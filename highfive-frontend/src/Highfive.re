[@react.component]
let make = (~api, ~addresses) => {
    let (account, setAccount) = React.useState(_ => addresses[0]);
    let (highfives, setHighFives) = React.useState(_ => None);

    let getAccountHighfives = () => {
        let _ = Contract.getAccountHighfives(api, account)
        |> Js.Promise.then_(hf => {
            Js.log(hf);
            setHighFives(_ => Some(hf));
            Js.Promise.resolve(Some(hf));
        })
        |> Js.Promise.catch(_ => {
            setHighFives(_ => None);
            Js.Promise.resolve(None);
        });
    };

    React.useEffect1(() => {
        getAccountHighfives();
        None;
    }, [||]);

    let sendHighfive = () => {
        let toAddress = Contract.getAddress(addresses[1]);
        let _ = Contract.sendHighfive(api, account, toAddress)
        |> Js.Promise.then_(_value => {
            Js.log("sent");
            Js.Promise.resolve(Some(()));
        })
        |> Js.Promise.catch(_ => {
            Js.log("error");
            Js.Promise.resolve(None);
        });
    };

    <div id="content">
        <div id="title">{React.string("Highfive!")}</div>


        {React.string(Contract.getAddress(account))}
        {
            switch (highfives) {
            | Some(v) => <div id="test">{React.string("High fives: " ++ v)}</div>
            | None => <div></div>
            }
        }
        <div onClick={_ => getAccountHighfives()}>{React.string("Press me!")}</div>
        <div onClick={_ => sendHighfive()}>{React.string("Send Five")}</div>
    </div>
}