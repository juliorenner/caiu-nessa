# Arcade UX research for "Caiu Nessa?"

Evidence note: web search was shallow (standard mode). Claims with a URL are from search results. Items marked (unverified) are my design judgment or knowledge, not sourced. Contrast ratios were computed locally (WCAG formula), not sourced.

## 1. Arcade visual language

What reads as "arcade" (design judgment, unverified): pixel or chunky display type, hard 2-4px borders with an offset "pressed" shadow (bevel), high-saturation accents on a dark indigo ground, score counters in monospace digits, "combo/streak" pops, a marquee/cabinet frame, optional scanlines/CRT glow.

Small-phone triage (unverified): keep chunky buttons, hard borders, offset shadows, pixel headline type, score/progress HUD, short pop animations. Use sparingly or skip: scanlines (cut contrast, moire on high-DPI), glow/neon text (blurs small text), pixel font for body or the quote (legibility), flashing (WCAG 2.3.1 risk), looping animation (needs prefers-reduced-motion; MDN notes the feature removes/reduces non-essential motion: https://developer.mozilla.org/fr/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).

References:
- NES.css, CSS-only, no JS, no layout system, ships no font and recommends Press Start 2P; NES palette, pixel icons. Borrow: the pixel-border "frame" for cards and the pressed-button look (do it with box-shadow/border-image, not the whole library). https://github.com/nostalgic-css/nes.css and summary https://best-of-web.builder.io/library/nostalgic-css/NES.css
- RetroUI (React + Tailwind, neobrutalism style). Borrow: thick outlines + offset shadow with flat colors; far more legible on phones than full pixel art, easy in Tailwind 4. https://shadcn.io/template/logging-stuff-retroui
- pixel-retroui (React, Tailwind-styled: Button, Card, Progress Bar, Popup). Borrow: the segmented pixel progress bar and the popup as a model for the verdict sheet. https://npmjs.com/package/pixel-retroui
- 21st.dev pixel/retro component sets (an 8-bit set uses Press Start 2P). Borrow: ideas for HUD chips and badges. https://21st.dev/community/components/s/pixel.md
- Real arcade culture in Brazil: see section 7 (fichas, bars/padarias as locations). https://www.tecmundo.com.br/voxel/280503-consoles-descubra-matou-fliperamas-brasil-especial.htm

(I did not fetch Dribbble/Behance shots; no verified shot URLs. Search "arcade quiz UI" there for mood only.)

## 2. Quiz UIs: patterns

Sources are thin; most items are design judgment drawing on known products.
1. Shape + color + label, never color alone. Kahoot's shape buttons help colorblind users and avoid guessing by color (https://www.commonsense.org/education/reviews/kahoot/teacher-reviews/4657633); Kahoot offers a high-contrast theme (https://kahoot.com/accessibility/); Wordle needed an orange/blue high-contrast mode because green/yellow confused players (https://billfischer.substack.com/p/these-2-wordle-colors-undermine-color). Apply: each verdict gets a distinct icon and word.
2. White text on yellow is unreadable; Kahoot users complained (https://support.kahoot.com/hc/pt-br/community/posts/360020924093-White-text-on-yellow-background-is-impossible-to-read). Avoid a yellow verdict anyway (partisan risk too).
3. Immediate feedback with the correct answer plus a short explanation (Duolingo: https://uxplanet.org/analyzing-duolingo-from-product-design-perspective-after-400-days-of-non-stop-practice-c4d4809bdb37). Apply: your bottom sheet already does this; make the verdict word the biggest element.
4. Wrong answers: Duolingo uses a distinct sound/pop-up, and its hearts mechanic and guilt-trip streak notifications are debated as manipulative (https://desirabilitylab.com/backfill/backfill-2025-46-duolingo-streak-design). Apply: no lives, no "you lose" copy; a wrong answer is "learned something", no shake-of-shame, no sad mascot.
5. Streak visuals scale with count (flame grows, celebration at milestones; same Desirability Lab page). Apply: a small streak chip in the HUD that grows at 3/5/8 correct, no penalty display when broken (it just resets quietly).
6. Segmented progress (12 pips) always visible; the current pip pulses (unverified, common in HQ/Kahoot-style UIs).
7. Answer controls in the thumb zone (bottom third), with the question/card filling the upper two thirds (unverified, mobile ergonomics convention).
8. Result screen as a "high score" screen: big "N de 12", tier name as a title card, share and "Continuar jogando" as the primary button (unverified).

## 3. Palettes (no red, no green, no yellow as verdict colors)

Verdict mapping for both: Verdade = cyan/teal (calm, "confirmed", far from every party color); Mentira = magenta/fuchsia (strong, clearly "negative" without being the PT red; pink/purple is not a main party color: unverified); Isso me cheira mal = orange (warning cue; saturated orange, not amber/yellow). Always pair with icon (check, X, question/nose) so colorblind users are covered (cyan vs magenta vs orange differ in lightness slightly; shapes remove the risk). Caveat: orange sits near both red and yellow families, so keep it clearly orange (#FB923C / #C2410C), and never put verdict colors next to a green/yellow accent.

### Palette A "Fliperama Noite" (indigo base, vivid verdicts)
Dark: bg #14112B, surface #221E4A, text #F5F2FF, muted #B9B2E0, Verdade #22D3EE, Mentira #F472B6, Cheira mal #FB923C, accent #A78BFA.
Contrast computed: text on bg 16.6; muted 9.2; verdicts on bg 10.2 / 6.9 / 8.1 (on surface 8.6 / 5.9 / 6.9); accent 6.7. Dark text #14112B on verdict-filled buttons: 10.2 / 6.9 / 8.1.
Light: bg #FFF8EC (warm paper), surface #FFFFFF, text #1E1838, muted #5B5478, Verdade #0E7490, Mentira #A21CAF, Cheira mal #B45309, accent #6D28D9.
Contrast: text 16.0; muted 6.7; verdicts on bg 5.1 / 6.0 / 4.8; white text on verdict fills 5.4 / 6.3 / 5.0; accent 6.7. (B45309 is brownish; if it reads yellow-brown, use #C2410C: 4.7 on #F1F5F9, but it drifts toward red, so test.)

### Palette B "Neon Petróleo" (teal-navy base, cooler, less purple)
Dark: bg #0B1F2A, surface #13303F, text #EEF8FB, Verdade #5EEAD4, Mentira #E879F9, Cheira mal #FDBA74, accent #38BDF8.
Contrast: text 15.6; verdicts on bg 11.4 / 6.9 / 10.0 (on surface 9.3 / 5.6 / 8.2); accent 7.9.
Light: bg #F1F5F9, surface #FFFFFF, text #0F2230, Verdade #0F766E, Mentira #A21CAF, Cheira mal #C2410C, accent #0369A1.
Contrast: text 14.8; verdicts on bg 5.0 / 5.8 / 4.7; white on fills 5.5 / 6.3 / 5.2; accent 5.4.
Risk: Verdade teal #0F766E sits near green; at small sizes it may read green. Palette A's cyan-blue is safer on neutrality. Recommend A.

UI (non-text) 3:1 is met by all pairs above (lowest verdict-vs-surface is 4.7 light/5.6 dark). Verify the final UI borders (1px outlines) separately.

## 4. Typography (Google Fonts)

Pt-BR needs ã õ ç á é í ó ú â ê ô à. Confirm on each glyph map before shipping.
- Press Start 2P: Google says it includes pan-European non-ASCII chars (https://fonts.google.com/specimen/Press+Start+2P/about); Font Library lists Western European support (https://fontlibrary.org/font/press-start-2p). Likely fine for pt-BR (unverified per glyph). Very wide and low x-height: titles, score and buttons only, short words, large size. Long labels like "Isso me cheira mal" will wrap badly; test at 360px.
- VT323: Latin, Latin-extended (https://www.figma.com/fonts/vt323/), but glyph set limited, copied from VT320 terminal (https://fontsource.org/fonts/vt323/about). Okay for numeric HUD; accents unverified.
- Silkscreen: I could not confirm accents from search. Test before use (I recall it covers Latin-1 but unverified).
Pairings (unverified beyond the above):
1. Press Start 2P (headline, score, buttons) + Inter or Atkinson Hyperlegible (body, quote, explanation). Safest.
2. Bungee (bold display, signage feel, close to Brazilian sign-painting; check ã/ç) + Nunito/DM Sans body.
3. Silkscreen or VT323 for tiny HUD labels only + Space Grotesk body.
Rule: pixel type for <= ~4 words; the quote and explanation always in a proportional sans at >= 16px.

## 5. Layout for tall phones (design judgment, unverified unless cited)
- Top HUD (sticky): 12-pip progress, streak chip, score digits; use env(safe-area-inset-top).
- Card takes the flexible middle (flex-1, sized to content with min-height ~55-60dvh), with the statement in larger type (scale with clamp()) and a speaker avatar/label, so tall screens grow the card and the type instead of the gap.
- Controls as a "control panel" docked at the bottom: one big pressed-style button per verdict, in a 3-column row (icon above word) or the 3-stack; swipe hints as arrows on the card edges (left Mentira, right Verdade, up Cheira mal).
- Cabinet frame: a 2-4px border and inner bezel around the playfield (card + HUD), marquee strip on top with the logo; fills side space on tablets/desktops.
- Background: dim dot or pixel grid at <= 6% opacity, static; no scrolling grids. Vertical gradient from bg to surface fills the void cheaply.
- Use dvh not vh; keep controls within the bottom 40% for thumb reach.
- Reduced motion: wrap pop/bounce/shake/confetti/pulse in @media (prefers-reduced-motion: no-preference) and give a static equivalent (color change plus icon). MDN: https://developer.mozilla.org/fr/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- Dark mode: define tokens on :root and override under prefers-color-scheme: dark; avoid pure #000 and pure white; neon verdicts on light backgrounds fail contrast, so use the darker light-variant hexes above. Drop glow/text-shadow in light theme.

## 6. Pitfalls (judgment, unverified)
- Pixel font everywhere, neon glow, scanlines over text: cheap and unreadable. Keep arcade to chrome, not content.
- Casino cues (slot jackpots, coins raining, loud "WIN"): trivializes a fact-check. Celebrate learning, not luck.
- Gloating on wrong answers or shaming copy ("Caiu nessa!" jokes aimed at the player): keep the tone light but never mock; the title is already playful.
- Verdict as the fun color but the source link as an afterthought: keep the fact-check link prominent and styled as a normal, sober link; show the source name and date.
- Fake-authority cues (badges, seals) and the red rubber stamp: red is the PT association; recolor the stamp to the accent (violet/cyan) or ink-neutral, keep the question mark.
- Neutral voice: identical visual weight for statements from any camp; no party colors anywhere, including avatars and tier badges.
- Sound and haptics off by default.

## 7. Brazilian cultural references
- Fliperama: arcades were in bars, padarias, lanchonetes, one ficha per try, with an audience around the machine (https://www.tupi.fm/?p=2390613); arcades stayed relevant in Brazil past 2000 (https://www.tecmundo.com.br/voxel/280503-consoles-descubra-matou-fliperamas-brasil-especial.htm); book "Insert Coin: The Arcade in Brazil" (https://www.thevideogamelibrary.org/book/insert-coin-the-arcade-in-brazil-then-and-now). Borrow: copy "INSIRA FICHA" / "FICHA" on the start/continue screen, "FIM DE JOGO", "PLACAR", "RECORDE". Neutral, nationwide. Safe.
- Jogo do bicho tickets (no source found; unverified): borrow a ticket/receipt layout with perforated edge and stamped numbers for the result screen. Flag: it is an illegal-gambling association; use only the paper-slip look, not animals/numbers, and skip it if "gambling" tone worries credibility.
- Cordel / xilogravura: the woodcut illustrates cordel covers in the Northeast (https://repositorio.ufc.br/ri/bitstream/riufc/41875/1/1995_art_fgccarvalho.pdf); free font Xilosa reinterprets it (https://www.dafont.com/xilosa.font); 500+ covers in a 2026 book (https://www.diariodepernambuco.com.br/viver/2026/10/11726110-designer-lanca-livro-que-ressalta-sofisticacao-da-xilogravura-em-mais-de-500-capas-de-cordel.html). Borrow: black-ink woodcut texture for the tier illustrations. Flag: regionally Nordeste-coded and clashes with pixel style; one accent at most. Check dafont license before use.
- Lambe-lambe posters and letras de caminhao: no search results; unverified. Borrow: layered bold display lettering with outline and drop shadow, which matches the arcade bevel style; Bungee-like fonts approximate it. Neutral if no slogans or colors of a camp. Avoid the green-yellow-red-blue striping common in truck art.
- Pixacao: skip, as you said.
- Carnaval/futebol: borrow only the verbs ("Apito final", "VAR": a "cheira mal" as "VAR" is a nice joke, unverified). Flag: green/yellow is the seleção and the Bolsonaro camp; avoid jerseys, flags, and verde-amarelo. Football also reads regionally by club; keep to generic terms.
- TV game shows (Show do Milhao, Passa ou Repassa, Programa Silvio Santos; no sources fetched, unverified): borrow ideas, not marks: lifelines language, "Passa ou Repassa" rhythm, a host-like tier label. Flag: those are trademarked formats, and the SBT/Silvio Santos brand and its red/blue palette are tied to a media group, so do not copy logos, sets, or catchphrases.

## Recommended direction
Palette A: indigo ground, cyan Verdade, magenta Mentira, orange Cheira mal, violet accent, with icons on every verdict. Arcade only in the chrome: sticky HUD (12 pips, streak chip, score), flexible tall card, bottom control panel with chunky pressed buttons, thin cabinet bezel, static dot-grid background. Press Start 2P (or Bungee) for titles and scores only; Inter/Atkinson for quote and explanation. Brazilian flavor via copy ("FICHA", "FIM DE JOGO", "RECORDE") rather than imagery. Recolor the red stamp to violet or ink. Respect prefers-reduced-motion, no flashing, no sound.
