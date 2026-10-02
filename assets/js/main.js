// ---------------------------------------------------------------
// main.js: dialogue engine. Reads CAST and SCRIPT from dialogue-data.js,
// which must be loaded first.
// ---------------------------------------------------------------
(function(){
  // ELEMENTS
  const titleScreen    = document.getElementById('titleScreen');
  const dialogueScreen = document.getElementById('dialogueScreen');
  const endScreen      = document.getElementById('endScreen');

  const charEls = {
    matty: document.getElementById('charMatty'),
    jules: document.getElementById('charJules')
  };
  const boxHeader    = document.getElementById('boxHeader');
  const speakerLabel = document.getElementById('speakerLabel');
  const textEl       = document.getElementById('dialogueText');
  const backBtn      = document.getElementById('backBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const startBtn     = document.getElementById('startBtn');
  const restartBtn   = document.getElementById('restartBtn');

  // preload both sheets so the first swap doesn't flash
  Object.values(CAST).forEach(c => { const img = new Image(); img.src = c.sheet.src; });

  // ---------------------------------------------------------------
  // SPRITE POSITIONING
  // Uses percentages, so it scales with the element at any size.
  // No resize listener needed.
  // ---------------------------------------------------------------
  function setSprite(el, character, expression){
    const { src, cols, rows, expressions } = character.sheet;
    const [row, col] = expressions[expression] || [0,0];
    el.style.backgroundImage    = `url("${src}")`;
    el.style.backgroundSize     = `${cols * 100}% ${rows * 100}%`;
    el.style.backgroundPosition = `${cols > 1 ? col / (cols - 1) * 100 : 0}% ${rows > 1 ? row / (rows - 1) * 100 : 0}%`;
  }

  // work out every character's expression at a given line,
  // carrying forward anything not set on that line (so Back works correctly)
  function expressionsAt(index){
    const state = {};
    Object.keys(CAST).forEach(id => state[id] = "Neutral");
    for (let i = 0; i <= index; i++){
      Object.keys(CAST).forEach(id => { if (SCRIPT[i][id]) state[id] = SCRIPT[i][id]; });
    }
    return state;
  }

  function showScreen(el){
    [titleScreen, dialogueScreen, endScreen].forEach(s => s.classList.remove('active'));
    el.classList.add('active');
  }

  let current = 0;
  let lastSpeaker = null;

  // restart the shared reveal animation on a set of elements
  function playReveal(els){
    els.forEach(el => el.classList.remove('reveal'));
    void document.body.offsetWidth;          // force reflow so the animation replays
    els.forEach(el => el.classList.add('reveal'));
  }

  function renderLine(){
    const line    = SCRIPT[current];
    const speaker = CAST[line.speaker];
    const state   = expressionsAt(current);
    const speakerChanged = line.speaker !== lastSpeaker;

    Object.entries(CAST).forEach(([id, character]) => {
      const wrap   = charEls[id];
      const sprite = wrap.querySelector('.sprite');
      sprite.classList.toggle('flip', !!character.flip);
      setSprite(sprite, character, state[id]);
      wrap.classList.toggle('is-speaking',  id === line.speaker);
      wrap.classList.toggle('is-listening', id !== line.speaker);
    });

    speakerLabel.textContent = speaker.name;
    boxHeader.classList.toggle('from-left',  speaker.side === 'left');
    boxHeader.classList.toggle('from-right', speaker.side === 'right');

    textEl.textContent = line.text;
    // new speaker: portrait (with its name tag) and line fade in together
    if (speakerChanged){
      playReveal([charEls[line.speaker], textEl]);
      Object.keys(charEls).forEach(id => {
        if (id !== line.speaker) charEls[id].classList.remove('reveal');
      });
    }
    lastSpeaker = line.speaker;

    backBtn.disabled = current === 0;
    nextBtn.textContent = (current === SCRIPT.length - 1) ? "Finish ▸" : "Next ▸";
  }

  function startConversation(){
    current = 0;
    lastSpeaker = null;
    showScreen(dialogueScreen);
    renderLine();
    nextBtn.focus();
  }

  function goNext(){
    if (current < SCRIPT.length - 1){ current++; renderLine(); }
    else { showScreen(endScreen); restartBtn.focus(); }
  }

  function goBack(){
    if (current > 0){ current--; renderLine(); }
  }

  startBtn.addEventListener('click', startConversation);
  restartBtn.addEventListener('click', startConversation);
  nextBtn.addEventListener('click', goNext);
  backBtn.addEventListener('click', goBack);

  // arrow keys step through the conversation
  document.addEventListener('keydown', e => {
    if (!dialogueScreen.classList.contains('active')) return;
    if (e.key === 'ArrowRight'){ e.preventDefault(); goNext(); }
    if (e.key === 'ArrowLeft'){  e.preventDefault(); goBack(); }
  });

  // title screen portraits
  setSprite(document.getElementById('coverMatty'), CAST.matty, "Neutral");
  setSprite(document.getElementById('coverJules'), CAST.jules, "Neutral");
})();
