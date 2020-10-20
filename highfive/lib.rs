#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod highfive {

    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
    }

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct Highfive {
        total_highfives: Balance,
        high_fives: ink_storage::collections::HashMap<AccountId, Balance>,
    }

    impl Highfive {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(initial_highfives: Balance) -> Self {
            let mut high_fives = ink_storage::collections::HashMap::new();

            high_fives.insert(Self::env().caller(), initial_highfives);

            Self::env().emit_event(
                Transfer {
                    from: Some(Self::env().caller()),
                    to: None
                }
            );

            Self { 
                total_highfives: initial_highfives,
                high_fives,
            }
        }

        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new(100)
        }

        #[ink(message)]
        pub fn total_highfives(&self) -> Balance {
            return self.total_highfives
        }

        /// Returns the balance of the caller
        #[ink(message)]
        pub fn num_highfives(&self) -> Balance {
            self.num_highfives_of_or_zero(&self.env().caller())
        }

        #[ink(message)]
        pub fn num_highfives_of(&self, account: AccountId) -> Balance {
            self.num_highfives_of_or_zero(&account)
        }

        pub fn num_highfives_of_or_zero(&self, account: &AccountId) -> Balance {
            *self.high_fives.get(account).unwrap_or(&0)
        }

        #[ink(message)]
        pub fn send_highfive(&mut self, to: AccountId) -> bool {
            self.send_highfive_from_to(self.env().caller(), to)
        }

        pub fn send_highfive_from_to(&mut self, from: AccountId, to: AccountId) -> bool {
            let from_fives = self.num_highfives_of_or_zero(&from);

            if from_fives < 1 {
                return false;
            }

            self.env().emit_event(
                Transfer {
                    from: Some(from),
                    to: Some(to),
                }
            );

            self.high_fives
                .entry(from)
                .and_modify(|hf| *hf -= 1);
            
            self.high_fives
                .entry(to)
                .and_modify(|hf| *hf += 1)
                .or_insert(1);

            true
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn new_works() {
            let contract = Highfive::new(777);
            assert_eq!(contract.total_highfives(), 777);
        }

        #[ink::test]
        fn num_highfives_works() {
            let contract = Highfive::new(100);
            assert_eq!(contract.total_highfives(), 100);
            assert_eq!(contract.num_highfives_of(AccountId::from([0x1; 32])), 100);
            assert_eq!(contract.num_highfives_of(AccountId::from([0x0; 32])), 0);
        }

        #[ink::test]
        fn send_highfive_works() {
            let mut contract = Highfive::new(100);
            assert_eq!(contract.num_highfives_of(AccountId::from([0x1; 32])), 100);
            assert!(contract.send_highfive(AccountId::from([0x0; 32])));
            assert_eq!(contract.num_highfives_of(AccountId::from([0x0; 32])), 1);
            assert_eq!(contract.num_highfives_of(AccountId::from([0x1; 32])), 99);
            assert!(contract.send_highfive(AccountId::from([0x0; 32])));
            assert_eq!(contract.num_highfives_of(AccountId::from([0x0; 32])), 2);
            assert_eq!(contract.num_highfives_of(AccountId::from([0x1; 32])), 98);
            assert!(contract.send_highfive_from_to(AccountId::from([0x0; 32]), AccountId::from([0x1; 32])));
            assert_eq!(contract.num_highfives_of(AccountId::from([0x0; 32])), 1);
            assert_eq!(contract.num_highfives_of(AccountId::from([0x1; 32])), 99);
        }
    }
}
