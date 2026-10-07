(() => {
  'use strict';
  const data = window.RESEARCH_SITE;
  const $ = id => document.getElementById(id);
  const element = (tag, className, value) => { const node = document.createElement(tag); if (className) node.className = className; if (value !== undefined) node.textContent = value; return node; };
  const date = value => value.length === 4 ? value : new Date(value + (value.length === 7 ? '-01' : '') + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', ...(value.length === 10 ? { day: 'numeric' } : {}), year: 'numeric' });
  function links(items, className = 'link-row') {
    const row = element('div', className);
    for (const item of items || []) {
      try { const url = new URL(item.url); if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) continue;
        const a = element('a', '', item.label + ' ↗'); a.href = url.href;
        if (url.protocol !== 'mailto:') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        row.append(a);
      } catch { /* Ignore incomplete URLs until they are configured. */ }
    }
    return row;
  }
  document.title = data.name + ' — Research updates';
  $('brand-name').textContent = data.name; $('footer-name').textContent = data.name;
  $('template-banner').hidden = !data.template;
  $('headline').replaceChildren(...data.headline.split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
  $('intro').textContent = data.intro;
  $('interests').replaceChildren(...data.interests.map(v => element('span', '', v)));
  $('about-heading').textContent = data.aboutHeading; $('bio').textContent = data.bio;
  $('profile-links').replaceChildren(...links(data.links).childNodes);
  let filter = 'All';
  const dialog = $('update-dialog');
  function openUpdate(update) {
    const content = $('dialog-content');
    content.replaceChildren(element('div', 'eyebrow', `${update.example ? 'EXAMPLE / ' : ''}${update.type.toUpperCase()} · ${date(update.date)}`), element('h2', '', update.title), element('p', '', update.body || update.summary), links(update.links));
    dialog.showModal();
  }
  document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
  function renderUpdates() {
    const query = $('search').value.trim().toLowerCase();
    const updates = [...data.updates].sort((a,b) => b.date.localeCompare(a.date)).filter(v => (filter === 'All' || v.type === filter) && `${v.title} ${v.summary} ${v.body || ''}`.toLowerCase().includes(query));
    $('updates-list').replaceChildren(...updates.map(update => {
      const row = element('article', 'update-row'); const time = element('time', 'update-date', date(update.date)); time.dateTime = update.date;
      const copy = element('div'); const tag = element('span', 'tag', update.type); copy.append(tag);
      if (update.example) copy.append(element('span', 'example-label', 'Illustrative entry'));
      copy.append(element('h3', '', update.title), element('p', '', update.summary));
      const button = element('button', 'read-update', '↗'); button.setAttribute('aria-label', `Read ${update.title}`); button.addEventListener('click', () => openUpdate(update));
      row.append(time, copy, button); return row;
    }));
    if (!updates.length) $('updates-list').append(element('p', 'empty-state', data.updates.length ? 'No updates match your search. Try another term or category.' : 'Research updates will appear here.'));
    $('results-count').textContent = `${updates.length} ${updates.length === 1 ? 'update' : 'updates'}${data.template ? ' · Sample content' : ''}`;
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(v => { v.classList.toggle('active', v === button); v.setAttribute('aria-pressed', String(v === button)); });
    renderUpdates();
  }));
  $('search').addEventListener('input', renderUpdates); renderUpdates();
  function renderPublications(pubFilter = 'All') {
  $('publications-list').replaceChildren(...data.publications.filter(pub => pubFilter === 'All' || (pubFilter === 'Earlier' ? pub.year < 2025 : String(pub.year) === pubFilter)).map((pub, i) => {
    const row = element('article', 'publication'); const copy = element('div');
    copy.append(element('h3', '', pub.title), element('p', '', pub.authors), element('p', 'venue', `${pub.venue}${pub.example ? ' · EXAMPLE PUBLICATION' : ''}`), element('p', '', pub.description), links(pub.links));
    row.append(element('span', 'pub-index', String(i+1).padStart(2,'0')), copy); return row;
  }));
  if (!$('publications-list').children.length) $('publications-list').append(element('p','empty-state','No selected publications for this year.'));
  }
  renderPublications();
  document.querySelectorAll('[data-pub-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-pub-filter]').forEach(v => { v.classList.toggle('active', v === button); v.setAttribute('aria-pressed', String(v === button)); });
    renderPublications(button.dataset.pubFilter);
  }));
  $('projects-list').replaceChildren(...data.projects.map((project, i) => {
    const card = element('article', 'project'); card.append(element('div', 'project-number', String(i+1).padStart(2,'0')), element('span', 'project-status', project.status), element('h3','',project.title), element('p','',project.description), links(project.links)); return card;
  }));
  if (!data.projects.length) $('projects-list').append(element('p','empty-state','Projects will appear here.'));
  $('education-list').replaceChildren(...(data.education || []).map(item => { const entry = element('div','education-entry'); entry.append(element('p','',item.title),element('span','',item.detail)); return entry; }));
  $('service-list').replaceChildren(...(data.service || []).map(item => element('li','',item)));
  $('recognition-list').replaceChildren(...(data.recognition || []).map(item => element('li','',item)));
})();
