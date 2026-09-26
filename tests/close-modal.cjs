// Browser-free smoke test for the video modal close handlers (critical fix).
// Runs the REAL js/app.js inside jsdom and proves that:
//   1. the X button closes the modal on `click` AND on `touchend`,
//   2. the backdrop (outside empty space) closes it on click/touchend,
//   3. an overlay-level tap closes it (e.target === overlay safety net),
//   4. taps inside the modal card never close it,
//   5. page scrolling is locked while open and restored on close,
//   6. closing pauses the video and rewinds it to 0.
// It also (optionally, via --regression-check) runs the same flow against the
// pre-fix app.js and asserts that the old bug (ReferenceError: video is not
// defined) left the modal stuck open — i.e. this test really catches it.
const { JSDOM, VirtualConsole } = require("jsdom");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const regressionCheck = process.argv.includes("--regression-check");
const appSourcePath = regressionCheck
  ? path.join(__dirname, ".app-regression.js")
  : path.join(__dirname, "..", "js", "app.js");
const appSource = fs.readFileSync(appSourcePath, "utf8");

const pageErrors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (e) => pageErrors.push(String(e.detail?.message || e.message)));
virtualConsole.on("error", (...a) => pageErrors.push(a.join(" ")));
virtualConsole.on("log", () => {});
virtualConsole.on("warn", () => {});

const dom = new JSDOM('<!doctype html><html lang="fr"><body class="menu-page"><div id="app"></div></body></html>', {
  url: "http://localhost:8000/index.html", // menu route, not staff-scan
  pretendToBeVisual: true, // provides requestAnimationFrame for the reveal
  runScripts: "dangerously", // execute js/app.js in the jsdom realm
  virtualConsole,
});
const { window } = dom;
const { document } = window;

// --- Stubs for CDN scripts and media APIs (mirrors tests/browser.cjs) -------
window.lucide = { createIcons() {} };
window.supabase = {
  createClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }) }),
};

const mediaCalls = [];
const currentTimeWrites = [];
const mediaProto = window.HTMLMediaElement.prototype;
mediaProto.play = function () { mediaCalls.push("play"); return Promise.resolve(); };
mediaProto.pause = function () { mediaCalls.push("pause"); };
mediaProto.load = function () { mediaCalls.push("load"); };
Object.defineProperty(mediaProto, "currentTime", {
  get() { return this._jtTime || 0; },
  set(v) { currentTimeWrites.push(v); this._jtTime = v; },
  configurable: true,
});

// --- Boot the real app -------------------------------------------------------
window.eval(appSource);

function modalEl() {
  return document.getElementById("video-modal") || document.querySelector(".video-modal");
}
async function openModal() {
  const card = document.querySelector(".video-card");
  assert.ok(card, "a video card is rendered");
  card.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.ok(modalEl(), "tapping a video card opens the modal");
  assert.ok(modalEl().querySelector(".modal-video"), "the modal hosts the video");
  // The reveal class is dropped on the next animation frame.
  await new Promise((r) => setTimeout(r, 30));
  assert.ok(!modalEl().classList.contains("is-entering"), "the reveal is released after open");
  return modalEl();
}
function closeModalAndAssert(gone) {
  const detached = !modalEl();
  assert.equal(detached, gone, gone ? "the modal is fully removed" : "the modal stayed open");
  return detached;
}

async function main() {
// --- 1. X button: click + touchend ------------------------------------------
let overlay = await openModal();
if (!regressionCheck) {
  assert.equal(document.body.style.overflow, "hidden", "opening locks page scrolling");
}
overlay.querySelector(".modal-close").dispatchEvent(new window.Event("click", { bubbles: true }));

if (regressionCheck) {
  // Expected against the pre-fix code: the close handler throws
  // `ReferenceError: video is not defined` and the modal stays stuck open.
  assert.ok(
    pageErrors.some((m) => /video is not defined/.test(m)),
    "the pre-fix code throws ReferenceError: video is not defined on close",
  );
  closeModalAndAssert(false); // the modal is still there — the reported bug
  console.log("REGRESSION CHECK PASSED: pre-fix code throws and leaves the modal stuck open");
  window.close();
  return;
}

closeModalAndAssert(true);
assert.equal(document.body.style.overflow, "", "close restores page scrolling");
assert.ok(mediaCalls.includes("pause"), "closing pauses the video");
assert.deepEqual(currentTimeWrites.slice(-1), [0], "closing rewinds the video to 0");

overlay = await openModal();
overlay.querySelector(".modal-close").dispatchEvent(
  new window.Event("touchend", { bubbles: true, cancelable: true })
);
closeModalAndAssert(true);

// --- 2. Backdrop (outside empty space): click + touchend --------------------
overlay = await openModal();
overlay.querySelector(".modal-bg").dispatchEvent(new window.Event("click", { bubbles: true }));
closeModalAndAssert(true);

overlay = await openModal();
overlay.querySelector(".modal-bg").dispatchEvent(
  new window.Event("touchend", { bubbles: true, cancelable: true })
);
closeModalAndAssert(true);

// --- 3. Overlay-level tap safety net ----------------------------------------
overlay = await openModal();
overlay.dispatchEvent(new window.Event("click", { bubbles: false })); // target === overlay
closeModalAndAssert(true);

// --- 4. Interacting inside the card must NOT close --------------------------
overlay = await openModal();
const heading = overlay.querySelector(".modal-card h2");
heading.dispatchEvent(new window.Event("click", { bubbles: true }));
assert.ok(modalEl(), "a click inside the modal card does not close the modal");
overlay.querySelector(".modal-close").dispatchEvent(new window.Event("click", { bubbles: true }));
closeModalAndAssert(true);

if (regressionCheck) {
  console.log("REGRESSION CHECK PASSED");
} else {
  assert.deepEqual(
    pageErrors.filter((m) => /not defined|TypeError/.test(m)),
    [],
    "no uncaught errors while exercising the close paths",
  );
  console.log("VIDEO MODAL CLOSE FIX PASSED:");
  console.log("  - X button closes on click and touchend");
  console.log("  - backdrop closes on click and touchend");
  console.log("  - overlay-level tap closes (e.target === overlay)");
  console.log("  - clicks inside the card keep the modal open");
  console.log("  - page scroll locked while open, restored on close");
  console.log("  - closing pauses and rewinds the video");
}
}
main().then(() => window.close()).catch((e) => { console.error(e); window.close(); process.exit(1); });
