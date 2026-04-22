// ── CURSOR ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
document.querySelectorAll('a, button, .speaker-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// ── LETTER PUSH (title) ──
function splitLetters(el) {
  const text = el.textContent;
  el.innerHTML = '';
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(s);
  });
}
['line1', 'line2'].forEach(id => splitLetters(document.getElementById(id)));

document.addEventListener('mousemove', e => {
  document.querySelectorAll('.title-line span').forEach(span => {
    const r = span.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 120;
    if (dist < radius) {
      const force = (radius - dist) / radius;
      const tx = -(dx / dist) * force * 18;
      const ty = -(dy / dist) * force * 18;
      span.style.transform = `translate(${tx}px, ${ty}px)`;
      span.classList.add('pushed');
    } else {
      span.style.transform = '';
      span.classList.remove('pushed');
    }
  });
});

// ── SPEAKER DATA ──
const speakers = {
  v: {
    desc: 'Making and creating from the heart, not the head. A solo exhibition at Art Windsor Essex (Nov. 20 – May 24, 2026) exploring profoundly personal and collaborative art-making.',
    bio: 'Vanessa Dion Fletcher is a Lenape and Potawatomi neurodiverse Artist. Her family is from Eelūnaapèewii Lahkèewiitt (displaced from Lenapehoking) and European settlers. She employs porcupine quills, Wampum belts, and menstrual blood to reveal the complexities of what defines a body physically and culturally. Reflecting on an Indigenous and gendered body with a neurodiverse mind, Dion Fletcher creates art using composite media, primarily working in performance, textiles and video. MFA, School of the Art Institute of Chicago, 2016.'
  },
  k: {
    desc: 'Virtual reconstruction of the 12-million-year-old ape Pierolapithecus — paleoanthropology, fossils, and new research on old faces.',
    bio: 'Kelsey Pugh is a paleoanthropologist studying ape and human evolution from the fossil record. She uses comparative anatomy, phylogenetics, and 3D geometric morphometrics to address questions such as "what is the nature of the last common ancestor of apes and humans?". PhD in Biological Anthropology, City University of New York, 2020.'
  },
  a: {
    desc: "Photography needs light, power, water. In South Africa these can't be taken for granted. Artists working within — and through — these constraints.",
    bio: "Anna Stielau is an assistant professor of art history and visual culture at OCAD University. She received her PhD from NYU's Department of Media, Culture, and Communication, and previously served as the Weisman Postdoctoral Teaching Fellow in Visual Culture at Caltech. Her research explores how contemporary African artists use media and technology to imagine the world, otherwise."
  }
};

// ── TYPING STATE ──
const typedDisplay = document.getElementById('typed-display');
const echoLayer = document.getElementById('echo-layer');
const infoOverlay = document.getElementById('info-overlay');

const speakerMap = {
  v: { card: document.getElementById('card-v'), desc: document.getElementById('desc-v'), hint: document.getElementById('hint-v') },
  k: { card: document.getElementById('card-k'), desc: document.getElementById('desc-k'), hint: document.getElementById('hint-k') },
  a: { card: document.getElementById('card-a'), desc: document.getElementById('desc-a'), hint: document.getElementById('hint-a') },
};

// 0=hidden, 1=desc showing, 2=bio showing
const cardState = { v: 0, k: 0, a: 0 };

let typedBuffer = '';

function showEcho(char) {
  const el = document.createElement('div');
  el.className = 'echo-char';
  el.textContent = char.toUpperCase();
  el.style.left = (10 + Math.random() * 50) + 'vw';
  el.style.top = (10 + Math.random() * 70) + 'vh';
  echoLayer.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function updateTypedDisplay() {
  typedDisplay.textContent = typedBuffer.slice(-20);
}

function fadeSwap(descEl, newText, callback) {
  descEl.classList.add('fading');
  setTimeout(() => {
    descEl.textContent = newText;
    descEl.classList.remove('fading');
    if (callback) callback();
  }, 350);
}

function handleSpeakerKey(key) {
  const { card, desc, hint } = speakerMap[key];
  const state = cardState[key];

  if (state === 0) {
    // Hide all other cards first
    Object.keys(speakerMap).forEach(k => {
      if (k !== key) {
        speakerMap[k].card.classList.remove('visible', 'active');
        cardState[k] = 0;
      }
    });
    // Show this card with desc
    desc.textContent = speakers[key].desc;
    card.classList.add('visible', 'active');
    hint.innerHTML = `type <span>${key.toUpperCase()}</span> again to read bio`;
    cardState[key] = 1;
  } else if (state === 1) {
    // Fade to bio
    fadeSwap(desc, speakers[key].bio, () => {
      hint.innerHTML = `type <span>${key.toUpperCase()}</span> again to close`;
    });
    cardState[key] = 2;
  } else {
    // Close
    card.classList.remove('visible', 'active');
    cardState[key] = 0;
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (infoOverlay.classList.contains('show')) {
      infoOverlay.classList.remove('show');
    } else {
      typedBuffer = '';
      updateTypedDisplay();
      Object.keys(cardState).forEach(k => {
        cardState[k] = 0;
        speakerMap[k].card.classList.remove('visible', 'active');
      });
    }
    return;
  }

  if (e.key === 'Enter') {
    infoOverlay.classList.add('show');
    return;
  }

  if (e.key.length > 1) return;
  e.preventDefault();

  const key = e.key.toLowerCase();
  typedBuffer += key;
  updateTypedDisplay();
  showEcho(key);

  if (['v', 'k', 'a'].includes(key)) handleSpeakerKey(key);
});

window.addEventListener('keydown', e => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
});
