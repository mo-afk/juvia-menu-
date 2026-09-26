// Browser-free check of the iOS Safari autoplay contract for the modal video.
// Runs the REAL js/app.js inside jsdom and proves that:
//   1. play() is requested synchronously inside the card tap gesture,
//   2. BEFORE play(): src, muted, defaultMuted, playsInline and the
//      playsinline / webkit-playsinline / muted attributes are all applied,
//   3. the video never carries native `controls` (markup or property),
//   4. when autoplay is blocked, a DOM fallback play button appears and a
//      tap on it retries play() — still without native controls,
//   5. the modal still closes via X click, backdrop click AND touchend.
const { JSDOM, VirtualConsole } = require("jsdom");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appSource = fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8");

const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", () => {});
virtualConsole.on("error", () => {});
virtualConsole.on("log", () => {});
virtualConsole.on("warn", () => {});

const dom = new JSDOM('<!doctype html><html lang="fr"><body class="menu-page"><div id="app"></div></body></html>', {
  url: "http://localhost:8000/index.html",
  pretendToBeVisual: true,
  runScripts: "dangerously",
  virtualConsole,
});
const { window } = dom;
const { document } = window;

// --- Stubs for CDN scripts and media APIs -----------------------------------
window.lucide = { createIcons() {} };
window.supabase = {
  createClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }) }),
};

let failNextPlay = false;
const playChecks = [];
const mediaProto = window.HTMLMediaElement.prototype;
mediaProto.play = function () {
  // Snapshot the element state exactly as iOS Safari would see it at play().
  playChecks.push({
    srcAttr: this.getAttribute("src"),
    mutedProp: this.muted,
    defaultMutedProp: this.defaultMuted,
    mutedAttr: this.hasAttribute("muted"),
    playsinlineAttr: this.hasAttribute("playsinline"),
    webkitPlaysinlineAttr: this.hasAttribute("webkit-playsinline"),
    controls: this.controls,
  });
  if (failNextPlay) {
    failNextPlay = false;
    return Promise.reject(new Error("NotAllowedError: autoplay blocked"));
  }
  return Promise.resolve();
};
mediaProto.pause = function () {};
mediaProto.load = function () {};
Object.defineProperty(mediaProto, "currentTime", {
  get() { return 0; },
  set() {},
  configurable: true,
});

window.eval(appSource);

const tick = () => new Promise((r) => setTimeout(r, 25));
function openModal() {
  const card = document.querySelector(".video-card");
  assert.ok(card, "a video card is rendered");
  card.dispatchEvent(new window.Event("click", { bubbles: true }));
  const modal = document.getElementById("video-modal");
  assert.ok(modal, "tapping a video card opens the modal");
  return modal;
}

async function main() {
  // --- 1+2. play() inside the tap gesture, after the iOS flag sequence ------
  const before = playChecks.length;
  const modal = openModal();
  assert.equal(playChecks.length, before + 1, "play() is called synchronously inside the tap gesture");

  const check = playChecks[before];
  assert.ok(check.srcAttr && check.srcAttr.endsWith(".mp4"), "src is set BEFORE play()");
  assert.equal(check.mutedProp, true, "muted=true BEFORE play()");
  assert.equal(check.defaultMutedProp, true, "defaultMuted=true BEFORE play()");
  assert.equal(check.mutedAttr, true, "muted attribute present BEFORE play()");
  assert.equal(check.playsinlineAttr, true, "playsinline attribute present BEFORE play()");
  assert.equal(check.webkitPlaysinlineAttr, true, "webkit-playsinline attribute present BEFORE play()");

  // --- 3. Native controls are gone (markup AND property) --------------------
  assert.equal(check.controls, false, "video.controls is false when play() is requested");
  const video = modal.querySelector(".modal-video");
  assert.ok(!video.hasAttribute("controls"), "no controls attribute in the modal markup");
  assert.doesNotMatch(appSource, /modalVideo\.controls\s*=\s*true/, "js/app.js never re-enables native controls");
  await tick();
  assert.equal(document.getElementById("video-fallback").hidden, true, "fallback stays hidden when autoplay succeeds");

  // X click still closes
  modal.querySelector(".modal-close").dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.ok(!document.getElementById("video-modal"), "the X button closes the modal");

  // --- 4. Blocked autoplay -> DOM fallback button, tap retries play() -------
  failNextPlay = true;
  openModal();
  await tick();
  const fallback = document.getElementById("video-fallback");
  assert.equal(fallback.hidden, false, "fallback play button appears when autoplay is blocked");
  assert.ok(!fallback.hasAttribute("controls") && !document.querySelector(".modal-video").hasAttribute("controls"),
    "blocked autoplay never falls back to native controls");

  const playsBeforeRetry = playChecks.length;
  fallback.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.equal(playChecks.length, playsBeforeRetry + 1, "tapping the fallback retries play()");
  await tick();
  assert.equal(fallback.hidden, true, "fallback hides once playback starts");

  // --- 5. Backdrop click AND touchend still dismiss the modal ---------------
  document.getElementById("video-bg").dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.ok(!document.getElementById("video-modal"), "backdrop click closes the modal");

  openModal();
  document.getElementById("video-bg").dispatchEvent(new window.Event("touchend"));
  assert.ok(!document.getElementById("video-modal"), "backdrop touchend closes the modal");

  console.log("IOS AUTOPLAY CONTRACT PASSED:");
  console.log("  - play() requested synchronously inside the card tap");
  console.log("  - src/muted/defaultMuted/playsInline + attributes set BEFORE play()");
  console.log("  - native controls removed from markup and never re-enabled");
  console.log("  - blocked autoplay shows a DOM fallback that retries play()");
  console.log("  - modal closes via X click, backdrop click and backdrop touchend");
}
main().then(() => window.close()).catch((e) => { console.error(e); window.close(); process.exit(1); });
