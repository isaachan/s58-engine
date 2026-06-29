# Glossary Word Cloud Plan

## Goal

Replace the glossary's alphabetical word list with an exploratory word cloud where related engine terms are connected explicitly, while preserving search and the existing definition/detail panel.

## Prototype implemented

The prototype is implemented in `src/ui/GlossaryPanel.tsx` as a rotating spherical word cloud. Terms are distributed over a Fibonacci sphere and projected into SVG with perspective and depth cues.

- The search bar is unchanged.
- Terms are rendered as interactive words on a sphere surface.
- Front-facing words grow brighter and larger; rear words become smaller and fainter.
- Existing `GlossaryEntry.related` data is rendered as great-circle arcs following the sphere.
- The sphere rotates automatically and supports mouse or touch dragging.
- Highly connected terms receive more visual weight.
- Clicking a term rotates it to the front, highlights its neighbours, and opens its details.
- Search results remain visible together with their direct neighbours, so the user keeps relationship context.
- The definition, long explanation, sources, and related-term buttons remain available in the detail panel.
- English and Chinese labels use the same graph with language-specific sizing.
- Keyboard selection with Enter or Space is supported.
- The modal stacks the graph and detail panel on narrow screens.

## Deliberate prototype constraints

- Relationships are treated as undirected for display, even when only one glossary entry declares the other as related.
- Node importance is currently based only on relationship count.
- The sphere supports rotation but not zoom, category filters, or persisted orientation.
- Isolated terms are still shown, but naturally have no connecting arc.
- Label collisions can still occur as the glossary grows; a future version may need adaptive font sizing or selective label hiding.

## Recommended next steps

### 1. Validate the interaction model

Test with both language modes and answer these questions before expanding the implementation:

- Is showing search matches plus direct neighbours clearer than showing matches alone?
- Is the detail panel wide enough for longer Chinese and English definitions?
- Are isolated terms understandable, or should they be grouped in a separate area?
- Should clicking an already-selected term clear the selection?

### 2. Strengthen glossary relationship data

Review every glossary entry and make the relationship graph intentional rather than incidental.

- Add missing `related` links.
- Decide whether links have types such as component, measurement, failure mode, process, or cause/effect.
- Add optional category metadata if users need topic-level grouping.
- Add a development-time validation that warns about unknown IDs and duplicate or one-sided links.

### 3. Refine visual hierarchy

- Tune node size using a combination of relationship count, category, and learning importance.
- Add a small bilingual legend explaining selected, related, search match, and contextual neighbour states.
- Improve collision handling for future glossaries with many more entries.
- Consider curved links or edge labels only if relationship types are added.

### 4. Improve navigation and accessibility

- Add arrow-key navigation between visible terms.
- Announce the number of search matches and related terms to screen readers.
- Add a visible focus style that remains clear in both themes.
- Consider a reduced-motion mode if animated transitions are introduced.

### 5. Refine spherical navigation

Validate the automatic rotation speed and drag sensitivity, then consider optional zoom or a pause control only if user testing shows they improve exploration rather than add noise.

## Acceptance criteria for a production version

- Search works for English terms, Chinese terms, and configured aliases.
- Every displayed relationship corresponds to validated glossary data.
- Selecting a term makes its direct relationships unambiguous.
- No labels overlap at supported desktop and mobile sizes.
- The graph is fully usable with keyboard navigation.
- The existing detail content and source links remain intact.
- Layout remains stable when reopening the glossary or switching language.
- Build and type checking pass without warnings introduced by the glossary implementation.
