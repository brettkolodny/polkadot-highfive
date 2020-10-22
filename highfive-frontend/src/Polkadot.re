module Pair = {
    type t;
    [@bs.get] external getAddress: t => string = "address";
};

module Api = {
    type t;
    [@bs.module "./contract"] external connect: unit => Js.Promise.t(t) = "connect";
    [@bs.module "./contract"] external getDevAccounts: t => Js.Promise.t(array(Pair.t)) = "getDevAccounts";
};

module Contract = {
    [@bs.module "./contract"] external getAccountHighfives: (Api.t, Pair.t) => Js.Promise.t(string) = "getAccountHighfives";
    [@bs.module "./contract"] external sendHighfive: (Api.t, Pair.t, string) => Js.Promise.t('a) = "sendHighfive";
};

module Identicon = {
    [@bs.module "@polkadot/react-identicon"][@react.component]
    external make: (~value: string, ~size: int, ~theme: string) => React.element = "default";
};