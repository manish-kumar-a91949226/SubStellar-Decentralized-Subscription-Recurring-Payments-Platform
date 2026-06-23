#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Subscription {
    pub user: Address,
    pub plan_id: u32,
    pub start_time: u64,
    pub active: bool,
}

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    pub fn subscribe(env: Env, id: u32, user: Address, plan_id: u32) {
        user.require_auth();
        
        // In a full implementation, we'd cross-contract call the plan contract 
        // to verify plan exists and transfer funds using token contract.
        
        let sub = Subscription {
            user: user.clone(),
            plan_id,
            start_time: env.ledger().timestamp(),
            active: true,
        };
        env.storage().persistent().set(&id, &sub);
        env.events().publish((symbol_short!("subbed"), user, plan_id), id);
    }

    pub fn cancel(env: Env, id: u32) {
        let mut sub: Subscription = env.storage().persistent().get(&id).unwrap();
        sub.user.require_auth();
        sub.active = false;
        env.storage().persistent().set(&id, &sub);
        env.events().publish((symbol_short!("cancel"), sub.user), id);
    }

    pub fn get_sub(env: Env, id: u32) -> Subscription {
        env.storage().persistent().get(&id).unwrap()
    }
}
