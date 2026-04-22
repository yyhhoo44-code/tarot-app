/* =============================================
   타로 앱 - 메인 로직
   화면 흐름: intro → spread-select → shuffle → select → reading
   ============================================= */

const SPREADS = [
  {
    id: 'time',
    name: '과거·현재·미래',
    icon: '⏳',
    desc: '시간의 흐름으로 상황을 읽어요',
    positions: [
      { label: '과거', desc: '현재 상황의 배경' },
      { label: '현재', desc: '지금 이 순간' },
      { label: '미래', desc: '앞으로의 방향' },
    ],
  },
  {
    id: 'advice',
    name: '상황·장애물·조언',
    icon: '🔮',
    desc: '문제 해결을 위한 방향을 찾아요',
    positions: [
      { label: '상황', desc: '지금 일어나고 있는 것' },
      { label: '장애물', desc: '가로막고 있는 것' },
      { label: '조언', desc: '카드가 전하는 메시지' },
    ],
  },
  {
    id: 'love',
    name: '나·상대방·관계',
    icon: '💫',
    desc: '연애·관계의 에너지를 살펴봐요',
    positions: [
      { label: '나', desc: '내가 관계에서 가진 에너지' },
      { label: '상대방', desc: '상대가 느끼는 것' },
      { label: '우리 사이', desc: '관계의 흐름' },
    ],
  },
  {
    id: 'choice',
    name: '선택A·선택B·핵심',
    icon: '🔀',
    desc: '갈림길에서 방향을 찾아요',
    positions: [
      { label: '선택 A', desc: '이 길을 택했을 때' },
      { label: '선택 B', desc: '저 길을 택했을 때' },
      { label: '핵심', desc: '진짜 고려해야 할 것' },
    ],
  },
  {
    id: 'self',
    name: '마음·몸·영혼',
    icon: '🌱',
    desc: '내면을 깊이 들여다봐요',
    positions: [
      { label: '마음', desc: '지금 내 감정·내면' },
      { label: '몸', desc: '행동·현실적인 상황' },
      { label: '영혼', desc: '진짜 원하는 것·본질' },
    ],
  },
  {
    id: 'daily',
    name: '아침·낮·저녁',
    icon: '☀️',
    desc: '오늘 하루의 에너지를 알아봐요',
    positions: [
      { label: '아침', desc: '오늘의 에너지' },
      { label: '낮', desc: '주의해야 할 것' },
      { label: '저녁', desc: '오늘의 교훈' },
    ],
  },
];

const state = {
  screen: 'intro',        // intro | spread-select | shuffle | select | reading
  question: '',
  spread: null,           // selected SPREADS entry
  deck: [],               // shuffled card indices
  selectedIndices: [],    // selected deck positions (up to 3)
  result: [],             // [{card, reversed, position}, ...]
};

// ─────────────── Utilities ───────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isReversed() {
  return Math.random() < 0.5;
}

function go(screen) {
  state.screen = screen;
  render();
}

// ─────────────── Render dispatcher ───────────────

function render() {
  const app = document.getElementById('app');
  switch (state.screen) {
    case 'intro':          app.innerHTML = renderIntro();         bindIntro();         break;
    case 'spread-select':  app.innerHTML = renderSpreadSelect();  bindSpreadSelect();  break;
    case 'shuffle':        app.innerHTML = renderShuffle();       bindShuffle();       break;
    case 'select':         app.innerHTML = renderSelect();        bindSelect();        break;
    case 'reading':        app.innerHTML = renderReading();       bindReading();       break;
  }
}

// ─────────────── Intro Screen ───────────────

function renderIntro() {
  return `
    <div class="screen" id="screen-intro">
      <div class="logo">
        <div class="logo-title">✦ 타로 리딩 ✦</div>
        <div class="logo-sub">Mystical Tarot Reading</div>
        <div class="logo-divider"></div>
        <p class="intro-desc">
          마음속에 품고 있는 질문이 있나요?<br>
          카드는 당신의 내면의 목소리를 들어줍니다.<br>
          오늘 당신에게 필요한 메시지를 찾아보세요.
        </p>
      </div>

      <div class="question-box">
        <label class="question-label" for="questionInput">오늘의 질문</label>
        <textarea
          id="questionInput"
          class="question-input"
          placeholder="ex) 지금 내 연애는 어떻게 흘러갈까? / 이 결정을 해도 괜찮을까? / 오늘 나에게 필요한 것은?"
          maxlength="200"
        >${state.question}</textarea>
        <button class="btn btn-primary" id="btnStart">
          ✦ 카드와 대화 시작하기
        </button>
      </div>
    </div>
  `;
}

function bindIntro() {
  document.getElementById('btnStart').addEventListener('click', () => {
    const q = document.getElementById('questionInput').value.trim();
    state.question = q;
    go('spread-select');
  });

  document.getElementById('questionInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('btnStart').click();
    }
  });
}

// ─────────────── Spread Select Screen ───────────────

function renderSpreadSelect() {
  const cardsHtml = SPREADS.map(sp => `
    <button class="spread-choice-card${state.spread && state.spread.id === sp.id ? ' active' : ''}" data-id="${sp.id}">
      <span class="spread-choice-icon">${sp.icon}</span>
      <span class="spread-choice-name">${sp.name}</span>
      <span class="spread-choice-desc">${sp.desc}</span>
      <span class="spread-choice-positions">
        ${sp.positions.map(p => `<span class="spread-chip">${p.label}</span>`).join('')}
      </span>
    </button>
  `).join('');

  return `
    <div class="screen" id="screen-spread-select">
      <div class="logo">
        <div class="logo-title">✦ 타로 리딩 ✦</div>
        <div class="logo-divider"></div>
      </div>
      ${state.question ? `<div class="reading-question-display" style="max-width:480px;margin:0 auto 24px">"${escHtml(state.question)}"</div>` : ''}
      <div class="section-title">스프레드 선택</div>
      <p style="text-align:center;color:var(--text-dim);font-size:0.88rem;margin:-16px 0 20px">어떤 방식으로 카드를 읽을까요?</p>
      <div class="spread-choice-grid">
        ${cardsHtml}
      </div>
      <div class="btn-row">
        <button class="btn btn-ghost" id="btnBackToIntro">← 뒤로</button>
        <button class="btn btn-gold" id="btnGoShuffle" ${!state.spread ? 'disabled' : ''}>
          ✦ 카드 섞으러 가기
        </button>
      </div>
    </div>
  `;
}

function bindSpreadSelect() {
  document.getElementById('screen-spread-select').addEventListener('click', (e) => {
    const card = e.target.closest('.spread-choice-card');
    if (!card) return;
    state.spread = SPREADS.find(s => s.id === card.dataset.id);
    // Re-render to update active state + enable button
    document.getElementById('app').innerHTML = renderSpreadSelect();
    bindSpreadSelect();
  });

  document.getElementById('btnGoShuffle').addEventListener('click', () => {
    if (state.spread) go('shuffle');
  });

  document.getElementById('btnBackToIntro').addEventListener('click', () => {
    go('intro');
  });
}

// ─────────────── Shuffle Screen ───────────────

function renderShuffle() {
  return `
    <div class="screen">
      <div class="logo">
        <div class="logo-title">✦ 타로 리딩 ✦</div>
        <div class="logo-divider"></div>
      </div>
      <div class="shuffle-screen">
        ${state.question ? `<div class="reading-question-display">"${escHtml(state.question)}"</div>` : ''}
        <div class="shuffle-orb" id="shuffleOrb">🃏</div>
        <div>
          <div class="shuffle-text">
            마음속 질문을 떠올리며<br>
            카드 더미를 터치해 섞어주세요
          </div>
          <div class="shuffle-hint" style="margin-top:8px">천천히 집중하고, 준비가 되면 클릭하세요</div>
        </div>
        <button class="btn btn-primary" id="btnShuffle" style="max-width:280px">
          🔀 카드 섞기
        </button>
      </div>
    </div>
  `;
}

function bindShuffle() {
  let shuffleCount = 0;

  function doShuffle() {
    shuffleCount++;
    const orb = document.getElementById('shuffleOrb');
    orb.style.animation = 'none';
    orb.offsetHeight; // reflow
    orb.style.animation = '';

    // shuffle deck
    state.deck = shuffle(Array.from({ length: TAROT_CARDS.length }, (_, i) => i));

    // visual feedback
    const btn = document.getElementById('btnShuffle');
    if (shuffleCount >= 1) {
      btn.textContent = shuffleCount === 1 ? '✅ 섞었어요! 한 번 더 섞을 수 있어요' : '✅ 잘 섞였어요! 카드 선택하기';
      btn.onclick = shuffleCount >= 2 ? () => go('select') : doShuffle;

      if (shuffleCount >= 2) {
        btn.className = 'btn btn-gold';
        btn.style.maxWidth = '280px';
        btn.innerHTML = '✦ 카드 선택하기';
      }
    }
  }

  document.getElementById('btnShuffle').addEventListener('click', doShuffle);
  document.getElementById('shuffleOrb').addEventListener('click', doShuffle);
}

// ─────────────── Select Screen ───────────────

function renderSelect() {
  const sel = state.selectedIndices;

  const cardsHtml = state.deck.map((cardIdx, deckPos) => {
    const isSelected = sel.includes(deckPos);
    const selOrder = isSelected ? sel.indexOf(deckPos) + 1 : '';
    return `
      <div
        class="deck-card${isSelected ? ' selected' : ''}"
        data-pos="${deckPos}"
        style="animation-delay: ${deckPos * 0.015}s"
        role="button"
        aria-label="카드 ${deckPos + 1}${isSelected ? ' (선택됨)' : ''}"
      >
        <div class="deck-card-back">
          ${isSelected ? `<span style="position:absolute;top:4px;right:6px;font-size:0.65rem;color:var(--gold);font-weight:700">${selOrder}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  const filled = [0,1,2].map(i =>
    `<div class="counter-dot${i < sel.length ? ' filled' : ''}"></div>`
  ).join('');

  return `
    <div class="screen" id="screen-select">
      <div class="select-header">
        <div class="select-title">✦ 카드를 선택하세요 ✦</div>
        ${state.question ? `<div class="select-question">"${escHtml(state.question)}"</div>` : ''}
        <div class="select-counter">
          <div class="counter-dots">${filled}</div>
          <span>${sel.length} / 3 선택됨</span>
        </div>
      </div>

      <div class="card-deck" id="cardDeck">
        ${cardsHtml}
      </div>

      <div class="btn-row">
        <button class="btn btn-ghost" id="btnBackToShuffle">← 다시 섞기</button>
        <button class="btn btn-gold" id="btnConfirm" ${sel.length < 3 ? 'disabled' : ''}>
          ✦ 결과 보기
        </button>
      </div>
    </div>
  `;
}

function bindSelect() {
  document.getElementById('cardDeck').addEventListener('click', (e) => {
    const card = e.target.closest('.deck-card');
    if (!card) return;

    const pos = parseInt(card.dataset.pos, 10);
    const sel = state.selectedIndices;

    if (sel.includes(pos)) {
      state.selectedIndices = sel.filter(p => p !== pos);
    } else if (sel.length < 3) {
      state.selectedIndices = [...sel, pos];
    } else {
      // shake hint
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'shuffleWiggle 0.3s ease';
      return;
    }

    // Re-render select screen
    renderSelectPartial();
  });

  document.getElementById('btnConfirm').addEventListener('click', () => {
    state.result = state.selectedIndices.map((deckPos, i) => ({
      card: TAROT_CARDS[state.deck[deckPos]],
      reversed: isReversed(),
      position: state.spread.positions[i],
    }));
    go('reading');
  });

  document.getElementById('btnBackToShuffle').addEventListener('click', () => {
    state.selectedIndices = [];
    go('shuffle');
  });
}

function renderSelectPartial() {
  // Update only counter + cards without full re-render (keeps animation smooth)
  const app = document.getElementById('app');
  app.innerHTML = renderSelect();
  bindSelect();
}

// ─────────────── Reading Screen ───────────────

function renderReading() {
  const spreadHtml = state.result.map((r, i) => `
    <div class="spread-slot">
      <div class="spread-position">${r.position.label}</div>
      <div class="spread-position-desc">${r.position.desc}</div>
      <div class="tarot-card-wrapper">
        <div class="tarot-card-inner" id="card-inner-${i}">
          <div class="tarot-card-back-face">✦</div>
          <div
            class="tarot-card-front${r.reversed ? ' reversed-card' : ''}"
            style="background: ${r.card.gradient}"
          >
            <div class="card-art">
              <span class="card-number">${String(r.card.id).padStart(2, '0')}</span>
              <div class="card-art-inner">
                <span>${r.card.symbol}</span>
                <span class="card-name-kr">${r.card.nameKr}</span>
              </div>
              ${r.reversed ? '<span class="reversed-badge">역방향</span>' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const interpHtml = state.result.map((r, i) => {
    const data = r.reversed ? r.card.reversed : r.card.upright;
    return `
      <div class="interp-card">
        <div class="interp-position">${r.position.label} — ${r.position.desc}</div>
        <div class="interp-card-name">
          <span class="interp-symbol">${r.card.symbol}</span>
          <span class="interp-name-text">${r.card.nameKr}</span>
          <span style="font-size:0.75rem;color:var(--text-dim);margin-left:2px">(${r.card.name})</span>
          ${r.reversed ? '<span class="interp-reversed-tag">역방향</span>' : ''}
        </div>
        <div class="interp-keywords">🔑 ${data.keywords}</div>
        <div class="interp-divider"></div>
        <div class="interp-meaning">${data.meaning}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="screen" id="screen-reading">
      <div class="reading-header">
        <div class="logo-title" style="font-size:1.8rem">✦ 당신의 리딩 ✦</div>
        ${state.spread ? `<div style="text-align:center;font-size:0.8rem;letter-spacing:0.15em;color:var(--text-dim);margin-top:4px">${state.spread.icon} ${state.spread.name}</div>` : ''}
        ${state.question ? `<div class="reading-question-display">"${escHtml(state.question)}"</div>` : ''}
      </div>

      <div class="spread" id="spread">
        ${spreadHtml}
      </div>

      <div class="section-title">카드 해석</div>

      <div class="interpretations">
        ${interpHtml}
      </div>

      <div class="action-area">
        <div class="btn-row">
          <button class="btn btn-ghost" id="btnShare">📤 결과 공유하기</button>
          <button class="btn btn-primary" id="btnRestart">↺ 다시 뽑기</button>
        </div>
        <div class="share-success" id="shareSuccess">✓ 클립보드에 복사되었습니다!</div>
      </div>
    </div>
  `;
}

function bindReading() {
  // Staggered card flip
  [0, 1, 2].forEach(i => {
    setTimeout(() => {
      const inner = document.getElementById(`card-inner-${i}`);
      if (inner) inner.classList.add('flipped');
    }, 300 + i * 600);
  });

  // Share button
  document.getElementById('btnShare').addEventListener('click', shareReading);

  // Restart
  document.getElementById('btnRestart').addEventListener('click', () => {
    state.question = '';
    state.spread = null;
    state.deck = [];
    state.selectedIndices = [];
    state.result = [];
    go('intro');
  });
}

// ─────────────── Web Share API ───────────────

async function shareReading() {
  const cards = state.result.map((r) =>
    `[${r.position.label}] ${r.card.nameKr}${r.reversed ? ' (역방향)' : ''}\n  ${(r.reversed ? r.card.reversed : r.card.upright).keywords}`
  ).join('\n\n');

  const text = [
    '✦ 타로 리딩 결과 ✦',
    state.spread ? `스프레드: ${state.spread.name}` : '',
    state.question ? `질문: "${state.question}"\n` : '',
    cards,
    '\n── 타로 앱에서 뽑았어요 ──',
  ].filter(Boolean).join('\n');

  try {
    if (navigator.share) {
      await navigator.share({ title: '타로 리딩 결과', text });
    } else {
      await navigator.clipboard.writeText(text);
      showShareSuccess('✓ 클립보드에 복사되었습니다!');
    }
  } catch (err) {
    // Fallback: textarea copy
    fallbackCopy(text);
  }
}

function showShareSuccess(msg) {
  const el = document.getElementById('shareSuccess');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showShareSuccess('✓ 클립보드에 복사되었습니다!');
  } catch {
    showShareSuccess('공유 기능을 지원하지 않는 브라우저입니다.');
  }
  document.body.removeChild(ta);
}

// ─────────────── HTML escape ───────────────

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────── Boot ───────────────

render();
