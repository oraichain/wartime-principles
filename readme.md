# Wartime Engineering Principles

A practical guide to ship fast **without** wreckage. Ranked by wartime impact (speed + survivability now) vs. effort to adopt.

Use this as a checklist and code reference for your team.

---

# Tier 1 — Core Wartime Survival (Always Apply)

## 1) [KISS (Keep It Simple, Stupid)](./01-kiss.ts)

> 💡 Prefer straightforward designs and code over clever abstractions.

**Why:** Simplicity ships faster, fails in simpler ways, and is easier to roll back under pressure.

**How**

- Write **straight-line code** where possible; avoid deep call chains and indirection.
- Prefer **one clear code path**; hide experiments behind **feature flags**.
- Choose **boring, well-known libraries**; avoid framework acrobatics.
- Keep functions/classes **small, single-purpose**; name them after the business action.
- Remove **premature abstractions**; duplicate once or twice if it saves time **now**.

---

## 2) [Bias to Reversible Decisions](./02-reversible-decisions.ts)

> 💡 Prefer changes you can **turn off or undo** quickly.

**Why:** Lets you move fast safely; wrong bets don’t become outages.

**How**

- Ship behind **feature flags / kill switches**; default off for risky changes.
- **Small PRs** with clear revert points; avoid mega-commits.
- **Branch-by-abstraction**: keep old/new impls switchable during refactors.
- **Backward-compatible DB migrations** (additive first; remove later).
- Automate **one-click rollback** in CI/CD.

## 3) [Contain the Blast Radius](./03-contain-blast-radius.ts)

> 💡 Design so failures are **isolated** and the system **degrades gracefully**.

**Why:** One broken dependency shouldn’t take the whole product down.

**How**

- Add **timeouts + retries with jitter** to all network calls.
- Use **circuit breakers** to fail fast when a dependency is sick.
- Introduce **rate limits/quotas** per client/tenant to protect shared resources.
- Make handlers **idempotent** so retries are safe.
- Isolate resources with **bulkheads** (separate pools/queues).

---

## 4) [Observability First, Not Later](./04-observability-first.ts)

> 💡 Build **visibility** (logs, metrics, traces) into new code paths immediately.

**Why:** You can’t fix what you can’t see; fast detection enables fast rollback.

**How**

- Add **structured logs** with **trace/request IDs** and key fields.
- Emit **golden signals**: latency, error rate, throughput, saturation.
- Instrument **critical spans** with distributed tracing.
- Create **per-release dashboards** + alerts before rollout.
- Define **SLOs** and use error budgets to gate releases.

---

# Tier 2 — Strong Enablers (Use Often)

## 5) [Ship Thin Vertical Slices](./05-thin-vertical-slices.ts)

> 💡 Deliver the **smallest end-to-end** outcome that moves the metric.

**Why:** Real feedback fast; less unfinished scaffolding; lower coordination overhead.

**How**

- Slice by **user journey** (input → process → output), not layers.
- **Stub/memoize** slow or unavailable dependencies to keep flow working.
- Define **“good-enough” acceptance tests**; time-box unknowns.
- Cut scope aggressively; create a **“Not Doing Now”** list.
- Avoid parallel partial layers — always close the loop.

---

## 6) [Prefer Boring, Proven Tech](./06-boring-proven-tech.ts)

> 💡 Novelty is a tax in wartime; choose **stable, known** tools.

**Why:** Fewer unknowns, faster onboarding, simpler ops when you’re sleep-deprived.

**How**

- Standardize on **known stacks**; avoid introducing new frameworks mid-crunch.
- Use **managed services** (DB, cache, queues, auth) over self-hosted.
- Reuse **existing patterns** in the repo; resist greenfield rewrites.
- Document **one blessed way** to do common tasks (HTTP, DB, logging).

---

## 7) [Tell, Don't Ask & Law of Demeter](./07-tell-dont-ask.ts)

> 💡 Push behavior to the object with the data (**Tell, Don't Ask**).
> Interact only with **direct collaborators**, not chained internals (**LoD**).

**Why:** Reduces coupling and “train-wreck” calls; changes stay local and fast.

**How**

- Replace `a.b().c().d()` with **facade methods**: `a.doThing()`.
- Move decision logic **into** the object that owns the state.
- Add **adapters** around messy dependencies to expose clean commands.
- Test via **behavioral contracts** (public methods), not internal state.

# Tier 3 — Contextual / Strategic (Apply When Fit)

## 8) [First-Principles Thinking](./08-first-principles.ts)

> 💡 Derive solutions from **goals and constraints**, not habit.

**Why:** Avoids cargo culting; finds leaner routes when precedent doesn’t fit.

**How**

- Define **success metrics** (e.g., p95 latency < 300ms, <1% error rate).
- List **hard constraints** (SLOs, budget, headcount, deadlines).
- Remove **nice-to-haves**; cut to minimal requirement set.
- Compare options with a **simple scorecard** (impact × time × risk).
- Decide quickly; make it **reversible** when possible.

## 9) [Composition over Inheritance](./09-composition-over-inheritance.ts)

> 💡 Assemble behavior by **combining** small parts, not extending deep hierarchies.

**Why:** Localizes change; parallelizes work; fewer “fragile base class” surprises.

**How**

- Use **interfaces** + **dependency injection** to swap implementations.
- Prefer **Strategy/Decorator** over base-class branching.
- Keep modules **replaceable**; avoid global singletons.
- Test at **seams** with contract tests.

## 10) [Scale Up Before Scale Out](./10-scale-up-before-scale-out.ts)

> 💡 Solve load by **adding resources/config** first; optimize code later.

**Why:** Buys time quickly without risky refactors.

**How**

- **Increase replicas/instances**; raise **CPU/memory** limits.
- Add a **cache** (CDN, in-memory) in front of hot paths.
- Use **autoscaling** with sane floor/ceiling and health checks.
- Defer algorithmic optimizations until demand stabilizes.

# Bonus Habits

- **Debt Ledger**: Log every shortcut with an owner and due date.
- **Pre-Ship / Post-Ship Checklist**: Verify flag toggles, rollback tested, metrics live, runbook linked.
