# Wartime Principles for Software Development

Simple, practical examples of 10 essential software engineering principles focused on **SaaS and crypto development** for junior developers.

## Principles & Code Examples

1. **[KISS (Keep It Simple, Stupid)](./01-kiss.ts)**

   - Simple vs over-complicated crypto price fetching
   - Basic subscription checks vs complex validation engines

2. **[Bias to Reversible Decisions](./02-reversible-decisions.ts)**

   - Interface-based payment providers (Stripe, PayPal)
   - Swappable database implementations (PostgreSQL, MongoDB)

3. **[Contain the Blast Radius](./03-contain-blast-radius.ts)**

   - Graceful failure handling in user registration
   - Crypto price fetching with fallback APIs

4. **[Observability First](./04-observability-first.ts)**

   - Adding logs and timing to payment processing
   - Debugging crypto API calls with proper error handling

5. **[Ship Thin Vertical Slices](./05-thin-vertical-slices.ts)**

   - Incremental payment system development
   - From basic subscription to advanced features

6. **[Prefer Boring, Proven Tech](./06-boring-proven-tech.ts)**

   - Reliable crypto price fetching vs complex ML systems
   - Simple queue processing vs advanced orchestration

7. **[Tell, Don't Ask & Law of Demeter](./07-tell-dont-ask.ts)**

   - Crypto wallet management with proper encapsulation
   - Subscription upgrades without deep object chains

8. **[First-Principles Thinking](./08-first-principles.ts)**

   - Simple trading bot vs complex AI systems
   - Basic subscription system vs over-engineered billing

9. **[Composition over Inheritance](./09-composition-over-inheritance.ts)**

   - Flexible user permission systems
   - Multi-currency crypto wallets with features

10. **[Scale Up Before Scale Out](./10-scale-up-before-scale-out.ts)**
    - Optimizing single instance vs premature microservices
    - Caching and database optimization techniques

## Focus Areas

- **SaaS Development**: User management, subscriptions, billing, API limits
- **Crypto Applications**: Wallet management, trading, price fetching, portfolio tracking
- **Junior-Friendly**: Simple examples, clear before/after comparisons, practical takeaways

Each file contains bad vs good examples with explanations of why certain approaches work better for maintainable, scalable applications.
