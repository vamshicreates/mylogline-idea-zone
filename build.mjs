import { mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { stories, storyDna } from './stories.mjs';

const out = join(import.meta.dirname, 'dist');
const base = 'https://mylogline-idea-zone.vercel.app';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function validate() {
  const slugs = new Set();
  for (const s of stories) {
    if (slugs.has(s.slug)) throw new Error(`Duplicate slug: ${s.slug}`);
    slugs.add(s.slug);
    if (s.country !== 'India') throw new Error(`${s.slug}: story must be rooted in India`);
    if (!['Biopic', 'Based on True Events'].includes(s.category)) throw new Error(`${s.slug}: invalid category`);
    if (s.sources.length < 2 || s.sources.length > 3) throw new Error(`${s.slug}: expected 2–3 sources`);
    if (s.sources.some(source => source.length !== 3 || !source[2])) throw new Error(`${s.slug}: each source needs a context note`);
    if (!s.sources[0][1].includes('wikipedia.org')) throw new Error(`${s.slug}: Wikipedia overview should be first`);
    if (s.sources.filter(([,url]) => url.includes('wikipedia.org')).length < 2) throw new Error(`${s.slug}: expected two Wikipedia links`);
    if (!s.sources.some(([,url]) => !url.includes('wikipedia.org'))) throw new Error(`${s.slug}: expected a corroborating source`);
    if (s.beats.length !== 13) throw new Error(`${s.slug}: expected 13 beats`);
    if (!storyDna[s.slug]) throw new Error(`${s.slug}: missing Story DNA`);
    if (!s.image?.file || !s.image.alt || !s.image.credit || !s.image.license || !s.image.licenseUrl || !s.image.source) throw new Error(`${s.slug}: missing image attribution`);
    if (!existsSync(join(import.meta.dirname, 'images', s.image.file))) throw new Error(`${s.slug}: image file does not exist`);
    for (const [i, beat] of s.beats.entries()) {
      if (!['Act I','Act II','Act III'].includes(beat[0])) throw new Error(`${s.slug}: invalid act at beat ${i+1}`);
      if (!['Documented','Interpretation','Dramatized'].includes(beat[3])) throw new Error(`${s.slug}: invalid basis at beat ${i+1}`);
    }
  }
}

function header(active = '') {
  return `<a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="header-inner">
    <a class="brand" href="/" aria-label="Film Idea Zone home"><span class="brand-mark" aria-hidden="true">▤</span><span>My Logline <strong>/ Idea Zone</strong></span></a>
    <nav class="main-nav" aria-label="Main navigation"><a href="/" ${active==='ideas'?'aria-current="page"':''}>Explore ideas</a><a href="/approach/" ${active==='approach'?'aria-current="page"':''}>Our approach</a><a href="https://www.mylogline.com/blog">Blog</a></nav>
    <a class="button button-small" href="https://app.mylogline.com/login">Start writing <span aria-hidden="true">↗</span></a>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap footer-grid"><div><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">▤</span><span>My Logline <strong>/ Idea Zone</strong></span></a><p>True stories. Original starting points.<br>Made for the writers who see a film in real life.</p></div><div class="footer-links"><a href="/">Explore ideas</a><a href="/approach/">Our approach</a><a href="https://www.mylogline.com/blog">My Logline blog</a><a href="https://www.mylogline.com/">My Logline home</a></div><div class="footer-note">All stories featured here are rooted in India. Film treatments are creative proposals, not authorised biographies.</div></div><div class="wrap copyright">© ${new Date().getFullYear()} My Logline · Film Idea Zone</div></footer>`;
}

function page({title, description, canonical, body, active='', type='website'}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0f0f0f"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${base}${canonical}"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${base}${canonical}"><link rel="stylesheet" href="/styles.css"><script src="/app.js" defer></script></head><body>${header(active)}${body}${footer()}</body></html>`;
}

function categoryPill(s) { return `<span class="pill">${esc(s.category)}</span>`; }
function card(s, featured=false) {
  return `<a class="story-card ${featured?'story-card-featured':''}" href="/stories/${esc(s.slug)}/" data-story data-category="${esc(s.category)}" data-search="${esc(`${s.title} ${s.subject} ${s.location} ${s.genre} ${s.teaser}`.toLowerCase())}">
    <div class="card-art photo-${esc(s.slug)}"><img src="/images/${esc(s.image.file)}" alt="${esc(s.image.alt)}" loading="${featured?'eager':'lazy'}" decoding="async"><span class="art-horizon"></span><span class="art-caption">INDIA / ${esc(s.period)}</span><span class="photo-credit">PHOTO: ${esc(s.image.shortCredit || s.image.credit)}</span></div>
    <div class="card-content"><div class="card-top">${categoryPill(s)}<span class="quiet">${esc(s.genre)}</span></div><p class="card-subject">Inspired by ${esc(s.subject)}</p><h3>${esc(s.title)}</h3><p class="card-teaser">${esc(s.teaser)}</p><span class="card-link">Explore the film idea <span aria-hidden="true">↗</span></span></div>
  </a>`;
}

function index() {
  const featured = stories[0];
  return page({title:'Film Idea Zone | My Logline',description:'Discover Indian true stories shaped into original film ideas, with sources, loglines, synopses and 13-beat outlines.',canonical:'/',active:'ideas',body:`<main id="main">
    <section class="hero"><div class="hero-glow"></div><div class="wrap hero-inner"><p class="eyebrow eyebrow-line">A MY LOGLINE ORIGINAL</p><h1>Real lives.<br><em>Unwritten films.</em></h1><p class="hero-copy">Discover Indian stories with the courage, conflict and cinematic stakes to inspire your next screenplay.</p><div class="hero-actions"><a class="button" href="#stories">Explore the stories <span aria-hidden="true">↘</span></a><a class="text-link" href="/approach/">How we shape each idea <span aria-hidden="true">↗</span></a></div><div class="hero-foot"><span>01 / TRUE STORIES</span><span>02 / ORIGINAL TREATMENTS</span><span>03 / YOUR NEXT DRAFT</span></div></div></section>
    <section class="section featured-section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">THE FEATURED IDEA</p><h2>One life. A whole film.</h2></div><p>Start with a documented story. Follow the dramatic possibility.</p></div>${card(featured,true)}</div></section>
    <section class="section library-section" id="stories"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">THE IDEA LIBRARY</p><h2>Find the story that finds you.</h2></div><p>Biopics and true-event stories from across India. Each comes with a researched foundation and a working film treatment.</p></div><div class="library-tools"><div class="filters" role="group" aria-label="Filter stories by category"><button class="filter is-active" type="button" data-filter="All stories" aria-pressed="true">All stories <span>${stories.length}</span></button><button class="filter" type="button" data-filter="Biopic" aria-pressed="false">Biopic <span>${stories.filter(s=>s.category==='Biopic').length}</span></button><button class="filter" type="button" data-filter="Based on True Events" aria-pressed="false">Based on True Events <span>${stories.filter(s=>s.category==='Based on True Events').length}</span></button></div><label class="search"><span class="sr-only">Search stories</span><span aria-hidden="true">⌕</span><input type="search" id="story-search" placeholder="Search stories, places, genres…"></label></div><p class="results" id="results" role="status">Showing ${stories.length} Indian stories</p><div class="story-grid">${stories.map(s=>card(s)).join('')}</div><p class="empty-state" id="empty-state" hidden>No stories match that search. Try another name, place or category.</p></div></section>
    <section class="method-strip"><div class="wrap method-grid"><div><p class="eyebrow">HOW TO USE IDEA ZONE</p><h2>Research is the start.<br><em>Your voice makes the film.</em></h2></div><div class="method-steps"><p><strong>01</strong> Read the verified story and open its sources.</p><p><strong>02</strong> Study the logline, synopsis and 13-beat treatment.</p><p><strong>03</strong> Change the angle. Write the version only you can write.</p></div></div></section>
    ${cta('A real story could become your next screenplay.','Pick an idea, make your own choices, and put the first line on the page.')}
  </main>`});
}

function cta(headline,copy) { return `<section class="cta-section"><div class="wrap cta-inner"><p class="eyebrow">THE NEXT DRAFT IS YOURS</p><h2>${headline}</h2><p>${copy}</p><a class="button" href="https://app.mylogline.com/login">Write your film in My Logline <span aria-hidden="true">↗</span></a></div></section>`; }

function storyPage(s) {
  const dna=storyDna[s.slug];
  const sources=s.sources.map(([label,url,note],i)=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="source-number">0${i+1}</span><span class="source-copy"><strong>${esc(label)}</strong><small>${esc(note)}</small></span><span aria-hidden="true">↗</span></a></li>`).join('');
  const beats=s.beats.map(([act,name,copy,basis],i)=>`<li class="beat"><span class="beat-number">${String(i+1).padStart(2,'0')}</span><div><span class="beat-act">${esc(act)}</span><h3>${esc(name)}</h3><p>${esc(copy)}</p></div><span class="basis basis-${basis.toLowerCase()}">${esc(basis)}</span></li>`).join('');
  const related=stories.filter(x=>x.slug!==s.slug).slice(0,2);
  const structured=JSON.stringify({'@context':'https://schema.org','@type':'CreativeWork','name':s.title,'description':s.teaser,'genre':s.genre,'isBasedOn':s.sources.map(x=>x[1]),'url':`${base}/stories/${s.slug}/`}).replace(/</g,'\\u003c');
  return page({title:`${s.title} — Film Idea Zone | My Logline`,description:s.teaser,canonical:`/stories/${s.slug}/`,type:'article',body:`<main id="main"><div class="story-hero photo-${esc(s.slug)}"><img class="story-hero-image" src="/images/${esc(s.image.file)}" alt="${esc(s.image.alt)}" decoding="async"><div class="wrap story-hero-inner"><a class="breadcrumb" href="/">← All film ideas</a><div class="story-hero-copy"><div class="story-tags">${categoryPill(s)}<span>${esc(s.location)}</span></div><p class="eyebrow">AN INDIAN STORY / AN ORIGINAL FILM IDEA</p><h1>${esc(s.title)}</h1><p>${esc(s.teaser)}</p><div class="story-meta"><span>Inspired by <strong>${esc(s.subject)}</strong></span><span>${esc(s.genre)}</span><span>${esc(s.format)}</span></div></div></div><span class="art-horizon"></span></div>
    <nav class="story-nav" aria-label="On this page"><div class="wrap"><a href="#the-real-story">The real story</a><a href="#story-dna">Story DNA</a><a href="#film-treatment">Film treatment</a><a href="#thirteen-beats">13 beats</a><a href="#write-your-version">Write your version</a></div></nav>
    <div class="wrap story-layout"><article><section class="story-section" id="the-real-story"><p class="eyebrow">THE REAL STORY</p><h2>Before the film, the facts.</h2><p class="lead">${esc(s.fact)}</p><div class="timeline">${s.timeline.map(([when,what])=>`<div><strong>${esc(when)}</strong><p>${esc(what)}</p></div>`).join('')}</div><div class="editorial-note"><strong>Where fact ends and the film begins</strong><p>${esc(s.note)}</p></div></section>
    <section class="story-section" id="story-dna"><p class="eyebrow">STORY DNA</p><h2>Why this could be a film.</h2><div class="dna-lead"><span>THE FRESH ANGLE</span><p>${esc(dna.angle)}</p></div><div class="dna-columns"><div><h3>Character roles</h3><ul class="plain-list">${dna.roles.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h3>Dramatic engine</h3><ul class="plain-list">${dna.mechanics.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div><div class="originality"><span>WHAT MAKES THE ANGLE DISTINCT</span><p>${esc(dna.originality)}</p></div></section>
    <section class="story-section" id="film-treatment"><p class="eyebrow">THE FILM TREATMENT</p><h2>An idea ready to be rewritten.</h2><div class="treatment-block"><div class="block-head"><span>01 / LOGLINE</span><button type="button" class="copy-button" data-copy-logline>Copy logline</button></div><p class="logline" id="logline">${esc(s.logline)}</p></div><div class="treatment-block"><div class="block-head"><span>02 / SYNOPSIS</span></div><p class="synopsis">${esc(s.synopsis)}</p></div><p class="treatment-note">This is an original creative proposal inspired by documented history. It is not an official film adaptation.</p></section>
    <section class="story-section" id="thirteen-beats"><p class="eyebrow">ROUGH STORY STRUCTURE</p><h2>13 beats. Three acts. One way in.</h2><p class="section-intro">Use these as possibilities, not a locked screenplay. The labels show which moments are directly documented and which need interpretation or invention.</p><ol class="beats">${beats}</ol></section>
    <section class="story-section" id="write-your-version"><p class="eyebrow">YOUR TURN</p><h2>The research leaves room for you.</h2><div class="dna-columns"><div><h3>Questions for the writer</h3><ul class="plain-list">${s.prompts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h3>Research before a draft</h3><ul class="plain-list">${dna.gaps.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div><a class="button" href="https://app.mylogline.com/login">Start writing this film <span aria-hidden="true">↗</span></a></section></article>
    <aside class="story-aside"><div class="aside-panel"><p class="eyebrow">RESEARCH STARTS HERE</p><h2>Read the sources.</h2><p>Start with two Wikipedia pages for overview and context, then use the third source to check the core facts.</p><ol class="sources">${sources}</ol><small>Sources support the real-life foundation. They do not verify the imagined film treatment.</small></div><div class="image-attribution"><span class="eyebrow">IMAGE CREDIT</span><p><a href="${esc(s.image.source)}" target="_blank" rel="noopener noreferrer">${esc(s.image.credit)} ↗</a> · <a href="${esc(s.image.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(s.image.license)}</a></p><small>${esc(s.image.note)}</small></div><div class="aside-quote"><span>THE STORY QUESTION</span><p>${esc(s.theme)}</p></div></aside></div>
    <section class="related-section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">KEEP EXPLORING</p><h2>Another life. Another lens.</h2></div></div><div class="story-grid related-grid">${related.map(x=>card(x)).join('')}</div></div></section>${cta('The next version is yours.','Use the facts, challenge the outline, and write a film only you could make.')}<script type="application/ld+json">${structured}</script></main>`});
}

function approach() {
  return page({title:'Our Approach — Film Idea Zone | My Logline',description:'How Film Idea Zone researches Indian real-life stories and turns them into original film writing prompts.',canonical:'/approach/',active:'approach',body:`<main id="main"><section class="subhero"><div class="wrap"><p class="eyebrow">THE IDEA ZONE APPROACH</p><h1>Truth gives us a place to start.<br><em>Writing takes us somewhere new.</em></h1><p>Film Idea Zone is a curated collection of Indian stories and original screenplay starting points. Each treatment is an invitation to research, question and write.</p></div></section><section class="section"><div class="wrap approach-grid"><div><p class="eyebrow">THE TWO SHELVES</p><h2>Choose your lens.</h2></div><div class="approach-pair"><div><span class="pill">BIOPIC</span><h3>One real person at the centre.</h3><p>The protagonist is a documented Indian person. We distinguish known milestones from imagined scenes or interior life.</p></div><div><span class="pill">BASED ON TRUE EVENTS</span><h3>A real event. A proposed point of view.</h3><p>The event happened in India. A treatment may use composite or fictional characters, clearly marked as such.</p></div></div></div></section><section class="section approach-process"><div class="wrap"><p class="eyebrow">FROM SOURCE TO SCREENPLAY</p><h2>The story is researched.<br>The treatment is a proposal.</h2><div class="process-list"><div><span>01</span><h3>Find the factual anchor</h3><p>Start with an Indian person or event and publish three links: two Wikipedia pages for overview and context, plus a corroborating source.</p></div><div><span>02</span><h3>Find the dramatic engine</h3><p>Name the protagonist, choices, stakes, relationships and distinctive angle before writing a logline.</p></div><div><span>03</span><h3>Shape a working film</h3><p>Offer a synopsis and 13 beats across three acts. Mark documented moments, interpretations and dramatized scenes.</p></div><div><span>04</span><h3>Leave space for the writer</h3><p>Show the research gaps and questions that a real screenplay draft still needs to answer.</p></div></div></div></section><section class="section"><div class="wrap approach-grid"><div><p class="eyebrow">EDITORIAL NOTE</p><h2>Read, verify, then make it your own.</h2></div><div class="approach-copy"><p>Source links are starting points. A film treatment may compress time, combine events or invent characters and dialogue, and those choices are signposted. No page claims to be an authorised biopic or a complete historical account.</p><p>Writers should verify important details independently, speak with relevant people where appropriate, and review rights and portrayal questions before production.</p></div></div></section>${cta('A real story is waiting for your point of view.','Find an idea, follow the sources, and start the draft.')} </main>`});
}

validate();
if (process.argv.includes('--check')) { console.log(`Validated ${stories.length} India-based stories, 13 beats each, with 2–3 sources each.`); process.exit(0); }
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await copyFile(join(import.meta.dirname,'styles.css'),join(out,'styles.css'));
await copyFile(join(import.meta.dirname,'app.js'),join(out,'app.js'));
await mkdir(join(out,'images'),{recursive:true});
for (const s of stories) await copyFile(join(import.meta.dirname,'images',s.image.file),join(out,'images',s.image.file));
await writeFile(join(out,'index.html'),index());
await mkdir(join(out,'approach'),{recursive:true});
await writeFile(join(out,'approach','index.html'),approach());
for (const s of stories) { const dir=join(out,'stories',s.slug); await mkdir(dir,{recursive:true}); await writeFile(join(dir,'index.html'),storyPage(s)); }
const urls=['/','/approach/',...stories.map(s=>`/stories/${s.slug}/`)];
await writeFile(join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
console.log(`Built ${urls.length} pages in ${out}`);
