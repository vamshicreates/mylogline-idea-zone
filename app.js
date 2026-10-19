(() => {
  const cards = [...(document.querySelector('#stories')?.querySelectorAll('[data-story]') || [])];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = document.querySelector('#story-search');
  const results = document.querySelector('#results');
  const empty = document.querySelector('#empty-state');
  let active = 'All stories';

  function update() {
    if (!results) return;
    const query = (search?.value || '').trim().toLowerCase();
    let count = 0;
    for (const card of cards) {
      const show = (active === 'All stories' || card.dataset.category === active) && (!query || card.dataset.search.includes(query));
      card.hidden = !show;
      if (show) count++;
    }
    results.textContent = `Showing ${count} Indian ${count === 1 ? 'story' : 'stories'}`;
    if (empty) empty.hidden = count !== 0;
  }

  for (const button of filters) button.addEventListener('click', () => {
    active = button.dataset.filter;
    for (const other of filters) {
      const selected = other === button;
      other.classList.toggle('is-active', selected);
      other.setAttribute('aria-pressed', String(selected));
    }
    update();
  });
  search?.addEventListener('input', update);

  const copy = document.querySelector('[data-copy-logline]');
  copy?.addEventListener('click', async () => {
    const text = document.querySelector('#logline')?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = 'Copied';
      window.setTimeout(() => { copy.textContent = 'Copy logline'; }, 2000);
    } catch {
      copy.textContent = 'Select the text to copy';
    }
  });
})();
