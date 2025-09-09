// Principle 8: First-Principles Thinking

// ❌ BAD: Copying complex solutions without understanding the problem
class CopiedTradingBot {
  // Blindly copied from "Advanced Trading Strategies" blog post
  private neuralNetwork = new DeepLearningModel();
  private sentimentAnalyzer = new TwitterSentimentAPI();
  private technicalIndicators = new AdvancedTechnicalAnalysis();

  async shouldBuyToken(symbol: string): Promise<boolean> {
    // Complex analysis that nobody understands
    const sentiment = await this.sentimentAnalyzer.getMarketSentiment(symbol);
    const technicals = await this.technicalIndicators.calculateAll(symbol);

    // Magic formula from the internet
    const score = (sentiment.score * 0.3) + (technicals.momentum * 0.7);

    return score > 0.75; // Why 0.75? Nobody knows!
  }
}

// ✅ GOOD: First-principles approach - understand the actual problem
class SimpleTradingBot {
  // Problem: Want to buy tokens when price is low and trending up
  // First principle: Buy low, sell high
  // Solution: Simple price tracking with basic trend detection

  private priceHistory: Record<string, number[]> = {};

  async shouldBuyToken(symbol: string): Promise<boolean> {
    const currentPrice = await this.getCurrentPrice(symbol);
    const prices = this.priceHistory[symbol] || [];

    // Add current price to history
    prices.push(currentPrice);
    if (prices.length > 10) {
      prices.shift(); // Keep only last 10 prices
    }
    this.priceHistory[symbol] = prices;

    // Simple logic: buy if price dropped 10% and is now recovering
    if (prices.length < 3) return false;

    const lowest = Math.min(...prices);
    const isRecovering = currentPrice > prices[prices.length - 2];
    const hasDropped = (prices[0] - lowest) / prices[0] > 0.1;

    return hasDropped && isRecovering;
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    return 50000; // Mock price
  }
}

// ❌ BAD: Copying subscription patterns without understanding
class CopiedSubscriptionSystem {
  // Copied from "Enterprise SaaS Architecture" without thinking
  private billingEngine = new AdvancedBillingEngine();
  private subscriptionOrchestrator = new SubscriptionOrchestrator();
  private pricingCalculator = new DynamicPricingCalculator();

  async upgradeUser(userId: string, newPlan: string): Promise<void> {
    // Over-engineered upgrade process
    const currentSubscription = await this.subscriptionOrchestrator.getCurrentSubscription(userId);
    const pricing = await this.pricingCalculator.calculateDynamicPricing(newPlan);
    const prorationAmount = await this.billingEngine.calculateProration(currentSubscription, pricing);

    await this.billingEngine.processUpgrade({
      userId,
      currentPlan: currentSubscription.plan,
      newPlan,
      prorationAmount
    });
  }
}

// ✅ GOOD: First-principles subscription system
class SimpleSubscriptionSystem {
  // Problem: Users want to upgrade their plan and pay the difference
  // First principle: Charge difference in price, update plan
  // Solution: Simple plan switching with basic prorating

  private users: Record<string, User> = {};
  private planPrices = { basic: 10, pro: 50, enterprise: 200 };

  async upgradeUser(userId: string, newPlan: keyof typeof this.planPrices): Promise<void> {
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    const currentPrice = this.planPrices[user.plan as keyof typeof this.planPrices];
    const newPrice = this.planPrices[newPlan];
    const priceDiff = newPrice - currentPrice;

    if (priceDiff <= 0) {
      throw new Error('Cannot downgrade or same plan');
    }

    // Simple charge for the difference
    await this.chargeUser(userId, priceDiff);

    // Update user plan
    user.plan = newPlan;
    user.planUpdatedAt = new Date();

    console.log(`User ${userId} upgraded to ${newPlan} for $${priceDiff}`);
  }

  private async chargeUser(userId: string, amount: number): Promise<void> {
    console.log(`Charging user ${userId} $${amount}`);
  }
}

// ❌ BAD: Copying crypto wallet patterns
class CopiedCryptoWallet {
  // Blindly copied from "Advanced Cryptocurrency Wallet Architecture"
  private hierarchicalDeterministicKeys = new HDKeyGenerator();
  private multiSignatureManager = new MultiSigManager();
  private gasOptimizer = new GasOptimizationEngine();

  async sendTokens(toAddress: string, amount: number): Promise<string> {
    // Over-engineered transaction creation
    const keyPair = await this.hierarchicalDeterministicKeys.deriveKeyPair();
    const multiSigSignatures = await this.multiSignatureManager.collectSignatures();
    const optimizedGas = await this.gasOptimizer.calculateOptimalGasPrice();

    const transaction = await this.createComplexTransaction({
      from: keyPair.address,
      to: toAddress,
      amount,
      gasPrice: optimizedGas.price,
      signatures: multiSigSignatures
    });

    return await this.broadcastTransaction(transaction);
  }

  private async createComplexTransaction(data: any): Promise<any> {
    return data;
  }

  private async broadcastTransaction(tx: any): Promise<string> {
    return 'tx_hash';
  }
}

// ✅ GOOD: First-principles crypto wallet
class SimpleCryptoWallet {
  // Problem: Need to send tokens from one address to another
  // First principle: Create transaction, sign it, broadcast it
  // Solution: Basic transaction creation and signing

  constructor(
    private privateKey: string,
    private balance: number = 1000
  ) {}

  async sendTokens(toAddress: string, amount: number): Promise<string> {
    // Simple validation
    if (amount <= 0) throw new Error('Amount must be positive');
    if (amount > this.balance) throw new Error('Insufficient balance');
    if (!this.isValidAddress(toAddress)) throw new Error('Invalid address');

    // Create simple transaction
    const transaction = {
      from: this.getMyAddress(),
      to: toAddress,
      amount,
      timestamp: Date.now(),
      nonce: this.generateNonce()
    };

    // Simple signing (in real app, use proper crypto)
    const signature = this.signTransaction(transaction);

    // Update balance
    this.balance -= amount;

    // Return transaction hash
    return this.generateTxHash(transaction, signature);
  }

  private getMyAddress(): string {
    return '0x' + this.privateKey.substring(0, 40);
  }

  private isValidAddress(address: string): boolean {
    return address.startsWith('0x') && address.length === 42;
  }

  private signTransaction(tx: any): string {
    return 'signature_' + JSON.stringify(tx).length;
  }

  private generateNonce(): number {
    return Math.floor(Math.random() * 1000000);
  }

  private generateTxHash(tx: any, sig: string): string {
    return '0x' + (tx.nonce + sig.length).toString(16).padStart(64, '0');
  }
}

// Mock classes for bad examples
class DeepLearningModel {}
class TwitterSentimentAPI {
  async getMarketSentiment(symbol: string) {
    return { score: 0.8 };
  }
}
class AdvancedTechnicalAnalysis {
  async calculateAll(symbol: string) {
    return { momentum: 0.6 };
  }
}
class AdvancedBillingEngine {
  async calculateProration(current: any, pricing: any) {
    return 25;
  }
  async processUpgrade(data: any) {}
}
class SubscriptionOrchestrator {
  async getCurrentSubscription(userId: string) {
    return { plan: 'basic' };
  }
}
class DynamicPricingCalculator {
  async calculateDynamicPricing(plan: string) {
    return { amount: 50 };
  }
}
class HDKeyGenerator {
  async deriveKeyPair() {
    return { address: '0x123' };
  }
}
class MultiSigManager {
  async collectSignatures() {
    return ['sig1', 'sig2'];
  }
}
class GasOptimizationEngine {
  async calculateOptimalGasPrice() {
    return { price: 20 };
  }
}

interface User {
  id: string;
  plan: string;
  planUpdatedAt: Date;
}

// Key takeaway for juniors:
//
// ❌ Don't copy complex solutions from blogs/tutorials without understanding
// ❌ Don't add complexity that doesn't solve your actual problem
// ❌ Don't use advanced patterns when simple ones work
//
// ✅ Start with the basic problem: "What am I actually trying to do?"
// ✅ Use the simplest solution that works
// ✅ Add complexity only when you have a specific need for it
//
// EXAMPLES:
// Problem: "I need caching" → Start with Map, not Redis cluster
// Problem: "I need authentication" → Start with sessions, not JWT+OAuth+SAML
// Problem: "I need payments" → Start with Stripe, not custom billing engine
