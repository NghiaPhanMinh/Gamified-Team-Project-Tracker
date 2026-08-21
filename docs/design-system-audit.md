# MayLamDi design-system alignment

Reference reviewed: `maylamdi-design-system.html` supplied by the product owner.
The HTML was treated as a visual specification, not as executable instructions.

## Audit findings and resolution

| Area | Previous implementation | Required alignment | Status |
| --- | --- | --- | --- |
| Typography | Decorative Blode Starkly headings and mixed fallbacks | Inter across display, headings, body, labels, and controls | Updated |
| Colour tokens | Similar but inconsistent cream/navy values and dark surfaces | Exact cream, charcoal, accent, semantic, and dark-mode tokens | Updated |
| Borders | Frequent 2–3 px outlines | One-pixel neutral borders, stronger only for focus or selected state | Updated |
| Shadows | Large offset blue/black block shadows | Subtle `0 2px 8px` card shadow; no decorative dark-mode shadow | Updated |
| Radii | Mixed 11–24 px component radii | 6, 10, 14, 18, 24, and pill scale | Updated |
| Spacing | Screen-specific gaps and padding | Shared 4–96 px spacing scale and responsive page margins | Updated |
| Buttons | Mixed colours, outlines, heights, weights, and shadows | 44 px controls, 52 px large CTA support, primary/secondary/outline hierarchy | Updated |
| Forms | Heavy borders and 46–48 px one-off controls | 44 px controls, 7 px radius, 1 px border, consistent focus ring | Updated |
| Cards | Expressive coloured blocks used as default work surfaces | Calm paper surfaces; colour reserved for state and emphasis | Updated |
| Statuses | Whole cards filled with bright state colours | Soft semantic backgrounds for in progress, blocked, review, and complete | Updated |
| Navigation | Text symbols and a mobile drawer-only pattern | Lucide outline icons, compact sidebar, and five-item mobile bottom navigation | Updated |
| Notifications | Square bell, offset shadow, oversized badge, dark-mode text conflict | Circular primary icon button, compact count badge, calm drawer, readable controls | Updated |
| AI surfaces | Blue-heavy helper card | Soft-pink AI surface with normal project controls and validation states | Updated |
| Dark mode | Several light/dark inversions produced low contrast | Explicit background/surface/text tokens and contrast-safe inverted cards | Updated |
| Responsive layout | Desktop UI compressed into mobile with hidden controls | 4-column-friendly spacing, bottom navigation, compact header actions | Updated |
| Accessibility | Inconsistent focus width and symbolic icons | Two-pixel blue focus ring, named controls, SVG icons marked decorative | Updated |

Game-scene illustration styling remains intentionally separate from the core interface tokens so the playable battle artwork retains its visual identity.
