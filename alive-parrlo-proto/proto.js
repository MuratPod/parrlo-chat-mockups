/* Парло — кликабельный прототип. Ответы заранее заготовлены, сервера и микрофона нет.
   Риги: ../alive-parrlo-front (A, B, C) и ../alive-parrlo (профиль, как в TestFlight). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ic = (d, extra = '') => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"${extra}>${d}</svg>`;
  const I = {
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    pin: ic('<path d="M9 3h6l-1 6 3 3v2H7v-2l3-3zM12 14v7"/>'),
    tr: ic('<path d="M4 6h9M8.5 4v2M6 6c0 4 3 7 7 8M11 6c0 3-3 7-7 8M14 20l4-9 4 9M15.5 17h5"/>'),
    grid: ic('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><path d="M17.5 14v7M14 17.5h7"/>'),
    search: ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
    back: ic('<path d="M15 5l-7 7 7 7"/>'),
    phone: ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    mic: ic('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    stop: ic('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
    send: ic('<path d="M12 19V5M5 12l7-7 7 7"/>'),
    spark: ic('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  };

  /* ---------- состояние ---------- */
  const qs = new URLSearchParams(location.search);
  const S = {
    v: ['a', 'b', 'c', 'p'].includes(qs.get('v')) ? qs.get('v') : 'a',
    reduce: qs.has('rm') ? qs.get('rm') === '1' : matchMedia('(prefers-reduced-motion: reduce)').matches,
    low: qs.get('low') === '1', unread: qs.get('unread') !== '0', size: qs.get('size') === '80' ? 80 : 104,
    tts: false, follow: true, screen: 'home', from: 'home', mode: 'idle', base: 'idle', busy: false,
  };
  const VAR = {
    a: { full: 'A · 2.5D', short: 'A', note: 'A · Мягкий объём 2.5D — рекомендуем. SVG-слои, в iOS — SwiftUI; для батареи дёшево.' },
    b: { full: 'B · 3D', short: 'B', note: 'B · Настоящий 3D (three.js). Самый объёмный; в iOS — SceneKit/RealityKit, батарею тратит заметно больше.' },
    c: { full: 'C · поворот', short: 'C', note: 'C · Поворот к вам. В покое почти профиль, как логотип; когда говорит и слушает — смотрит на вас.' },
    p: { full: 'Профиль (сейчас в TestFlight)', short: 'Проф.', note: 'Профиль — как сейчас в TestFlight (alive-parrlo). Для сравнения: смотрит вбок.' },
  };
  const YAW_C = { idle: 50, think: 36, search: 20, joy: 18, speak: 0, listen: 0 };
  const STATUS = { idle: 'На связи', joy: 'На связи', think: 'Думает…', search: 'Ищет…', speak: 'Пишет…', listen: 'Слушает…' };

  /* ---------- экраны ---------- */
  const persona = (id, label) => `<span class="pp-persona" id="${id}" role="button" tabindex="0" aria-label="${label}"></span>`;
  const row = (av, g, grp, nm, tm, pv, badge, tr) => `<li><button class="pc-row" type="button" data-other aria-label="${nm}"><span class="pc-av ${g}${grp ? ' pc-av--group' : ''}" aria-hidden="true">${av}</span><span class="tx"><span class="l1"><span class="nm">${nm}</span><span class="tm">${tm}</span></span><span class="l2"><span class="pv">${tr ? `<span class="tr">${I.tr}</span>` : ''}${pv}</span>${badge ? `<span class="pc-badge" aria-label="непрочитанных: ${badge}">${badge}</span>` : ''}</span></span></button></li>`;
  $('#home').innerHTML = `
    <header class="pc-bar"><button class="pc-me" type="button" data-other aria-label="Профиль">МП</button><span class="sp"></span><button class="pc-ibtn" type="button" data-other aria-label="Новый чат">${I.plus}</button></header>
    <div class="pc-scroll">
      <div class="pc-stage" id="stage">
        <span class="pw">${persona('p-home', 'Парло. Нажмите — он отреагирует')}<span class="pin" aria-hidden="true">${I.pin}</span></span>
        <button class="open" type="button" id="open-chat" aria-label="Открыть чат с Парло"><span class="nm">Парло</span><span class="st" id="home-st"></span></button>
      </div>
      <ul class="pc-chats" aria-label="Чаты">
        ${row('П', 'g0', 0, 'Петя', '09:12', 'Завтра в 10 в офисе?', 2)}
        ${row('К', 'g1', 1, 'Квартира', '08:47', 'Лена: оплатила свет, чек выше', 5)}
        ${row('M', 'g2', 0, 'Marco', 'Вчера', 'Увидимся у входа в девять', 0, 1)}
        ${row('М', 'g3', 0, 'Мама', 'Вчера', 'Позвони, когда будешь свободен')}
        ${row('А', 'g4', 0, 'Анна Л.', 'Вт', 'Спасибо, всё получила')}
        ${row('М', 'g5', 1, 'Макеты', 'Пн', 'Файл с макетами обновлён')}
      </ul>
    </div>
    <div class="pc-dock"><button class="pc-ibtn" type="button" data-other aria-label="Быстрые действия">${I.grid}</button><button class="pc-search" type="button" data-other aria-label="Поиск">${I.search}<span>Поиск</span></button></div>`;
  const sub = 'style="display:flex;flex-direction:column;flex:1;min-height:0"';
  $('#detail').innerHTML = `
    <div id="v-chat" ${sub}>
      <header class="pc-pp-bar"><button class="pc-ibtn pc-ibtn--plain back" type="button" id="chat-back" aria-label="Назад">${I.back}</button>${persona('p-chat', 'Парло')}<div class="who"><b>Парло</b><span id="chat-st">На связи</span></div><button class="pc-ibtn pc-ibtn--plain" type="button" id="chat-call" aria-label="Голосом">${I.phone}</button></header>
      <div class="pc-pp-body chat" id="chat-body"><div class="pc-pp-inner"><div class="pc-msgs" id="msgs"></div><div class="pc-chips" role="group" aria-label="Подсказки" id="chips"></div></div></div>
      <div class="pc-composer pc-composer--v"><div class="pc-composer-in compose"><input id="inp" type="text" enterkeyhint="send" autocomplete="off" placeholder="Напишите Парло…" aria-label="Сообщение Парло"><button class="pc-ibtn pc-ibtn--send" type="button" id="send" aria-label="Отправить" disabled>${I.send}</button></div>
        <div class="pc-composer-in"><button class="pc-btn pc-btn--voice" type="button" id="to-voice">${I.mic}Нажмите и говорите</button></div></div>
    </div>
    <div id="v-voice" ${sub} hidden>
      <header class="pc-pp-bar"><button class="pc-ibtn pc-ibtn--plain back" type="button" id="voice-back" aria-label="Назад">${I.back}</button>${persona('p-vhead', 'Парло')}<div class="who"><b>Парло</b><span id="voice-st">Голосом</span></div></header>
      <div class="pc-pp-body"><div class="pc-pp-inner"><div class="pc-voicearea">
        ${persona('p-voice', 'Парло. Нажмите — он отреагирует')}
        <h2 id="v-h"></h2><p id="v-p"></p>
        <div class="pc-wave" id="wave" aria-hidden="true">${'<i></i>'.repeat(14)}</div>
        <div class="pc-live subs" aria-live="polite" id="live"></div>
      </div></div></div>
      <div class="pc-voiceacts"><button class="pc-btn pc-btn--voice holdbtn" type="button" id="hold">${I.mic}<span id="hold-l">Нажмите и говорите</span></button><button class="pc-btn pc-btn--text" type="button" id="voice-done" style="align-self:center">Вернуться в чат</button></div>
    </div>`;

  /* ---------- экземпляры Парло ---------- */
  let inst = [];
  let svgProfile = null;
  let three = null;
  let mountGen = 0;
  async function mountAll() {
    const gen = ++mountGen;
    destroyAll();
    if (S.v === 'p' && !svgProfile) svgProfile = await (await fetch('../alive-parrlo/parrlo-rig.svg')).text();
    if (S.v === 'b' && !three) three = await import('../alive-parrlo-front/front-3d.js');
    if (gen !== mountGen) return;
    for (const id of ['p-home', 'p-chat', 'p-vhead', 'p-voice']) {
      const host = document.getElementById(id); host.innerHTML = ''; host.className = 'pp-persona';
      let api, kind = S.v;
      if (S.v === 'p') api = ParrloAlive.mount(host, svgProfile, { mode: S.mode });
      else if (S.v === 'b') api = three.mount3d(host, { mode: S.mode });
      else api = ParrloFrontSVG.mount(host, { mode: S.mode, modeYaw: S.v === 'c' ? YAW_C : undefined });
      inst.push({ id, host, api, kind });
    }
    applyFlags();
    renderPanel();
  }
  function destroyAll() {
    for (const it of inst) {
      try {
        if (it.kind === 'p') it.api.setPaused('manual', true);
        else { const L = it.api.loop; L.tick = () => {}; cancelAnimationFrame(L.raf); L.paused.add('gone'); }
        if (it.api.renderer) { it.api.renderer.dispose(); it.api.renderer.forceContextLoss(); }
      } catch (e) { /* ничего */ }
      it.host.innerHTML = '';
    }
    inst = [];
  }
  function applyFlags() {
    ParrloFront.pointer.enabled = S.follow;
    for (const it of inst) {
      it.api.setReduce(S.reduce);
      if (it.kind === 'p') it.api.setLowPower(S.low); else it.api.setLow(S.low);
    }
    document.body.classList.toggle('rm', S.reduce);
  }
  function setMode(m) {
    S.mode = m;
    for (const it of inst) it.api.setMode(m);
    // на экране голоса во время разговора — взгляд прямо на вас (палец на кнопке не уводит глаза)
    ParrloFront.pointer.enabled = S.follow && !(S.screen === 'voice' && m !== 'idle' && m !== 'joy');
    $('#chat-st').textContent = STATUS[m];
    $('#voice-st').textContent = { idle: 'Голосом', joy: 'Голосом', think: 'Думает…', search: 'Ищет…', speak: 'Говорит', listen: 'Слушает вас' }[m];
    stat();
  }
  const homeMode = () => (S.unread ? 'joy' : 'idle');

  /* ---------- таймеры сценария (сбрасываются при уходе с экрана) ---------- */
  let timers = [];
  const later = (ms, fn) => { const t = setTimeout(() => { timers = timers.filter((x) => x !== t); fn(); }, ms); timers.push(t); return t; };
  const clearFlow = () => { timers.forEach(clearTimeout); timers = []; S.busy = false; stopWave(); if (window.speechSynthesis) speechSynthesis.cancel(); };

  /* ---------- навигация ---------- */
  function go(screen) {
    clearFlow(); voice.state = 'ready';
    S.from = S.screen === 'voice' ? S.from : S.screen;
    S.screen = screen;
    const app = $('#app');
    app.dataset.screen = screen === 'home' ? 'home' : screen === 'chat' ? 'parrlo' : 'parrlo-voice';
    if (screen === 'home') delete app.dataset.view; else app.dataset.view = 'detail';
    $('#v-chat').hidden = screen !== 'chat'; $('#v-voice').hidden = screen !== 'voice';
    if (screen === 'home') { setMode(homeMode()); renderHome(); }
    if (screen === 'chat') { if (!chat.started) startChat(); if (S.unread) { S.unread = false; renderHome(); renderPanel(); } setMode('idle'); }
    if (screen === 'voice') { setMode('idle'); voiceUI('ready'); $('#live').innerHTML = '<span class="k">Субтитры</span><span style="color:#9AA4B2">Здесь появится то, что вы скажете, и ответ Парло.</span>'; }
    stat();
  }
  function renderHome() {
    $('#home-st').textContent = S.unread ? '3 новых · есть что рассказать' : 'Готов помочь';
    $$('#home .pc-badge').forEach((b) => { b.style.display = S.unread ? '' : 'none'; });
  }

  /* ---------- реакция на нажатие по Парло ---------- */
  function react() {
    if (S.busy) { toast(S.mode === 'listen' ? 'Слушаю вас' : 'Секунду, я занят'); return; }
    const back = S.mode;
    const m = back === 'joy' ? 'speak' : 'joy';
    setMode(m);
    toast(S.screen === 'home' && S.unread ? 'Привет! У вас 3 новых' : 'Привет! Я на связи');
    clearTimeout(react.t); react.t = setTimeout(() => { if (!S.busy && S.mode === m) setMode(back); }, 1400);
  }
  let toastT = 0;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 1600); }

  /* ---------- чат ---------- */
  const chat = { started: false };
  const now = () => '9:41';
  function msgIn(text, canned = true) {
    const d = document.createElement('div'); d.className = 'pc-msg in';
    d.innerHTML = `<div class="pc-mb"><span class="tx"></span><span class="tm">${now()}</span></div>${canned ? `<div class="lbl-ai">${I.spark}<span>Заготовленный ответ</span></div>` : ''}`;
    d.querySelector('.tx').textContent = text; $('#msgs').appendChild(d); return d;
  }
  function msgOut(text) {
    const d = document.createElement('div'); d.className = 'pc-msg out';
    d.innerHTML = '<div class="pc-mb"><span class="tx"></span><span class="tm">' + now() + '</span></div>';
    d.querySelector('.tx').textContent = text; $('#msgs').appendChild(d); return d;
  }
  function startChat() {
    chat.started = true; $('#msgs').innerHTML = '<div class="pc-day">Сегодня</div>';
    if (S.unread) {
      msgIn('Пока вас не было: 3 новых в чатах. Петя ждёт ответ про завтра.', false);
      const c = document.createElement('div'); c.className = 'pc-card';
      c.innerHTML = '<div class="it"><b>Петя</b><span>Спрашивает, будете ли вы завтра в 10 в офисе</span></div><div class="it"><b>Квартира</b><span>5 сообщений, Лена оплатила свет</span></div>';
      $('#msgs').appendChild(c);
    } else msgIn('Здравствуйте! Чем помочь?', false);
    renderChips();
  }
  const CHIPS = ['Ответить Пете', 'Что в «Квартире»?', 'Найди чек за свет', 'Напомни позвонить маме'];
  function renderChips() { $('#chips').innerHTML = CHIPS.map((c) => `<button class="pc-chip" type="button">${c}</button>`).join(''); }
  function answerFor(q) {
    const t = q.toLowerCase();
    const search = /найд|найти|поищ|ищи|отыщ/.test(t);
    let a;
    if (search && /свет|чек/.test(t)) a = 'Нашёл чек за свет: Лена, 28 октября, 42,80 €. Он в чате «Квартира».';
    else if (search) a = 'Поискал по вашим чатам. В прототипе я нахожу только чек за свет — попробуйте «Найди чек за свет».';
    else if (/пет/.test(t)) a = 'Готово, набросал ответ Пете: «Да, буду завтра в 10 в офисе». Отправить?';
    else if (/квартир|свет|лен/.test(t)) a = 'В «Квартире» 5 новых. Главное: Лена оплатила свет — 42,80 €, чек в чате.';
    else if (/мам|позвон|напомн/.test(t)) a = 'Хорошо, напомню вам позвонить маме сегодня в 19:00.';
    else if (/привет|здравств|добр/.test(t)) a = 'Здравствуйте! Могу ответить в чат, найти сообщение или напомнить о деле.';
    else a = 'Понял вас. Это прототип, ответы заготовлены — в настоящем Парло здесь будет ответ по делу.';
    return { a, search };
  }
  function send(text) {
    text = text.trim(); if (!text || S.busy) return;
    S.busy = true; $('#inp').value = ''; $('#send').disabled = true; $('#chips').innerHTML = '';
    msgOut(text);
    const { a, search } = answerFor(text);
    setMode(search ? 'search' : 'think');
    const typ = document.createElement('div'); typ.className = 'pc-msg in';
    typ.innerHTML = '<div class="pc-mb"><span class="typing" aria-label="Парло думает"><i></i><i></i><i></i></span></div>';
    $('#msgs').appendChild(typ);
    later(search ? 2000 : 1600, () => {
      typ.remove(); const d = msgIn('', true); const tx = d.querySelector('.tx');
      setMode('speak'); let i = 0;
      const step = () => {
        i = Math.min(a.length, i + 2); tx.textContent = a.slice(0, i);
        if (i < a.length) later(40, step);
        else { setMode('joy'); later(900, () => { S.busy = false; setMode('idle'); renderChips(); }); }
      };
      step();
    });
  }

  /* ---------- голос ---------- */
  const VQ = [
    { q: 'Что нового у Пети?', a: 'Петя спрашивает, будете ли вы завтра в 10 в офисе. Ответить ему «да»?' },
    { q: 'Найди чек за свет', a: 'Нашёл. Лена оплатила свет, 42,80 евро. Чек в чате «Квартира».', search: true },
    { q: 'Напомни позвонить маме вечером', a: 'Хорошо. Напомню вам сегодня в 19:00.' },
  ];
  const voice = { state: 'ready', i: 0, down: 0, tap: false, heard: 0, item: null };
  function voiceUI(st) {
    voice.state = st;
    const T = {
      ready: ['Готов слушать', 'Удерживайте кнопку и говорите. Или нажмите один раз.', 'Нажмите и говорите'],
      listen: ['Слушаю…', voice.tap ? 'Нажмите ещё раз, когда закончите.' : 'Отпустите, когда закончите.', voice.tap ? 'Закончить' : 'Отпустите — и я отвечу'],
      think: [voice.item && voice.item.search ? 'Ищу…' : 'Думаю…', 'Секунду.', 'Остановить'],
      speak: ['Отвечаю…', 'Смотрю на вас и говорю. Звук выключен — читайте субтитры.', 'Остановить'],
    }[st];
    $('#v-h').textContent = T[0]; $('#v-p').textContent = T[1]; $('#hold-l').textContent = T[2];
    $('#hold').classList.toggle('live', st === 'listen');
    $('#hold').querySelector('svg').outerHTML = st === 'ready' || st === 'listen' ? I.mic : I.stop;
  }
  function vStart(tap) {
    clearFlow(); S.busy = true; voice.tap = tap; voice.item = VQ[voice.i % VQ.length]; voice.heard = 0;
    setMode('listen'); voiceUI('listen'); startWave();
    const words = voice.item.q.split(' ');
    $('#live').innerHTML = '<span class="k">Вы говорите</span><span class="q"></span><span class="pc-caret" aria-hidden="true"></span>';
    const step = () => {
      voice.heard++; $('#live .q').textContent = words.slice(0, voice.heard).join(' ');
      if (voice.heard < words.length) later(380, step);
      else if (voice.tap) later(1300, () => vStop());
    };
    later(450, step);
  }
  function vStop() {
    if (voice.state !== 'listen') return;
    timers.forEach(clearTimeout); timers = []; stopWave();
    const it = voice.item; voice.i++;
    $('#live').innerHTML = '<span class="k">Вы сказали</span><span class="q"></span>'; $('#live .q').textContent = it.q;
    setMode(it.search ? 'search' : 'think'); voiceUI('think');
    later(it.search ? 1900 : 1500, () => {
      setMode('speak'); voiceUI('speak');
      const ws = it.a.split(' ');
      $('#live').innerHTML = `<span class="k">Вы: ${esc(it.q)}</span>` + ws.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
      if (S.tts && window.speechSynthesis) { const u = new SpeechSynthesisUtterance(it.a); u.lang = 'ru-RU'; speechSynthesis.speak(u); }
      const spans = $$('#live .w'); let k = 0;
      const step = () => { if (k < spans.length) { spans[k++].classList.add('on'); later(310, step); } else later(500, vDone); };
      step();
      // в историю чата
      if (!chat.started) startChat();
      msgOut(it.q).querySelector('.pc-mb').insertAdjacentHTML('afterend', '<div class="lbl-ai">' + I.mic + '<span>Голосом</span></div>');
      msgIn(it.a, true);
    });
  }
  function vDone() { S.busy = false; setMode('idle'); voiceUI('ready'); }
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let waveT = 0;
  function startWave() {
    $('#wave').classList.add('on'); const bars = $$('#wave i');
    if (S.reduce) { bars.forEach((b, i) => { b.style.height = (30 + 40 * Math.abs(Math.sin(i * 1.7))) + '%'; }); return; }
    let t = 0;
    waveT = setInterval(() => { t += 1; const lvl = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.21)) * (0.6 + 0.4 * Math.random());
      bars.forEach((b, i) => { const env = 1 - Math.abs(i - 6.5) / 8; b.style.height = Math.max(10, Math.round(100 * lvl * env * (0.55 + 0.45 * Math.random()))) + '%'; }); }, 66);
  }
  function stopWave() { clearInterval(waveT); waveT = 0; $('#wave').classList.remove('on'); $$('#wave i').forEach((b) => { b.style.height = '16%'; }); }

  const hold = $('#hold');
  hold.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return; e.preventDefault();
    try { hold.setPointerCapture(e.pointerId); } catch (_) {}
    voice.down = performance.now();
    if (voice.state === 'ready') { vStart(false); voice.pressStart = true; }
    else if (voice.state === 'listen') { vStop(); voice.pressStart = false; }
    else { clearFlow(); vDone(); voice.pressStart = false; }
  });
  const up = () => {
    if (!voice.down) return; const held = performance.now() - voice.down; voice.down = 0;
    if (!voice.pressStart || voice.state !== 'listen') return;
    if (held > 350) vStop();
    else { voice.tap = true; voiceUI('listen'); if (voice.heard >= voice.item.q.split(' ').length) later(1300, () => vStop()); }
  };
  hold.addEventListener('pointerup', up); hold.addEventListener('pointercancel', up);
  hold.addEventListener('click', (e) => { if (e.detail !== 0) return; if (voice.state === 'ready') vStart(true); else if (voice.state === 'listen') vStop(); else { clearFlow(); vDone(); } });
  hold.addEventListener('contextmenu', (e) => e.preventDefault());

  /* ---------- события ---------- */
  for (const id of ['p-home', 'p-voice', 'p-chat', 'p-vhead']) {
    const el = document.getElementById(id);
    el.addEventListener('click', (e) => { e.stopPropagation(); react(); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); react(); } });
  }
  $('#open-chat').addEventListener('click', () => go('chat'));
  $('#chat-back').addEventListener('click', () => go('home'));
  $('#chat-call').addEventListener('click', () => go('voice'));
  $('#to-voice').addEventListener('click', () => go('voice'));
  $('#voice-back').addEventListener('click', () => go(S.from === 'chat' ? 'chat' : 'home'));
  $('#voice-done').addEventListener('click', () => go('chat'));
  $$('[data-other]').forEach((b) => b.addEventListener('click', () => toast('В прототипе работает только Парло')));
  $('#inp').addEventListener('input', () => { $('#send').disabled = !$('#inp').value.trim() || S.busy; });
  $('#inp').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send($('#inp').value); } });
  $('#send').addEventListener('click', () => send($('#inp').value));
  $('#chips').addEventListener('click', (e) => { const b = e.target.closest('.pc-chip'); if (b) send(b.textContent); });

  /* ---------- панель демо ---------- */
  function renderPanel() {
    $$('[data-seg=variant]').forEach((seg) => {
      const short = !!seg.closest('.mstrip');
      seg.innerHTML = Object.entries(VAR).map(([k, v]) => `<button type="button" data-v="${k}" aria-pressed="${S.v === k}" title="${v.full}">${short ? v.short : v.full}</button>`).join('');
    });
    $('#vnote').textContent = VAR[S.v].note; $('#vnote-m').textContent = VAR[S.v].note;
    const tg = (k, t, s) => `<label class="tg"><span>${t}${s ? `<small>${s}</small>` : ''}</span><input class="sw" type="checkbox" data-k="${k}"${S[k] ? ' checked' : ''}></label>`;
    const html = tg('reduce', 'Reduce Motion', 'Статичная поза, моргание прозрачностью')
      + tg('low', 'Экономия энергии', '15 кадров/с, без жестов')
      + tg('unread', 'Непрочитанное', 'На главной Парло радуется')
      + `<div class="tg"><span>Размер Парло<small>Главная и экран голоса</small></span><span class="mini">${[104, 80].map((n) => `<button type="button" data-size="${n}" aria-pressed="${S.size === n}">${n} pt</button>`).join('')}</span></div>`
      + tg('follow', 'Взгляд за пальцем', 'Иначе смотрит прямо на вас')
      + tg('tts', 'Озвучка браузера', 'Выключена по умолчанию');
    $$('[data-panel]').forEach((p) => { p.innerHTML = html; });
  }
  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-v]'); if (v) { if (v.dataset.v !== S.v) { S.v = v.dataset.v; history.replaceState(null, '', '?v=' + S.v); renderPanel(); mountAll(); } return; }
    const z = e.target.closest('[data-size]'); if (z) { S.size = +z.dataset.size; sizeVars(); renderPanel(); }
  });
  document.addEventListener('change', (e) => {
    const k = e.target.dataset && e.target.dataset.k; if (!k) return;
    S[k] = e.target.checked; applyFlags(); renderPanel();
    if (k === 'unread') { renderHome(); if (S.screen === 'home' && !S.busy) setMode(homeMode()); }
    if (k === 'tts' && !S.tts && window.speechSynthesis) speechSynthesis.cancel();
  });
  function sizeVars() { const f = $('#frame'); f.style.setProperty('--i-stage', S.size + 'px'); f.style.setProperty('--i-voice', S.size + 'px'); }
  $('#gear').addEventListener('click', () => document.body.classList.add('sheet-open'));
  $('#sheet-x').addEventListener('click', () => document.body.classList.remove('sheet-open'));
  $('#sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') document.body.classList.remove('sheet-open'); });

  /* ---------- раскладка: десктоп — телефон 402×874 с масштабом, мобильный — весь экран ---------- */
  function layout() {
    const m = innerWidth <= 520;
    document.body.classList.toggle('m', m);
    const f = $('#frame'), w = $('#wrap'), ph = $('#phone');
    document.documentElement.style.setProperty('--vh', innerHeight + 'px');
    if (m) {
      f.style.cssText += `;--W:${innerWidth}px;--H:${innerHeight}px;--safe-t:calc(env(safe-area-inset-top) + 44px);--safe-b:env(safe-area-inset-bottom);--safe-l:0px;--safe-r:0px`;
    } else {
      f.style.cssText += ';--W:402px;--H:874px;--safe-t:62px;--safe-b:34px;--safe-l:0px;--safe-r:0px';
      const k = Math.min(1, (innerHeight - 40) / 874);
      ph.style.transform = `scale(${k})`; w.style.width = 402 * k + 'px'; w.style.height = 874 * k + 'px';
    }
    sizeVars();
  }
  addEventListener('resize', layout);

  function stat() {
    const s = inst.map((it) => { const st = it.api.status(); return `${it.id.slice(2)}:${st.hz || 0}`; }).join(' ');
    const el = $('#stat'); if (el) el.textContent = `вариант ${S.v} · режим ${S.mode} · кадры/с ${s}`;
  }
  setInterval(stat, 1000);

  layout(); renderPanel(); renderHome(); setMode(homeMode()); mountAll();
  window.__proto = { S, get inst() { return inst; }, go, send, react, setMode, mountAll, voice, vStart, vStop };
})();
