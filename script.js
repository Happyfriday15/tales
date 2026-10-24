const illustration = document.querySelector('#illustration');
const pageCopy = document.querySelector('#pageCopy');
const nextButton = document.querySelector('#nextButton');
const backButton = document.querySelector('#backButton');
const pageNumber = document.querySelector('#pageNumber');
const helperText = document.querySelector('#helperText');
const progressLabel = document.querySelector('#progressLabel');
const progressFill = document.querySelector('#progressFill');

let page = 0;
const totalPages = 7;
let pageState = { clouds: 0, supplies: [], parts: [], snackFound: false, rocketName: '', rocketDesign: 'classic' };
let touchPart = null;

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function parkerMarkup(extraClass = '') {
  return `<div class="parker ${extraClass}" aria-label="Johnny"><span class="hair"></span><span class="head"><i class="eye one"></i><i class="eye two"></i><i class="cheek one"></i><i class="cheek two"></i><i class="smile"></i></span><span class="neck"></span><span class="body"><i class="collar"></i><i class="shirt-seam"></i></span><span class="arm one"><i class="hand"></i></span><span class="arm two"><i class="hand"></i></span><span class="leg one"><i class="shoe"></i></span><span class="leg two"><i class="shoe"></i></span></div>`;
}

function render() {
  const pages = [renderCover, renderClouds, renderSupplies, renderAssembly, renderFlight, renderSnacks, renderEnd];
  pages[page]();
  backButton.disabled = page === 0;
  nextButton.hidden = [1, 2, 3, 5].includes(page);
  nextButton.textContent = page === 0 ? 'Start the story' : page === 4 ? 'Land on Mars' : page === 6 ? 'Read it again' : 'Next page';
  pageNumber.textContent = page === 0 ? 'Cover' : `Page ${page} of ${totalPages - 1}`;
  progressLabel.textContent = page === 0 ? 'Cover' : `${page} / ${totalPages - 1}`;
  progressFill.style.width = `${(page / (totalPages - 1)) * 100}%`;
  if (page === 1 && pageState.clouds === 3) { nextButton.hidden = false; nextButton.textContent = 'Go find supplies'; }
  if (page === 2 && pageState.supplies.length === 4) { nextButton.hidden = false; nextButton.textContent = 'Build the rocket'; }
  if (page === 3 && pageState.parts.length === 5) { nextButton.hidden = false; nextButton.textContent = 'Blast off!'; }
  if (page === 5 && pageState.snackFound) { nextButton.hidden = false; nextButton.textContent = 'The end'; }
}

function setCopy(eyebrow, title, text) {
  pageCopy.innerHTML = `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="story-text">${text}</p>`;
}

function renderCover() {
  illustration.innerHTML = `<div class="cover-art" aria-label="Johnny, a rocket, and the moon"><div class="cover-sun"></div><div class="moon"></div><div class="hill back"></div><div class="hill"></div>${parkerMarkup()}<div class="rocket cover-rocket"><i class="rocket-window"></i><i class="rocket-band"></i><i class="rocket-fin left"></i><i class="rocket-fin right"></i><i class="rocket-flame"></i></div></div>`;
  setCopy('A story you can help tell', 'Parker Builds<br>to Mars', 'On a bright morning, Parker looks up at the red planet and wonders what it would feel like to stand there. With a brave heart and a little help, Parker decides to find out.');
  helperText.textContent = 'Turn the page to begin Parker’s adventure.';
}

function renderClouds() {
  const cloudPositions = [[31, 88, 1], [41, 38, .9], [51, 104, .82]];
  const clouds = cloudPositions.map(([left, top, scale], index) => `<button class="cloud ${index < pageState.clouds ? 'cleared' : ''}" data-cloud type="button" aria-label="Clear cloud ${index + 1}" style="left:${left}%;top:${top}px;transform:scale(${scale})"><span></span><span></span><span></span></button>`).join('');
  illustration.innerHTML = `<div class="scene sky-scene ${pageState.clouds === 3 ? 'idea-scene' : ''}" role="group" aria-label="Mars behind clouds"><span class="scene-label">Clear the clouds to see Mars</span><div class="sky-mars"><i></i><i></i><i></i></div>${clouds}<span class="terrain-hill back-hill"></span><span class="terrain-hill front-hill"></span><span class="terrain-rock rock-one"></span><span class="terrain-rock rock-two"></span><span class="terrain-rock rock-three"></span><span class="ground"><i></i><i></i><i></i></span><div class="speech-bubble ${pageState.clouds === 3 ? 'visible' : ''}" role="status">Maybe I should build a rocket!</div>${parkerMarkup(`scene-parker ${pageState.clouds === 3 ? 'idea' : ''}`)}</div>`;
  setCopy('Chapter 1 · The big idea', 'Look at that!', 'Parker has been dreaming about Mars all morning, but thick clouds hide it from view. Clear the sky so Parker can see the place that started this adventure.');
  helperText.textContent = pageState.clouds < 3 ? `${3 - pageState.clouds} cloud${3 - pageState.clouds === 1 ? '' : 's'} left to clear.` : 'The sky is clear! Parker has an idea: build a rocket.';
  document.querySelectorAll('[data-cloud]').forEach(cloud => cloud.addEventListener('click', () => {
    if (!cloud.classList.contains('cleared')) { cloud.classList.add('cleared'); pageState.clouds++; }
    if (pageState.clouds === 3) { document.querySelector('.sky-scene').classList.add('idea-scene'); document.querySelector('.scene-parker').classList.add('idea'); document.querySelector('.speech-bubble').classList.add('visible'); nextButton.hidden = false; nextButton.textContent = 'Go find supplies'; helperText.textContent = 'The sky is clear! Johnny knows what to do next.'; }
  }));
}

const supplies = [
  ['A spoon', 'spoon', false], ['A helmet', 'helmet', true], ['A pillow', 'pillow', false], ['A fuel tank', 'tank', true],
  ['A sock', 'sock', false], ['A star map', 'map', true], ['A watering can', 'water', false], ['A tool box', 'toolbox', true]
];

function renderSupplies() {
  const positions = shuffled([[10, 42], [31, 42], [52, 42], [73, 42], [10, 18], [31, 18], [52, 18], [73, 18]]);
  const lineup = shuffled(supplies.map((item, index) => ({ item, index })));
  const items = lineup.map(({ item: [name, icon], index }, slot) => `<button class="house-object object-${icon} ${pageState.supplies.includes(name) ? 'found' : ''}" data-supply="${index}" type="button" aria-label="${name}" ${pageState.supplies.includes(name) ? 'disabled' : ''} style="left:${positions[slot][0]}%;top:${positions[slot][1]}%"><span class="object-shape" aria-hidden="true"></span><span class="object-label">${name.replace('A ', '')}</span></button>`).join('');
  illustration.innerHTML = `<div class="house-scene" role="group" aria-label="Parker's house filled with objects"><div class="room-window"><span></span><span></span></div><div class="wall-picture"><i></i></div><div class="room-shelf"><i></i><i></i><i></i></div><div class="wall-rail rail-top"></div><div class="wall-rail rail-bottom"></div><div class="room-floor"></div><div class="room-rug"></div><div class="room-table"></div><div class="room-chair"></div>${items}<div class="house-basket" id="basket" role="status"><strong>Rocket basket</strong><span>${pageState.supplies.length ? pageState.supplies.join(' · ') : 'Empty for now'}</span></div></div>`;
  setCopy('Chapter 2 · The supply hunt', 'Parker checks the house', 'Parker runs home with a plan. A helmet will keep the head safe, a fuel tank will power the trip, a star map will guide the way, and a toolbox will help with every tricky fix.');
  helperText.textContent = `${pageState.supplies.length} of 4 supplies found.`;
  document.querySelectorAll('[data-supply]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.supply); const [name, , correct] = supplies[index];
    if (correct) {
      button.classList.add('correct', 'found'); button.disabled = true; pageState.supplies.push(name);
      document.querySelector('#basket span').textContent = pageState.supplies.join(' · ');
      helperText.textContent = `${pageState.supplies.length} of 4 supplies found.`;
      if (pageState.supplies.length === 4) { nextButton.hidden = false; nextButton.textContent = 'Build the rocket'; helperText.textContent = 'Everything is packed. Time for the garage!'; }
    } else { button.classList.remove('wrong'); void button.offsetWidth; button.classList.add('wrong'); helperText.textContent = 'Not quite. Parker needs something for the rocket.'; }
  }));
}

const parts = [['Red nose cap', 'nose'], ['Round window', 'window'], ['Left fin', 'leftFin'], ['Right fin', 'rightFin'], ['Rocket flame', 'flame']];
function renderAssembly() {
  const finished = pageState.parts.length === 5;
  const rocketParts = finished
    ? '<i class="rocket-window"></i><i class="rocket-fin left"></i><i class="rocket-fin right"></i><i class="rocket-flame"></i>'
    : pageState.parts.map(id => id === 'nose' ? '' : id === 'leftFin' ? '<i class="rocket-fin left"></i>' : id === 'rightFin' ? '<i class="rocket-fin right"></i>' : id === 'window' ? '<i class="rocket-window"></i>' : '<i class="rocket-flame"></i>').join('');
  const flameAdded = pageState.parts.includes('flame');
  const designClass = `design-${pageState.rocketDesign}`;
  const customizer = finished ? `<div class="rocket-customizer"><label for="rocketNameInput">Name your rocket</label><input id="rocketNameInput" type="text" maxlength="28" placeholder="Type a rocket name"><span class="design-label">Choose a design</span><div class="design-options"><button class="design-choice design-classic ${pageState.rocketDesign === 'classic' ? 'selected' : ''}" data-design="classic" type="button" aria-label="Classic red design"></button><button class="design-choice design-ocean ${pageState.rocketDesign === 'ocean' ? 'selected' : ''}" data-design="ocean" type="button" aria-label="Ocean blue design"></button><button class="design-choice design-forest ${pageState.rocketDesign === 'forest' ? 'selected' : ''}" data-design="forest" type="button" aria-label="Forest green design"></button></div><p class="customizer-status" id="customizerStatus">${pageState.rocketName ? `Meet ${escapeHtml(pageState.rocketName)}!` : 'Give your rocket a name before blast off.'}</p></div>` : `<div class="part-list">${parts.map(([label, id]) => `<button class="part ${pageState.parts.includes(id) ? 'used' : ''}" data-part="${id}" draggable="${!pageState.parts.includes(id)}" type="button">${label}<small>drag me</small></button>`).join('')}</div>`;
  illustration.innerHTML = `<div class="assembly"><div class="rocket-bay ${finished ? 'finished-bay' : ''}"><p class="drop-hint">Drag each part to its matching outline</p><div class="build-rocket ${finished ? 'finished-rocket' : ''} ${flameAdded ? 'flame-added' : ''} ${designClass}">${rocketParts}<button class="drop-zone nose-zone ${pageState.parts.includes('nose') ? 'filled' : ''}" data-drop="nose" aria-label="Drop the red nose cap here"></button><button class="drop-zone window-zone ${pageState.parts.includes('window') ? 'filled' : ''}" data-drop="window" aria-label="Drop the round window here"></button><button class="drop-zone fin-zone left-fin-zone ${pageState.parts.includes('leftFin') ? 'filled' : ''}" data-drop="leftFin" aria-label="Drop the left side fin here"></button><button class="drop-zone fin-zone right-fin-zone ${pageState.parts.includes('rightFin') ? 'filled' : ''}" data-drop="rightFin" aria-label="Drop the right side fin here"></button><button class="drop-zone flame-zone ${pageState.parts.includes('flame') ? 'filled' : ''}" data-drop="flame" aria-label="Drop the rocket flame here"></button></div></div>${customizer}</div>`;
  setCopy('Chapter 3 · The garage', 'A rocket takes teamwork', 'In the garage, Parker spreads the parts across the workbench. Piece by piece, the rocket begins to look ready for the biggest journey Parker has ever imagined.');
  helperText.textContent = pageState.parts.length < 5 ? `${pageState.parts.length} of 5 parts added.` : 'Rocket ready! Parker is buckled in.';
  const placePart = (part, target) => {
    if (part === target && !pageState.parts.includes(part)) { pageState.parts.push(part); renderAssembly(); if (pageState.parts.length === 5) { nextButton.hidden = false; nextButton.textContent = 'Blast off!'; } }
    else if (part) { helperText.textContent = 'That part belongs somewhere else. Try another outline.'; }
  };
  document.querySelectorAll('[data-part]').forEach(button => {
    button.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', button.dataset.part));
    button.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') { touchPart = button.dataset.part; button.setPointerCapture(event.pointerId); } });
    button.addEventListener('click', () => { helperText.textContent = 'Drag this part onto its matching outline on the rocket.'; });
  });
  if (finished) {
    const nameInput = document.querySelector('#rocketNameInput');
    nameInput.value = pageState.rocketName;
    nameInput.addEventListener('input', event => {
      pageState.rocketName = event.target.value.trim();
      document.querySelector('#customizerStatus').textContent = pageState.rocketName ? `Meet ${pageState.rocketName}!` : 'Give your rocket a name before blast off.';
    });
    document.querySelectorAll('[data-design]').forEach(button => button.addEventListener('click', () => {
      pageState.rocketDesign = button.dataset.design;
      renderAssembly();
    }));
  }
  document.querySelectorAll('[data-drop]').forEach(zone => {
    zone.addEventListener('dragover', event => event.preventDefault());
    zone.addEventListener('drop', event => {
      event.preventDefault(); const part = event.dataTransfer.getData('text/plain');
      placePart(part, zone.dataset.drop);
    });
    zone.addEventListener('pointerup', event => { if (event.pointerType === 'touch' && touchPart) { placePart(touchPart, zone.dataset.drop); touchPart = null; } });
    zone.addEventListener('click', () => { helperText.textContent = 'Drag the matching part from the workbench onto this outline.'; });
  });
}

function renderFlight() {
  const rocketName = pageState.rocketName || "Parker's Rocket";
  illustration.innerHTML = `<div class="flight-scene"><span class="star" style="left:12%;top:22%"></span><span class="star" style="left:31%;top:62%"></span><span class="star" style="left:60%;top:18%"></span><span class="star" style="left:78%;top:42%"></span><div class="planet-mars" aria-label="Mars"></div><div class="flight-rocket design-${pageState.rocketDesign}" aria-label="${escapeHtml(rocketName)} flying to Mars"><i class="rocket-window"></i><i class="rocket-band"></i><i class="rocket-fin left"></i><i class="rocket-fin right"></i><i class="rocket-flame"></i></div><div class="flight-rocket-name">${escapeHtml(rocketName)}</div></div>`;
  setCopy('Chapter 4 · Blast off', 'Up, up, away!', `${escapeHtml(rocketName)} lifts off, carrying Parker past the clouds and into the quiet, starry sky. Far ahead, Mars glows like a little red lantern.`);
  helperText.textContent = 'Watch the rocket fly. Parker is almost there!';
}

const snacks = [['Moon cheese', 'circle'], ['Crunchy carrots', 'triangle'], ['Star crackers', 'star'], ['Red berries', 'dot']];
function renderSnacks() {
  illustration.innerHTML = `<div class="snack-scene"><div class="parker-note"><h3>Oh no!</h3><p>Parker forgot his favorite snack. Search the page for clues from the trip.</p><span class="end-badge">Clue: a bright shape from the sky</span></div><div class="snack-options">${snacks.map(([name, shape]) => `<button class="snack" data-snack="${shape}" type="button">${name}</button>`).join('')}</div></div>`;
  setCopy('Chapter 5 · Mars', 'A snack-sized problem', 'Parker lands safely and takes the first careful steps on Mars. Then Parker remembers one important thing: the trip was so exciting that the favorite snack was left behind.');
  helperText.textContent = pageState.snackFound ? 'You remembered the clue! Parker is ready for a starry snack.' : 'Choose Parker’s favorite snack.';
  document.querySelectorAll('[data-snack]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.snack === 'star') { button.classList.add('correct'); pageState.snackFound = true; nextButton.hidden = false; nextButton.textContent = 'The end'; helperText.textContent = 'You remembered the clue! Parker is ready for a starry snack.'; }
    else { button.classList.remove('wrong'); void button.offsetWidth; button.classList.add('wrong'); helperText.textContent = 'Try again — remember the clue from the sky.'; }
  }));
}

function renderEnd() {
  illustration.innerHTML = `<div class="cover-art" aria-label="Parker celebrates on Mars"><div class="cover-sun" style="background:#f6a77c"></div><div class="planet-mars" style="right:24%;top:25px;width:180px;height:180px"></div>${parkerMarkup('scene-parker')}</div>`;
  setCopy('The end', 'You built to Mars!', 'Parker shares a star cracker beneath the red sky and smiles at the rocket nearby. The journey began with a question, grew with courage and teamwork, and ended with a brand-new story to tell.');
  helperText.textContent = 'Story complete. Want to build it again?';
  nextButton.hidden = false;
}

nextButton.addEventListener('click', () => { if (page === 6) { page = 0; pageState = { clouds: 0, supplies: [], parts: [], snackFound: false, rocketName: '', rocketDesign: 'classic' }; } else if (page < totalPages - 1) page++; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
backButton.addEventListener('click', () => { if (page > 0) { page--; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
render();
