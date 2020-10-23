# polkadot-highfive

## Running from source
1. Build the substrate node with ``cargo build --release`` within the substrate-node-template directory
2. Install the node libraries in contract-deploy directory with ``yarn install``
3. Install the node libraries in highfive-frontend directory with ``yarn install``
4. Build the ReasonML files with ``yarn re:build``
5. Start the substrate by running node-template in the substrate-node-template release folder with ``--dev --tmp``
6. Deploy the contract by running index.js within the contract-deploy directory with ``yarn run run ../highfive-frontend/contract/highfive.wasm ../highfive-frontend/contract/metadata.json``
7. Start the front end server by running ``yarn server`` within the highfive-frontend directory
8. Navigate to localhost:1234 in your browser
9. Send a highfive from one account to another
10. Press "See highfives" after a few seconds to see the updated balances (Note: by defualt Alice, the first account, has all of the highfives at the start)
