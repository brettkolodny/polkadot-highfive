[@bs.module "./domUtility"] external getElementValueById: string => string = "getElementValueById";

[@react.component]
let make = (~api, ~addresses) => {
    let (fromHighfives, setFromHighfives) = React.useState(_ => None);
    let (toHighfives, setToHighfives) = React.useState(_ => None);

    let getPair = address => {
        let rec search = (i, a) => {
            if (i < Array.length(a)) {
                if (address == Polkadot.Pair.getAddress(a[i])) {
                    Some(a[i]);
                } else {
                    search(i + 1, a);
                }
            } else {
                None
            };
        };

        search(0, addresses);
    }

    let getAccountHighfives = (account, stateFunction) => {
        let _ = Polkadot.Contract.getAccountHighfives(api, account)
        |> Js.Promise.then_(hf => {
            stateFunction(_ => Some(hf));
            Js.Promise.resolve(Some(hf));
        })
        |> Js.Promise.catch(_ => {
            stateFunction(_ => None);
            Js.Promise.resolve(None);
        });
    };

    let sendHighfive = () => {
        let fromPairOption = getElementValueById("from-input") -> getPair;
        let toAddress = getElementValueById("to-input");

        switch (fromPairOption) {
        | Some(fromPair) => {
            let _ = Polkadot.Contract.sendHighfive(api, fromPair, toAddress)
                |> Js.Promise.then_(_value => {
                    Js.Promise.resolve(Some(()));
                })
                |> Js.Promise.catch(_ => {
                    Js.log("error");
                    Js.Promise.resolve(None);
                });
        };
        | None => ()
        };
    };

    let refreshHighfives = () => {
        let fromPair = getElementValueById("from-input") -> getPair;
        switch (fromPair) {
        | Some(v) => getAccountHighfives(v, setFromHighfives);
        | None => ()
        };

        let toPair = getElementValueById("to-input") -> getPair;
        switch (toPair) {
        | Some(v) => getAccountHighfives(v, setToHighfives);
        | None => ()
        };
    };

    let getAccountIcons = () => {
        Array.mapi((i, e) => {
            let accountAddress = Polkadot.Pair.getAddress(e);
            <div className="icon" key={string_of_int(i)}>
                <Polkadot.Identicon 
                    value={accountAddress}
                    size=64
                    theme="polkadot"
                />
            </div>
        },
        addresses)
        -> React.array;
    };

    <div id="content">
        <div id="accounts">
            {getAccountIcons()}
        </div>

        <div id="title">{React.string("Highfive!")}</div>

        <div>
            <input id="from-input" />

            <div>
                {
                    switch (fromHighfives) {
                    | Some(v) => <div className="space">{React.string(v ++ " highfives")}</div>
                    | None => <div className="space">{React.string("")}</div>
                    };            
                }
            </div>
        </div>

        <div id="to">
            {React.string("to")}
        </div>
        
        <div className="space"></div>
        
        <div>
            <input id="to-input" />

            <div>
                {
                    switch (toHighfives) {
                    | Some(v) => <div className="space">{React.string(v ++ " highfives")}</div>
                    | None => <div className="space">{React.string("")}</div>
                    };            
                }
            </div>
        </div>
        <div className="space"></div>
        <div id="send" onClick={_ => sendHighfive()}>{React.string("Send!")}</div>
        <div className="space"></div>
        <div id="refresh" onClick={_ => refreshHighfives()}>{React.string("See highfives")}</div>
    </div>
}