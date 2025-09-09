// Principle 5: Ship Thin Vertical Slices

// ❌ BAD: Building entire payment system before users can pay anything
class BadPaymentSystem {
  // Trying to build ALL payment features before anyone can subscribe!

  // Week 1-2: Build complete Stripe integration
  async createCustomer(user: User): Promise<StripeCustomer> { /* ... */ }
  async createSubscription(customerId: string, priceId: string): Promise<Subscription> { /* ... */ }
  async updateSubscription(subId: string, newPriceId: string): Promise<Subscription> { /* ... */ }
  async cancelSubscription(subId: string): Promise<void> { /* ... */ }
  async pauseSubscription(subId: string): Promise<void> { /* ... */ }
  async resumeSubscription(subId: string): Promise<void> { /* ... */ }
  async addPromoCode(subId: string, promoCode: string): Promise<void> { /* ... */ }
  async handleFailedPayments(subId: string): Promise<void> { /* ... */ }

  // Week 3-4: Build complete billing features
  // - Multiple payment methods
  // - Invoice generation and sending
  // - Tax calculation for different regions
  // - Dunning management for failed payments
  // - Refund processing
  // - Usage-based billing with metering
  // - Multi-currency support
  // - Enterprise billing with custom terms

  // Week 5-6: Build advanced subscription features
  // - Free trials with different periods
  // - Grandfathered pricing for existing users
  // - Subscription analytics and reporting
  // - Webhook handling for all Stripe events
  // - Subscription lifecycle management
  // - Team subscriptions with seat management

  // Problem: 6 weeks later, still no one can pay you!
  // What if users just want to pay $10/month for basic access?
}

// ✅ GOOD: Ship payment slices - one complete flow at a time

// 🚀 SLICE 1 (Week 1): Just "Basic Subscription" - ship it!
class PaymentSlice1 {
  private subscriptions: Array<{userId: string, plan: string, active: boolean}> = [];

  async subscribe(userId: string, plan: 'basic' | 'pro'): Promise<string> {
    // Super simple: just create subscription record
    const subscription = {
      userId,
      plan,
      active: true
    };

    this.subscriptions.push(subscription);
    console.log(`✅ User ${userId} subscribed to ${plan} plan`);

    // For now, assume payment succeeded
    return 'subscription_' + Date.now();
  }

  isSubscribed(userId: string): boolean {
    return this.subscriptions.some(sub => sub.userId === userId && sub.active);
  }

  getUserPlan(userId: string): string | null {
    const sub = this.subscriptions.find(sub => sub.userId === userId && sub.active);
    return sub ? sub.plan : null;
  }
}

// Ship it! Users can "subscribe" and access features immediately!
// Revenue starts flowing (even if payment is manual for now)

// 🚀 SLICE 2 (Week 2): Add real Stripe payment - ship it!
class PaymentSlice2 {
  private subscriptions: Array<{
    userId: string,
    plan: string,
    active: boolean,
    stripeSubscriptionId?: string
  }> = [];

  async subscribe(userId: string, plan: 'basic' | 'pro', paymentMethodId: string): Promise<string> {
    console.log(`💳 Processing payment for ${userId}...`);

    try {
      // Real Stripe integration (simplified)
      const stripeCustomer = await this.createStripeCustomer(userId);
      const stripeSubscription = await this.createStripeSubscription(
        stripeCustomer.id,
        plan === 'basic' ? 'price_basic' : 'price_pro',
        paymentMethodId
      );

      const subscription = {
        userId,
        plan,
        active: true,
        stripeSubscriptionId: stripeSubscription.id
      };

      this.subscriptions.push(subscription);
      console.log(`✅ User ${userId} successfully subscribed to ${plan} with Stripe`);

      return stripeSubscription.id;

    } catch (error) {
      console.error(`❌ Payment failed for ${userId}:`, error.message);
      throw new Error('Payment failed. Please try again.');
    }
  }

  isSubscribed(userId: string): boolean {
    return this.subscriptions.some(sub => sub.userId === userId && sub.active);
  }

  private async createStripeCustomer(userId: string): Promise<{id: string}> {
    // Simplified Stripe customer creation
    return { id: 'cus_' + userId };
  }

  private async createStripeSubscription(customerId: string, priceId: string, paymentMethodId: string): Promise<{id: string}> {
    // Simplified Stripe subscription creation
    return { id: 'sub_' + Date.now() };
  }
}

// Ship again! Now real money is flowing through Stripe!
// Get feedback: "Payment was smooth!" or "Payment failed, fix X"

// 🚀 SLICE 3 (Week 3): Add plan upgrades/downgrades - ship it!
class PaymentSlice3 extends PaymentSlice2 {
  async changePlan(userId: string, newPlan: 'basic' | 'pro'): Promise<void> {
    const subscription = this.subscriptions.find(sub => sub.userId === userId && sub.active);

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    console.log(`🔄 Changing ${userId} from ${subscription.plan} to ${newPlan}...`);

    if (subscription.stripeSubscriptionId) {
      // Update Stripe subscription
      await this.updateStripeSubscription(
        subscription.stripeSubscriptionId,
        newPlan === 'basic' ? 'price_basic' : 'price_pro'
      );
    }

    subscription.plan = newPlan;
    console.log(`✅ User ${userId} plan changed to ${newPlan}`);
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = this.subscriptions.find(sub => sub.userId === userId && sub.active);

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    console.log(`❌ Canceling subscription for ${userId}...`);

    if (subscription.stripeSubscriptionId) {
      await this.cancelStripeSubscription(subscription.stripeSubscriptionId);
    }

    subscription.active = false;
    console.log(`✅ Subscription canceled for ${userId}`);
  }

  private async updateStripeSubscription(subscriptionId: string, newPriceId: string): Promise<void> {
    // Simplified Stripe subscription update
    console.log(`Updating Stripe subscription ${subscriptionId} to ${newPriceId}`);
  }

  private async cancelStripeSubscription(subscriptionId: string): Promise<void> {
    // Simplified Stripe subscription cancellation
    console.log(`Canceling Stripe subscription ${subscriptionId}`);
  }
}

// Ship again! Users can now upgrade/downgrade and cancel!
// Get feedback: "Love the flexibility!" or "Need annual billing"

// 🚀 SLICE 4 (Week 4): Add usage-based billing for crypto research - ship it!
class PaymentSlice4 extends PaymentSlice3 {
  private usage: Array<{userId: string, tokensUsed: number, month: string}> = [];

  async recordTokenUsage(userId: string, tokensUsed: number): Promise<void> {
    const month = new Date().toISOString().slice(0, 7); // "2024-01" format

    const existing = this.usage.find(u => u.userId === userId && u.month === month);

    if (existing) {
      existing.tokensUsed += tokensUsed;
    } else {
      this.usage.push({ userId, tokensUsed, month });
    }

    console.log(`📊 Recorded ${tokensUsed} tokens for user ${userId}`);

    // Check if user exceeded their plan limits
    await this.checkUsageLimits(userId);
  }

  private async checkUsageLimits(userId: string): Promise<void> {
    const plan = this.getUserPlan(userId);
    const currentUsage = this.getCurrentMonthUsage(userId);

    const limits = {
      basic: 10000,   // 10k tokens/month
      pro: 100000     // 100k tokens/month
    };

    const limit = limits[plan as keyof typeof limits] || 0;

    if (currentUsage > limit * 0.8) { // 80% warning
      console.log(`⚠️  User ${userId} at ${Math.round(currentUsage/limit*100)}% of ${plan} plan limit`);
    }

    if (currentUsage > limit) {
      console.log(`🚫 User ${userId} exceeded ${plan} plan limit! Consider upgrading.`);
    }
  }

  getCurrentMonthUsage(userId: string): number {
    const month = new Date().toISOString().slice(0, 7);
    const usage = this.usage.find(u => u.userId === userId && u.month === month);
    return usage ? usage.tokensUsed : 0;
  }
}

// Ship again! Now you can track LLM costs and encourage upgrades!
// Get feedback: "Usage tracking is helpful!" or "Need better analytics"

// 🚀 SLICE 5 (Week 5): Add free trial - ship it!
class PaymentSlice5 extends PaymentSlice4 {
  private trials: Array<{userId: string, startDate: string, plan: string}> = [];

  async startFreeTrial(userId: string, plan: 'basic' | 'pro'): Promise<void> {
    // Check if user already had a trial
    const existingTrial = this.trials.find(t => t.userId === userId);
    if (existingTrial) {
      throw new Error('Free trial already used');
    }

    // Start 7-day free trial
    this.trials.push({
      userId,
      startDate: new Date().toISOString(),
      plan
    });

    // Create "subscription" but don't charge yet
    const subscription = {
      userId,
      plan,
      active: true,
      stripeSubscriptionId: undefined // No Stripe subscription during trial
    };

    this.subscriptions.push(subscription);
    console.log(`🎁 Started 7-day free trial for user ${userId} on ${plan} plan`);
  }

  isInFreeTrial(userId: string): boolean {
    const trial = this.trials.find(t => t.userId === userId);
    if (!trial) return false;

    const trialStart = new Date(trial.startDate);
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return new Date() < trialEnd;
  }

  async convertTrialToSubscription(userId: string, paymentMethodId: string): Promise<string> {
    const trial = this.trials.find(t => t.userId === userId);
    if (!trial) {
      throw new Error('No active trial found');
    }

    if (!this.isInFreeTrial(userId)) {
      throw new Error('Trial period expired');
    }

    console.log(`💳 Converting trial to paid subscription for user ${userId}...`);

    // Convert to real Stripe subscription
    return await this.subscribe(userId, trial.plan as 'basic' | 'pro', paymentMethodId);
  }
}

// Ship again! Users can try before they buy!
// Get feedback: "7 days perfect!" or "Need 14 days" or "Trial convinced me!"

// Key takeaway: Each slice generates revenue and user feedback immediately!
// Week 1: Users can subscribe (manual payment) → $$$
// Week 2: Automated Stripe payments → More $$$
// Week 3: Users can upgrade/cancel → Better retention
// Week 4: Usage tracking → Upgrade encouragement
// Week 5: Free trials → More signups
