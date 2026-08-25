# ADR 0001: Deterministic-first web ingestion, LLM as fallback

**Status:** Accepted · **Date:** 2026-06

## Context

Operators onboard by pointing BotAnswer at their existing website. We need the business's services, prices, hours and policies as structured, retrievable data.

The obvious implementation is to fetch each page and hand the HTML to a model with "extract the business information as JSON." It works on the first try, it handles any layout, and it is about forty lines of code.

It is also the version we would regret. Three reasons:

- **Cost never amortizes.** Every page costs on every crawl, forever, including the scheduled refresh. Onboarding a site with a hundred pages is a hundred model calls, repeated every time that site changes.
- **Latency lands in the worst place.** Ingestion runs while an operator watches a progress indicator during onboarding. Seconds per page is felt directly, at the exact moment we are trying to convince someone the product works.
- **Output is not reproducible.** The same page can yield different JSON across runs. That makes incremental refresh nearly impossible — we cannot tell a real content change from model variance, so every diff looks like a change.

## Decision

Ingestion runs a deterministic crawl-and-parse pipeline first. A model is called only when deterministic parsing fails to produce a valid result.

The pipeline is recipe-driven: a per-source recipe describes how to locate and partition content, executed against a fetched DOM. Parsing, partitioning and axis reconciliation are ordinary code with ordinary tests. Results are content-hashed so incremental refresh re-parses only what actually changed.

When the deterministic path cannot produce a valid result, a fallback ladder escalates: structured extraction first, then metered LLM induction as the last rung. Anything the model produces is constrained to a strict schema and re-validated before it is written.

The whole thing runs as a Cloudflare Queue consumer, off the request path, so a slow site does not hold the dashboard HTTP request open.

## Consequences

**Good.** Pages handled by deterministic recipes incur no model-call cost. Their latency is network- and parser-bound, and their output is reproducible, which makes meaningful incremental refresh possible. When parsing cannot produce a valid result, the request remains eligible for a bounded fallback rather than silently becoming publishable data.

**Bad.** Recipes need maintenance as site structures drift. There is meaningfully more code than the naive version, and it needs its own tests. Actual deterministic coverage and fallback rate are not yet instrumented, so the system cannot currently prove what share of pages avoids the model path.

**Neutral.** This inverts for document ingestion. Images genuinely require a vision model, so there the model *is* the primary path, and the discipline shifts entirely to schema constraint and re-validation.

## What I would revisit

Per-source fallback-rate instrumentation should come first. If sustained fallback then went past roughly a third for a class of site, the maintenance cost of its recipes would start to outweigh what they save, and the honest move would be to invert the ladder for that class rather than defend the original choice.
