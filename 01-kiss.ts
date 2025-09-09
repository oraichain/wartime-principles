// Principle 1: KISS (Keep It Simple, Stupid)

// ❌ BAD: Over-complicated way to get Bitcoin price
class ComplexCryptoPrice {
  private priceCalculator: PriceCalculator;
  private dataAggregator: DataAggregator;
  private validationEngine: ValidationEngine;

  constructor() {
    this.priceCalculator = new PriceCalculator({
      algorithms: ['weighted', 'median', 'volume-adjusted'],
      sources: ['binance', 'coinbase', 'kraken', 'gemini'],
      fallbackStrategies: ['cached', 'estimated', 'historical']
    });

    this.dataAggregator = new DataAggregator({
      refreshInterval: 1000,
      qualityThreshold: 0.95,
      outlierDetection: true
    });
  }

  async getBitcoinPrice(): Promise<number> {
    // Way too many steps for a simple price lookup!
    const sources = await this.dataAggregator.getAvailableSources();
    const rawData = await this.dataAggregator.fetchFromMultipleSources(sources);
    const validatedData = await this.validationEngine.validatePriceData(rawData);
    const normalizedData = await this.dataAggregator.normalizeData(validatedData);
    const calculatedPrice = await this.priceCalculator.calculateOptimalPrice(normalizedData);
    const adjustedPrice = await this.priceCalculator.applyMarketAdjustments(calculatedPrice);

    return adjustedPrice;
  }
}

// ✅ GOOD: Simple, direct approach
class SimpleCryptoPrice {
  async getBitcoinPrice(): Promise<number> {
    // Just get the price - that's it!
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    return data.bitcoin.usd;
  }
}

// Even simpler example: User subscription check
// ❌ BAD: Over-engineered subscription validation
class ComplexSubscriptionChecker {
  private validator: SubscriptionValidator;
  private ruleEngine: BusinessRuleEngine;
  private auditLogger: AuditLogger;

  async canUserMakeQuery(userId: string): Promise<boolean> {
    const user = await this.validator.validateUser(userId);
    const subscription = await this.validator.getSubscriptionDetails(user);
    const rules = await this.ruleEngine.getApplicableRules(subscription.tier);
    const usage = await this.validator.getCurrentUsage(userId);
    const limits = await this.ruleEngine.calculateLimits(rules, subscription);
    const canProceed = await this.ruleEngine.evaluatePermission(usage, limits);

    await this.auditLogger.logPermissionCheck(userId, canProceed);

    return canProceed;
  }
}

// ✅ GOOD: Simple subscription check
class SimpleSubscriptionChecker {
  async canUserMakeQuery(userId: string): Promise<boolean> {
    // Get user's current usage and limit
    const usage = await this.getUserUsage(userId);
    const limit = await this.getUserLimit(userId);

    // Simple comparison
    return usage < limit;
  }

  private async getUserUsage(userId: string): Promise<number> {
    const result = await db.query('SELECT queries_used FROM users WHERE id = ?', [userId]);
    return result[0]?.queries_used || 0;
  }

  private async getUserLimit(userId: string): Promise<number> {
    const result = await db.query('SELECT query_limit FROM users WHERE id = ?', [userId]);
    return result[0]?.query_limit || 100;
  }
}

// Key takeaway: Start simple, add complexity only when needed!
// Bad:  10 classes, 50 lines of code to get Bitcoin price
// Good: 1 API call, 4 lines of code
