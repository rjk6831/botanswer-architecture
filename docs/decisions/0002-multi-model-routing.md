# ADR 0002: Multi-model routing rather than a single provider

**Status:** Accepted · **Date:** 2026-07

## Context

BotAnswer's core loop is a model call. If the provider is down, the product is down.

The tasks are also not alike. Generating a greeting, translating a message, extracting structured data from a photographed menu and answering a grounded question about a business have different quality floors and very different cost tolerances. Pinning all of them to one model means either overpaying for the cheap tasks or under-serving the hard ones.

Tenants differ too. A clinic in Bangkok and a retailer in Osaka have different language mixes, different sensitivity to latency, and different willingness to pay.

## Decision

Model selection is per-tenant and per-task, resolved at call time through a router rather than hard-coded at each call site.

Three providers are integrated behind a common adapter interface: OpenAI, Anthropic Claude and Google Gemini. Each adapter normalizes request shape, response shape and error semantics, so the router deals in one vocabulary.

The router resolves a model from tenant configuration and task type, then attempts providers in a defined order, falling through on error or timeout. Every response is constrained to a schema and re-validated with Zod before anything downstream sees it — provider differences in structured-output behaviour do not leak.

Usage is metered per tenant and per model at the point of the call, then settled against plan entitlements.

## Consequences

**Good.** A provider incident degrades answer quality instead of taking the product down. Cost is attributable to a tenant and a model rather than arriving as one opaque monthly number, which is what makes plan-limit gating and prepaid credits possible at all. Adding a fourth provider is one adapter, not a refactor.

**Bad.** Three integrations to keep current instead of one, and provider APIs move. The adapter layer is real code with real tests. Behaviour differences between providers on structured output are a persistent source of subtle bugs, and the re-validation layer exists because of them.

**Neutral.** Routing config is per-tenant, so misconfiguration is possible. Provisioning seeds sane defaults, and the platform seed migration is what makes a new tenant work without manual setup.

## What I would revisit

Routing is currently static per tenant and task. Routing on observed latency and error rate rather than a fixed order would be better, and needs per-provider health tracking that does not exist yet.

There is also no automatic quality comparison across providers for the same task. Right now that judgment is manual, which does not scale past a small number of tenants.
