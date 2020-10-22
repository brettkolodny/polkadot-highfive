type pair;
type api;

[@bs.module "./contract"] external getAccountHighfives: (api, pair) => Js.Promise.t('a) = "getAccountHighfives";
[@bs.module "./contract"] external getDevAccounts: api => Js.Promise.t(array(pair)) = "getDevAccounts";
[@bs.module "./contract"] external sendHighfive: (api, pair, string) => Js.Promise.t('a) = "sendHighfive";
[@bs.module "./contract"] external connect: unit => Js.Promise.t(api) = "connect"; 
[@bs.get] external getAddress: pair => string = "address";