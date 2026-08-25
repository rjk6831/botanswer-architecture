# Architecture decision records

These records explain the decisions that most shaped BotAnswer. Each ADR includes the
alternative that was rejected, the operational consequences of the choice, and a
condition that would justify revisiting it.

| ADR | Decision | Core trade-off | Current revisit trigger |
|---|---|---|---|
| [0001](0001-deterministic-first-ingestion.md) | Deterministic-first web ingestion, model as fallback | Reproducibility and bounded model spend in exchange for recipe maintenance | Instrumented fallback coverage shows deterministic recipes are no longer carrying enough traffic |
| [0002](0002-multi-model-routing.md) | Route models per tenant and task through provider adapters | Less single-provider dependence in exchange for more integration surface | Observed latency/error data can support health-aware routing instead of a static order |
| [0003](0003-operator-review-queue.md) | Treat extracted content as a proposal until publication | Safer knowledge governance in exchange for onboarding friction | Reliable confidence signals make narrowly scoped auto-publication defensible |
| [0004](0004-line-first-not-channel-agnostic.md) | Use LINE-native capabilities directly | Depth in the chosen market in exchange for real work when adding a channel | A target customer segment demonstrably needs a second channel to complete the same journey |
| [0005](0005-metered-ai-usage-and-plan-gating.md) | Meter consumption per tenant and per model at the call seam | Attributable unit economics in exchange for a mandatory wrapper at every model call | Cost and reliability data justify a softer degradation policy at plan limits |

## Status

All five decisions are **Accepted** architecture. “Accepted” does not imply that every
path is active in production: ADR 0002's customer router is implemented behind disabled
provider/generative modes. Revisit conditions are part of each decision, not footnotes
to it.

## Reading order

For the shortest path through the architecture:

1. Start with [0004](0004-line-first-not-channel-agnostic.md) for the market and product
   boundary.
2. Read [0003](0003-operator-review-queue.md) for the knowledge trust boundary.
3. Read [0001](0001-deterministic-first-ingestion.md) for the cost/reproducibility
   strategy.
4. Read [0002](0002-multi-model-routing.md) and
   [0005](0005-metered-ai-usage-and-plan-gating.md) for provider resilience and unit
   economics.

[← Back to the architecture overview](../../README.md)
