import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outputRoot = join(root, "artifacts", "visual");
const layoutAuditRoot = join(outputRoot, "layout-audit");
const port = 3100;
const debugPort = 9223;
const baseUrl = `http://127.0.0.1:${port}`;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profilePath = mkdtempSync(join(tmpdir(), "bloom-demo-capture-"));

mkdirSync(outputRoot, { recursive: true });
mkdirSync(layoutAuditRoot, { recursive: true });

const server = spawn(process.execPath, [join(root, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(port)], {
  cwd: root,
  stdio: "ignore",
  windowsHide: true,
});

let chrome;

try {
  await waitForHttp(baseUrl);
  chrome = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profilePath}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true }
  );

  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`);
  const tab = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, {
    method: "PUT",
  }).then((response) => response.json());
  const cdp = await connectCdp(tab.webSocketDebuggerUrl);

  await cdp.call("Page.enable");
  await cdp.call("Runtime.enable");
  await cdp.call("Emulation.setDeviceMetricsOverride", {
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const brand of [
    { key: "sirena", storeId: "SIR-001", catalogPath: "/home" },
    { key: "aprezio", storeId: "APZ-001", catalogPath: "/products" },
  ]) {
    const destination = join(outputRoot, brand.key);
    mkdirSync(destination, { recursive: true });
    await navigate(cdp, `${baseUrl}/select-store`);
    await cdp.call("Runtime.evaluate", {
      expression: `localStorage.setItem("bloom-store-v2", ${JSON.stringify(JSON.stringify(seedState(brand.storeId)))})`,
    });

    const screens = [
      ["01-welcome", "/"],
      ["02-language", "/language"],
      ["03-catalog", brand.catalogPath],
      ["04-rescue", "/rescue"],
      ["05-basket", "/basket/result"],
      ["06-route", "/route"],
      ["07-closing", "/thanks"],
    ];

    for (const [name, pathname] of screens) {
      await navigate(cdp, `${baseUrl}${pathname}`);
      await delay(pathname === "/route" ? 1800 : 1100);
      await assertNoPageOverflow(cdp, `${brand.key}${pathname}`);
      const result = await cdp.call("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      writeFileSync(join(destination, `${name}.png`), Buffer.from(result.data, "base64"));
    }

    await navigate(cdp, `${baseUrl}/products`);
    await delay(550);
    const menuOpened = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const trigger = document.querySelector('[aria-controls="app-navigation-drawer"]');
        if (!(trigger instanceof HTMLButtonElement)) return false;
        trigger.click();
        return true;
      })()`,
      returnByValue: true,
    });
    if (!menuOpened.result.value) throw new Error(`Menu trigger unavailable for ${brand.key}`);
    await delay(250);
    const drawerVisible = await cdp.call("Runtime.evaluate", {
      expression: "Boolean(document.getElementById('app-navigation-drawer'))",
      returnByValue: true,
    });
    if (!drawerVisible.result.value) throw new Error(`Menu drawer did not open for ${brand.key}`);
    const menuCapture = await cdp.call("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    writeFileSync(join(layoutAuditRoot, `${brand.key}-menu-open.png`), Buffer.from(menuCapture.data, "base64"));
    await cdp.call("Runtime.evaluate", {
      expression: "document.querySelector('#app-navigation-drawer button')?.click()",
    });
    await delay(150);
    const drawerClosed = await cdp.call("Runtime.evaluate", {
      expression: "!document.getElementById('app-navigation-drawer')",
      returnByValue: true,
    });
    if (!drawerClosed.result.value) throw new Error(`Menu drawer did not close for ${brand.key}`);

    await navigate(cdp, `${baseUrl}/basket/start`);
    await delay(1100);
    await assertNoPageOverflow(cdp, `${brand.key}/basket/start`);
    const basketStartCapture = await cdp.call("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    writeFileSync(join(layoutAuditRoot, `${brand.key}-basket-start.png`), Buffer.from(basketStartCapture.data, "base64"));

    for (const layoutCase of [
      { key: "large-text", width: 768, height: 1024 },
      { key: "mobile-large-text", width: 390, height: 844 },
    ]) {
      const layoutState = seedState(brand.storeId);
      layoutState.state.accessibility.largeText = true;
      await cdp.call("Emulation.setDeviceMetricsOverride", {
        width: layoutCase.width,
        height: layoutCase.height,
        deviceScaleFactor: 1,
        mobile: layoutCase.width < 640,
      });
      await navigate(cdp, `${baseUrl}/select-store`);
      await cdp.call("Runtime.evaluate", {
        expression: `localStorage.setItem("bloom-store-v2", ${JSON.stringify(JSON.stringify(layoutState))})`,
      });
      await navigate(cdp, `${baseUrl}/basket/start`);
      await delay(550);
      await assertNoPageOverflow(cdp, `${brand.key}/basket/start (${layoutCase.key})`);
      const layoutCapture = await cdp.call("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      writeFileSync(
        join(layoutAuditRoot, `${brand.key}-basket-start-${layoutCase.key}.png`),
        Buffer.from(layoutCapture.data, "base64")
      );
    }

    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const englishState = seedState(brand.storeId);
    englishState.state.language = "en";
    await cdp.call("Runtime.evaluate", {
      expression: `localStorage.setItem("bloom-store-v2", ${JSON.stringify(JSON.stringify(englishState))})`,
    });
    for (const pathname of ["/language", "/home", "/products", "/basket/start", "/basket/result", "/rescue", "/route", "/checkout"]) {
      await navigate(cdp, `${baseUrl}${pathname}`);
      await delay(350);
      await assertNoPageOverflow(cdp, `${brand.key}${pathname} (English)`);
      const body = await cdp.call("Runtime.evaluate", { expression: "document.body.innerText", returnByValue: true });
      if (/Application error|Internal Server Error|Unhandled Runtime Error/i.test(body.result.value ?? "")) {
        throw new Error(`English smoke check failed for ${brand.key}${pathname}`);
      }
    }
  }

  cdp.close();
  process.stdout.write(`Captured 14 demo screens, 2 menu checks, 6 basket layout checks, and passed bilingual smoke checks in ${outputRoot}\n`);
} finally {
  await terminate(chrome);
  await terminate(server);
  try {
    rmSync(profilePath, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
  } catch (error) {
    process.stderr.write(`Temporary Chrome profile could not be removed: ${error.message}\n`);
  }
}

function seedState(storeId) {
  const sirena = storeId === "SIR-001";
  const price = (aprezio, sirenaPrice) => (sirena ? sirenaPrice : aprezio);
  const line = (sku, quantity, unitPrice) => ({
    id: `${sku}::normal`,
    sku,
    quantity,
    unitPrice,
    regularUnitPrice: unitPrice,
    isRescue: false,
    isBundle: false,
    manuallyAdded: false,
  });

  return {
    state: {
      storeId,
      language: "es",
      accessibility: {
        colorProfile: "none",
        highContrast: false,
        largeText: false,
        readAloud: false,
      },
      productFilters: { query: "", category: "", onlyAvailable: false, onlyPromo: false, onlyRescue: false },
      basketForm: {
        budget: 2500,
        people: 4,
        basketType: "comida_semanal",
        preferences: ["compra_balanceada"],
        restrictions: [],
        allergies: [],
      },
      lines: [
        line("CEBOLLA-ROJA-LB", 2, price(60, 62)),
        line("PLATANO-UN", 6, price(20, 22)),
        line("TOMATE-LB", 2, price(47, 49)),
        line("POLLO-ENTERO-LB", 5, price(89, 94)),
        line("PIMCO-ARROZ-10LB", 1, price(449, 469)),
        line("WALA-AZUCAR-5LB", 1, price(157, 164)),
      ],
      basketExplanations: [
        "Cantidades calculadas para preparar comidas para cuatro personas.",
        "Selección equilibrada entre proteína, vegetales y acompañamientos.",
      ],
      basketSavings: 76,
      hasManualBasketEdits: false,
      route: null,
      assistance: null,
      ticket: null,
      generatedBaskets: [],
      rescueAdditions: [],
      bundleAdditions: [],
    },
    version: 0,
  };
}

async function waitForHttp(url, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Service is still starting.
    }
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function navigate(cdp, url) {
  const loaded = cdp.waitFor("Page.loadEventFired", 15_000);
  await cdp.call("Page.navigate", { url });
  await loaded;
}

async function assertNoPageOverflow(cdp, label) {
  const metrics = await cdp.call("Runtime.evaluate", {
    expression: `JSON.stringify({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    })`,
    returnByValue: true,
  });
  const value = JSON.parse(metrics.result.value);
  const renderedWidth = Math.max(value.documentWidth, value.bodyWidth);
  if (renderedWidth > value.viewportWidth + 1) {
    throw new Error(`Horizontal page overflow on ${label}: ${renderedWidth}px rendered in ${value.viewportWidth}px`);
  }
}

function connectCdp(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    const listeners = new Map();
    let nextId = 1;

    socket.addEventListener("error", reject, { once: true });
    socket.addEventListener("open", () => {
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(String(event.data));
        if (message.id) {
          const waiter = pending.get(message.id);
          if (!waiter) return;
          pending.delete(message.id);
          if (message.error) waiter.reject(new Error(message.error.message));
          else waiter.resolve(message.result);
          return;
        }
        const queue = listeners.get(message.method);
        const waiter = queue?.shift();
        if (waiter) waiter(message.params);
      });

      resolve({
        call(method, params = {}) {
          const id = nextId++;
          return new Promise((callResolve, callReject) => {
            pending.set(id, { resolve: callResolve, reject: callReject });
            socket.send(JSON.stringify({ id, method, params }));
          });
        },
        waitFor(method, timeout = 15_000) {
          return new Promise((eventResolve, eventReject) => {
            const queue = listeners.get(method) ?? [];
            const timeoutId = setTimeout(() => eventReject(new Error(`Timed out waiting for ${method}`)), timeout);
            queue.push((params) => {
              clearTimeout(timeoutId);
              eventResolve(params);
            });
            listeners.set(method, queue);
          });
        },
        close() {
          socket.close();
        },
      });
    });
  });
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function terminate(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  const exited = new Promise((resolveExit) => child.once("exit", resolveExit));
  child.kill();
  await Promise.race([exited, delay(5000)]);
}
