// Principle 2: Bias to Reversible Decisions

// ❌ BAD: Hard-coded to Stripe - can't switch later
class BadPaymentService {
  async chargeUser(amount: number, cardToken: string): Promise<string> {
    // Directly using Stripe - stuck with it forever!
    const stripe = new Stripe(process.env.STRIPE_KEY!);
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      source: cardToken
    });
    return charge.id;
  }
}

// ✅ GOOD: Can easily switch payment providers
interface PaymentProvider {
  chargeUser(amount: number, cardToken: string): Promise<string>;
}

class StripeProvider implements PaymentProvider {
  async chargeUser(amount: number, cardToken: string): Promise<string> {
    const stripe = new Stripe(process.env.STRIPE_KEY!);
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      source: cardToken
    });
    return charge.id;
  }
}

class PayPalProvider implements PaymentProvider {
  async chargeUser(amount: number, cardToken: string): Promise<string> {
    // PayPal logic here
    return 'paypal_transaction_123';
  }
}

class GoodPaymentService {
  constructor(private provider: PaymentProvider) {}

  async chargeUser(amount: number, cardToken: string): Promise<string> {
    return this.provider.chargeUser(amount, cardToken);
  }
}

// Easy to switch providers!
const paymentService = new GoodPaymentService(
  process.env.PAYMENT_PROVIDER === 'paypal'
    ? new PayPalProvider()
    : new StripeProvider()
);

// Another simple example: Database choice
// ❌ BAD: Hard-coded to PostgreSQL
class BadUserService {
  async getUser(id: string): Promise<User> {
    // Stuck with PostgreSQL forever!
    const client = new PostgresClient();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}

// ✅ GOOD: Can switch databases easily
interface Database {
  findUser(id: string): Promise<User>;
}

class PostgresDB implements Database {
  async findUser(id: string): Promise<User> {
    const client = new PostgresClient();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}

class MongoDBDatabase implements Database {
  async findUser(id: string): Promise<User> {
    const db = new MongoClient();
    return await db.collection('users').findOne({ _id: id });
  }
}

class GoodUserService {
  constructor(private db: Database) {}

  async getUser(id: string): Promise<User> {
    return this.db.findUser(id);
  }
}

// Switch database by changing config
const userService = new GoodUserService(
  process.env.DB_TYPE === 'mongo'
    ? new MongoDBDatabase()
    : new PostgresDB()
);

// Key takeaway: Use interfaces to make decisions reversible!
interface User {
  id: string;
  email: string;
}
