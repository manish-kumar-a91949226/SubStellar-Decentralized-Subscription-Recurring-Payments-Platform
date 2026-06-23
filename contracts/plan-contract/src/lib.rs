#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Plan {
    pub creator: Address,
    pub name: String,
    pub price: i128,
    pub interval: String,
    pub active: bool,
}

#[contract]
pub struct PlanContract;

#[contractimpl]
impl PlanContract {
    pub fn create_plan(env: Env, id: u32, creator: Address, name: String, price: i128, interval: String) {
        creator.require_auth();
        let plan = Plan {
            creator: creator.clone(),
            name: name.clone(),
            price,
            interval: interval.clone(),
            active: true,
        };
        env.storage().persistent().set(&id, &plan);
        env.events().publish((symbol_short!("created"), creator, id), plan);
    }

    pub fn get_plan(env: Env, id: u32) -> Plan {
        env.storage().persistent().get(&id).unwrap()
    }

    pub fn set_active(env: Env, id: u32, active: bool) {
        let mut plan: Plan = env.storage().persistent().get(&id).unwrap();
        plan.creator.require_auth();
        plan.active = active;
        env.storage().persistent().set(&id, &plan);
    }
}
