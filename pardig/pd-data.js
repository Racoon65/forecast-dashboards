  /* ---------- Данные: файл с расчётами (набор src); страница выбирает лист по своим параметрам ---------- */
  dash.calc('places', {
    title: "Пункты",
    description: "Пункты, координаты пункта и узла сетки, высота, первые и последние сутки ряда. Из файла данных дашборда.",
    inputs: ['src'],
    fn: (src) => {
      const TEXT = new Set(["date_local", "max_1h_end", "max_int_at", "max_12h_end", "frames", "place", "place_ru", "place_en", "first_day", "last_day", "last_frame_local", "key"]); const fixT = (s) => s.replace(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})(?::\d{2})?$/, (m, d, h, mi) => d + ' ' + h.padStart(2, '0') + ':' + mi);
      const name = 'places';
      const sheet = (src && src.alias && src.alias[name]) || name;
      const values = src && src.sheets && src.sheets[sheet] && src.sheets[sheet]['places'];
      if (!Array.isArray(values) || !values.length) return [];
      const columns = values[0].map(String);
      const info = columns[0] === 'key' && columns[1] === 'value';
      return values.slice(1).filter((r) => r && r.length && r[0] != null && String(r[0]) !== '').map((r) => {
        const o = {};
        columns.forEach((c, i) => {
          const v = r[i];
          if (TEXT.has(c) || (info && c === 'value')) { o[c] = v == null ? '' : fixT(String(v)); return; }
          if (v == null || v === '') { o[c] = null; return; }
          const n = typeof v === 'number' ? v : Number(String(v).replace(/\s/g, '').replace(',', '.'));
          o[c] = Number.isFinite(n) ? n : null;
        });
        return o;
      });
    },
  });
  dash.calc('info', {
    title: "Сведения и пороги",
    description: "Время обновления, последний кадр и пороги интенсивных осадков. Из файла данных дашборда.",
    inputs: ['src'],
    fn: (src) => {
      const TEXT = new Set(["date_local", "max_1h_end", "max_int_at", "max_12h_end", "frames", "place", "place_ru", "place_en", "first_day", "last_day", "last_frame_local", "key"]); const fixT = (s) => s.replace(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})(?::\d{2})?$/, (m, d, h, mi) => d + ' ' + h.padStart(2, '0') + ':' + mi);
      const name = 'info';
      const sheet = (src && src.alias && src.alias[name]) || name;
      const values = src && src.sheets && src.sheets[sheet] && src.sheets[sheet]['info'];
      if (!Array.isArray(values) || !values.length) return [];
      const columns = values[0].map(String);
      const info = columns[0] === 'key' && columns[1] === 'value';
      return values.slice(1).filter((r) => r && r.length && r[0] != null && String(r[0]) !== '').map((r) => {
        const o = {};
        columns.forEach((c, i) => {
          const v = r[i];
          if (TEXT.has(c) || (info && c === 'value')) { o[c] = v == null ? '' : fixT(String(v)); return; }
          if (v == null || v === '') { o[c] = null; return; }
          const n = typeof v === 'number' ? v : Number(String(v).replace(/\s/g, '').replace(',', '.'));
          o[c] = Number.isFinite(n) ? n : null;
        });
        return o;
      });
    },
  });
  dash.calc('daily', {
    title: "Суточные данные пункта",
    description: "Для выбранного пункта: суточные суммы, максимумы, отметки интенсивных осадков и мгновенная интенсивность по кадрам. Из файла данных дашборда.",
    inputs: ['src'],
    fn: (src) => {
      const TEXT = new Set(["date_local", "max_1h_end", "max_int_at", "max_12h_end", "frames", "place", "place_ru", "place_en", "first_day", "last_day", "last_frame_local", "key"]); const fixT = (s) => s.replace(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})(?::\d{2})?$/, (m, d, h, mi) => d + ' ' + h.padStart(2, '0') + ':' + mi);
      const p = dash.params(); const name = (p.place || 'Tashkent') + '_daily';
      const sheet = (src && src.alias && src.alias[name]) || name;
      const values = src && src.sheets && src.sheets[sheet] && src.sheets[sheet]['daily'];
      if (!Array.isArray(values) || !values.length) return [];
      const columns = values[0].map(String);
      const info = columns[0] === 'key' && columns[1] === 'value';
      return values.slice(1).filter((r) => r && r.length && r[0] != null && String(r[0]) !== '').map((r) => {
        const o = {};
        columns.forEach((c, i) => {
          const v = r[i];
          if (TEXT.has(c) || (info && c === 'value')) { o[c] = v == null ? '' : fixT(String(v)); return; }
          if (v == null || v === '') { o[c] = null; return; }
          const n = typeof v === 'number' ? v : Number(String(v).replace(/\s/g, '').replace(',', '.'));
          o[c] = Number.isFinite(n) ? n : null;
        });
        return o;
      });
    },
  });

  /* ---------- Расчёты ---------- */
  dash.calc('dsel', {
    title: 'Сутки выбранного периода',
    description: 'Суточные строки пункта за выбранный период (последние 30 или 90 суток, месяц или весь ряд) с нарастающей суммой от начала периода.',
    inputs: ['daily'],
    fn: (daily) => {
      const per = String(dash.params().per || '30');
      const ds = daily.filter((r) => r.date_local).sort((a, b) => (a.date_local < b.date_local ? -1 : 1));
      if (!ds.length) return [];
      let sel = ds;
      if (per === '30' || per === '90') {
        const last = new Date(ds[ds.length - 1].date_local + 'T00:00:00Z');
        const from = new Date(+last - (Number(per) - 1) * 86400000).toISOString().slice(0, 10);
        sel = ds.filter((r) => r.date_local >= from);
      } else if (/^\d{4}-\d{2}$/.test(per)) sel = ds.filter((r) => r.date_local.slice(0, 7) === per);
      let c = 0;
      return sel.map((r) => { c += r.sum_mm || 0; return {date_local: r.date_local, sum_mm: r.sum_mm, cum_mm: Math.round(c * 1000) / 1000, n: r.n,
        max_1h_mm: r.max_1h_mm, max_1h_end: r.max_1h_end, max_int_mmh: r.max_int_mmh, max_int_at: r.max_int_at, max_12h_mm: r.max_12h_mm,
        max_12h_end: r.max_12h_end, wet_h: r.wet_h, flag12: r.flag12, flagint: r.flagint}; });
    },
  });
  dash.calc('ptot', {
    title: 'Итоги периода',
    description: 'Сумма осадков, число суток и часов с осадками, наибольшие суточная, часовая сумма и 15-минутная интенсивность за выбранный период.',
    inputs: ['dsel'],
    fn: (dsel) => {
      if (!dsel.length) return [];
      const top = (f) => dsel.reduce((b, r) => (r[f] != null && (b == null || r[f] > b[f]) ? r : b), null);
      const d = top('sum_mm'), h = top('max_1h_mm'), i = top('max_int_mmh');
      return [{first_day: dsel[0].date_local, last_day: dsel[dsel.length - 1].date_local, days: dsel.length,
        total_mm: Math.round(dsel.reduce((s, r) => s + (r.sum_mm || 0), 0) * 10) / 10,
        wet_days: dsel.filter((r) => (r.sum_mm || 0) >= 0.1).length, wet_hours: dsel.reduce((s, r) => s + (r.wet_h || 0), 0),
        max_day_mm: d ? d.sum_mm : null, max_day_date: d && d.sum_mm > 0 ? d.date_local : '',
        max_1h_mm: h ? h.max_1h_mm : null, max_1h_end: h && h.max_1h_mm > 0 ? h.max_1h_end : '',
        max_int_mmh: i ? i.max_int_mmh : null, max_int_at: i && i.max_int_mmh > 0 ? i.max_int_at : '',
        events: dsel.filter((r) => r.flag12 || r.flagint).length}];
    },
  });
  dash.calc('dframes', {
    title: 'Кадры выбранных суток',
    description: '96 кадров PARDIG выбранных суток: время кадра (ташкентское), интенсивность, мм/ч, и слой за 15 минут, мм (интенсивность × 0.25 ч).',
    inputs: ['daily', 'dsel'],
    fn: (daily, dsel) => {
      const want = dash.params().day;
      const list = dsel.map((r) => r.date_local);
      // По умолчанию — последние сутки с осадками от 1 мм, иначе последние с осадками, иначе последние сутки периода
      const wet1 = dsel.filter((r) => (r.sum_mm || 0) >= 1), wet = dsel.filter((r) => (r.sum_mm || 0) >= 0.1);
      const day = list.includes(want) ? want : (wet1.length ? wet1[wet1.length - 1].date_local : wet.length ? wet[wet.length - 1].date_local : list[list.length - 1]);
      const row = daily.find((r) => r.date_local === day);
      if (!row || !row.frames) return [];
      const vals = row.frames.trim().split(/\s+/);
      const t0 = Date.parse(day + 'T00:00:00Z');
      return vals.slice(0, 96).map((v, k) => {
        const t = new Date(t0 + (k + 1) * 900000).toISOString();
        const r = v === '-' || v === '' ? null : Number(v);
        return {local: t.slice(0, 10) + ' ' + t.slice(11, 16), rate_mmh: Number.isFinite(r) ? r : null, depth_mm: Number.isFinite(r) ? Math.round(r * 250) / 1000 : null};
      });
    },
  });
  dash.calc('dagg', {
    title: 'Суммы выбранных суток по интервалам',
    description: 'Слои 15-минутных кадров, сложенные по интервалам 15 мин, 30 мин или 1 ч (конец интервала включён): сумма, средняя и наибольшая интенсивность, сумма с начала суток.',
    inputs: ['dframes'],
    fn: (fr) => {
      const step = [15, 30, 60].includes(Number(dash.params().step)) ? Number(dash.params().step) : 60;
      const k = step / 15, out = [];
      let cum = 0;
      for (let i = 0; i + k <= fr.length; i += k) {
        const part = fr.slice(i, i + k), ok = part.filter((p) => p.rate_mmh != null);
        const s = ok.reduce((a, p) => a + p.rate_mmh * 0.25, 0);
        if (ok.length) cum += s;
        out.push({end_local: part[part.length - 1].local, sum_mm: ok.length ? Math.round(s * 1000) / 1000 : null,
          mean_mmh: ok.length ? Math.round(s / (step / 60) * 1000) / 1000 : null, max_mmh: ok.length ? Math.max(...ok.map((p) => p.rate_mmh)) : null,
          cum_mm: Math.round(cum * 1000) / 1000, n: ok.length, step});
      }
      return out;
    },
  });
  dash.calc('age_h', {
    title: 'Возраст данных, ч',
    description: 'Сколько часов прошло с последнего обновления таблицы (время Ташкента, UTC+5) до открытия страницы.',
    inputs: ['info'],
    fn: (info) => {
      const r = info.find((x) => x.key === 'updated_local');
      const t = r && Date.parse(r.value.replace(' ', 'T') + ':00+05:00');
      return Number.isFinite(t) ? Math.max(0, Math.round((Date.now() - t) / 3600000)) : null;
    },
  });
