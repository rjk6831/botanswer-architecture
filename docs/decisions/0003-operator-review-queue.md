# ADR 0003: Ingested content is a proposal until an operator publishes it

**Status:** Accepted · **Date:** 2026-06

## Context

Ingestion pulls content from two untrusted places: files an operator uploads, and websites we fetch. Both end up as text a model reads and a customer eventually sees.

Two distinct risks:

- **Correctness.** Extraction gets things wrong. A misread price or a stale opening time is a small technical error and a large business problem — the operator finds out when a customer arrives expecting something the bot promised.
- **Injection.** Fetched page content is attacker-controlled in the general case. Text on a third-party page can be crafted to instruct the model that later reads it.

Publishing extracted content straight to live answering optimizes for onboarding speed and accepts both risks on the operator's behalf.

## Decision

Extracted content lands in an operator review queue as a proposal. It is not retrievable by the conversation engine until an operator reviews and publishes it.

Alongside that, outbound fetching is fenced: SSRF protection and host allow-listing on every request, so ingestion cannot be steered at internal addresses. Fetched media is mirrored to R2 and served through signed, short-lived, domain-separated URLs rather than hot-linked. Source governance records where every published fact came from, so a wrong answer can be traced to a source and corrected there.

Knowledge publication is explicit and fails closed: absent configuration means unpublished, never published.

## Consequences

**Good.** Nothing reaches a customer without a human approving it, which contains both risks with one mechanism. Prompt-injection blast radius is bounded — injected instructions sit in a proposal an operator reads, rather than in live retrieval. Source governance makes corrections targeted instead of archaeological.

**Bad.** Onboarding has a manual step, and that is real friction at exactly the moment a new operator is deciding whether this product is worth it. Large sites mean a large queue. The review UI is a surface we would not otherwise have built.

**Neutral.** The queue turns out to be useful beyond safety — operators frequently edit extracted content for tone and completeness, which they would not have done if it had gone live silently.

## What I would revisit

Auto-publishing high-confidence extractions from a source an operator has already approved would cut most of the friction while keeping the guarantee where it matters. That needs a confidence signal we do not currently produce.

Bulk approve for a reviewed source is the obvious near-term improvement and is not built.
