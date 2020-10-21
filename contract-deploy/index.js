const { ApiPromise, WsProvider } = require("@polkadot/api");
const { CodePromise } = require("@polkadot/api-contract");
const { Keyring } = require("@polkadot/keyring");
const fs = require("fs");

async function main() {
    if (process.argv.length > 2 && process.argv[2] == "--help") {
        console.log("contract-deploy <WASM PATH> <METADATA PATH>");
        process.exit();
    }

    if (process.argv.length < 5) {
        console.log("Invalid number of arguments");
        process.exit(1);
    }

    //const wasm = fs.readFileSync(process.argv[2]);
    const wasm = "0x" + fs.readFileSync(process.argv[2], "hex");
    const abi = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
    // console.log(abi);

    const provider = new WsProvider('ws://127.0.0.1:9944');

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

    // Deploy the WASM, retrieve a Blueprint
    let blueprint;

    const unsub1 = await code
        .createBlueprint()
        .signAndSend(alicePair, async (result1) => {
            if (result1.status.isInBlock || result1.status.isFinalized) {
                // here we have an additional field in the result, containing the blueprint
                blueprint = result1.blueprint;
                // console.log(result);

                // Deploy a contract using the Blueprint
                const endowment = 123000000000n;

                // NOTE The apps UI specifies these in Mgas
                const gasLimit = 100000n * 1000000n;
                const initialHighfives = 100;

                let contract;

                // console.log(blueprint.abi.constructors);

                const unsub = await blueprint.tx
                    .default(endowment, gasLimit)
                    .signAndSend(alicePair, async (result) => {
                        if (result.status.isInBlock || result.status.isFinalized) {
                            contract = result.contract;
                            // console.log(contract);
                            console.log(contract.address.toHuman());

                            const val = 0; // only useful on isPayable messages

                            // NOTE the apps UI specified these in mega units
                            const gasLimit = 3000n * 1000000n;

                            // Perform the actual read (no params at the end, for the `get` message)
                            // (We perform the send from an account, here using Alice's address)
                            const value = await contract.query.totalHighfives(alicePair.address, val, gasLimit);

                            // The actual result from RPC as `ContractExecResult`
                            console.log(value.result.toHuman());

                            // check if the call was successful
                            if (value.result.isSuccess) {
                                // data from the enum
                                const success = value.result.asSuccess;

                                // should output 123 as per our initial set (output here is an i32)
                                console.log(value.output.toHuman());

                                // the amount of gas consumed (naturally a u64 value()
                                console.log(success.gasConsumed.toHuman());
                            } else {
                                console.error('Call failed');
                            }

                            process.exit();
                        } else if (result.isError) {
                            console.log("error");
                        } else {
                            console.log("Not on chain");
                        }

                    });
            }
    });

    // process.exit();
}

main();