# ADR 0004: LINE-first, not channel-agnostic

**Status:** Accepted · **Date:** 2026-02

## Context

Most conversational AI products are channel-agnostic: one engine, thin adapters for web chat, WhatsApp, Messenger, Instagram, SMS. It is the obvious architecture and it maximizes addressable market on paper.

In the product's target markets—Thailand, Japan and Taiwan—LINE is often part of the operating workflow, not merely another notification channel. The relevant customer journeys include orders, appointments, service questions, identity, and staff follow-up inside a LINE Official Account.

Shared abstractions create pressure toward the lowest common denominator across supported channels. LINE's distinctive surfaces — Rich Menus, postbacks, flex messages, LINE Login as identity — are exactly the parts that do not generalize, and exactly the parts that make the product feel native rather than bolted on.

## Decision

Build LINE-first and use LINE-specific capabilities directly. Keep the messaging layer behind a platform abstraction so other channels can be added, but do not pay the abstraction tax now by designing to the intersection of channels we do not yet serve.

Concretely, that means a native Rich Menu editor/composer with a Messaging API publication adapter; postback-driven booking flows; LINE Login as a first-class identity path alongside magic-link; and message quota tracking against LINE's actual limits rather than a generic abstraction over “sending.” At this snapshot, the publication request-shape repair is implemented locally but still awaits production deployment and live LINE UAT.

## Consequences

**Good.** The product can use the native surfaces of its chosen operating environment instead of reducing them to generic text messages. The Rich Menu editing workflow and postback-driven journeys would not emerge from a lowest-common-denominator channel design. Positioning stays specific: “AI receptionist for your LINE OA.”

**Bad.** Addressable market is bounded by LINE's footprint. Adding a channel later is real work, not a config change, and some LINE-shaped concepts will not map cleanly onto it.

**Neutral.** Multi-tenancy, booking, CRM, payments, handoff and billing are all channel-independent. The genuinely LINE-specific surface is smaller than it looks from outside.

## What I would revisit

If a target vertical turned out to need a second channel to close deals — WhatsApp for a Thai business with international customers, for instance — the abstraction would get exercised sooner than planned, and this decision should be re-argued rather than defended.
