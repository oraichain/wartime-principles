// Principle 7: Tell, Don't Ask & Law of Demeter

// ❌ BAD: Asking for data to make decisions
class BadWalletManager {
  async transfer(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);

    // ASK: Getting data to make decisions here
    const balance = user.getBalance();
    const dailyLimit = user.getDailyLimit();
    const todaySpent = user.getTodaySpent();

    // Making decisions based on asked data
    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    if (todaySpent + amount > dailyLimit) {
      throw new Error('Daily limit exceeded');
    }

    // More asking and deciding
    user.setBalance(balance - amount);
    user.setTodaySpent(todaySpent + amount);
  }

  private async getUser(userId: string): Promise<any> {
    return {
      getBalance: () => 1000,
      getDailyLimit: () => 5000,
      getTodaySpent: () => 100,
      setBalance: (amount: number) => {},
      setTodaySpent: (amount: number) => {}
    };
  }
}

// ✅ GOOD: Tell objects what to do
class GoodWalletManager {
  async transfer(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);

    // TELL the user to transfer money (user decides if it's allowed)
    user.transferMoney(amount);
  }

  private async getUser(userId: string): Promise<User> {
    return new User(1000, 5000, 100);
  }
}

class User {
  constructor(
    private balance: number,
    private dailyLimit: number,
    private todaySpent: number
  ) {}

  transferMoney(amount: number): void {
    // User object makes its own decisions
    if (this.balance < amount) {
      throw new Error('Insufficient balance');
    }

    if (this.todaySpent + amount > this.dailyLimit) {
      throw new Error('Daily limit exceeded');
    }

    // User updates its own state
    this.balance -= amount;
    this.todaySpent += amount;
  }
}

// ❌ BAD: Violating Law of Demeter (chaining calls)
class BadSubscriptionManager {
  async upgrade(userId: string, plan: string): Promise<void> {
    const user = await this.getUser(userId);

    // Chaining through multiple objects - bad!
    const currentPlan = user.getAccount().getSubscription().getPlan();
    const paymentMethod = user.getAccount().getBilling().getPaymentMethod();

    if (paymentMethod.getCard().isExpired()) {
      throw new Error('Card expired');
    }

    // More chaining
    user.getAccount().getSubscription().upgradeTo(plan);
    user.getAccount().getBilling().chargeUpgrade(plan);
  }

  private async getUser(userId: string): Promise<any> {
    return {
      getAccount: () => ({
        getSubscription: () => ({
          getPlan: () => 'basic',
          upgradeTo: (plan: string) => {}
        }),
        getBilling: () => ({
          getPaymentMethod: () => ({
            getCard: () => ({ isExpired: () => false })
          }),
          chargeUpgrade: (plan: string) => {}
        })
      })
    };
  }
}

// ✅ GOOD: Only talk to immediate neighbors
class GoodSubscriptionManager {
  async upgrade(userId: string, plan: string): Promise<void> {
    const user = await this.getUser(userId);

    // Just tell the user what you want - let them figure out how
    user.upgradeToPlan(plan);
  }

  private async getUser(userId: string): Promise<SmartUser> {
    return new SmartUser('basic');
  }
}

class SmartUser {
  constructor(private currentPlan: string) {}

  upgradeToPlan(newPlan: string): void {
    // User handles all the internal coordination
    if (!this.canUpgrade(newPlan)) {
      throw new Error('Cannot upgrade');
    }

    this.processUpgrade(newPlan);
  }

  private canUpgrade(plan: string): boolean {
    // User knows its own upgrade rules
    return this.currentPlan !== plan;
  }

  private processUpgrade(plan: string): void {
    // User coordinates its own internal objects
    this.currentPlan = plan;
    console.log(`Upgraded to ${plan}`);
  }
}

// Simple crypto example
// ❌ BAD: Asking
class BadCryptoTrader {
  async buyToken(userId: string, symbol: string, amount: number): Promise<void> {
    const portfolio = await this.getPortfolio(userId);

    // Asking for data to make decisions
    const balance = portfolio.getUSDBalance();
    const currentHolding = portfolio.getTokenAmount(symbol);

    if (balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Making decisions and updating state
    portfolio.setUSDBalance(balance - amount);
    portfolio.setTokenAmount(symbol, currentHolding + amount);
  }

  private async getPortfolio(userId: string): Promise<any> {
    return {
      getUSDBalance: () => 5000,
      getTokenAmount: (symbol: string) => 100,
      setUSDBalance: (amount: number) => {},
      setTokenAmount: (symbol: string, amount: number) => {}
    };
  }
}

// ✅ GOOD: Telling
class GoodCryptoTrader {
  async buyToken(userId: string, symbol: string, amount: number): Promise<void> {
    const portfolio = await this.getPortfolio(userId);

    // Tell portfolio to buy token - it decides if possible
    portfolio.buyToken(symbol, amount);
  }

  private async getPortfolio(userId: string): Promise<Portfolio> {
    return new Portfolio(5000);
  }
}

class Portfolio {
  private holdings: Record<string, number> = {};

  constructor(private usdBalance: number) {}

  buyToken(symbol: string, amount: number): void {
    // Portfolio makes its own decisions
    if (this.usdBalance < amount) {
      throw new Error('Insufficient funds');
    }

    // Portfolio updates its own state
    this.usdBalance -= amount;
    this.holdings[symbol] = (this.holdings[symbol] || 0) + amount;
  }
}

// Key takeaway:
// ❌ Don't ask: user.getBalance() < amount
// ✅ Do tell: user.canAfford(amount)
//
// ❌ Don't chain: user.getAccount().getSubscription().upgrade()
// ✅ Do tell: user.upgradePlan()