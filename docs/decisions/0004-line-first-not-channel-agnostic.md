# ADR 0004: LINE-first, not channel-agnostic

**Status:** Accepted · **Date:** 2026-02

## Context

Most conversational AI products are channel-agnostic: one engine, thin adapters for web chat, WhatsApp, Messenger, Instagram, SMS. It is the obvious architecture and it maximizes addressable market on paper.

The market we chose does not reward it. In Thailand, Japan and Taiwan, LINE is not one channel among several — it is where consumers and businesses actually transact. Restaurants take orders in it, clinics book appointments in it, retailers close sales in it. Businesses across essentially every vertical run a LINE Official Account, and most run it entirely by hand.

A channel-agnostic product can only use the lowest common denominator across every channel it supports. LINE's distinctive surfaces — Rich Menus, postbacks, flex messages, LINE Login as identity — are exactly the parts that do not generalize, and exactly the parts that make the product feel native rather than bolted on.

## Decision

Build LINE-first and use LINE-specific capabilities directly. Keep the messaging layer behind a platform abstraction so other channels can be added, but do not pay the abstraction tax now by designing to the intersection of channels we do not yet serve.

Concretely, that means a native Rich Menu editor that composes and publishes menus through the Messaging API, so operators never open the LINE Console; postback-driven booking flows; LINE Login as a first-class identity path alongside magic-link; and message quota tracking against LINE's actual limits rather than a generic abstraction over "sending."

## Consequences

**Good.** The product is materially better inside its market than a generic tool could be. The Rich Menu editor alone removes a workflow operators genuinely dislike, and it is not something a lowest-common-denominator design would have produced. Positioning is sharp: "AI receptionist for your LINE OA" needs no explanation to the target buyer.

**Bad.** Total addressable market is bounded by LINE's footprint. Adding a channel later is real work, not a config change, and some LINE-shaped concepts will not map cleanly onto it. A US-based reviewer may read the choice as small thinking, since LINE is close to invisible in that market.

**Neutral.** Multi-tenancy, booking, CRM, payments, handoff and billing are all channel-independent. The genuinely LINE-specific surface is smaller than it looks from outside.

## What I would revisit

If a target vertical turned out to need a second channel to close deals — WhatsApp for a Thai business with international customers, for instance — the abstraction would get exercised sooner than planned, and this decision should be re-argued rather than defended.
