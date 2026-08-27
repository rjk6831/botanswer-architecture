# ADR 0005: Meter AI consumption per tenant and per model

**Status:** Accepted · **Date:** 2026-07

## Context

Every model-assisted conversation has a variable marginal cost. Usage differs with conversation volume, context size, document processing, task type, and model choice. Flat-rate pricing over that variable-cost input can make the most engaged tenants the least sustainable to serve.

Metering can be bolted on later, but retrofitting it means threading a usage context through every call site after the fact, and the numbers are wrong until every path is covered.

## Decision

Meter at the point of the model call, not at the edges. Every call records tenant, model, task type and consumption, then settles against plan entitlements.

Billing is Stripe: three plan tiers across four currencies (THB, JPY, TWD, USD), monthly and annual. D1 migrations version the billing schema and tier constraints; reviewed Wrangler environment configuration binds the 24 Stripe Price objects and amounts for each environment. Metering and entitlement seams support current plan-limit checks and tier changes. Prepaid usage credits remain a possible extension, not a shipped capability claimed by this decision.

The quota guard sits in front of the router, so a tenant at limit is stopped before a provider call is made rather than after it has been paid for.

## Consequences

**Good.** Usage and cost are attributable per tenant, which makes unit economics queryable rather than leaving them as one provider invoice. Gating happens before spend, not after. Multi-currency pricing was designed in from the start rather than retrofitted.

**Bad.** Every model call path has to go through the metered wrapper, and a call site that bypasses it is silently wrong in a way tests do not naturally catch. Billing schema and environment-specific price bindings are two reviewed surfaces that must remain aligned.

**Neutral.** Twenty-four Stripe price objects across tiers, currencies and intervals is a lot of configuration surface for a private beta. It was still cheaper to define once than to migrate customers later.

## What I would revisit

Cost per conversation by plan tier is a query away and is not yet a dashboard. That number should be driving pricing, and currently it is checked manually.

Enforcement is also currently hard gating at limit. Soft-landing behaviour — degrade to a cheaper model before refusing service — would be better for the operator and is not built.
