// Principle 9: Composition over Inheritance

// ❌ BAD: Deep inheritance that becomes rigid
abstract class User {
  constructor(
    protected id: string,
    protected email: string
  ) {}

  abstract getPermissions(): string[];
}

class BasicUser extends User {
  getPermissions(): string[] {
    return ['read'];
  }
}

class ProUser extends BasicUser {
  getPermissions(): string[] {
    return ['read', 'write'];
  }
}

class AdminUser extends ProUser {
  getPermissions(): string[] {
    return ['read', 'write', 'admin'];
  }
}

// Problem: What if we need a user with admin + billing but not pro features?
// What if we need to change permissions at runtime?
// Inheritance is too rigid!

// ✅ GOOD: Composition with flexible roles
interface Role {
  name: string;
  permissions: string[];
}

class FlexibleUser {
  private roles: Role[] = [];

  constructor(
    private id: string,
    private email: string
  ) {}

  addRole(role: Role): void {
    this.roles.push(role);
  }

  hasPermission(permission: string): boolean {
    return this.roles.some(role =>
      role.permissions.includes(permission)
    );
  }

  getPermissions(): string[] {
    const allPermissions = this.roles.flatMap(role => role.permissions);
    return [...new Set(allPermissions)]; // Remove duplicates
  }
}

// Define roles as objects
const ROLES = {
  BASIC: { name: 'basic', permissions: ['read'] },
  PRO: { name: 'pro', permissions: ['read', 'write'] },
  ADMIN: { name: 'admin', permissions: ['admin', 'delete'] },
  BILLING: { name: 'billing', permissions: ['billing', 'invoices'] }
};

// Easy to create any combination
const user = new FlexibleUser('1', 'user@example.com');
user.addRole(ROLES.BASIC);
user.addRole(ROLES.BILLING); // User can read and handle billing!

// ❌ BAD: Inheritance for crypto wallets
abstract class Wallet {
  constructor(protected balance: number) {}
  abstract transfer(amount: number): void;
}

class BitcoinWallet extends Wallet {
  transfer(amount: number): void {
    console.log(`Transferring ${amount} BTC`);
    this.balance -= amount;
  }
}

class EthereumWallet extends BitcoinWallet {
  // Inherits Bitcoin logic? That's weird!
  transfer(amount: number): void {
    console.log(`Transferring ${amount} ETH`);
    this.balance -= amount;
  }

  deployContract(): void {
    console.log('Deploying smart contract');
  }
}

// Problem: What if we want a multi-currency wallet?
// What if we want Bitcoin with smart contract features?

// ✅ GOOD: Composition for crypto wallets
interface CurrencyHandler {
  symbol: string;
  transfer(amount: number): void;
}

interface Feature {
  name: string;
  execute(): void;
}

class BitcoinHandler implements CurrencyHandler {
  symbol = 'BTC';

  transfer(amount: number): void {
    console.log(`Transferring ${amount} BTC`);
  }
}

class EthereumHandler implements CurrencyHandler {
  symbol = 'ETH';

  transfer(amount: number): void {
    console.log(`Transferring ${amount} ETH`);
  }
}

class SmartContractFeature implements Feature {
  name = 'smart_contracts';

  execute(): void {
    console.log('Deploying smart contract');
  }
}

class StakingFeature implements Feature {
  name = 'staking';

  execute(): void {
    console.log('Staking tokens');
  }
}

class ComposableWallet {
  private currencies: CurrencyHandler[] = [];
  private features: Feature[] = [];

  addCurrency(handler: CurrencyHandler): void {
    this.currencies.push(handler);
  }

  addFeature(feature: Feature): void {
    this.features.push(feature);
  }

  transfer(symbol: string, amount: number): void {
    const handler = this.currencies.find(c => c.symbol === symbol);
    if (handler) {
      handler.transfer(amount);
    } else {
      throw new Error(`Currency ${symbol} not supported`);
    }
  }

  hasFeature(featureName: string): boolean {
    return this.features.some(f => f.name === featureName);
  }

  useFeature(featureName: string): void {
    const feature = this.features.find(f => f.name === featureName);
    if (feature) {
      feature.execute();
    } else {
      throw new Error(`Feature ${featureName} not available`);
    }
  }
}

// Easy to create any combination
const wallet = new ComposableWallet();
wallet.addCurrency(new BitcoinHandler());
wallet.addCurrency(new EthereumHandler());
wallet.addFeature(new SmartContractFeature());
wallet.addFeature(new StakingFeature());

// ❌ BAD: Subscription inheritance
abstract class Subscription {
  constructor(protected price: number) {}
  abstract getFeatures(): string[];
}

class BasicSubscription extends Subscription {
  constructor() { super(10); }
  getFeatures(): string[] {
    return ['basic_api'];
  }
}

class ProSubscription extends BasicSubscription {
  constructor() { super(); }
  getFeatures(): string[] {
    return ['basic_api', 'advanced_api'];
  }
}

class EnterpriseSubscription extends ProSubscription {
  constructor() { super(); }
  getFeatures(): string[] {
    return ['basic_api', 'advanced_api', 'custom_limits'];
  }
}

// Problem: What if we want basic + custom_limits but not advanced_api?

// ✅ GOOD: Composition for subscriptions
interface SubscriptionFeature {
  name: string;
  price: number;
}

class ComposableSubscription {
  private features: SubscriptionFeature[] = [];

  addFeature(feature: SubscriptionFeature): void {
    this.features.push(feature);
  }

  hasFeature(featureName: string): boolean {
    return this.features.some(f => f.name === featureName);
  }

  getTotalPrice(): number {
    return this.features.reduce((sum, f) => sum + f.price, 0);
  }

  getFeatures(): string[] {
    return this.features.map(f => f.name);
  }
}

// Define features as objects
const FEATURES = {
  BASIC_API: { name: 'basic_api', price: 10 },
  ADVANCED_API: { name: 'advanced_api', price: 40 },
  CUSTOM_LIMITS: { name: 'custom_limits', price: 100 },
  PRIORITY_SUPPORT: { name: 'priority_support', price: 50 }
};

// Create any combination
const customSub = new ComposableSubscription();
customSub.addFeature(FEATURES.BASIC_API);
customSub.addFeature(FEATURES.CUSTOM_LIMITS); // Skip advanced_api!
console.log(`Total: $${customSub.getTotalPrice()}`); // $110

// Key takeaway for juniors:
//
// ❌ Inheritance problems:
// - Rigid hierarchy
// - Hard to change at runtime
// - Forces you into specific combinations
// - "Is-a" relationship is too restrictive
//
// ✅ Composition benefits:
// - Flexible combinations
// - Easy to change at runtime
// - Mix and match features
// - "Has-a" relationship is more flexible
//
// SIMPLE RULE: Instead of inheriting, compose with smaller pieces