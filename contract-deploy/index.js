const { ApiPromise, WsProvider } = require("@polkadot/api");
const { CodePromise } = require("@polkadot/api-contract");
const { Keyring } = require("@polkadot/keyring");
const fs = require("fs");

async function main() {
    if (process.argv.length > 2 && process.argv[2] == "--help") {
        console.log("contract-deploy <WASM PATH> <METADATA PATH>");
        process.exit();
    }

    if (process.argv.length < 4) {
        console.log("Invalid number of arguments");
        process.exit(1);
    }

    //const wasm = fs.readFileSync(process.argv[2]);
    const wasm = "0x" + fs.readFileSync(process.argv[2], "hex");
    const abi = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
    // console.log(abi);

    const provider = new WsProvider('ws://127.0.0.1:9944');

    console.log("Connecting to chain...");
    const api = await ApiPromise.create({
        types: {
            // mapping the actual specified address format
            Address: 'AccountId',
            // mapping the lookup
            LookupSource: 'AccountId',
          },
        provider 
    });
    const code = new CodePromise(api, abi, wasm);

    const keyring = new Keyring({ type: 'sr25519' });

    const alicePair = keyring.createFromUri("//Alice");

    await createBlueprint(api, code, alicePair);
}

async function createBlueprint(api, code, pair) {
    console.log("Creating contract blueprint...");

    const unsub = await code
        .createBlueprint()
        .signAndSend(pair, async ({ blueprint, status, events, dispatchError }) => {
            // status would still be set, but in the case of error we can shortcut
            // to just check it (so an error would indicate InBlock or Finalized)
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                const { documentation, method, section } = decoded;
        
                console.log(`${section}.${method}: ${documentation.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                console.log(dispatchError.toString());
              }

              process.exit(1);
            } else {
                if (status.isInBlock || status.isFinalized) {
                    // here we have an additional field in the result, containing the blueprint
                    
                    unsub();
                    await initiateContract(api, blueprint, pair);
                }
            }
        });
}

async function initiateContract(api, blueprint, pair) {
    console.log("Initiating contract...");
    const endowment = 12300000000000000n;

    // NOTE The apps UI specifies these in Mgas
    const gasLimit = 100000n * 10000000n;
    const initialHighfives = 100;

    // console.log(blueprint.abi.constructors);

    const unsub = await blueprint.tx
        .default(endowment, gasLimit)
        .signAndSend(pair, async ({ isError, contract, status, events, dispatchError }) => {
            // status would still be set, but in the case of error we can shortcut
            // to just check it (so an error would indicate InBlock or Finalized)
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                const { documentation, method, section } = decoded;
        
                console.log(`${section}.${method}: ${documentation.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                console.log(dispatchError.toString());
              }

              process.exit();
            } else {
                if (status.isInBlock || status.isFinalized) {
                    unsub();
                    let contractAddress = { address: contract.address.toHuman() };
                    fs.writeFileSync("../highfive-frontend/contract/contract-address.json", JSON.stringify(contractAddress), { "flag": "w"});
                    console.log("Contract address written to file!");
    
                    process.exit();
                } else if (isError) {
                    console.log("error");
                    process.exit(1);
                }
            }
        });
}

main();