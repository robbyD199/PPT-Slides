/* eslint-disable no-undef */
/**
 * Talks to the task pane inside PowerPoint via the WebView2 DevTools protocol (test instance started
 * with --remote-debugging-port). Usage:
 *   node scripts/selftest/cdp.js <port> <outDir> [action ...]
 * actions: info | shot:<file.png> | click:<aria-label> | eval:<js> | search:<query> | menu
 */
const fs = require("fs");
const path = require("path");

const [port, outDir, ...actions] = process.argv.slice(2);

async function targets() {
  const res = await fetch(`http://127.0.0.1:${port}/json`);
  return res.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };
    ws.onerror = reject;
    ws.onopen = () =>
      resolve({
        send(method, params = {}) {
          return new Promise((res) => {
            const i = ++id;
            pending.set(i, res);
            ws.send(JSON.stringify({ id: i, method, params }));
          });
        },
        close: () => ws.close(),
      });
  });
}

async function evaluate(c, expr) {
  const r = await c.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result && r.result.exceptionDetails) return { error: r.result.exceptionDetails.text };
  return r.result && r.result.result ? r.result.result.value : r;
}

(async () => {
  let t = null;
  for (let i = 0; i < 40 && !t; i++) {
    try {
      const list = await targets();
      const re = new RegExp(process.env.CDP_TARGET || "taskpane\\.html");
      t = list.find((x) => re.test(x.url) && x.type === "page") || null;
    } catch {
      /* not up yet */
    }
    if (!t) await new Promise((r) => setTimeout(r, 1500));
  }
  if (!t) {
    console.log(JSON.stringify({ ok: false, error: "taskpane target not found" }));
    process.exit(2);
  }
  const c = await connect(t.webSocketDebuggerUrl);
  await c.send("Runtime.enable");
  const out = { url: t.url };
  for (const a of actions) {
    const [cmd, ...restParts] = a.split(":");
    const arg = restParts.join(":");
    if (cmd === "wait") {
      out.wait = await evaluate(
        c,
        `new Promise(r => { const t0 = Date.now(); const f = () => { const n = document.querySelectorAll('#content .card, #content .folder').length; if (n || Date.now() - t0 > 20000) r(n); else setTimeout(f, 300); }; f(); })`
      );
    } else if (cmd === "info") {
      out.info = await evaluate(
        c,
        `({ title: document.title, cards: document.querySelectorAll('#content .card').length, sections: [...document.querySelectorAll('.section-title')].map(e => e.textContent), banners: [...document.querySelectorAll('.banner')].map(e => e.textContent), footer: document.getElementById('footer').textContent, folders: [...document.querySelectorAll('.folder .folder-label')].map(e => e.textContent), crumbs: (document.getElementById('crumbs') || {}).textContent, width: innerWidth })`
      );
    } else if (cmd === "shot") {
      const r = await c.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      if (r.result && r.result.data) {
        fs.writeFileSync(path.join(outDir, arg), Buffer.from(r.result.data, "base64"));
        out[`shot_${arg}`] = "ok";
      } else out[`shot_${arg}`] = r.error || "failed";
    } else if (cmd === "click") {
      out[`click_${arg}`] = await evaluate(
        c,
        `(() => { const b = document.querySelector('[aria-label=${JSON.stringify(arg)}]'); if (!b) return 'not found'; b.scrollIntoView({block:'center'}); b.click(); return 'clicked'; })()`
      );
      await new Promise((r) => setTimeout(r, 2500));
      out[`toast_${arg}`] = await evaluate(c, `[...document.querySelectorAll('.toast-msg')].map(e => e.textContent).join(' | ')`);
    } else if (cmd === "search") {
      out[`search_${arg}`] = await evaluate(
        c,
        `(async () => { const i = document.getElementById('search-input'); i.value = ${JSON.stringify(arg)}; i.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 400)); return [...document.querySelectorAll('#content .card .card-title')].slice(0, 8).map(e => e.textContent); })()`
      );
    } else if (cmd === "clear") {
      await evaluate(c, `(() => { const i = document.getElementById('search-input'); i.value = ''; i.dispatchEvent(new Event('input')); })()`);
      await new Promise((r) => setTimeout(r, 400));
    } else if (cmd === "menu") {
      await evaluate(c, `document.getElementById('btn-menu').click()`);
      await new Promise((r) => setTimeout(r, 400));
    } else if (cmd === "eval") {
      out[`eval`] = await evaluate(c, arg);
    } else if (cmd === "sleep") {
      await new Promise((r) => setTimeout(r, Number(arg) || 1000));
    }
  }
  c.close();
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
})().catch((e) => {
  console.log(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
