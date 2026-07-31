# ADR 0005: Meter AI consumption per tenant and per model

**Status:** Accepted · **Date:** 2026-07

## Context

Every conversation costs money, and the amount is unpredictable. A tenant with chatty customers and long documents can cost an order of magnitude more than a quiet one on the same plan. Flat-rate pricing over a variable-cost input is a structural way to lose money on your best-engaged customers.

Metering can be bolted on later, but retrofitting it means threading a usage context through every call site after the fact, and the numbers are wrong until every path is covered.

## Decision

Meter at the point of the model call, not at the edges. Every call records tenant, model, task type and consumption, then settles against plan entitlements.

Billing is Stripe: three plan tiers across four currencies (THB, JPY, TWD, USD), monthly and annual, seeded through migrations so environments stay reproducible rather than hand-configured. Metered-billing hooks are in place for plan-limit gating, tier upgrades and prepaid usage credits.

The quota guard sits in front of the router, so a tenant at limit is stopped before a provider call is made rather than after it has been paid for.

## Consequences

**Good.** Unit economics are observable per tenant, which is what makes pricing a decision rather than a guess. Gating happens before spend, not after. Multi-currency pricing was designed in from the start rather than retrofitted, which matters in markets where charging in USD is itself a conversion problem.

**Bad.** Every model call path has to go through the metered wrapper, and a call site that bypasses it is silently wrong in a way tests do not naturally catch. The pricing seed data is a migration concern, which couples billing config to schema versioning more tightly than is ideal.

**Neutral.** Twenty-four Stripe price objects across tiers, currencies and intervals is a lot of configuration surface for a pre-launch product. It was still cheaper to define once than to migrate customers later.

## What I would revisit

Cost per conversation by plan tier is a query away and is not yet a dashboard. That number should be driving pricing, and currently it is checked manually.

Enforcement is also currently hard gating at limit. Soft-landing behaviour — degrade to a cheaper model before refusing service — would be better for the operator and is not built.
