# Figma → code component map

Updated in the same PR that creates or changes a component (skill `ui-component`). Status:
🗓️ to design · 🎨 in Figma · 🧩 in code · ✅ in sync (Figma and code match).

| Component (Figma = code) | Figma (page / link) | Code                                               | Variants                                                 | Status |
| ------------------------ | ------------------- | -------------------------------------------------- | -------------------------------------------------------- | ------ |
| `Button`                 | 02 · Components     | `packages/ui-web/src/components/Button`            | primary · secondary · ghost · danger × sm · md · lg      | 🗓️     |
| `Amount`                 | 02 · Components     | `packages/ui-web/src/components/Amount`            | hero · default · compact × positive · negative · neutral | 🗓️     |
| `TruthBadge`             | 02 · Components     | `packages/ui-web/src/patterns/TruthBadge`          | verified · declared · calculated · estimated · stale     | 🗓️     |
| `ReceiptPanel`           | 02 · Components     | `packages/ui-web/src/patterns/ReceiptPanel`        | sheet (mobile) · side panel (desktop)                    | 🗓️     |
| `DecisionCard`           | 02 · Components     | `packages/ui-web/src/patterns/DecisionCard`        | collapsed · expanded × approve · warn · block            | 🗓️     |
| `EnvelopeRow`            | 02 · Components     | `packages/ui-web/src/patterns/EnvelopeRow`         | ok · 80 % · 100 % · overspent                            | 🗓️     |
| `CardUsageMeter`         | 02 · Components     | `packages/ui-web/src/patterns/CardUsageMeter`      | low · medium · high · near-usury                         | 🗓️     |
| `PaydayPlan`             | 02 · Components     | `packages/ui-web/src/patterns/PaydayPlan`          | draft · confirmed · executing · done                     | 🗓️     |
| `SecondOpinionBanner`    | 02 · Components     | `packages/ui-web/src/patterns/SecondOpinionBanner` | approve · warn · block · unavailable                     | 🗓️     |
| `FreshnessStamp`         | 02 · Components     | `packages/ui-web/src/patterns/FreshnessStamp`      | fresh · recent · stale · offline                         | 🗓️     |
