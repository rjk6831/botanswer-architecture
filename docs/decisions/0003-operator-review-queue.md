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

Alongside that, website and media ingestion fetches are fenced with URL validation, SSRF protection, and host rules so a submitted source cannot steer the ingestion path at internal addresses. Fetched media is mirrored to R2 and served through signed, short-lived, domain-separated URLs rather than hot-linked. Source governance records where every published fact came from, so a wrong answer can be traced to a source and corrected there.

Knowledge publication is explicit and fails closed: absent configuration means unpublished, never published.

## Consequences

**Good.** No ingested fact becomes eligible for customer retrieval until an operator publishes it. That review boundary reduces the direct path from untrusted source text into live answers and makes corrections targeted instead of archaeological.

**Residual risk.** Human review reduces prompt-injection exposure; it does not prove source content safe or eliminate every downstream model risk. Fetch fencing, schema validation, publication state, retrieval scope, and reply policy remain independent controls.

**Bad.** Onboarding has a manual step, and that is real friction at exactly the moment a new operator is deciding whether this product is worth it. Large sites mean a large queue. The review UI is a surface we would not otherwise have built.

**Neutral.** The queue is useful beyond safety: it gives operators a place to improve tone and completeness before extracted content can shape a customer answer.

## What I would revisit

Auto-publishing high-confidence extractions from a source an operator has already approved would cut most of the friction while keeping the guarantee where it matters. That needs a confidence signal we do not currently produce.

Bulk approve for a reviewed source is the obvious near-term improvement and is not built.
