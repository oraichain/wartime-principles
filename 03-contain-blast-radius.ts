// Principle 3: Contain the Blast Radius

// ❌ BAD: One failure breaks everything
class BadUserRegistration {
  async registerUser(email: string, password: string): Promise<void> {
    // If ANY step fails, the entire registration fails!
    const user = await this.createUser(email, password);
    await this.sendWelcomeEmail(email);        // Email server down = registration fails
    await this.addToNewsletter(email);         // Newsletter API down = registration fails
    await this.trackAnalytics(user.id);        // Analytics down = registration fails
    await this.notifyAdmins(user.id);          // Admin notification fails = registration fails
  }

  private async createUser(email: string, password: string) { /* ... */ }
  private async sendWelcomeEmail(email: string) { /* ... */ }
  private async addToNewsletter(email: string) { /* ... */ }
  private async trackAnalytics(userId: string) { /* ... */ }
  private async notifyAdmins(userId: string) { /* ... */ }
}

// ✅ GOOD: Core operation succeeds even if extras fail
class GoodUserRegistration {
  async registerUser(email: string, password: string): Promise<{ success: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    // Core operation - MUST succeed
    const user = await this.createUser(email, password);

    // Extra operations - failures are contained
    await this.doExtraStuff(email, user.id, warnings);

    return { success: true, warnings };
  }

  private async doExtraStuff(email: string, userId: string, warnings: string[]): Promise<void> {
    // Try each operation, but don't let failures break registration
    try {
      await this.sendWelcomeEmail(email);
    } catch (error) {
      warnings.push('Welcome email failed - will retry later');
    }

    try {
      await this.addToNewsletter(email);
    } catch (error) {
      warnings.push('Newsletter signup failed');
    }

    try {
      await this.trackAnalytics(userId);
    } catch (error) {
      warnings.push('Analytics tracking failed');
    }

    try {
      await this.notifyAdmins(userId);
    } catch (error) {
      warnings.push('Admin notification failed');
    }
  }

  private async createUser(email: string, password: string) {
    return { id: '123', email };
  }
  private async sendWelcomeEmail(email: string) { /* ... */ }
  private async addToNewsletter(email: string) { /* ... */ }
  private async trackAnalytics(userId: string) { /* ... */ }
  private async notifyAdmins(userId: string) { /* ... */ }
}

// Another simple example: API calls with fallbacks
// ❌ BAD: One API failure breaks everything
class BadCryptoPriceService {
  async getCryptoPrice(symbol: string): Promise<number> {
    // If CoinGecko is down, entire function fails!
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    const data = await response.json();
    return data[symbol].usd;
  }
}

// ✅ GOOD: Fallbacks contain the blast radius
class GoodCryptoPriceService {
  async getCryptoPrice(symbol: string): Promise<{ price: number | null; source: string }> {
    // Try primary source
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
      const data = await response.json();
      return { price: data[symbol].usd, source: 'CoinGecko' };
    } catch (error) {
      console.warn('CoinGecko failed, trying backup...');
    }

    // Try backup source
    try {
      const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${symbol}`);
      const data = await response.json();
      return { price: parseFloat(data.data.rates.USD), source: 'Coinbase' };
    } catch (error) {
      console.warn('Coinbase failed, using cached data...');
    }

    // Last resort: cached data
    const cachedPrice = this.getCachedPrice(symbol);
    return { price: cachedPrice, source: 'Cache' };
  }

  private getCachedPrice(symbol: string): number | null {
    // Return cached price or null
    return 50000; // Example cached Bitcoin price
  }
}

// Key takeaway: Separate critical from non-critical operations!
// Critical = must succeed, Non-critical = nice to have
