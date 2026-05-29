// Split Bill — calm expense splitter for A Curious Note
// State lives in localStorage; calculations are pure and instant.
(function () {
  'use strict';

  // ---------- Currency ----------
  const CUR = {
    IDR: { sym: 'Rp', locale: 'id-ID', dp: 0 },
    USD: { sym: '$',  locale: 'en-US', dp: 2 },
    EUR: { sym: '€',  locale: 'de-DE', dp: 2 },
    GBP: { sym: '£',  locale: 'en-GB', dp: 2 },
    JPY: { sym: '¥',  locale: 'ja-JP', dp: 0 },
    SGD: { sym: 'S$', locale: 'en-SG', dp: 2 },
    AUD: { sym: 'A$', locale: 'en-AU', dp: 2 },
    INR: { sym: '₹',  locale: 'en-IN', dp: 2 }
  };
  const AV = [
    ['#f5b8c7', '#d96b8a'], ['#c6b5e0', '#a07ab5'], ['#b3d0e8', '#6f9bd1'],
    ['#a7d8c5', '#6ba39a'], ['#f6c7a3', '#c08a64'], ['#efb0c6', '#b56f93'],
    ['#a9c6e8', '#5d83b8'], ['#bfe0cd', '#74ab8e'], ['#e8c39c', '#bd8a5a'],
    ['#d6b8e0', '#9a6fb5']
  ];
  // Each split mode owns a brand colour; the whole tool's accent follows it.
  const MODE_COLORS = {
    equal:      [111, 155, 209], // blue
    custom:     [192, 138, 100], // peach
    percentage: [160, 122, 181], // lavender
    itemized:   [217, 107, 138]  // rose
  };
  function applyAccent(m) {
    const c = MODE_COLORS[m] || MODE_COLORS.equal;
    const r = document.documentElement;
    r.style.setProperty('--video-r', c[0]);
    r.style.setProperty('--video-g', c[1]);
    r.style.setProperty('--video-b', c[2]);
    const th = document.getElementById('totalHint');
    if (th) th.textContent = (m === 'itemized') ? 'Summed from the receipt below.' : 'Before tax, tip & service.';
  }

  function curMeta() { return CUR[state.bill.currency] || CUR.IDR; }
  function fmt(n) {
    const c = curMeta();
    if (!isFinite(n)) n = 0;
    const num = new Intl.NumberFormat(c.locale, { minimumFractionDigits: c.dp, maximumFractionDigits: c.dp }).format(n);
    return c.sym + (c.sym.length > 1 ? ' ' : '') + num;
  }
  function parseNum(str) {
    if (typeof str === 'number') return isFinite(str) ? str : 0;
    let s = String(str == null ? '' : str).trim();
    if (!s) return 0;
    const neg = /^-/.test(s);
    s = s.replace(/[^\d.,]/g, '');
    const dp = curMeta().dp;
    if (dp === 0) {
      s = s.replace(/[.,]/g, '');
    } else {
      const lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(',');
      if (lastComma > lastDot) s = s.replace(/\./g, '').replace(/,/g, '.');
      else s = s.replace(/,/g, '');
    }
    let n = parseFloat(s);
    if (!isFinite(n)) n = 0;
    return neg ? -n : n;
  }
  const pow = () => Math.pow(10, curMeta().dp);
  function round(n) { const p = pow(); return Math.round((n + Number.EPSILON) * p) / p; }
  // Split `total` into n parts summing exactly to total (minor-unit precision).
  function splitEqual(total, n) {
    if (n <= 0) return [];
    const p = pow();
    const minor = Math.round(total * p);
    const base = Math.trunc(minor / n);
    let rem = minor - base * n;
    const out = [];
    for (let i = 0; i < n; i++) { out.push((base + (i < rem ? 1 : 0)) / p); }
    return out;
  }

  // ---------- State ----------
  const KEY = 'acn-splitbill-v1';
  let pcounter = 0, icounter = 0;
  function uid(p) { return p + '-' + (Date.now().toString(36)) + '-' + Math.random().toString(36).slice(2, 6); }

  function defaultState() {
    return {
      bill: { name: '', total: '', currency: 'IDR', date: '', note: '', tax: '', tip: '', service: '', discount: '' },
      people: [
        { id: uid('p'), name: 'Sherly', contact: '', included: true, paid: false, ci: 0 },
        { id: uid('p'), name: 'Kris', contact: '', included: true, paid: false, ci: 1 }
      ],
      method: 'itemized',
      custom: {}, percentage: {}, locks: {},
      items: [], taxtip: 'proportional',
      paidBy: ''
    };
  }
  let state = load() || seedExample();

  function seedExample() {
    const s = defaultState();
    s.bill.name = 'Dinner at Sushi House';
    s.bill.total = '500000';
    s.bill.note = 'Team dinner';
    s.bill.date = '2026-05-29';
    const a = s.people[0].id, b = s.people[1].id;
    s.items = [
      { id: uid('i'), name: 'Sushi platter', price: '240000', qty: 1, assignees: [a, b] },
      { id: uid('i'), name: 'Edamame & drinks', price: '160000', qty: 1, assignees: [a, b] },
      { id: uid('i'), name: 'Mochi dessert', price: '100000', qty: 1, assignees: [a, b] }
    ];
    return s;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (!raw) return null; const s = JSON.parse(raw); if (!s.people || !s.people.length) return null; return s; }
    catch (e) { return null; }
  }
  let saveTimer = 0;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }, 200);
  }

  // ---------- Helpers ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function included() { return state.people.filter(p => p.included); }
  function personById(id) { return state.people.find(p => p.id === id); }
  function displayName(p, idx) { return (p.name && p.name.trim()) ? p.name.trim() : ('Person ' + ((typeof idx === 'number' ? idx : state.people.indexOf(p)) + 1)); }
  function initials(p, idx) {
    const n = (p.name || '').trim();
    if (!n) return '?';
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function avStyle(p) { const c = AV[p.ci % AV.length]; return '--av1:' + c[0] + ';--av2:' + c[1] + ';'; }

  // ---------- Totals ----------
  function grandTotal() {
    const b = state.bill;
    let base;
    if (state.method === 'itemized') base = state.items.reduce((s, it) => s + parseNum(it.price) * (parseNum(it.qty) || 1), 0);
    else base = parseNum(b.total);
    const t = base + parseNum(b.tax) + parseNum(b.tip) + parseNum(b.service) - parseNum(b.discount);
    return { base: base, total: t, clamped: Math.max(0, t) };
  }

  // ---------- Compute shares per mode ----------
  function compute() {
    const inc = included();
    const g = grandTotal();
    const total = g.clamped;
    const shares = {}; state.people.forEach(p => shares[p.id] = 0);
    let allocated = 0, valid = false, note = '', extra = {};

    if (inc.length === 0) {
      return { total, shares, allocated: 0, remaining: total, valid: false, note: 'Add at least one person to the split.', status: 'warn', extra };
    }

    if (state.method === 'equal') {
      const parts = splitEqual(total, inc.length);
      inc.forEach((p, i) => shares[p.id] = parts[i]);
      allocated = total;
      valid = total > 0;
      // rounding note: who covers the extra
      if (total > 0 && parts.length > 1 && parts[0] !== parts[parts.length - 1]) {
        const diff = round(parts[0] - parts[parts.length - 1]);
        const nHigher = parts.filter(x => x === parts[0]).length;
        const names = inc.slice(0, nHigher).map((p, i) => displayName(p));
        note = (names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' & ' + names.slice(-1)) +
          ' cover' + (names.length === 1 ? 's' : '') + ' the extra ' + fmt(diff) + ' from rounding.';
      }
      extra.each = parts[parts.length - 1];
    }

    else if (state.method === 'custom') {
      inc.forEach(p => { const v = parseNum(state.custom[p.id]); shares[p.id] = v; allocated += v; });
      allocated = round(allocated);
      valid = total > 0 && Math.abs(allocated - total) < 0.005;
    }

    else if (state.method === 'percentage') {
      let pctSum = 0; inc.forEach(p => pctSum += (parseNum(state.percentage[p.id]) || 0));
      extra.pctSum = round(pctSum);
      // distribute total by pct, then fix rounding so it sums exactly when pct=100
      let acc = 0, last = null;
      inc.forEach(p => { const pct = parseNum(state.percentage[p.id]) || 0; const v = round(total * pct / 100); shares[p.id] = v; acc += v; last = p; });
      acc = round(acc);
      if (Math.abs(pctSum - 100) < 0.01 && last && Math.abs(acc - total) >= 0.005) {
        shares[last.id] = round(shares[last.id] + (total - acc));
      }
      allocated = inc.reduce((s, p) => s + shares[p.id], 0);
      allocated = round(allocated);
      valid = total > 0 && Math.abs(pctSum - 100) < 0.01;
    }

    else if (state.method === 'itemized') {
      // item subtotals per person (split equally among assignees)
      const sub = {}; inc.forEach(p => sub[p.id] = 0);
      let assignedBase = 0, unassigned = 0;
      state.items.forEach(it => {
        const price = parseNum(it.price) * (parseNum(it.qty) || 1);
        const who = (it.assignees || []).filter(id => personById(id) && personById(id).included);
        if (price <= 0) return;
        if (who.length === 0) { unassigned += price; return; }
        const parts = splitEqual(price, who.length);
        who.forEach((id, i) => { sub[id] = round(sub[id] + parts[i]); });
        assignedBase += price;
      });
      // adjustments distributed
      const adj = parseNum(state.bill.tax) + parseNum(state.bill.tip) + parseNum(state.bill.service) - parseNum(state.bill.discount);
      if (adj !== 0) {
        if (state.taxtip === 'equal') {
          const parts = splitEqual(adj, inc.length);
          inc.forEach((p, i) => sub[p.id] = round(sub[p.id] + parts[i]));
        } else { // proportional to assigned subtotal
          if (assignedBase > 0) {
            let acc = 0, last = null;
            inc.forEach(p => { const share = round(adj * (sub[p.id] / assignedBase)); /* note sub already only base here */ });
            // recompute proportional on a snapshot of base subtotals
            const baseSnap = {}; inc.forEach(p => baseSnap[p.id] = sub[p.id]);
            const denom = inc.reduce((s, p) => s + baseSnap[p.id], 0) || 1;
            inc.forEach(p => { const v = round(adj * (baseSnap[p.id] / denom)); sub[p.id] = round(sub[p.id] + v); acc += v; last = p; });
            const target = round(assignedBase + adj);
            const got = round(inc.reduce((s, p) => s + sub[p.id], 0));
            if (last && Math.abs(got - target) >= 0.005) sub[last.id] = round(sub[last.id] + (target - got));
          } else {
            const parts = splitEqual(adj, inc.length);
            inc.forEach((p, i) => sub[p.id] = round(sub[p.id] + parts[i]));
          }
        }
      }
      inc.forEach(p => shares[p.id] = round(sub[p.id]));
      allocated = round(inc.reduce((s, p) => s + shares[p.id], 0));
      extra.unassigned = round(unassigned);
      extra.itemCount = state.items.length;
      valid = total > 0 && unassigned < 0.005 && state.items.length > 0;
    }

    const remaining = round(total - allocated);
    let status = 'ok', sText = 'Fully allocated.';
    if (total <= 0) { status = 'neutral'; sText = 'Add a total to begin.'; valid = false; }
    else if (state.method === 'custom') {
      if (remaining > 0.005) { status = 'warn'; sText = fmt(remaining) + ' left to assign.'; }
      else if (remaining < -0.005) { status = 'bad'; sText = fmt(-remaining) + ' over the bill total.'; }
    }
    else if (state.method === 'percentage') {
      const d = round((extra.pctSum || 0) - 100);
      if (d < -0.005) { status = 'warn'; sText = round(-d) + '% left to assign.'; }
      else if (d > 0.005) { status = 'bad'; sText = round(d) + '% over 100%.'; }
    }
    else if (state.method === 'itemized') {
      if ((extra.itemCount || 0) === 0) { status = 'neutral'; sText = 'Add items to the receipt.'; }
      else if ((extra.unassigned || 0) > 0.005) { status = 'warn'; sText = fmt(extra.unassigned) + ' of items not assigned to anyone.'; }
    }
    return { total, shares, allocated, remaining, valid, note, status, sText, extra };
  }

  // ---------- Render: people ----------
  const peopleList = $('#peopleList');
  function renderPeople() {
    peopleList.innerHTML = state.people.map((p, idx) => {
      const exc = p.included ? '' : ' excluded';
      return '<div class="sb-person' + exc + '" data-id="' + p.id + '" role="listitem">' +
        '<div class="sb-avatar" style="' + avStyle(p) + '" data-av="' + p.id + '" aria-hidden="true">' + initials(p) + '</div>' +
        '<div class="sb-person-main">' +
          '<div class="sb-person-name"><label class="sb-sr" for="nm-' + p.id + '">Name</label>' +
          '<input id="nm-' + p.id + '" type="text" value="' + escAttr(p.name) + '" placeholder="Person ' + (idx + 1) + '" autocomplete="off" data-name="' + p.id + '" /></div>' +
          '<div class="sb-person-sub"><span class="owe" data-owe="' + p.id + '">' + fmt(0) + '</span>' +
          '<span class="paid-tag" data-paidtag="' + p.id + '"' + (p.paid ? '' : ' hidden') + '>· settled</span></div>' +
        '</div>' +
        '<div class="sb-person-actions">' +
          iconBtn('inc', p.id, p.included ? 'Included — tap to exclude' : 'Excluded — tap to include', p.included ? 'on' : '',
            p.included ? '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
                       : '<path d="M2 12s3.5-7 10-7c2 0 3.8.6 5.3 1.5M22 12s-3.5 7-10 7c-2 0-3.8-.6-5.3-1.5"/><path d="M4 4l16 16"/>') +
          iconBtn('paid', p.id, p.paid ? 'Settled — tap to undo' : 'Mark settled', p.paid ? 'on' : '', '<path d="M20 6 9 17l-5-5"/>') +
          iconBtn('dup', p.id, 'Duplicate', '', '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>') +
          iconBtn('del', p.id, 'Remove', 'danger', '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>') +
        '</div>' +
      '</div>';
    }).join('');
    $('#peopleSub').textContent = included().length + ' of ' + state.people.length + ' included';
    renderPaidBy();
  }
  function iconBtn(act, id, title, cls, path) {
    return '<button class="sb-iconbtn ' + (cls || '') + '" type="button" data-act="' + act + '" data-id="' + id + '" title="' + title + '" aria-label="' + title + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">' + path + '</svg></button>';
  }
  function escAttr(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // ---------- Render: mode panel ----------
  const modePanel = $('#modePanel');
  const MODE_DESC = {
    equal: 'Everyone included pays the same share. Rounding leftovers are assigned transparently.',
    custom: 'Type exactly what each person owes. We track what&rsquo;s left until it balances.',
    percentage: 'Give everyone a percentage of the bill. Shares must add up to 100%.',
    itemized: 'Add the receipt below and tap who shared each item. Tax &amp; tip follow along.'
  };
  function renderModePanel() {
    $('#modeDesc').innerHTML = MODE_DESC[state.method] || '';
    const inc = included();
    if (state.method === 'equal') {
      modePanel.innerHTML =
        '<div class="sb-equal">' +
          '<div class="sb-stat"><div class="k">People</div><div class="v" data-eq="people">' + inc.length + '</div></div>' +
          '<div class="sb-stat"><div class="k">Total to split</div><div class="v" data-eq="total">' + fmt(0) + '</div></div>' +
          '<div class="sb-stat"><div class="k">Each pays</div><div class="v accent" data-eq="each">' + fmt(0) + '</div></div>' +
        '</div>' +
        '<div class="sb-status neutral" data-eq="note" style="margin-top:14px; display:none;"></div>';
    }
    else if (state.method === 'custom' || state.method === 'percentage') {
      const pct = state.method === 'percentage';
      modePanel.innerHTML = '<div class="sb-people">' + inc.map(p =>
        '<div class="sb-person" data-id="' + p.id + '">' +
          '<div class="sb-avatar" style="' + avStyle(p) + '" aria-hidden="true">' + initials(p) + '</div>' +
          '<div class="sb-person-main"><div class="sb-person-name" style="font-weight:500;color:var(--ink);font-size:15.5px;">' + escAttr(displayName(p)) + '</div>' +
          '<div class="sb-person-sub"><span class="computed" data-computed="' + p.id + '">' + fmt(0) + '</span></div></div>' +
          '<div class="sb-modeval">' +
            (pct
              ? '<input class="mini pct" type="text" inputmode="decimal" value="' + escAttr(state.percentage[p.id] || '') + '" placeholder="0" data-pct="' + p.id + '" aria-label="Percentage for ' + escAttr(displayName(p)) + '" /><span class="unit">%</span>' +
                '<button class="sb-iconbtn lockbtn ' + (state.locks[p.id] ? 'locked' : '') + '" type="button" data-act="lock" data-id="' + p.id + '" title="Lock this percentage" aria-label="Lock percentage"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">' + (state.locks[p.id] ? '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>' : '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 7-1"/>') + '</svg></button>'
              : '<span class="unit" data-cur>' + curMeta().sym + '</span><input class="mini" type="text" inputmode="decimal" value="' + escAttr(state.custom[p.id] || '') + '" placeholder="0" data-custom="' + p.id + '" aria-label="Amount for ' + escAttr(displayName(p)) + '" />'
            ) +
          '</div>' +
        '</div>'
      ).join('') + '</div>' +
      (pct ? '<div class="sb-status neutral" data-pcttotal style="margin-top:14px;"></div>'
           : '<div style="display:flex; gap:8px; margin-top:14px;"><button class="sb-pill ghost" id="customSplitRest" type="button">Split the rest equally</button></div>');
    }
    else if (state.method === 'itemized') {
      modePanel.innerHTML = '<div class="sb-people" data-itembreakdown>' + inc.map(p =>
        '<div class="sb-person" data-id="' + p.id + '">' +
          '<div class="sb-avatar" style="' + avStyle(p) + '" aria-hidden="true">' + initials(p) + '</div>' +
          '<div class="sb-person-main"><div class="sb-person-name" style="font-weight:500;color:var(--ink);font-size:15.5px;">' + escAttr(displayName(p)) + '</div>' +
          '<div class="sb-person-sub">their share</div></div>' +
          '<div class="sb-modeval"><span class="computed" data-computed="' + p.id + '">' + fmt(0) + '</span></div>' +
        '</div>'
      ).join('') + '</div>';
    }
    $('#itemsCard').style.display = state.method === 'itemized' ? '' : 'none';
  }

  // ---------- Render: items ----------
  const itemsList = $('#itemsList');
  function renderItems() {
    if (!state.items.length) {
      itemsList.innerHTML = '<div class="sb-empty"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg></div><p>No items yet. Add the things on the receipt and tap who shared each one.</p></div>';
      return;
    }
    const inc = included();
    itemsList.innerHTML = state.items.map((it, idx) => {
      const chips = inc.map(p => {
        const on = (it.assignees || []).indexOf(p.id) >= 0;
        return '<button class="sb-chip ' + (on ? 'on' : '') + '" type="button" data-itemassign="' + it.id + '" data-pid="' + p.id + '" aria-pressed="' + on + '">' +
          '<span class="av" style="' + avStyle(p) + '">' + initials(p) + '</span>' + escAttr(displayName(p)) +
          '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6 9 17l-5-5"/></svg></button>';
      }).join('');
      return '<div class="sb-item" data-id="' + it.id + '">' +
        '<div class="sb-item-top">' +
          '<input class="sb-input" type="text" value="' + escAttr(it.name) + '" placeholder="Item name" data-itemname="' + it.id + '" aria-label="Item name" />' +
          '<div class="sb-amount"><span class="cur sb-cur">' + curMeta().sym + '</span><input class="sb-input num" type="text" inputmode="decimal" value="' + escAttr(it.price) + '" placeholder="0" data-itemprice="' + it.id + '" aria-label="Item price" /></div>' +
          '<button class="sb-iconbtn danger" type="button" data-act="delitem" data-id="' + it.id + '" title="Remove item" aria-label="Remove item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>' +
        '</div>' +
        '<div class="sb-item-assign">' + (inc.length ? chips : '<span class="sb-hint">Add people first.</span>') + '</div>' +
        '<div class="sb-item-foot" data-itemfoot="' + it.id + '"></div>' +
      '</div>';
    }).join('');
  }

  // ---------- Render: paidBy ----------
  function renderPaidBy() {
    const sel = $('#paidBy'); if (!sel) return;
    const cur = state.paidBy;
    const inc = included();
    sel.innerHTML = '<option value="">No one yet — just split</option>' +
      inc.map(p => '<option value="' + p.id + '">' + escAttr(displayName(p)) + '</option>').join('');
    if (cur && inc.some(p => p.id === cur)) sel.value = cur; else { sel.value = ''; state.paidBy = ''; }
  }

  // ---------- Refresh (recompute + update text only) ----------
  function refresh() {
    const r = compute();
    const inc = included();

    // person owe sub-text
    state.people.forEach(p => {
      const el = peopleList.querySelector('[data-owe="' + p.id + '"]');
      if (el) el.textContent = p.included ? fmt(r.shares[p.id] || 0) : 'excluded';
    });

    // mode panel computed
    if (state.method === 'equal') {
      const each = inc.length ? (r.extra.each || 0) : 0;
      setEq('people', inc.length); setEq('total', fmt(r.total)); setEq('each', fmt(each));
      const noteEl = modePanel.querySelector('[data-eq="note"]');
      if (noteEl) { if (r.note) { noteEl.style.display = ''; noteEl.className = 'sb-status neutral'; noteEl.textContent = r.note; } else noteEl.style.display = 'none'; }
    } else if (state.method === 'custom' || state.method === 'itemized') {
      inc.forEach(p => { const el = modePanel.querySelector('[data-computed="' + p.id + '"]'); if (el) el.textContent = fmt(r.shares[p.id] || 0); });
    } else if (state.method === 'percentage') {
      inc.forEach(p => { const el = modePanel.querySelector('[data-computed="' + p.id + '"]'); if (el) el.textContent = fmt(r.shares[p.id] || 0); });
      const tEl = modePanel.querySelector('[data-pcttotal]');
      if (tEl) {
        const sum = round(r.extra.pctSum || 0); const d = round(sum - 100);
        tEl.className = 'sb-status ' + (Math.abs(d) < 0.01 ? 'ok' : (d < 0 ? 'warn' : 'bad'));
        tEl.innerHTML = statusIcon(Math.abs(d) < 0.01 ? 'ok' : 'warn') + '<span>' + sum + '% assigned' + (Math.abs(d) < 0.01 ? ' — balanced.' : (d < 0 ? ' · ' + round(-d) + '% left.' : ' · ' + round(d) + '% over.')) + '</span>';
      }
    }

    // item foots
    if (state.method === 'itemized') {
      state.items.forEach(it => {
        const foot = itemsList && itemsList.querySelector('[data-itemfoot="' + it.id + '"]'); if (!foot) return;
        const price = parseNum(it.price) * (parseNum(it.qty) || 1);
        const who = (it.assignees || []).filter(id => { const pp = personById(id); return pp && pp.included; });
        if (price > 0 && who.length === 0) {
          foot.innerHTML = '<span class="sb-item-flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>Not assigned to anyone</span><span></span>';
          it._un = true; const card = itemsList.querySelector('.sb-item[data-id="' + it.id + '"]'); if (card) card.classList.add('unassigned');
        } else {
          const ea = who.length ? fmt(price / who.length) : fmt(0);
          foot.innerHTML = '<span>' + (who.length ? who.length + ' ' + (who.length === 1 ? 'person' : 'people') : 'unassigned') + '</span>' + (who.length ? '<span class="ea">' + ea + ' each</span>' : '<span></span>');
          const card = itemsList.querySelector('.sb-item[data-id="' + it.id + '"]'); if (card) card.classList.remove('unassigned');
        }
      });
    }

    // summary
    $('#sumTotal').textContent = fmt(r.total);
    $('#sumAllocated').textContent = fmt(r.allocated);
    const remEl = $('#sumRemaining'); remEl.textContent = fmt(Math.abs(r.remaining) < 0.005 ? 0 : r.remaining);
    remEl.className = 'v' + (Math.abs(r.remaining) < 0.005 ? ' muted' : '');
    $('#sumPeople').textContent = inc.length;
    $('#summaryMeta').textContent = state.method.charAt(0).toUpperCase() + state.method.slice(1) + ' split' + (state.bill.name ? ' · ' + state.bill.name : '');

    const pctDone = r.total > 0 ? Math.max(0, Math.min(1, r.allocated / r.total)) : 0;
    const prog = $('#sumProgress'); prog.className = 'sb-progress ' + r.status;
    prog.firstElementChild.style.width = (pctDone * 100) + '%';

    const st = $('#sumStatus'); st.className = 'sb-status ' + r.status;
    st.innerHTML = statusIcon(r.status) + '<span id="sumStatusText">' + (r.sText || '') + '</span>';

    renderSettlement(r);
    refreshMobileBar(r);
    lastResult = r;
    save();
    return r;
  }
  let lastResult = null;
  function setEq(k, v) { const el = modePanel.querySelector('[data-eq="' + k + '"]'); if (el) el.textContent = v; }
  function statusIcon(s) {
    if (s === 'ok') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>';
    if (s === 'bad') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';
    if (s === 'warn') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>';
  }

  // ---------- Settlement ----------
  function renderSettlement(r) {
    const list = $('#settleList'); const inc = included();
    if (!inc.length || r.total <= 0) {
      list.innerHTML = '<div class="sb-settle-empty">Add people and a total to see who pays whom.</div>'; return;
    }
    const payer = state.paidBy ? personById(state.paidBy) : null;
    if (payer && payer.included) {
      const rows = inc.filter(p => p.id !== payer.id && r.shares[p.id] > 0.005).map(p => {
        const amt = r.shares[p.id];
        const line = displayName(p) + ' owes ' + displayName(payer) + ' ' + fmt(amt);
        return settleRow(p, '<span class="who">' + escAttr(displayName(p)) + ' owes ' + escAttr(displayName(payer)) + '</span> <span class="amt">' + fmt(amt) + '</span>', line, p.paid);
      }).join('');
      const payerLine = '<div class="sb-settle-row"><div class="sb-avatar" style="' + avStyle(payer) + '">' + initials(payer) + '</div><div class="sb-settle-text"><span class="who">' + escAttr(displayName(payer)) + ' paid the bill ·</span> <span class="amt">' + fmt(r.total) + '</span></div></div>';
      list.innerHTML = payerLine + (rows || '<div class="sb-settle-empty">Everyone else is settled.</div>');
    } else {
      list.innerHTML = inc.map(p => {
        const line = displayName(p) + '\u2019s share: ' + fmt(r.shares[p.id] || 0);
        return settleRow(p, '<span class="who">' + escAttr(displayName(p)) + '\u2019s share</span> <span class="amt">' + fmt(r.shares[p.id] || 0) + '</span>', line, p.paid);
      }).join('');
    }
  }
  function settleRow(p, html, copyText, paid) {
    return '<div class="sb-settle-row' + (paid ? ' paid' : '') + '">' +
      '<div class="sb-avatar" style="' + avStyle(p) + '" aria-hidden="true">' + initials(p) + '</div>' +
      '<div class="sb-settle-text">' + html + '</div>' +
      '<button class="sb-iconbtn sb-settle-copy" type="button" data-copyline="' + escAttr(copyText) + '" title="Copy" aria-label="Copy this line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>' +
    '</div>';
  }

  // ---------- Mobile bar ----------
  function refreshMobileBar(r) {
    $('#mbAllocated').textContent = fmt(r.allocated);
    $('#mbTotal').textContent = fmt(r.total);
    $('#mbStatusText').textContent = r.sText || '';
    $('#mbDot').className = 'dotstatus ' + r.status;
    const inner = $('#mobileBarInner');
    inner.innerHTML =
      '<div class="sb-sumrow total"><span class="k">Total to split</span><span class="v">' + fmt(r.total) + '</span></div>' +
      '<div class="sb-sumrow"><span class="k">Allocated</span><span class="v">' + fmt(r.allocated) + '</span></div>' +
      '<div class="sb-sumrow"><span class="k">Remaining</span><span class="v">' + fmt(Math.abs(r.remaining) < 0.005 ? 0 : r.remaining) + '</span></div>' +
      '<div class="sb-sumrow"><span class="k">People included</span><span class="v">' + included().length + '</span></div>' +
      '<div class="sb-status ' + r.status + '" style="margin-top:14px;">' + statusIcon(r.status) + '<span>' + (r.sText || '') + '</span></div>' +
      '<div class="sb-summary-actions"><button class="sb-pill ghost" type="button" id="mbCopy" style="justify-content:center;">Copy results</button></div>';
    const mb = $('#mbCopy'); if (mb) mb.addEventListener('click', () => copyResults());
  }

  // ---------- Summary text (copy / download) ----------
  function summaryText() {
    const r = lastResult || compute(); const inc = included(); const b = state.bill;
    const L = [];
    L.push((b.name || 'Split bill').trim());
    if (b.date) L.push(b.date);
    L.push('Total to split: ' + fmt(r.total) + ' · ' + state.method + ' split');
    L.push('');
    const payer = state.paidBy ? personById(state.paidBy) : null;
    if (payer && payer.included) {
      L.push(displayName(payer) + ' paid ' + fmt(r.total) + '.');
      inc.filter(p => p.id !== payer.id && r.shares[p.id] > 0.005).forEach(p => {
        L.push('• ' + displayName(p) + ' owes ' + displayName(payer) + ' ' + fmt(r.shares[p.id]) + (p.paid ? '  (settled)' : ''));
      });
    } else {
      inc.forEach(p => L.push('• ' + displayName(p) + ': ' + fmt(r.shares[p.id] || 0) + (p.paid ? '  (settled)' : '')));
    }
    if (r.status !== 'ok' && r.sText) { L.push(''); L.push('Note: ' + r.sText); }
    L.push(''); L.push('Split with A Curious Note · Split Bill');
    return L.join('\n');
  }
  function copyText(text, msg) {
    const done = () => window.showToast && window.showToast(msg || 'Copied to clipboard.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); cb && cb();
  }
  function copyResults() {
    const r = lastResult || compute();
    if (r.total <= 0) { window.showToast && window.showToast('Add a total first.'); return; }
    copyText(summaryText(), 'Copyable summary ready — copied.');
  }

  // ===================== EVENTS =====================
  function bindBill() {
    const map = { billName: 'name', billTotal: 'total', billNote: 'note', billDate: 'date', adjTax: 'tax', adjTip: 'tip', adjService: 'service', adjDiscount: 'discount' };
    Object.keys(map).forEach(id => {
      const el = $('#' + id); if (!el) return;
      el.addEventListener('input', () => { state.bill[map[id]] = el.value; if (id === 'adjDiscount' || id === 'adjTax' || id === 'adjTip' || id === 'adjService') checkAdjWarn(); refresh(); });
    });
    // currency
    $('#billCurrency').value = state.bill.currency;
    $('#billCurrency').addEventListener('change', () => { state.bill.currency = $('#billCurrency').value; updateCurrencyChrome(); renderModePanel(); renderItems(); refresh(); });
    // adjustments toggle
    const at = $('#adjustToggle'), ab = $('#adjustBody');
    at.addEventListener('click', () => { const open = at.getAttribute('aria-expanded') === 'true'; at.setAttribute('aria-expanded', String(!open)); ab.hidden = open; });
    if (parseNum(state.bill.tax) || parseNum(state.bill.tip) || parseNum(state.bill.service) || parseNum(state.bill.discount)) { at.setAttribute('aria-expanded', 'true'); ab.hidden = false; }
  }
  function checkAdjWarn() {
    const g = grandTotal(); const w = $('#adjWarn'); if (!w) return;
    if (g.total < -0.005) { w.style.display = 'flex'; w.innerHTML = statusIcon('warn') + '<span>Discount is larger than the bill. The total is treated as ' + fmt(0) + '.</span>'; }
    else if (parseNum(state.bill.discount) < 0) { w.style.display = 'flex'; w.innerHTML = statusIcon('warn') + '<span>This discount is negative, so it adds to the total.</span>'; }
    else w.style.display = 'none';
  }
  function updateCurrencyChrome() {
    const sym = curMeta().sym;
    $('#curPrefix').textContent = sym;
    $$('.sb-cur').forEach(e => e.textContent = sym);
  }

  // People interactions (delegated)
  peopleList.addEventListener('input', e => {
    const nm = e.target.getAttribute && e.target.getAttribute('data-name');
    if (nm) { const p = personById(nm); if (p) { p.name = e.target.value; const av = peopleList.querySelector('[data-av="' + nm + '"]'); if (av) av.textContent = initials(p); refresh(); } }
  });
  peopleList.addEventListener('click', e => {
    const btn = e.target.closest('.sb-iconbtn'); if (!btn) return;
    const act = btn.dataset.act, id = btn.dataset.id, p = personById(id); if (!p) return;
    if (act === 'inc') { p.included = !p.included; structuralRender(); }
    else if (act === 'paid') { p.paid = !p.paid; structuralRender(); }
    else if (act === 'dup') {
      if (state.people.length >= 20) { window.showToast && window.showToast('That\u2019s the max of 20 people.'); return; }
      const ci = nextColor(); state.people.splice(state.people.indexOf(p) + 1, 0, { id: uid('p'), name: p.name ? p.name + ' (2)' : '', contact: p.contact, included: true, paid: false, ci });
      structuralRender();
    }
    else if (act === 'del') {
      if (state.people.length <= 1) { window.showToast && window.showToast('Keep at least one person.'); return; }
      delete state.custom[id]; delete state.percentage[id]; delete state.locks[id];
      state.items.forEach(it => { it.assignees = (it.assignees || []).filter(x => x !== id); });
      state.people = state.people.filter(x => x.id !== id);
      structuralRender();
    }
  });
  function nextColor() { const used = state.people.map(p => p.ci); for (let i = 0; i < AV.length; i++) if (used.indexOf(i) < 0) return i; return state.people.length % AV.length; }

  $('#addPerson').addEventListener('click', () => {
    if (state.people.length >= 20) { window.showToast && window.showToast('That\u2019s the max of 20 people.'); return; }
    state.people.push({ id: uid('p'), name: '', contact: '', included: true, paid: false, ci: nextColor() });
    structuralRender();
    const last = peopleList.querySelector('.sb-person:last-child input[data-name]'); if (last) last.focus();
  });
  $('#clearPeople').addEventListener('click', () => {
    state.people = [{ id: uid('p'), name: '', contact: '', included: true, paid: false, ci: 0 }];
    state.custom = {}; state.percentage = {}; state.locks = {}; state.paidBy = '';
    state.items.forEach(it => it.assignees = []);
    structuralRender(); window.showToast && window.showToast('Cleared everyone but one.');
  });
  $('#invitePerson').addEventListener('click', () => {
    copyText(location.href.split('#')[0] + '#join', 'Invite link copied — share it with your group.');
  });

  // Mode tabs
  $('#modeTabs').addEventListener('click', e => {
    const t = e.target.closest('.sb-mode'); if (!t) return;
    setMode(t.dataset.mode);
  });
  function setMode(m) {
    state.method = m;
    applyAccent(m);
    $$('#modeTabs .sb-mode').forEach(b => { const on = b.dataset.mode === m; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
    // seed sensible defaults
    const inc = included();
    if (m === 'percentage' && inc.every(p => !state.percentage[p.id])) { const eq = round(100 / inc.length * 100) / 100; inc.forEach((p, i) => state.percentage[p.id] = String(i === inc.length - 1 ? round(100 - eq * (inc.length - 1)) : eq)); }
    renderModePanel(); renderItems(); refresh();
  }

  // Mode panel inputs (custom / percentage / lock)
  modePanel.addEventListener('input', e => {
    const c = e.target.getAttribute && e.target.getAttribute('data-custom');
    const pc = e.target.getAttribute && e.target.getAttribute('data-pct');
    if (c) { state.custom[c] = e.target.value; refresh(); }
    else if (pc) { state.percentage[pc] = e.target.value; refresh(); }
  });
  modePanel.addEventListener('click', e => {
    const lock = e.target.closest('[data-act="lock"]');
    if (lock) { const id = lock.dataset.id; state.locks[id] = !state.locks[id]; renderModePanel(); refresh(); return; }
    if (e.target.id === 'customSplitRest') {
      const r = compute(); const inc = included();
      const unset = inc.filter(p => !parseNum(state.custom[p.id]));
      const targets = unset.length ? unset : inc;
      const assigned = inc.reduce((s, p) => s + (unset.length && unset.indexOf(p) >= 0 ? 0 : parseNum(state.custom[p.id])), 0);
      const rest = Math.max(0, round(r.total - assigned));
      const parts = splitEqual(rest, targets.length);
      targets.forEach((p, i) => state.custom[p.id] = String(parts[i]));
      renderModePanel(); refresh();
    }
  });

  // Items
  $('#addItem').addEventListener('click', () => {
    state.items.push({ id: uid('i'), name: '', price: '', qty: 1, assignees: included().map(p => p.id) });
    renderItems(); refresh();
    const last = itemsList.querySelector('.sb-item:last-child input[data-itemname]'); if (last) last.focus();
  });
  itemsList.addEventListener('input', e => {
    const nm = e.target.getAttribute('data-itemname'), pr = e.target.getAttribute('data-itemprice');
    if (nm) { const it = state.items.find(x => x.id === nm); if (it) { it.name = e.target.value; } refresh(); }
    else if (pr) { const it = state.items.find(x => x.id === pr); if (it) { it.price = e.target.value; } refresh(); }
  });
  itemsList.addEventListener('click', e => {
    const del = e.target.closest('[data-act="delitem"]');
    if (del) { state.items = state.items.filter(x => x.id !== del.dataset.id); renderItems(); refresh(); return; }
    const chip = e.target.closest('[data-itemassign]');
    if (chip) {
      const it = state.items.find(x => x.id === chip.dataset.itemassign); if (!it) return;
      it.assignees = it.assignees || [];
      const i = it.assignees.indexOf(chip.dataset.pid);
      if (i >= 0) it.assignees.splice(i, 1); else it.assignees.push(chip.dataset.pid);
      chip.classList.toggle('on'); chip.setAttribute('aria-pressed', String(i < 0));
      refresh();
    }
  });
  $('#taxtipMode').addEventListener('click', e => {
    const b = e.target.closest('button[data-tt]'); if (!b) return;
    state.taxtip = b.dataset.tt;
    $$('#taxtipMode button').forEach(x => x.classList.toggle('active', x === b));
    refresh();
  });

  // Settlement
  $('#paidBy').addEventListener('change', () => { state.paidBy = $('#paidBy').value; refresh(); });
  $('#settleList').addEventListener('click', e => {
    const c = e.target.closest('[data-copyline]'); if (c) copyText(c.dataset.copyline, 'Line copied.');
  });

  // Summary actions
  $('#createSummary').addEventListener('click', () => doSummary());
  $('#mbCreate').addEventListener('click', () => doSummary());
  $('#copyResults').addEventListener('click', () => copyResults());
  function doSummary() {
    const r = lastResult || compute();
    if (r.total <= 0) { window.showToast && window.showToast('Add a total to begin.'); return; }
    if (!included().length) { window.showToast && window.showToast('Add at least one person.'); return; }
    copyText(summaryText(), r.valid ? 'Summary copied — ready to share.' : 'Summary copied (still unbalanced).');
  }
  $('#shareLink').addEventListener('click', () => copyText(location.href.split('#')[0], 'Share link copied.'));
  $('#downloadSummary').addEventListener('click', () => {
    const blob = new Blob([summaryText()], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = ((state.bill.name || 'split-bill').trim().replace(/[^\w]+/g, '-').toLowerCase()) + '.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    window.showToast && window.showToast('Summary downloaded.');
  });

  // Reset modal
  const modal = $('#resetModal');
  $('#resetAll').addEventListener('click', () => modal.classList.add('open'));
  $$('[data-reset-close]').forEach(el => el.addEventListener('click', () => modal.classList.remove('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) modal.classList.remove('open'); });
  $('#resetConfirm').addEventListener('click', () => {
    state = defaultState(); pcounter = 0;
    try { localStorage.removeItem(KEY); } catch (e) {}
    modal.classList.remove('open');
    hydrateBill(); structuralRender();
    window.showToast && window.showToast('Fresh start. Everything reset.');
  });

  // Mobile bar expand
  const mb = $('#mobileBar'); const mbToggle = $('#mobileBarToggle');
  mbToggle.addEventListener('click', () => { const open = mb.classList.toggle('expanded'); mbToggle.setAttribute('aria-expanded', String(open)); });

  // ---------- Hydrate + render ----------
  function hydrateBill() {
    $('#billName').value = state.bill.name || '';
    $('#billTotal').value = state.bill.total || '';
    $('#billNote').value = state.bill.note || '';
    $('#billDate').value = state.bill.date || '';
    $('#billCurrency').value = state.bill.currency || 'IDR';
    $('#adjTax').value = state.bill.tax || ''; $('#adjTip').value = state.bill.tip || '';
    $('#adjService').value = state.bill.service || ''; $('#adjDiscount').value = state.bill.discount || '';
    $$('#taxtipMode button').forEach(x => x.classList.toggle('active', x.dataset.tt === state.taxtip));
    updateCurrencyChrome(); checkAdjWarn();
  }
  function structuralRender() { renderPeople(); renderModePanel(); renderItems(); refresh(); }

  function init() {
    hydrateBill();
    applyAccent(state.method);
    // ensure color indices
    state.people.forEach((p, i) => { if (typeof p.ci !== 'number') p.ci = i % AV.length; });
    $$('#modeTabs .sb-mode').forEach(b => { const on = b.dataset.mode === state.method; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
    bindBill();
    structuralRender();
  }
  init();
})();
