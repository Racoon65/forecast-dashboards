  /* ---------- Помощники ---------- */
  const PD = (window.PD = {});
  PD.L = () => (dash.params().lang === 'en' ? 'en' : 'ru');
  PD.TR = {
    ru: {wd: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], mon: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
      monN: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      mm: 'мм', mmh: 'мм/ч', fail: 'Не удалось загрузить', none: 'Нет данных', p30: 'Последние 30 суток', p90: 'Последние 90 суток', pall: 'Весь ряд',
      h12: 'за 12 ч', int: 'мгновенная интенсивность', part: 'неполные сутки: кадров ', of: ' из 96', day: 'сутки', cum: 'с начала периода', frames: 'кадров',
      aDaily: 'Суточные суммы осадков за период', aCum: 'Нарастающая сумма осадков за период', aSum: 'Осадки выбранных суток по интервалам', aInt: 'Мгновенная интенсивность осадков выбранных суток, кадры через 15 минут', thr: 'порог'},
    en: {wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], mon: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      mm: 'mm', mmh: 'mm/h', fail: 'Failed to load', none: 'No data', p30: 'Last 30 days', p90: 'Last 90 days', pall: 'Whole series',
      h12: 'in 12 h', int: 'instantaneous rate', part: 'partial day: frames ', of: ' of 96', day: 'day', cum: 'since period start', frames: 'frames',
      aDaily: 'Daily precipitation totals for the period', aCum: 'Cumulative precipitation for the period', aSum: 'Selected day precipitation by interval', aInt: 'Selected day instantaneous precipitation rate, frames every 15 minutes', thr: 'threshold'},
  };
  PD.tr = (k) => PD.TR[PD.L()][k];
  PD.enc = (s) => encodeURIComponent(String(s));
  PD.f1 = (v) => (v == null || !Number.isFinite(v) ? '—' : (Math.round(v * 10) / 10).toFixed(1));
  PD.f2 = (v) => (v == null || !Number.isFinite(v) ? '—' : (Math.round(v * 100) / 100).toFixed(2));
  PD.ok = (id) => dash.data(id).status === 'ok';
  PD.rows = (id) => (PD.ok(id) ? dash.data(id).data || [] : []);
  PD.parseT = d3.utcParse('%Y-%m-%d %H:%M');
  PD.parseD = d3.utcParse('%Y-%m-%d');
  PD.fmtH = d3.utcFormat('%H:%M');
  PD.fmtDM = d3.utcFormat('%d.%m');
  PD.place = () => dash.params().place || 'Tashkent';
  PD.placeRow = () => PD.rows('places').find((r) => r.place === PD.place()) || null;
  PD.info = (k) => { const r = PD.rows('info').find((x) => x.key === k); return r ? r.value : null; };
  PD.thr = (k) => { const v = Number(PD.info(k)); return Number.isFinite(v) ? v : null; };
  PD.dayLabel = (iso, long) => {
    const d = iso && PD.parseD(iso.slice(0, 10)); if (!d) return iso || '—';
    const t = PD.TR[PD.L()];
    return long ? (t.wd[d.getUTCDay()] + ', ' + d.getUTCDate() + ' ' + t.mon[d.getUTCMonth()] + ' ' + d.getUTCFullYear()) : PD.fmtDM(d);
  };
  PD.when = (s) => { const d = s && PD.parseT(s); return d ? PD.fmtDM(d) + ' ' + PD.fmtH(d) : '—'; };
  PD.day = () => {
    const rows = PD.rows('dframes');
    return rows.length ? new Date(Date.parse(rows[0].local.replace(' ', 'T') + ':00Z') - 900000).toISOString().slice(0, 10) : null;
  };
  PD.pickDay = (iso) => { if (iso) dash.setParams({day: iso}); };
  PD.state = (el, id) => {
    const st = dash.data(id).status;
    if (st === 'ok') return true;
    el.replaceChildren();
    const p = document.createElement('div');
    p.className = st === 'error' ? 'pd-fail' : 'dash-skeleton';
    p.textContent = st === 'error' ? PD.tr('fail') : '';
    if (st !== 'error') p.style.minHeight = '120px';
    el.appendChild(p);
    return false;
  };
  PD.bell = (size) => {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg');
    s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M12 2a6 6 0 0 0-6 6v4.5L4 16v1h16v-1l-2-3.5V8a6 6 0 0 0-6-6zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22z');
    p.setAttribute('fill', 'currentColor'); s.appendChild(p);
    return s;
  };
  PD.tipPlace = (tip, W, cx, top) => {
    tip.hidden = false;
    const tw = tip.offsetWidth;
    tip.style.left = Math.max(0, cx + 12 + tw > W ? cx - tw - 12 : cx + 12) + 'px'; tip.style.top = top + 'px';
  };
  PD.none = (el) => { el.replaceChildren(); const n = document.createElement('div'); n.className = 'pd-fail'; n.textContent = PD.tr('none'); el.appendChild(n); };
  PD.yAxis = (svg, y, W, m, fmt) => {
    const gy = svg.append('g').call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(6).tickFormat(fmt || d3.format('~f')));
    let wl = 0; gy.selectAll('text').each(function () { wl = Math.max(wl, this.getComputedTextLength()); });
    m.l = Math.ceil(wl) + 10;
    gy.attr('transform', `translate(${m.l},0)`).call((g) => g.select('.domain').remove());
    gy.selectAll('.tick line').attr('x2', W - m.r - m.l).attr('stroke', 'var(--cds-chart-grid)');
  };

  /* Столбцы: rows [{key, label, v, tip: [строки], sel}]; подписи по оси — не чаще, чем помещаются. */
  PD.bars = (el, o) => {
    el.replaceChildren();
    if (!o.rows.length) { PD.none(el); return; }
    const W = Math.max(260, el.clientWidth || 600), H = o.h || 160, m = {t: 10, r: 12, b: 24, l: 10};
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', o.aria || '');
    const y = d3.scaleLinear().domain([0, Math.max(o.minMax || 1, d3.max(o.rows, (r) => r.v || 0))]).nice(4).range([H - m.b, m.t]);
    PD.yAxis(svg, y, W, m);
    const keys = o.rows.map((r) => r.key);
    const x = d3.scaleBand().domain(keys).range([m.l, W - m.r]).paddingInner(o.pad == null ? 0.25 : o.pad).paddingOuter(0.1);
    for (const r of o.rows) if (r.sel) svg.append('rect').attr('x', x(r.key) - x.step() * x.paddingInner() / 2).attr('y', m.t).attr('width', x.step()).attr('height', H - m.t - m.b).attr('fill', 'var(--c-band)');
    const every = Math.max(1, Math.ceil(keys.length * (o.labW || 44) / (W - m.l - m.r)));
    const lab = new Map(o.rows.map((r) => [r.key, r.label]));
    svg.append('g').attr('transform', `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickValues(o.tickKeys ? o.tickKeys(keys, every) : keys.filter((k, i) => i % every === 0)).tickSize(4).tickFormat((k) => lab.get(k)))
      .call((g) => g.select('.domain').attr('stroke', 'var(--cds-chart-axis)'));
    svg.append('g').selectAll('rect').data(o.rows.filter((r) => r.v > 0)).join('rect')
      .attr('x', (r) => x(r.key)).attr('width', x.bandwidth()).attr('y', (r) => y(r.v)).attr('height', (r) => y(0) - y(r.v))
      .style('fill', (r) => (r.hit ? 'var(--c-haz)' : 'var(--c-bar)'));
    const tip = document.createElement('div'); tip.className = 'pd-tip'; tip.hidden = true; el.appendChild(tip);
    svg.append('g').selectAll('rect').data(o.rows).join('rect')
      .attr('x', (r) => x(r.key) - x.step() * x.paddingInner() / 2).attr('width', x.step()).attr('y', m.t).attr('height', H - m.t - m.b).attr('fill', 'transparent')
      .style('cursor', o.onPick ? 'pointer' : 'default')
      .on('pointerenter', (ev, r) => {
        tip.replaceChildren();
        r.tip.forEach((t, i) => { const d = document.createElement('div'); if (i === 0) { const b = document.createElement('b'); b.textContent = t; d.appendChild(b); } else { d.textContent = t; if (i > 1) d.className = 'm'; } tip.appendChild(d); });
        PD.tipPlace(tip, W, x(r.key) + x.bandwidth() / 2, m.t);
      })
      .on('pointerleave', () => { tip.hidden = true; })
      .on('click', (ev, r) => { if (o.onPick) o.onPick(r.key); });
  };

  /* Линия по времени: pts [{x: Date, y}], пропуски — разрыв. */
  PD.line = (el, o) => {
    el.replaceChildren();
    const pts = o.pts.filter((p) => p.y != null);
    if (!pts.length) { PD.none(el); return; }
    const W = Math.max(260, el.clientWidth || 600), H = o.h || 160, m = {t: 10, r: 12, b: 24, l: 10};
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', o.aria || '');
    let ymax = Math.max(o.minMax || 1, d3.max(pts, (p) => p.y));
    const showThr = o.thr != null && o.thr <= ymax * 1.25;
    if (showThr) ymax = Math.max(ymax, o.thr);
    const y = d3.scaleLinear().domain([0, ymax]).nice(4).range([H - m.b, m.t]);
    PD.yAxis(svg, y, W, m);
    const x = d3.scaleUtc().domain(o.xDomain || d3.extent(o.pts, (p) => p.x)).range([m.l, W - m.r]);
    if (o.band) { const b0 = Math.max(x(o.band[0]), m.l), b1 = Math.min(x(o.band[1]), W - m.r); if (b1 > b0) svg.append('rect').attr('x', b0).attr('y', m.t).attr('width', b1 - b0).attr('height', H - m.t - m.b).attr('fill', 'var(--c-band)'); }
    const nT = Math.max(2, Math.floor((W - m.l - m.r) / (o.tickW || 64)));
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(o.ticks ? o.ticks(nT) : nT).tickSize(4).tickFormat(o.xFmt || PD.fmtDM))
      .call((g) => g.select('.domain').attr('stroke', 'var(--cds-chart-axis)'));
    if (showThr) svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(o.thr)).attr('y2', y(o.thr)).attr('stroke', 'var(--c-haz)').attr('stroke-dasharray', '5 4');
    const line = d3.line().defined((p) => p.y != null).x((p) => x(p.x)).y((p) => y(p.y));
    if (o.area) svg.append('path').datum(o.pts).attr('d', d3.area().defined((p) => p.y != null).x((p) => x(p.x)).y0(y(0)).y1((p) => y(p.y))).style('fill', o.color).attr('opacity', 0.18);
    svg.append('path').datum(o.pts).attr('fill', 'none').attr('stroke-width', 2).attr('d', line).style('stroke', o.color);
    const tip = document.createElement('div'); tip.className = 'pd-tip'; tip.hidden = true; el.appendChild(tip);
    const rule = svg.append('line').attr('y1', m.t).attr('y2', H - m.b).attr('stroke', 'var(--cds-chart-reference)').attr('visibility', 'hidden');
    const dot = svg.append('circle').attr('r', 3.5).style('fill', o.color).attr('visibility', 'hidden');
    const bis = d3.bisector((p) => p.x).center;
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).attr('fill', 'transparent')
      .style('cursor', o.onPick ? 'pointer' : 'default')
      .on('pointermove', (ev) => {
        const p = o.pts[bis(o.pts, x.invert(d3.pointer(ev)[0]))]; if (!p) return;
        rule.attr('x1', x(p.x)).attr('x2', x(p.x)).attr('visibility', 'visible');
        if (p.y != null) dot.attr('cx', x(p.x)).attr('cy', y(p.y)).attr('visibility', 'visible'); else dot.attr('visibility', 'hidden');
        tip.replaceChildren();
        const h = document.createElement('div'); const b = document.createElement('b'); b.textContent = o.tipT(p.x); h.appendChild(b); tip.appendChild(h);
        const v = document.createElement('div'); v.textContent = p.y == null ? '—' : o.vFmt(p.y) + ' ' + o.unit; tip.appendChild(v);
        PD.tipPlace(tip, W, x(p.x), m.t);
      })
      .on('pointerleave', () => { tip.hidden = true; rule.attr('visibility', 'hidden'); dot.attr('visibility', 'hidden'); })
      .on('click', (ev) => { if (o.onPick) { const p = o.pts[bis(o.pts, x.invert(d3.pointer(ev)[0]))]; if (p) o.onPick(p); } });
  };

  /* ---------- Язык, шаг, устаревание: только классы, hidden и aria ---------- */
  for (const b of document.querySelectorAll('#dash-root [data-lang-btn]')) b.addEventListener('click', () => dash.setParams({lang: b.getAttribute('data-lang-btn')}));
  for (const b of document.querySelectorAll('#dash-root [data-step-btn]')) b.addEventListener('click', () => dash.setParams({step: b.getAttribute('data-step-btn')}));
  dash.onData(() => {
    const en = PD.L() === 'en';
    for (const r of document.querySelectorAll('#dash-root .pd')) r.classList.toggle('pd-en', en);
    for (const b of document.querySelectorAll('#dash-root [data-lang-btn]')) b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === PD.L()));
    const st = String([15, 30, 60].includes(Number(dash.params().step)) ? Number(dash.params().step) : 60);
    for (const b of document.querySelectorAll('#dash-root [data-step-btn]')) b.setAttribute('aria-pressed', String(b.getAttribute('data-step-btn') === st));
    for (const t of document.querySelectorAll('#dash-root [data-step-title]')) t.hidden = t.getAttribute('data-step-title') !== st;
    const age = dash.data('age_h');
    for (const p of document.querySelectorAll('#dash-root [data-pill="stale"]')) p.hidden = !(age.status === 'ok' && age.data != null && age.data > 24);
    const ds = dash.data('dsel');
    const known = ds.status === 'ok';
    const hits = known ? ds.data.filter((r) => r.flag12 || r.flagint).length : 0;
    for (const p of document.querySelectorAll('#dash-root [data-hz="none"]')) p.hidden = !(known && ds.data.length && hits === 0);
  });

  /* ---------- Шапка ---------- */
  const pdText = (name, fn) => dash.draw(name, (el) => { const v = fn(); el.textContent = v == null || v === '' ? '—' : v; });
  const pdPl = (f) => () => { const r = PD.placeRow(); return r ? r[f] : null; };
  pdText('place-ru', pdPl('place_ru'));
  pdText('place-en', pdPl('place_en'));
  pdText('lat', pdPl('lat')); pdText('lon', pdPl('lon')); pdText('elev', pdPl('elev_m'));
  pdText('nlat', () => { const r = PD.placeRow(); return r && r.node_lat != null ? r.node_lat.toFixed(2) : null; });
  pdText('nlon', () => { const r = PD.placeRow(); return r && r.node_lon != null ? r.node_lon.toFixed(2) : null; });
  pdText('last-frame', () => { const r = PD.placeRow(); return r ? PD.when(r.last_frame_local) : null; });
  pdText('updated', () => PD.when(PD.info('updated_local')));
  pdText('thr12', () => PD.info('thr_12h_mm'));
  pdText('thrint', () => PD.info('thr_int_mmh'));
  const pdT = (f, fmt) => () => { const r = PD.rows('ptot')[0]; return r ? fmt(r[f]) : null; };
  pdText('p-first', pdT('first_day', (v) => PD.dayLabel(v)));
  pdText('p-last', pdT('last_day', (v) => PD.dayLabel(v)));
  pdText('p-sum', pdT('total_mm', PD.f1));
  pdText('p-wet', pdT('wet_days', String));
  pdText('p-int', pdT('max_int_mmh', PD.f1));
  pdText('p-int-at', pdT('max_int_at', PD.when));
  pdText('k-sum', pdT('total_mm', PD.f1));
  pdText('k-days', pdT('days', String));
  pdText('k-wet', pdT('wet_days', String));
  pdText('k-weth', pdT('wet_hours', String));
  pdText('k-maxday', pdT('max_day_mm', PD.f1));
  pdText('k-maxday-at', pdT('max_day_date', (v) => (v ? PD.dayLabel(v, true) : '—')));
  pdText('k-max1h', pdT('max_1h_mm', PD.f1));
  pdText('k-max1h-at', pdT('max_1h_end', PD.when));
  pdText('k-int', pdT('max_int_mmh', PD.f1));
  pdText('k-int-at', pdT('max_int_at', PD.when));

  dash.draw('place-btns', (el) => {
    el.replaceChildren();
    const cur = PD.place();
    for (const r of PD.rows('places')) {
      const b = document.createElement('button'); b.type = 'button';
      b.textContent = PD.L() === 'en' ? (r.place_en || r.place) : (r.place_ru || r.place);
      b.setAttribute('aria-pressed', String(r.place === cur));
      b.addEventListener('click', () => { if (r.place !== PD.place()) dash.setParams({place: r.place, day: null}); });
      el.appendChild(b);
    }
  });

  dash.draw('per-select', (sel) => {
    const t = PD.TR[PD.L()];
    const months = [...new Set(PD.rows('daily').map((r) => (r.date_local || '').slice(0, 7)).filter(Boolean))].sort().reverse();
    const opts = [new Option(t.p30, '30'), new Option(t.p90, '90'), new Option(t.pall, 'all')]
      .concat(months.map((mo) => new Option(t.monN[Number(mo.slice(5, 7)) - 1] + ' ' + mo.slice(0, 4), mo)));
    sel.replaceChildren(...opts);
    const cur = String(dash.params().per || '30');
    sel.value = opts.some((o) => o.value === cur) ? cur : '30';
    sel.onchange = () => dash.setParams({per: sel.value, day: null});
  });

  /* ---------- Интенсивные осадки ---------- */
  dash.draw('hz-list', (el) => {
    el.replaceChildren();
    if (!PD.ok('dsel')) return;
    const t12 = PD.thr('thr_12h_mm'), ti = PD.thr('thr_int_mmh');
    for (const r of PD.rows('dsel').filter((x) => x.flag12 || x.flagint)) {
      const parts = [];
      if (r.flag12) parts.push(PD.f1(r.max_12h_mm) + ' ' + PD.tr('mm') + ' ' + PD.tr('h12') + (t12 != null ? ' (≥ ' + t12 + ')' : ''));
      if (r.flagint) parts.push(PD.tr('int') + ' ' + PD.f1(r.max_int_mmh) + ' ' + PD.tr('mmh') + (ti != null ? ' (≥ ' + ti + ')' : ''));
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pd-hz-pill';
      b.setAttribute('data-source', 'dsel'); b.setAttribute('data-field', r.flag12 ? 'max_12h_mm' : 'max_int_mmh');
      b.setAttribute('data-where', 'date_local=' + PD.enc(r.date_local));
      b.append(PD.bell(14), document.createTextNode(PD.dayLabel(r.date_local) + ' · ' + parts.join(' · ')));
      b.addEventListener('click', () => { PD.pickDay(r.date_local); const s = document.querySelector('#dash-root #day'); if (s) s.scrollIntoView({behavior: 'smooth', block: 'start'}); });
      el.appendChild(b);
    }
  });

  /* ---------- Карточки суток ---------- */
  dash.draw('days', (el) => {
    if (!PD.state(el, 'dsel')) return;
    el.replaceChildren();
    const sel = PD.day();
    for (const r of PD.rows('dsel')) {
      const d = r.date_local, wet = (r.sum_mm || 0) >= 0.1;
      const c = document.createElement('button'); c.type = 'button'; c.className = 'pd-dc' + (wet ? '' : ' dry');
      c.setAttribute('aria-pressed', String(d === sel));
      const h = document.createElement('span'); h.className = 'pd-dc-h';
      const pd = PD.parseD(d);
      h.textContent = PD.dayLabel(d) + ' ' + (pd ? PD.TR[PD.L()].wd[pd.getUTCDay()] : '');
      if (r.flag12 || r.flagint) { const b = document.createElement('span'); b.className = 'pd-bell'; b.appendChild(PD.bell(13)); h.appendChild(b); }
      const mk = (f, txt, cls) => { const s = document.createElement('span'); s.className = cls; s.textContent = txt; s.setAttribute('data-source', 'dsel'); s.setAttribute('data-field', f); s.setAttribute('data-where', 'date_local=' + PD.enc(d)); return s; };
      const v = document.createElement('span'); v.className = 'pd-dc-v';
      v.append(mk('sum_mm', PD.f1(r.sum_mm), ''), document.createTextNode(' ' + PD.tr('mm')));
      c.append(h, v);
      if (wet) { const x = document.createElement('span'); x.className = 'pd-dc-x'; x.append(document.createTextNode('↑ '), mk('max_int_mmh', PD.f1(r.max_int_mmh), ''), document.createTextNode(' ' + PD.tr('mmh'))); c.appendChild(x); }
      if (r.n != null && r.n < 96) { const x = document.createElement('span'); x.className = 'pd-dc-x'; x.textContent = r.n + PD.tr('of'); c.appendChild(x); }
      c.addEventListener('click', () => PD.pickDay(d));
      el.appendChild(c);
    }
  });

  /* ---------- Графики периода ---------- */
  dash.draw('ch-daily', (el) => {
    if (!PD.state(el, 'dsel')) return;
    const sel = PD.day();
    const rows = PD.rows('dsel').map((r) => ({key: r.date_local, label: PD.dayLabel(r.date_local), v: r.sum_mm, sel: r.date_local === sel, hit: !!(r.flag12 || r.flagint),
      tip: [PD.dayLabel(r.date_local, true), PD.f1(r.sum_mm) + ' ' + PD.tr('mm'), PD.tr('int') + ' ≤ ' + PD.f1(r.max_int_mmh) + ' ' + PD.tr('mmh')].concat(r.n < 96 ? [PD.tr('part') + r.n + PD.tr('of')] : [])}));
    PD.bars(el, {rows, h: 160, aria: PD.tr('aDaily'), onPick: PD.pickDay});
  });
  dash.draw('ch-cum', (el) => {
    if (!PD.state(el, 'dsel')) return;
    const rs = PD.rows('dsel');
    const pts = rs.map((r) => ({x: new Date(Date.parse(r.date_local + 'T00:00:00Z') + 86400000), y: r.cum_mm, d: r.date_local}));
    if (rs.length) pts.unshift({x: PD.parseD(rs[0].date_local), y: 0, d: rs[0].date_local});
    const sel = PD.day(), s0 = sel && PD.parseD(sel);
    PD.line(el, {pts, h: 150, color: 'var(--c-cum)', unit: PD.tr('mm'), vFmt: PD.f1, aria: PD.tr('aCum'), band: s0 ? [s0, new Date(+s0 + 86400000)] : null,
      tipT: (x) => PD.dayLabel(new Date(+x - 1).toISOString().slice(0, 10), true) + ', 24:00', onPick: (p) => PD.pickDay(p.d)});
  });

  /* ---------- Выбранные сутки ---------- */
  dash.draw('day-name', (el) => { const d = PD.day(); el.textContent = d ? PD.dayLabel(d, true) : '—'; });
  const pdDay = (name, f, fmt) => dash.draw(name, (el) => {
    const d = PD.day(), r = PD.rows('dsel').find((x) => x.date_local === d);
    el.setAttribute('data-where', 'date_local=' + PD.enc(d || ''));
    el.textContent = r ? fmt(r[f]) : '—';
  });
  pdDay('d-sum', 'sum_mm', PD.f1); pdDay('d-1h', 'max_1h_mm', PD.f1); pdDay('d-int', 'max_int_mmh', PD.f1); pdDay('d-12h', 'max_12h_mm', PD.f1);
  dash.draw('d-part', (el) => {
    const d = PD.day(), r = PD.rows('dsel').find((x) => x.date_local === d);
    el.setAttribute('data-where', 'date_local=' + PD.enc(d || ''));
    el.textContent = r && r.n != null && r.n < 96 ? PD.tr('part') + r.n + PD.tr('of') : '';
  });
  dash.draw('ch-day-sum', (el) => {
    if (!PD.state(el, 'dagg')) return;
    const rs = PD.rows('dagg');
    const step = rs.length ? rs[0].step : 60;
    const ti = PD.thr('thr_int_mmh');
    const rows = rs.map((r) => { const t = PD.parseT(r.end_local); const lab = r.end_local.slice(11) === '00:00' ? '24:00' : r.end_local.slice(11);
      return {key: r.end_local, label: lab, v: r.sum_mm, hit: ti != null && r.max_mmh != null && Math.round(r.max_mmh * 10) / 10 >= ti,
        tip: [(t ? PD.fmtH(new Date(+t - step * 60000)) : '') + '–' + lab, PD.f2(r.sum_mm) + ' ' + PD.tr('mm'), PD.tr('int') + ' ≤ ' + PD.f1(r.max_mmh) + ' ' + PD.tr('mmh'), PD.tr('frames') + ': ' + r.n]}; });
    // Подписи оси — на круглых часах (через 1, 2, 3, 6 или 12 ч, сколько помещается)
    const tickKeys = (keys, every) => {
      const need = every * step / 60, k = [1, 2, 3, 6, 12].find((v) => v >= need) || 12;
      return keys.filter((key) => key.slice(14) === '00' && Number(key.slice(11, 13)) % k === 0);
    };
    PD.bars(el, {rows, h: 190, minMax: 0.5, aria: PD.tr('aSum'), pad: step === 15 ? 0.15 : 0.25, labW: 40, tickKeys});
  });
  dash.draw('ch-day-int', (el) => {
    if (!PD.state(el, 'dframes')) return;
    const pts = PD.rows('dframes').map((r) => ({x: PD.parseT(r.local), y: r.rate_mmh}));
    if (!pts.length) { PD.none(el); return; }
    const t0 = new Date(+pts[0].x - 900000);
    PD.line(el, {pts, h: 190, area: true, color: 'var(--c-int)', unit: PD.tr('mmh'), vFmt: PD.f2, minMax: 0.5, thr: PD.thr('thr_int_mmh'), aria: PD.tr('aInt'),
      xDomain: [t0, new Date(+t0 + 86400000)], xFmt: (d) => (d.getUTCHours() === 0 && +d > +t0 ? '24:00' : PD.fmtH(d)), ticks: (n) => d3.utcHour.every(n >= 8 ? 3 : 6), tickW: 48,
      tipT: (x) => { const s = PD.fmtH(x); return s === '00:00' ? '24:00' : s; }});
  });

  /* ---------- Таблицы ---------- */
  dash.draw('tb-days', (tb) => {
    tb.replaceChildren();
    if (!PD.ok('dsel')) return;
    const sel = PD.day();
    for (const r of PD.rows('dsel')) {
      const tr = document.createElement('tr'); tr.setAttribute('data-key', PD.enc(r.date_local));
      tr.className = (r.date_local === sel ? 'sel' : '') + (r.flag12 || r.flagint ? ' hit' : '');
      const cells = [[PD.dayLabel(r.date_local), 'l'], [PD.f1(r.sum_mm)], [PD.f1(r.cum_mm)], [PD.f1(r.max_1h_mm)], [PD.f1(r.max_int_mmh)], [PD.f1(r.max_12h_mm)], [String(r.wet_h ?? '—')], [String(r.n ?? '—')]];
      for (const [t, c] of cells) { const td = document.createElement('td'); td.textContent = t; if (c) td.className = c; tr.appendChild(td); }
      tr.style.cursor = 'pointer'; tr.addEventListener('click', () => PD.pickDay(r.date_local));
      tb.appendChild(tr);
    }
  });
  dash.draw('tb-day', (tb) => {
    tb.replaceChildren();
    if (!PD.ok('dagg')) return;
    for (const r of PD.rows('dagg')) {
      const tr = document.createElement('tr'); tr.setAttribute('data-key', PD.enc(r.end_local));
      const lab = r.end_local.slice(11) === '00:00' ? '24:00' : r.end_local.slice(11);
      const cells = [[lab, 'l'], [PD.f2(r.sum_mm)], [PD.f2(r.mean_mmh)], [PD.f2(r.max_mmh)], [PD.f2(r.cum_mm)], [String(r.n)]];
      for (const [t, c] of cells) { const td = document.createElement('td'); td.textContent = t; if (c) td.className = c; tr.appendChild(td); }
      tb.appendChild(tr);
    }
  });
