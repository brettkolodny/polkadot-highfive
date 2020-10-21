import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Keyring } from "@polkadot/keyring";
import 'regenerator-runtime/runtime';
const abi = require("../contract/metadata.json");

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

async function getTotalHighfives() {
    const api = await connect();

    const keyring = new Keyring({ type: 'sr25519' });

    const alicePair = keyring.createFromUri("//Alice");

    const contract = new ContractPromise(api, abi, "5FZLhVrvGUir2TEhwsxA7gsWKp2oUDubvD4rY8iiVEQTXsRc");

    // Read from the contract via an RPC call
    const val = 0; // only useful on isPayable messages

    // NOTE the apps UI specified these in mega units
    const gasLimit = 3000n * 1000000n;

    console.log(contract.query);

    // Perform the actual read (no params at the end, for the `get` message)
    // (We perform the send from an account, here using Alice's address)
    const value = await contract.query.totalHighfives(alicePair.Address, val, gasLimit);

    // console.log(value.result.toHuman());

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
} 


export { getTotalHighfives };