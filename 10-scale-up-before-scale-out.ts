// Principle 10: Scale Up Before Scale Out

// ❌ BAD: Jumping to microservices too early
class PrematureMicroservices {
  // For a simple crypto trading app with 100 users!
  private userService = new UserMicroservice();
  private portfolioService = new PortfolioMicroservice();
  private tradingService = new TradingMicroservice();
  private priceService = new PriceMicroservice();
  private notificationService = new NotificationMicroservice();

  async buyToken(userId: string, symbol: string, amount: number): Promise<void> {
    // 5 network calls for a simple buy order!
    const user = await this.userService.getUser(userId);
    const portfolio = await this.portfolioService.getPortfolio(userId);
    const price = await this.priceService.getCurrentPrice(symbol);
    const tradeResult = await this.tradingService.executeTrade(userId, symbol, amount, price);
    await this.notificationService.sendTradeConfirmation(userId, tradeResult);

    // Problems:
    // - Network latency between services
    // - Complex debugging when something fails
    // - Need to handle distributed transactions
    // - Over-engineered for 100 users!
  }
}

// ✅ GOOD: Scale up first - optimize single instance
class OptimizedTradingApp {
  // Simple, fast, handles thousands of users
  private cache = new Map<string, any>();

  async buyToken(userId: string, symbol: string, amount: number): Promise<void> {
    // Single database transaction - simple and fast
    await this.database.transaction(async (tx) => {
      // Get user and portfolio in one query
      const user = await tx.query(`
        SELECT u.id, u.balance, p.holdings
        FROM users u
        LEFT JOIN portfolios p ON u.id = p.user_id
        WHERE u.id = $1
      `, [userId]);

      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get cached price (much faster than API call)
      const price = this.getCachedPrice(symbol);
      const tokens = amount / price;

      // Update balance and holdings in one query
      await tx.query(`
        UPDATE users SET balance = balance - $1 WHERE id = $2;
        INSERT INTO portfolio_holdings (user_id, symbol, quantity)
        VALUES ($2, $3, $4)
        ON CONFLICT (user_id, symbol)
        DO UPDATE SET quantity = portfolio_holdings.quantity + $4
      `, [amount, userId, symbol, tokens]);

      console.log(`User ${userId} bought ${tokens} ${symbol} for $${amount}`);
    });
  }

  private getCachedPrice(symbol: string): number {
    // Cache prices for 30 seconds - much faster than API calls
    const cached = this.cache.get(`price:${symbol}`);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.price;
    }

    // In real app, fetch from API and cache
    const price = 50000; // Mock price
    this.cache.set(`price:${symbol}`, { price, timestamp: Date.now() });
    return price;
  }

  private database = {
    transaction: async (fn: (tx: any) => Promise<void>) => {
      const tx = { query: (sql: string, params: any[]) => Promise.resolve([]) };
      await fn(tx);
    }
  };
}

// ❌ BAD: Premature scaling for SaaS subscription
class PrematureSubscriptionScaling {
  // Using Redis cluster, message queues, multiple databases for 50 customers!
  private userDB = new DatabaseCluster(['db1', 'db2', 'db3']);
  private subscriptionDB = new DatabaseCluster(['sub-db1', 'sub-db2']);
  private billingQueue = new MessageQueue();
  private emailQueue = new MessageQueue();
  private redisCluster = new RedisCluster(['redis1', 'redis2', 'redis3']);

  async upgradeSubscription(userId: string, newPlan: string): Promise<void> {
    // Complex distributed operation for a simple upgrade!
    const transactionId = this.generateDistributedTransactionId();

    try {
      await this.userDB.updateUser(userId, { upgradeInProgress: true });
      await this.subscriptionDB.createNewSubscription(userId, newPlan, transactionId);
      await this.billingQueue.publish('billing.upgrade', { userId, newPlan, transactionId });
      await this.emailQueue.publish('email.upgrade', { userId, newPlan });
      await this.redisCluster.invalidate(`user:${userId}`);

      // Complex rollback logic if anything fails...
    } catch (error) {
      await this.rollbackDistributedUpgrade(transactionId);
      throw error;
    }
  }

  private rollbackDistributedUpgrade(transactionId: string): Promise<void> {
    // Hundreds of lines of rollback logic...
    return Promise.resolve();
  }

  private generateDistributedTransactionId(): string {
    return 'tx_' + Date.now();
  }
}

// ✅ GOOD: Simple subscription system that scales up
class SimpleSubscriptionSystem {
  private users: Map<string, User> = new Map();
  private planPrices = { basic: 10, pro: 50, enterprise: 200 };

  async upgradeSubscription(userId: string, newPlan: keyof typeof this.planPrices): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const oldPrice = this.planPrices[user.plan as keyof typeof this.planPrices];
    const newPrice = this.planPrices[newPlan];
    const priceDiff = newPrice - oldPrice;

    if (priceDiff <= 0) throw new Error('Cannot downgrade');

    // Simple upgrade process
    await this.chargeUser(userId, priceDiff);
    user.plan = newPlan;
    user.upgradedAt = new Date();

    // Send email asynchronously (don't block the upgrade)
    this.sendUpgradeEmailAsync(user.email, newPlan);

    console.log(`User ${userId} upgraded to ${newPlan} for $${priceDiff}`);
  }

  private async chargeUser(userId: string, amount: number): Promise<void> {
    // Simple Stripe charge
    console.log(`Charging user ${userId} $${amount}`);
  }

  private sendUpgradeEmailAsync(email: string, plan: string): void {
    // Send email in background, don't block upgrade
    setTimeout(() => {
      console.log(`Sent upgrade email to ${email} for ${plan} plan`);
    }, 100);
  }
}

// Scale up techniques (use these before microservices!)
class ScaleUpTechniques {

  // 1. Add caching
  private cache = new Map<string, any>();

  getCachedData(key: string, fetchFn: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return Promise.resolve(cached.data);
    }

    return fetchFn().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    });
  }

  // 2. Optimize database queries
  async getOrdersOptimized(userId: string): Promise<any[]> {
    // Bad: N+1 queries
    // const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
    // for (const order of orders) {
    //   order.items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    // }

    // Good: Single query with JOIN
    return await this.db.query(`
      SELECT o.*,
             json_agg(json_build_object('product', oi.product_id, 'qty', oi.quantity)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
    `, [userId]);
  }

  // 3. Use background jobs for heavy work
  processHeavyWorkInBackground(data: any): void {
    // Don't block the main thread
    setTimeout(async () => {
      try {
        await this.doHeavyWork(data);
      } catch (error) {
        console.error('Background job failed:', error);
      }
    }, 0);
  }

  private async doHeavyWork(data: any): Promise<void> {
    // Heavy processing like image generation, PDF creation, etc.
    console.log('Processing heavy work:', data);
  }

  private db = {
    query: (sql: string, params: any[]) => Promise.resolve([])
  };
}

// Mock classes for bad examples
class UserMicroservice {
  async getUser(id: string) { return { id, balance: 1000 }; }
}
class PortfolioMicroservice {
  async getPortfolio(id: string) { return { holdings: [] }; }
}
class TradingMicroservice {
  async executeTrade(userId: string, symbol: string, amount: number, price: number) {
    return { id: 'trade_123', success: true };
  }
}
class PriceMicroservice {
  async getCurrentPrice(symbol: string) { return 50000; }
}
class NotificationMicroservice {
  async sendTradeConfirmation(userId: string, trade: any) {}
}
class DatabaseCluster {
  constructor(private nodes: string[]) {}
  async updateUser(id: string, data: any) {}
  async createNewSubscription(userId: string, plan: string, txId: string) {}
}
class MessageQueue {
  async publish(topic: string, data: any) {}
}
class RedisCluster {
  constructor(private nodes: string[]) {}
  async invalidate(key: string) {}
}

interface User {
  id: string;
  email: string;
  plan: string;
  upgradedAt: Date;
}

// Key takeaway for juniors:
//
// ❌ Don't start with microservices for small apps
// ❌ Don't use complex distributed systems unless you really need them
// ❌ Don't scale out when you can scale up
//
// ✅ Scale UP first:
// - Add caching (Map, Redis)
// - Optimize database queries
// - Use background jobs for heavy work
// - Get better hardware
// - Add database indexes
//
// ✅ Scale OUT only when:
// - Single instance is maxed out (CPU, memory, database connections)
// - You have millions of users
// - You have a team to manage the complexity
//
// SIMPLE RULE: Start with one server, make it fast, then consider multiple servers