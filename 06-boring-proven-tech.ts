// Principle 6: Prefer Boring, Proven Tech

// ❌ BAD: Choosing exciting new tech without considering trade-offs
class ExcitingTechChoices {
  // "Let's use the new GraphQL Federation with microservices!"
  async getCryptoPrice(symbol: string): Promise<number> {
    // Using 5 different microservices with GraphQL federation
    const priceService = new GraphQLClient('http://price-service/graphql');
    const validationService = new GraphQLClient('http://validation-service/graphql');
    const cacheService = new GraphQLClient('http://cache-service/graphql');

    // Complex query across multiple services
    const query = `
      query GetPrice($symbol: String!) {
        price(symbol: $symbol) @requires(fields: "validation { isValid }") {
          value
          timestamp
        }
        validation(symbol: $symbol) {
          isValid
          confidence
        }
        cache(key: $symbol) {
          hit
          ttl
        }
      }
    `;

    // What could go wrong? 🤔
    // - Network latency between 5 services
    // - Complex debugging when query fails
    // - Need to hire GraphQL experts
    // - Overkill for simple price lookup
    return 50000; // If it even works...
  }

  // "Let's use the latest NoSQL document database!"
  async saveUserQuery(userId: string, query: string): Promise<void> {
    // Using brand new document database with "revolutionary" query language
    const db = new RevolutionaryDB();

    await db.collection('users').aggregate([
      { $match: { _id: userId } },
      { $addFields: {
        queries: {
          $concatArrays: [
            "$queries",
            [{ text: query, timestamp: new Date(), embedding: await this.generateEmbedding(query) }]
          ]
        }
      }},
      { $merge: { into: "users", whenMatched: "replace" } }
    ]);

    // Problems:
    // - Learning curve for new query language
    // - Limited community support
    // - Might have bugs in aggregation pipeline
    // - Over-engineered for simple append operation
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Another exciting choice: latest embedding model
    return []; // Placeholder
  }
}

// ✅ GOOD: Boring tech choices that solve real problems
class BoringTechChoices {

  // SCENARIO: Need fast crypto prices with high availability
  // EXCITING CHOICE: Build custom load balancer with ML-based routing
  // BORING CHOICE: Use proven load balancing pattern

  private priceProviders = [
    { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3/simple/price', weight: 3 },
    { name: 'CoinCap', url: 'https://api.coincap.io/v2/assets', weight: 2 },
    { name: 'CryptoCompare', url: 'https://min-api.cryptocompare.com/data/price', weight: 1 }
  ];

  async getCryptoPrice(symbol: string): Promise<number> {
    // Boring but proven: Simple round-robin with fallback
    for (const provider of this.priceProviders) {
      try {
        const price = await this.fetchFromProvider(provider, symbol);
        console.log(`✅ Got price from ${provider.name}: $${price}`);
        return price;
      } catch (error) {
        console.warn(`⚠️ ${provider.name} failed, trying next...`);
        continue;
      }
    }

    throw new Error('All price providers failed');
  }

  private async fetchFromProvider(provider: any, symbol: string): Promise<number> {
    // Boring but works: Simple fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const response = await fetch(
        `${provider.url}?ids=${symbol}&vs_currencies=usd`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data[symbol]?.usd || data.data?.[0]?.priceUsd || 0;

    } finally {
      clearTimeout(timeoutId);
    }
  }

  // SCENARIO: Store user queries safely
  // EXCITING CHOICE: Use latest graph database with semantic relationships
  // BORING CHOICE: PostgreSQL with proper parameterized queries

  async saveUserQuery(userId: string, query: string, result: string): Promise<void> {
    // Boring but secure: Parameterized queries prevent SQL injection
    const sql = `
      INSERT INTO user_queries (user_id, query_text, result_text, created_at)
      VALUES ($1, $2, $3, NOW())
    `;

    // $1, $2, $3 prevent SQL injection - boring but essential
    await this.executeQuery(sql, [userId, query, result]);

    console.log(`💾 Saved query for user ${userId} safely`);
  }

  async getUserQueries(userId: string, limit: number = 10): Promise<any[]> {
    // Boring but safe: Always use parameterized queries
    const sql = `
      SELECT query_text, result_text, created_at
      FROM user_queries
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    return await this.executeQuery(sql, [userId, limit]);
  }

  private async executeQuery(sql: string, params: any[]): Promise<any[]> {
    // Mock implementation - in real app, use pg library
    console.log('Executing safe SQL:', sql, 'with params:', params);
    return [];
  }

  // SCENARIO: Handle high LLM request volume
  // EXCITING CHOICE: Custom AI request router with predictive scaling
  // BORING CHOICE: Simple rate limiting + queue

  private requestQueue: Array<{userId: string, query: string, resolve: Function, reject: Function}> = [];
  private processing = false;
  private readonly MAX_CONCURRENT = 5; // Boring but prevents API overload

  async analyzeCrypto(userId: string, query: string): Promise<string> {
    // Boring but effective: Simple queue to prevent API rate limits
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ userId, query, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;

    // Process requests in batches - boring but prevents rate limiting
    while (this.requestQueue.length > 0) {
      const batch = this.requestQueue.splice(0, this.MAX_CONCURRENT);

      await Promise.allSettled(
        batch.map(async (request) => {
          try {
            const result = await this.callOpenAI(request.query);
            request.resolve(result);
          } catch (error) {
            request.reject(error);
          }
        })
      );

      // Boring but necessary: Wait between batches to respect rate limits
      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      }
    }

    this.processing = false;
  }

  private async callOpenAI(query: string): Promise<string> {
    // Boring but proven: Standard OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4', // Boring but stable
        messages: [
          { role: 'system', content: 'You are a crypto research analyst.' },
          { role: 'user', content: query }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Key takeaway: Choose boring tech that solves your actual problems!

// THE DECISION FRAMEWORK:
//
// 1. IDENTIFY THE REAL PROBLEM:
//    ❌ "We need the latest tech to be innovative"
//    ✅ "We need reliable crypto prices with 99.9% uptime"
//
// 2. BORING TECH WINS WHEN:
//    - You have paying customers (reliability matters)
//    - You need to hire developers quickly
//    - You want to focus on business logic, not infrastructure
//    - You need predictable performance and costs
//
// 3. EXCITING TECH IS OK WHEN:
//    - It's your core competitive advantage
//    - You have time to become expert in it
//    - The boring solution genuinely can't handle your scale
//    - You can afford the risk of it failing
//
// 4. EXAMPLES FOR CRYPTO SAAS:
//
//    LOAD BALANCING CRYPTO PRICES:
//    ❌ Exciting: Custom ML-based routing system
//    ✅ Boring: Simple round-robin with fallback (shown above)
//
//    DATABASE QUERIES:
//    ❌ Exciting: Latest graph database with complex queries
//    ✅ Boring: PostgreSQL with parameterized queries (prevents SQL injection)
//
//    LLM REQUEST HANDLING:
//    ❌ Exciting: Custom AI request router with predictive scaling
//    ✅ Boring: Simple queue with rate limiting (shown above)
//
//    REAL-TIME UPDATES:
//    ❌ Exciting: Custom WebSocket cluster with message routing
//    ✅ Boring: Server-Sent Events or simple WebSocket library
//
// 5. THE BORING TECH STACK THAT WORKS:
//    - Database: PostgreSQL (everyone knows SQL, handles 99% of use cases)
//    - API: Express.js or Fastify (huge community, well-documented)
//    - LLM: OpenAI GPT-4 (stable, reliable, good docs)
//    - Crypto Data: CoinGecko + fallbacks (free tier, multiple providers)
//    - Payments: Stripe (industry standard for SaaS)
//    - Hosting: Railway, Vercel, or AWS (proven deployment platforms)
//    - Caching: Redis (if needed - don't add complexity early)
//
// Remember: Your customers don't care if you use the latest tech.
// They care if your product works reliably and solves their problems.
