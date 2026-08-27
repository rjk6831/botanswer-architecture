# Product evidence capture policy

The root README presents only product captures that are current, coherent, and safe to
use as public evidence. A screenshot is not proof merely because it came from a running
build.

## Before adding a capture

- use a fictional demo workspace and one exact application build;
- remove operator, tenant, customer, email, phone, messaging, and provider identifiers;
- remove API keys, tokens, internal URLs, raw enum values, database IDs, and object keys;
- make sure visible capability copy matches the architecture claim beside the image;
- avoid empty, disabled, read-only, loading, or error states unless that state is the
  subject being documented;
- keep branding and locale consistent across a gallery; and
- prefer one screenshot that proves a product decision over several near-duplicates.

## Capture quality

- Aim for at least 1600 pixels on the long edge.
- Capture the relevant surface without browser chrome or unrelated account controls.
- Check legibility at the README's rendered width, normally 760–1000 pixels.
- Write meaningful alt text and a caption that explains the product decision being
  demonstrated.
- Re-review the image whenever the surrounding claim or workflow changes.

## Current public evidence

`onboarding-language-select.png` is the only screenshot currently referenced by the
architecture overview. It demonstrates five-locale first-run setup without exposing
tenant or operator data.

Six legacy captures that failed the checklist above were removed from the current
public tree on 25 August 2026. Their original versions remain recoverable from Git
history; they should not be restored without a fresh content and privacy review.

[← Back to the architecture overview](../README.md)
