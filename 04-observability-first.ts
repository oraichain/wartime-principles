// Principle 4: Observability First

// ❌ BAD: No visibility when things go wrong
class BadPaymentService {
  async chargeUser(userId: string, amount: number): Promise<void> {
    // No logs - you have no idea what's happening!
    const user = await this.getUser(userId);
    const paymentResult = await this.processPayment(user, amount);
    await this.updateDatabase(userId, paymentResult);
    // When payment fails at 3am, good luck debugging!
  }

  private async getUser(userId: string) { /* ... */ }
  private async processPayment(user: any, amount: number) { /* ... */ }
  private async updateDatabase(userId: string, result: any) { /* ... */ }
}

// ✅ GOOD: Add logs so you can see what's happening
class GoodPaymentService {
  async chargeUser(userId: string, amount: number): Promise<void> {
    console.log(`Starting payment for user ${userId}, amount: $${amount}`);

    try {
      const user = await this.getUser(userId);
      console.log(`User found: ${user.email}`);

      const paymentResult = await this.processPayment(user, amount);
      console.log(`Payment processed: ${paymentResult.status}, ID: ${paymentResult.id}`);

      await this.updateDatabase(userId, paymentResult);
      console.log(`Database updated for user ${userId}`);

      console.log(`✅ Payment completed successfully for ${userId}`);

    } catch (error) {
      console.error(`❌ Payment failed for user ${userId}:`, error.message);
      throw error;
    }
  }

  private async getUser(userId: string) {
    return { id: userId, email: 'user@example.com' };
  }
  private async processPayment(user: any, amount: number) {
    return { id: 'payment_123', status: 'success' };
  }
  private async updateDatabase(userId: string, result: any) { /* ... */ }
}

// Even better: Add timing to see what's slow
class BetterPaymentService {
  async chargeUser(userId: string, amount: number): Promise<void> {
    const startTime = Date.now();
    console.log(`🚀 Starting payment for user ${userId}, amount: $${amount}`);

    try {
      // Time each step to find bottlenecks
      let stepStart = Date.now();
      const user = await this.getUser(userId);
      console.log(`👤 User found in ${Date.now() - stepStart}ms: ${user.email}`);

      stepStart = Date.now();
      const paymentResult = await this.processPayment(user, amount);
      console.log(`💳 Payment processed in ${Date.now() - stepStart}ms: ${paymentResult.status}`);

      stepStart = Date.now();
      await this.updateDatabase(userId, paymentResult);
      console.log(`💾 Database updated in ${Date.now() - stepStart}ms`);

      const totalTime = Date.now() - startTime;
      console.log(`✅ Payment completed in ${totalTime}ms for ${userId}`);

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ Payment failed after ${totalTime}ms for user ${userId}:`, error.message);
      throw error;
    }
  }

  private async getUser(userId: string) {
    // Simulate slow database
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id: userId, email: 'user@example.com' };
  }

  private async processPayment(user: any, amount: number) {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 200));
    return { id: 'payment_123', status: 'success' };
  }

  private async updateDatabase(userId: string, result: any) {
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// Simple example: API with basic observability
// ❌ BAD: No visibility into API calls
class BadCryptoAPI {
  async getBitcoinPrice(): Promise<number> {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    return data.bitcoin.usd;
  }
}

// ✅ GOOD: Log what's happening
class GoodCryptoAPI {
  async getBitcoinPrice(): Promise<number> {
    console.log('📈 Fetching Bitcoin price from CoinGecko...');
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const price = data.bitcoin.usd;
      const duration = Date.now() - startTime;

      console.log(`✅ Bitcoin price fetched in ${duration}ms: $${price}`);
      return price;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Failed to fetch Bitcoin price after ${duration}ms:`, error.message);
      throw error;
    }
  }
}

// Key takeaway: Add console.log to see what your code is doing!
// When things break, you'll know exactly where and why.
