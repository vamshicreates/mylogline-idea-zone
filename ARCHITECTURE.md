# Film Idea Zone — proposed architecture

## Goal

A standalone, editorial story discovery site for My Logline. Every entry is rooted in India and starts with a documented real person or event, then offers an original film adaptation concept: a logline, synopsis, and a rough 13-beat outline. The page invites writers to develop their own screenplay in My Logline.

**Local project:** `ideazone/mylogline`  
**Current public home:** `mylogline-idea-zone.vercel.app`  
**Planned custom domain:** `ideazone.mylogline.com`  
**Status:** implemented locally; deployment is a separate step.

## Experience and routes

| Route | Purpose | Main content |
| --- | --- | --- |
| `/` | Discover ideas | Cinematic introduction, featured real-life story, Biopic and Based on True Events filters, explanation of how to use an idea, writing CTA |
| `/stories/[slug]` | Develop one idea | Real-life foundation and source links; adaptation title, genre, logline, synopsis, 13 beats across three acts; writing prompts and CTA |
| `/approach` | Establish editorial trust | How facts are checked, what is imagined, adaptation and rights note, submission standards for future stories |

The primary navigation mirrors the linked My Logline blog: brand at left, a few restrained links, and a red **Start writing** button. Both the header and footer link back to My Logline and its blog.

## Categories and geographic rule

- **Biopic:** A documented Indian person is the central protagonist. The treatment explores an episode of their life and identifies any invented scenes.
- **Based on True Events:** A documented event in India is the foundation. The treatment may use a fictional or composite point of view, labeled clearly so the invented characters are not mistaken for historical people.
- The index has an **All stories** view plus the two category filters. Each story has exactly one primary category. Genre is a separate descriptor, not another top-level category.
- Publication validation requires `country: India` and either an Indian subject or an event located in India. Source review checks the Indian connection before release.

## Story page sequence

1. **The person and the hook:** name, place, period, one-line real-life achievement.
2. **What happened:** a short factual timeline with direct source links.
3. **The film idea:** working title, format, genre, thematic question, proposed point of view.
4. **Story DNA:** fresh angle, central dramatic question, character roles, specific story mechanics, and a brief originality check against familiar films.
5. **Logline:** one sentence identifying protagonist, goal, obstacle, and stakes.
6. **Synopsis:** a concise, filmable beginning, middle, and ending.
7. **13-beat outline:** three acts with 13 labeled turning points. This is a writing proposal, not a claim that every scene occurred.
8. **Research and writing decisions:** gaps to verify plus two or three open creative choices rather than a prescriptive finished script.
9. **CTA:** “Write your version in My Logline,” linking to the existing writing app.

## Fact versus adaptation

Every story separates **Verified history** from **Film treatment**. Beats can carry a small `Documented`, `Interpretation`, or `Dramatized` label. Source links support historical claims; invented dialogue, composite moments, and proposed conflicts are labeled as creative development. Copy will avoid presenting a pitch as an authorized biopic or an available rights package. Any film production based on a living person would need its own rights and fact review.

Each story displays **three source links**: two relevant Wikipedia pages for easy overview and context, plus an official or institutional source for the core factual anchor. The links are research starting points, not proof that the proposed film scenes happened.

## Initial editorial set

The launch version can feature four distinct Indian story worlds, with complete treatments for each rather than empty teaser cards:

| Subject | Category | Story world | Initial factual anchors |
| --- | --- | --- | --- |
| Arunima Sinha | Biopic | Survival / mountaineering drama | Her 2011 train assault, mountaineering training, and 21 May 2013 Everest summit, supported by [Press Information Bureau](https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=150404&lang=2&reg=48) and [Guinness World Records](https://www.guinnessworldrecords.com/world-records/550815-first-female-amputee-to-climb-everest) |
| Jadav Payeng | Biopic | Ecological / generational drama | The Molai forest and his conservation work, supported by [Assam Tourism](https://publications.assamtourism.gov.in/publications/files/Aporup_Assam.pdf) and [Assam State Biodiversity Board](https://asbb.assam.gov.in/about-us/expert-committees) |
| Dr. Muthulakshmi Reddy | Biopic | Period / social reform drama | Her medical and reform work and the 1954 founding of the Adyar Cancer Institute, supported by the [Institute's history](https://cancerinstitutewia.in/history/) and [founder profile](https://cancerinstitutewia.in/doctor/late-dr-muthulakshmi-reddy/) |
| Diviseema cyclone, 1977 | Based on True Events | Period / survival drama | The November 1977 cyclone and its impact on coastal Andhra Pradesh, supported by the [National Disaster Management Authority guidelines](https://nidm.gov.in/PDF/guidelines/cyclones.pdf) and [Wikipedia overview](https://en.wikipedia.org/wiki/1977_Andhra_Pradesh_cyclone) |

These are editorial starting points. Each proposed dramatic scene will be checked against sources and labeled appropriately during content writing.

## Content model

Each story lives in a versioned content file, making it possible to add new ideas without changing page code:

```text
Story
  slug, title, subject, category, country, location, period, format, genre, theme
  teaser, heroVisual, sourceList[] (two Wikipedia links and one corroborating link)
  verifiedFacts[] { statement, sourceIds[] }
  timeline[] { dateOrPeriod, event, sourceIds[] }
  storyDna { freshAngle, originality, roles[], mechanics[], researchGaps[] }
  logline, synopsis
  acts[] { name, beats[] { number, name, summary, basis } }
  writerPrompts[]
  editorialNote, reviewedAt
```

Validation requires exactly 13 numbered beats, 2–3 research links, support for each factual claim, a clear editorial note, one of the two categories, and an Indian connection before a story is published.

## Technical architecture

- **Framework:** A dependency-free Node static generator for this first version. It produces fast HTML from versioned content files and avoids runtime infrastructure; an Astro migration remains possible when editorial volume grows.
- **Styling:** locally defined CSS tokens based on the My Logline blog reference: near-black background, charcoal panels, white type, muted gray support text, deep red glow, and red primary buttons. Responsive layouts and visible focus states are built in.
- **Content:** Astro content collection with a schema for stories; source citations live beside the relevant facts. Start with files in the repository, then connect a CMS only if editorial volume demands one.
- **Interactions:** lightweight search and the two category filters on the index, a jump navigation for each treatment, and copyable loglines. Core reading works with JavaScript disabled.
- **Media:** original abstract artwork or licensed assets. No film stills or real-person likenesses are needed for the first release.
- **SEO and sharing:** unique title, description, canonical URL, Open Graph image, sitemap, and structured article metadata per story.
- **Accessibility:** semantic headings and landmarks, keyboard-operable controls, adequate contrast, reduced-motion support, and 44px touch targets.

## Integration and deployment boundary

The site is a separate Vercel project connected to the [GitHub repository](https://github.com/vamshicreates/mylogline-idea-zone). The public deployment is [mylogline-idea-zone.vercel.app](https://mylogline-idea-zone.vercel.app). To complete the My Logline integration, point `ideazone.mylogline.com` to this Vercel project, update the canonical base URL in `build.mjs`, and add a Film Idea Zone link on the main site. The CTA links to the existing [My Logline app](https://app.mylogline.com/login); a prefilled draft handoff should wait until the app exposes a documented import/deep-link flow.

## Build sequence

1. Establish the design system and responsive index/detail templates.
2. Research and write the four launch treatments, including 13 beats and source notes.
3. Add discovery controls, writing CTAs, metadata, and the editorial approach page.
4. Run build, content validation, accessibility and mobile checks; review the local preview.
5. Deploy to the subdomain and add the main-site link in a later step.
