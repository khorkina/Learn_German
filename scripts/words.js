// scripts/words.js
(async function(){
  const levelSelect = document.getElementById('level-select');
  const searchInput = document.getElementById('search-input');
  const posFilter   = document.getElementById('pos-filter');
  const list        = document.getElementById('words-list');
  const stats       = document.getElementById('stats');

  const LEVEL_FILES = {
    A1: '../content/words/a1/words_a1.json'
  };

  let all = [];

  async function load(level){
    try {
      const url = LEVEL_FILES[level];
      const res = await fetch(url, { cache: 'no-store' });
      all = res.ok ? await res.json() : [];
      console.log('Words loaded:', all.length);
      renderPOSOptions(all);
      render();
    } catch (e) {
      console.error('Load error:', e);
      all = [];
      renderPOSOptions(all);
      render();
    }
  }

  function renderPOSOptions(items){
    const pos = Array.from(new Set(items.map(x => x.part || '—'))).sort();
    posFilter.innerHTML =
      '<option value="all">Alle</option>' +
      pos.map(p=>`<option value="${p}">${p}</option>`).join('');
  }

  function matches(q, item){
    if(!q) return true;
    q = q.toLowerCase();
    return (item.word && item.word.toLowerCase().includes(q)) ||
           (item.example && item.example.toLowerCase().includes(q));
  }

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"]/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"
    }[c]));
  }

  function render(){
    const q = searchInput.value.trim();
    const pos = posFilter.value;
    const filtered = all.filter(x => matches(q,x) && (pos==='all' || (x.part||'—')===pos));
    stats.textContent = `${filtered.length} / ${all.length} Einträge`;

    list.innerHTML = filtered.map(item => `
      <article class="word-item">
        <header>
          <h3>${escapeHtml(item.word)}</h3>
          <span class="badge">${escapeHtml(item.part||'')}</span>
        </header>
        ${item.forms?`<div class="forms">${escapeHtml(item.forms)}</div>`:''}
        ${item.example?`<p class="example">${escapeHtml(item.example)}</p>`:''}
      </article>
    `).join('');
  }

  searchInput.addEventListener('input', render);
  posFilter.addEventListener('change', render);
  levelSelect.addEventListener('change', (e)=> load(e.target.value));

  await load('A1');
})();
