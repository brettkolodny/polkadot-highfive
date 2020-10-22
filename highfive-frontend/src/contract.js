import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Keyring } from "@polkadot/keyring";
import 'regenerator-runtime/runtime';

const abi = require("../contract/metadata.json");
const contractAddressJSON = require("../contract/contract-address.json");
const contractAddress = contractAddressJSON.address;

async function connect() {
    const provider = new WsProvider('ws://127.0.0.1:9944');

    const api = await ApiPromise.create({
        types: {
            // mapping the actual specified address format
            Address: 'AccountId',
            // mapping the lookup
            LookupSource: 'AccountId'
          },
        provider 
    });

    return api;
}

async function getDevAccounts(api) {
    const keyring = new Keyring({ type: 'sr25519' });

    const alicePair = keyring.createFromUri("//Alice");
    const bobPair = keyring.createFromUri("//Bob");
    const charliePair = keyring.createFromUri("//Charlie");
    const davePair = keyring.createFromUri("//Dave");
    const evePair = keyring.createFromUri("//Eve");

    return [alicePair, bobPair, charliePair, davePair, evePair];
}

async function getAccountHighfives(api, pair) {
    const contract = new ContractPromise(api, abi, contractAddress);

    const value = 0;

    const gasLimit = 3000n * 10000000n;

    const callValue = await contract.query.numHighfives(pair.address, value, gasLimit);

    return callValue.output.toHuman();
}

async function sendHighfive(api, fromPair, to) {
    const contract = new ContractPromise(api, abi, contractAddress);

    const value = 0;
    const gasLimit = 3000n * 10000000n;

    const unsub = await contract.tx
    .sendHighfive(value, gasLimit, to)
    .signAndSend(fromPair, ({ status, events, dispatchError }) => {
        if (dispatchError) {
            if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, method, section } = decoded;
    
            console.log(`${section}.${method}: ${documentation.join(' ')}`);
            } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(error.toString());
            }

            unsub();
        } else {
            if (status.isInBlock || status.isFinalized) {
                unsub();
            }
        }
    });
}

export { connect, getAccountHighfives, getDevAccounts, sendHighfive };