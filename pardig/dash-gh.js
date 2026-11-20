/* Мини-замена движка дашбордов claude.ai для GitHub Pages.
   Даёт странице те же вызовы: dash.calc, dash.data, dash.draw, dash.onData, dash.params, dash.setParams.
   Источник src — файл data.json рядом со страницей (его пишет блокнот Colab).
   Параметры страницы (place, per, day, step, lang) хранятся в адресе после «?». */
(function () {
  const SOURCES = {src: 'data.json'};
  const raw = {};                       // id источника → {status, data, message}
  const calcs = {}, draws = {}, onData = [];
  let cache = {}, scheduled = false;

  const readParams = () => {
    const o = {};
    new URLSearchParams(location.search).forEach((v, k) => { o[k] = v; });
    return o;
  };
  let params = readParams();

  function data(id) {
    if (cache[id]) return cache[id];
    let res;
    if (raw[id]) res = raw[id];
    else if (calcs[id]) {
      const c = calcs[id];
      const ins = c.inputs.map(data);
      const bad = ins.find((x) => x.status !== 'ok');
      if (bad) res = {status: bad.status, data: null, message: bad.message};
      else {
        try { res = {status: 'ok', data: c.fn(...ins.map((x) => x.data))}; }
        catch (e) { console.error('calc ' + id, e); res = {status: 'error', data: null, message: String(e)}; }
      }
    } else res = {status: 'missing', data: [], message: 'Нет набора ' + id};
    if (res.status === 'ok' && Array.isArray(res.data) && res.data.length && typeof res.data[0] === 'object')
      res.columns = Object.keys(res.data[0]);
    res.refreshing = false; res.truncated = false;
    cache[id] = res;
    return res;
  }

  function render() {
    scheduled = false; cache = {};
    for (const fn of onData) { try { fn(); } catch (e) { console.error(e); } }
    for (const [name, fns] of Object.entries(draws)) {
      for (const el of document.querySelectorAll('[data-draw="' + name + '"]'))
        for (const fn of fns) { try { fn(el); } catch (e) { console.error('draw ' + name, e); } }
    }
  }
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(render); } };

  window.dash = {
    calc: (id, o) => { calcs[id] = {inputs: o.inputs || [], fn: o.fn}; },
    loader: () => {},
    data,
    draw: (name, fn) => { (draws[name] = draws[name] || []).push(fn); schedule(); },
    onData: (fn) => { onData.push(fn); schedule(); },
    params: () => ({...params}),
    setParams: (o) => {
      for (const [k, v] of Object.entries(o)) { if (v == null || v === '') delete params[k]; else params[k] = String(v); }
      const q = new URLSearchParams(params).toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
      schedule();
    },
    resetParams: () => { params = {}; history.replaceState(null, '', location.pathname); schedule(); },
    refresh: () => {}, setLink: () => {},
    colors: ['#81cffe', '#2f7fe8', '#edddb6', '#ff8a5c'],
  };

  for (const [id, url] of Object.entries(SOURCES)) {
    raw[id] = {status: 'loading', data: []};
    fetch(url, {cache: 'no-store'})
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((j) => { raw[id] = {status: 'ok', data: j}; schedule(); })
      .catch((e) => { raw[id] = {status: 'error', data: [], message: String(e)}; schedule(); });
  }
  let w = 0;
  window.addEventListener('resize', () => { const n = document.documentElement.clientWidth; if (n !== w) { w = n; schedule(); } });
  window.addEventListener('popstate', () => { params = readParams(); schedule(); });
})();
