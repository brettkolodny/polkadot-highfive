Polkadot.Api.connect()
|> Js.Promise.then_(api => {
    let _ = Polkadot.Api.getDevAccounts(api)
    |> Js.Promise.then_(addresses => {
        switch (ReactDOM.querySelector("#root")) {
        | Some(root) => ReactDOM.render(<Highfive api=api addresses=addresses />, root)
        | None => ()
        };

        Js.Promise.resolve(Some(addresses));
    })
    |> Js.Promise.catch(err => {
        Js.log(err);
        Js.Promise.resolve(None);
    });

    Js.Promise.resolve(Some(api));
})
|> Js.Promise.catch(err => {
    Js.log(err);
    Js.Promise.resolve(None);
});