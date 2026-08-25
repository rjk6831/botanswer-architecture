# ADR 0002: Multi-model routing rather than a single provider

**Status:** Accepted; implemented but inactive in the deployed customer runtime · **Date:** 2026-07

## Context

BotAnswer's model-assisted customer-answering design depends on model calls. In a single-provider design, a provider outage would remove that path entirely.

At this snapshot, the router and provider adapters are implemented behind activation flags, while the deployed customer runtime has both provider and generative modes disabled. Production website ingestion uses a separate direct OpenAI fallback seam; it is not routed through the customer-answering router described here.

The customer tasks are also not alike. Generating a greeting, translating a message, suggesting structured content and answering a grounded question about a business have different quality floors and very different cost tolerances. Pinning all of them to one model means either overpaying for the cheap tasks or under-serving the hard ones.

Tenants differ too. A clinic in Bangkok and a retailer in Osaka can have different language mixes, latency requirements, and plan-level cost preferences.

## Decision

Model selection is per-tenant and per-task, resolved at call time through a router rather than hard-coded at each call site.

Three providers are integrated behind a common adapter interface: OpenAI, Anthropic Claude and Google Gemini. Each adapter normalizes request shape, response shape and error semantics, so the router deals in one vocabulary.

The router resolves a model from tenant configuration and task type, then attempts eligible providers in a defined order, falling through on error or timeout. Structured responses used by application code are constrained to a schema and re-validated with Zod before anything downstream sees them.

Usage is metered per tenant and per model at the point of the call, then settled against plan entitlements.

## Consequences

**Good.** Once deliberately activated, ordered fallback reduces dependence on any single provider and gives retryable failures a configured alternate path. If no eligible provider succeeds, deterministic behavior and fail-closed handoff rules still apply; availability is not promised by the router alone. Cost is attributable to a tenant and model rather than arriving as one opaque monthly number. A new provider enters through the adapter seam instead of being added at every call site.

**Bad.** Three integrations to keep current instead of one, and provider APIs move. The adapter layer is real code with real tests. Behaviour differences between providers on structured output are a persistent source of subtle bugs, and the re-validation layer exists because of them.

**Neutral.** Routing config is per-tenant, so misconfiguration is possible. Provisioning seeds defaults, but customer provider/generative activation remains an explicit deployment decision rather than an incidental side effect of tenant creation.

## What I would revisit

When activated, routing is static per tenant and task. Routing on observed latency and error rate rather than a fixed order would be better, and needs per-provider health tracking that does not exist yet.

There is also no automatic quality comparison across providers for the same task. Right now that judgment is manual, which does not scale past a small number of tenants.
