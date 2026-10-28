(() => {
  const C = window.FORGE_CONFIG;
  const $ = (id) => document.getElementById(id);
  const names = Object.keys(C.agents);

  const state = {
    balance: C.startBalance,
    shown: C.startBalance,
    closed: [],
    byAgent: Object.fromEntries(names.map((n) => [n, 0])),
    i: 0,
  };

  const money = (v) =>
    "$" + (v >= 1000
      ? Math.round(v).toLocaleString("en-US")
      : v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const signed = (v) => (v >= 0 ? "+" : "-") + money(Math.abs(v));
  const clock = () => new Date().toTimeString().slice(0, 8);

  // ---------- balance counter ----------
  function tick() {
    const diff = state.balance - state.shown;
    if (Math.abs(diff) > 0.005) {
      state.shown += diff * 0.08;
      if (Math.abs(state.balance - state.shown) < 0.01) state.shown = state.balance;
      $("balance").textContent = money(state.shown);
      $("withdraw-amt").textContent = money(state.shown);
    }
    requestAnimationFrame(tick);
  }

  // ---------- render ----------
  function sparkline(pct) {
    const pts = [];
    let y = 16;
    const n = 14;
    for (let k = 0; k < n; k++) {
      const drift = (pct > 0 ? -1 : 0.7) * (k / n) * 12;
      y = 16 + drift + (Math.random() - 0.5) * 4;
      pts.push(`${(k / (n - 1)) * 100},${Math.max(2, Math.min(20, y)).toFixed(1)}`);
    }
    const col = pct >= 0 ? "#22a35a" : "#e5484d";
    return `<svg viewBox="0 0 100 22" preserveAspectRatio="none"><polyline fill="none" stroke="${col}" stroke-width="1.6" points="${pts.join(" ")}"/></svg>`;
  }

  function renderTrades() {
    const box = $("trades");
    box.innerHTML = "";
    state.closed.slice(0, 12).forEach((t, idx) => {
      const el = document.createElement("div");
      el.className = "trade" + (idx === 0 ? " fresh" : "");
      el.innerHTML = `
        <div class="tk">$${t.tk}</div>
        <div class="by"><span class="dot" style="background:${C.agents[t.agent].color}"></span>${t.agent}</div>
        <div class="pct ${t.pct >= 0 ? "pos" : "neg"}">${t.pct >= 0 ? "+" : ""}${t.pct}%</div>
        ${t.svg}`;
      box.appendChild(el);
    });
    $("trades-total").textContent = `${state.closed.length} total`;
  }

  function renderAgents() {
    const total = names.reduce((s, n) => s + Math.max(0, state.byAgent[n]), 0) || 1;
    $("agent-bar").innerHTML = names
      .map((n) => `<span style="width:${(Math.max(0, state.byAgent[n]) / total) * 100}%;background:${C.agents[n].color}"></span>`)
      .join("");
    $("agent-legend").innerHTML = names
      .map((n) => `<div class="agent"><div class="name"><span class="dot" style="background:${C.agents[n].color}"></span>${n}</div><div class="val">${signed(state.byAgent[n])}</div></div>`)
      .join("");
  }

  function renderStats() {
    const n = state.closed.length;
    const wins = state.closed.filter((t) => t.pct > 0).length;
    const profit = state.balance - C.startBalance;
    $("profit").textContent = `${signed(profit)} profit · from ${money(C.startBalance)}`;
    const mult = state.balance / C.startBalance;
    $("mult").textContent = (mult >= 100 ? Math.round(mult).toLocaleString("en-US") : mult.toFixed(1)) + "x";
    $("trades-meta").textContent = `${n} trade${n === 1 ? "" : "s"} · ${n ? Math.round((wins / n) * 100) : 0}% win`;
  }

  function log(agent, msg, cls = "") {
    const li = document.createElement("li");
    li.innerHTML = `<span class="t">${clock()}</span><span style="color:${C.agents[agent].color}">${agent}</span><span class="${cls}">${msg}</span>`;
    const ul = $("log");
    ul.prepend(li);
    while (ul.children.length > 10) ul.lastChild.remove();
  }

  let toastTimer;
  function toast(text) {
    const el = $("toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  // ---------- engine ----------
  function nextTrade() {
    if (state.i < C.trades.length) return C.trades[state.i++];
    return null;
  }

  function step() {
    const t = nextTrade();
    if (!t) {
      const a = names[Math.floor(Math.random() * names.length)];
      log(a, C.idle[Math.floor(Math.random() * C.idle.length)]);
      return;
    }
    const pnl = state.balance * C.allocation * (t.pct / 100);
    state.balance += pnl;
    state.byAgent[t.agent] += pnl;
    state.closed.unshift({ ...t, svg: sparkline(t.pct) });

    log(t.agent, `closed $${t.tk} ${t.pct >= 0 ? "+" : ""}${t.pct}%`, t.pct >= 0 ? "pos" : "neg");
    toast(`${t.pct >= 0 ? "+" : ""}${t.pct}% · $${t.tk} closed by ${t.agent}`);

    renderTrades();
    renderAgents();
    renderStats();

    // a bit of idle chatter between trades
    setTimeout(() => {
      const a = names[Math.floor(Math.random() * names.length)];
      log(a, C.idle[Math.floor(Math.random() * C.idle.length)]);
    }, C.interval / 2);
  }

  $("withdraw").addEventListener("click", () => toast(`Balance: ${money(state.balance)}`));

  renderAgents();
  renderStats();
  log("Scout", "scanning for runners");
  requestAnimationFrame(tick);
  setTimeout(step, 900);
  setInterval(step, C.interval);
})();
