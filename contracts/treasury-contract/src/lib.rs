#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
pub enum DataKey {
    PlatformFee, // u32 percentage, e.g. 2
    CreatorBal(Address),
}

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    pub fn init(env: Env, fee_percent: u32) {
        env.storage().instance().set(&DataKey::PlatformFee, &fee_percent);
    }

    pub fn collect_fee(env: Env, creator: Address, amount: i128) {
        // Only authorized caller (like subscription contract) can call this
        // In full implementation, this transfers funds from user to contract
        
        let fee_percent: u32 = env.storage().instance().get(&DataKey::PlatformFee).unwrap_or(2);
        let fee = amount * (fee_percent as i128) / 100;
        let creator_share = amount - fee;
        
        let key = DataKey::CreatorBal(creator.clone());
        let mut bal: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        bal += creator_share;
        env.storage().persistent().set(&key, &bal);
        
        env.events().publish((symbol_short!("fee_col"), creator), (amount, fee));
    }

    pub fn withdraw(env: Env, creator: Address) {
        creator.require_auth();
        
        let key = DataKey::CreatorBal(creator.clone());
        let bal: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        if bal > 0 {
            // In full implementation, invoke token contract to transfer `bal` to `creator`
            env.storage().persistent().set(&key, &0_i128);
            env.events().publish((symbol_short!("withdraw"), creator), bal);
        }
    }
}
