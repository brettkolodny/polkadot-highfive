[@bs.module "./contract"] external getTotalHighfives: unit => Js.Promise.t('a) = "getTotalHighfives";

let _ = getTotalHighfives()
|> Js.Promise.then_(value => {
    /* setter(_ => Some(value)); */
    Js.Promise.resolve(Some(value));
    })
|> Js.Promise.catch(err => {
    Js.log(err);
    Js.Promise.resolve(None);
});

switch (ReactDOM.querySelector("#root")) {
| Some(root) => ReactDOM.render(<Counter />, root)
| None => ()
};