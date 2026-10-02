// ---------------------------------------------------------------
// design-system.js: renders design-system.html from tokens/tokens.json
// and the CAST in dialogue-data.js.
// ---------------------------------------------------------------
(function(){
  const root = document.documentElement;
  const toVar = path => `--${path.replace(/\./g, '-')}`;
  const live  = name => getComputedStyle(root).getPropertyValue(name).trim();

  function el(tag, attrs = {}, ...children){
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)){
      if (k === 'class') node.className = v;
      else if (k === 'style') node.style.cssText = v;
      else node.setAttribute(k, v);
    }
    children.flat().forEach(c => node.append(c instanceof Node ? c : document.createTextNode(c)));
    return node;
  }

  // same flattening rules as scripts/build-tokens.js
  function collect(node, prefix = [], out = []){
    for (const [key, value] of Object.entries(node)){
      if (key.startsWith('$') || value === null || typeof value !== 'object') continue;
      const here = [...prefix, key];
      if ('$value' in value) out.push({ path: here.join('.'), ...value });
      else collect(value, here, out);
    }
    return out;
  }

  // ---------- token sections ----------
  function renderColors(tokens){
    const wrap = document.getElementById('colorTokens');
    tokens.filter(t => t.path.startsWith('color.')).forEach(t => {
      const name = toVar(t.path);
      const isRef = /\{.+\}/.test(t.$value);
      wrap.append(el('div', { class:'ds-swatch' },
        el('div', { class:'ds-swatch-chip', style:`background: var(${name})` }),
        el('div', { class:'ds-swatch-meta' },
          el('strong', {}, t.path.replace(/^color\./, '')),
          el('span', { class:'ds-var' }, `${name}: ${isRef ? t.$value + ' → ' : ''}${live(name)}`),
          t.$description ? el('div', { class:'ds-desc' }, t.$description) : ''
        )
      ));
    });
  }

  function renderFonts(tokens){
    const wrap = document.getElementById('fontTokens');
    const samples = {
      'font.display': 'Matty & Jules',
      'font.body':    'Three agonizing hours. Every time I tweak the eyebrows, the jawline collapses.',
      'font.mono':    'DIALOGUE PROTOTYPE'
    };
    tokens.filter(t => t.path.startsWith('font.')).forEach(t => {
      const name = toVar(t.path);
      wrap.append(el('div', { class:'ds-type-row' },
        el('div', { class:'ds-type-label' },
          el('strong', {}, t.path.replace(/^font\./, '')), el('br'),
          el('span', { class:'ds-var' }, name), el('br'),
          t.$description || ''
        ),
        el('div', { class:'ds-type-sample', style:`font-family: var(${name})` }, samples[t.path] || 'The quick brown fox')
      ));
    });
  }

  function renderRadii(tokens){
    const wrap = document.getElementById('radiusTokens');
    tokens.filter(t => t.path.startsWith('radius.')).forEach(t => {
      const name = toVar(t.path);
      wrap.append(el('div', { class:'ds-radius' },
        el('div', { class:'ds-radius-box', style:`border-radius: var(${name})` }),
        el('strong', {}, `${t.path.replace(/^radius\./, '')} · ${t.$value}`),
        el('span', { class:'ds-var' }, name)
      ));
    });
  }

  function renderTable(id, group, tokens, breakpoints){
    const table = document.getElementById(id);
    const rows = tokens.filter(t => t.path.startsWith(group + '.'));
    const head = el('tr', {}, el('th', {}, 'Token'), el('th', {}, 'Value'), el('th', {}, 'Overrides'), el('th', {}, 'Use'));
    table.append(el('thead', {}, head));
    const body = el('tbody');
    rows.forEach(t => {
      const overrides = breakpoints
        .filter(bp => t.path in bp.tokens)
        .map(bp => `${bp.name}: ${bp.tokens[t.path]}`)
        .join('; ');
      body.append(el('tr', {},
        el('td', {}, el('code', {}, toVar(t.path))),
        el('td', {}, el('code', {}, t.$value)),
        el('td', {}, overrides || '—'),
        el('td', {}, t.$description || '')
      ));
    });
    table.append(body);
  }

  function renderTokens(json){
    const tokens = collect(json);
    const breakpoints = json.$breakpoints || [];
    renderColors(tokens);
    renderFonts(tokens);
    renderRadii(tokens);
    renderTable('layoutTokens', 'layout', tokens, breakpoints);
    renderTable('motionTokens', 'motion', tokens, breakpoints);
  }

  function showLoadError(){
    ['colorTokens', 'fontTokens', 'radiusTokens', 'layoutTokens', 'motionTokens'].forEach(id => {
      const target = document.getElementById(id);
      const msg = el('p', { class:'ds-error' },
        'Couldn\'t load tokens/tokens.json. Browsers block this when the page is opened straight from disk. Run ',
        el('code', {}, 'npm run serve'), ' and open the local address it prints.');
      if (target.tagName === 'TABLE') target.closest('.ds-table-wrap').replaceWith(msg);
      else target.replaceWith(msg);
    });
  }

  fetch('tokens/tokens.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(renderTokens)
    .catch(showLoadError);

  // ---------- motion demo ----------
  const motionLine = document.getElementById('motionLine');
  document.getElementById('replayBtn').addEventListener('click', () => {
    motionLine.classList.remove('reveal');
    void motionLine.offsetWidth;
    motionLine.classList.add('reveal');
  });

  // ---------- expression sheets ----------
  function renderSheets(){
    const wrap = document.getElementById('expressionSheets');
    Object.values(CAST).forEach(character => {
      const { src, cols, rows, expressions } = character.sheet;
      const grid = el('div', { class:'ds-sheet-grid' });
      for (let row = 0; row < rows; row++){
        for (let col = 0; col < cols; col++){
          const names = Object.keys(expressions).filter(n => expressions[n][0] === row && expressions[n][1] === col);
          const sprite = el('div', { class:'ds-cell-sprite' });
          sprite.style.backgroundImage    = `url("${src}")`;
          sprite.style.backgroundSize     = `${cols * 100}% ${rows * 100}%`;
          sprite.style.backgroundPosition = `${cols > 1 ? col / (cols - 1) * 100 : 0}% ${rows > 1 ? row / (rows - 1) * 100 : 0}%`;
          grid.append(el('div', { class:'ds-cell' },
            sprite,
            el('div', { class:'ds-cell-name' }, names.join(' / ') || 'Unnamed'),
            el('div', { class:'ds-cell-pos' }, `[${row}, ${col}]`)
          ));
        }
      }
      wrap.append(el('div', { class:'ds-sheet' }, el('h3', {}, character.name), grid));
    });
  }
  renderSheets();
})();
