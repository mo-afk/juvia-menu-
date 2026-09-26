// Browser regression checks: real QR decoder + synthetic camera; no live database writes.
const { chromium } = require("playwright");
const QRCode = require("qrcode");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const baseURL = process.env.BASE_URL || "http://localhost:8000";
  const appSource = fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8");
  const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.doesNotMatch(appSource, /html2canvas|pass-download|downloadPassImage|Télécharger mon Pass/);
  assert.doesNotMatch(indexSource, /html2canvas/);
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined,
    headless: true,
  });
  const ctx = await browser.newContext({ serviceWorkers: "block" });
  const uuid = "123e4567-e89b-42d3-a456-426614174000";
  const qr = await QRCode.toDataURL(uuid, { width: 420, margin: 4 });
  await ctx.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin !== new URL(baseURL).origin)
      return route.abort();
    return route.continue();
  });
  await ctx.addInitScript(
    ({ qr, uuid }) => {
      sessionStorage.setItem("juvia_staff_verified_v2", "1");
      window.lookups = [];
      window.streams = [];
      window.supabase = {
        createClient: () => ({
          from: () => ({
            select: () => ({
              eq: (key, id) => ({
                single: async () => {
                  window.lookups.push(id);
                  await new Promise((r) => setTimeout(r, 450));
                  return window.failLookup
                    ? { error: { message: "not found" } }
                    : {
                        data: {
                          id: uuid,
                          first_name: "Test",
                          last_name: "Member",
                          points: 20,
                        },
                      };
                },
              }),
            }),
          }),
        }),
      };
      navigator.mediaDevices.getUserMedia = async () => {
        if (window.cameraError) throw { name: window.cameraError };
        if (window.permissionWait)
          await new Promise((r) => (window.allowCamera = r));
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        const c = canvas.getContext("2d");
        const img = new Image();
        img.src = qr;
        await img.decode();
        const draw = () => {
          c.fillStyle = "white";
          c.fillRect(0, 0, 1280, 720);
          if (!window.blankCamera) c.drawImage(img, 430, 150, 420, 420);
        };
        draw();
        const interval = setInterval(draw, 50);
        const stream = canvas.captureStream(20);
        window.streams.push(stream);
        stream.getTracks().forEach((track) => {
          const stop = track.stop.bind(track);
          track.stop = () => {
            stop();
            clearInterval(interval);
          };
        });
        return stream;
      };
      navigator.mediaDevices.enumerateDevices = async () => [
        { kind: "videoinput", deviceId: "test-camera", label: "Back camera" },
      ];
    },
    { qr, uuid },
  );
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(baseURL + "/index.html");
    await p.waitForSelector(".menu-content");
    const menu = await p.evaluate(() => ({
      width: document.querySelector(".menu-content").getBoundingClientRect()
        .width,
      overflow: document.documentElement.scrollWidth > innerWidth,
      cols: getComputedStyle(document.querySelector(".dish-list"))
        .gridTemplateColumns,
    }));
    assert.equal(menu.overflow, false, `menu overflow ${width}`);
    if (width >= 1024) {
      assert.ok(menu.width >= Math.min(width * 0.89, 1400));
      assert.equal(menu.cols.split(" ").length, 2);
    }
    await p.goto(baseURL + "/staff-scan.html");
    await p.waitForSelector("#staff-start-cam");
    const staff = await p.evaluate(() => ({
      width: document.querySelector(".staff-content").getBoundingClientRect()
        .width,
      overflow: document.documentElement.scrollWidth > innerWidth,
      cols: getComputedStyle(document.querySelector(".staff-grid"))
        .gridTemplateColumns,
    }));
    assert.equal(staff.overflow, false, `staff overflow ${width}`);
    if (width >= 1024) {
      assert.ok(staff.width >= Math.min(width * 0.89, 1280));
      assert.equal(staff.cols.split(" ").length, 2);
    }
    console.log("layout", width, menu, staff);
  }
  // Mobile menu regression: one tap anywhere on a video card opens its modal
  // and requests playback while the tap is still a trusted user gesture,
  // before the modal's reveal animation is allowed to run.
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(baseURL + "/index.html");
  await p.waitForSelector(".video-card");
  await p.evaluate(() => {
    window.videoPlayCalls = 0;
    window.pauseCalls = 0;
    window.loadCalls = 0;
    window.videoPreparationCalls = [];
    window.currentTimeWrites = [];
    window.playContext = null;
    window.nativeVideoPlay = HTMLMediaElement.prototype.play;
    window.nativeVideoPause = HTMLMediaElement.prototype.pause;
    window.nativeVideoLoad = HTMLMediaElement.prototype.load;
    window.nativeCurrentTime = Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      "currentTime",
    );
    HTMLMediaElement.prototype.load = function () {
      window.loadCalls += 1;
      window.videoPreparationCalls.push("load");
    };
    HTMLMediaElement.prototype.play = function () {
      window.videoPlayCalls += 1;
      window.videoPreparationCalls.push("play");
      const modal = document.querySelector(".video-modal");
      const card = document.querySelector(".modal-card");
      window.playContext = {
        revealGated: !!modal && modal.classList.contains("is-entering"),
        revealAnimation: card ? getComputedStyle(card).animationPlayState : null,
      };
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      window.pauseCalls += 1;
      window.videoPreparationCalls.push("pause");
      return window.nativeVideoPause.apply(this, arguments);
    };
    Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
      get: window.nativeCurrentTime.get,
      set(value) {
        window.currentTimeWrites.push(value);
        return window.nativeCurrentTime.set.call(this, value);
      },
      configurable: true,
    });
  });
  await p.locator(".video-card").first().click({ position: { x: 8, y: 8 } });
  await p.waitForSelector(".modal-video");
  const mobileVideo = await p.locator(".modal-video").evaluate((video) => ({
    autoplay: video.hasAttribute("autoplay") && video.autoplay,
    playsinline: video.hasAttribute("playsinline") && video.playsInline,
    webkitPlaysinline: video.hasAttribute("webkit-playsinline"),
    muted: video.hasAttribute("muted") && video.muted && video.defaultMuted,
    loop: video.hasAttribute("loop") && video.loop,
    preload: video.getAttribute("preload"),
    controls: video.hasAttribute("controls") && video.controls,
    loadCalls: window.loadCalls,
    preparationCalls: window.videoPreparationCalls.slice(),
    playCalls: window.videoPlayCalls,
    playContext: window.playContext,
    revealReleased: !document.querySelector(".video-modal").classList.contains("is-entering"),
    openWrites: window.currentTimeWrites.slice(),
    thumbnailPointerEvents: getComputedStyle(document.querySelector(".video-card-media")).pointerEvents,
  }));
  assert.deepEqual(
    {
      autoplay: mobileVideo.autoplay,
      playsinline: mobileVideo.playsinline,
      webkitPlaysinline: mobileVideo.webkitPlaysinline,
      muted: mobileVideo.muted,
      loop: mobileVideo.loop,
      preload: mobileVideo.preload,
      controls: mobileVideo.controls,
      thumbnailPointerEvents: mobileVideo.thumbnailPointerEvents,
    },
    {
      autoplay: true,
      playsinline: true,
      webkitPlaysinline: true,
      muted: true,
      loop: true,
      preload: "auto",
      controls: true,
      thumbnailPointerEvents: "none",
    },
    "the mobile modal exposes inline muted autoplay and the whole card remains tappable",
  );
  assert.ok(mobileVideo.playCalls >= 1, "opening a card immediately calls video.play()");
  assert.equal(mobileVideo.loadCalls, 1, "opening explicitly loads the source in the tap handler");
  assert.deepEqual(
    mobileVideo.preparationCalls.slice(0, 3),
    ["pause", "load", "play"],
    "the video is paused and explicitly loaded before playback is requested",
  );
  assert.deepEqual(
    mobileVideo.playContext,
    { revealGated: true, revealAnimation: "paused" },
    "play() runs in the tap handler, before the reveal animation starts",
  );
  assert.equal(
    mobileVideo.revealReleased,
    true,
    "the reveal animation is released once playback has been requested",
  );
  assert.deepEqual(mobileVideo.openWrites, [0], "opening rewinds the video to 0");
  await p.locator(".modal-video").evaluate((video) => {
    video.currentTime = 3.5;
  });
  await p.click("#video-close");
  await p.waitForSelector(".modal-video", { state: "detached" });
  const closedVideo = await p.evaluate(() => ({
    pauseCalls: window.pauseCalls,
    writes: window.currentTimeWrites.slice(),
  }));
  assert.ok(closedVideo.pauseCalls >= 1, "closing the modal pauses playback");
  assert.deepEqual(
    closedVideo.writes,
    [0, 3.5, 0],
    "closing pauses the video and rewinds it to 0",
  );
  await p.evaluate(() => {
    HTMLMediaElement.prototype.play = window.nativeVideoPlay;
    HTMLMediaElement.prototype.pause = window.nativeVideoPause;
    HTMLMediaElement.prototype.load = window.nativeVideoLoad;
    Object.defineProperty(
      HTMLMediaElement.prototype,
      "currentTime",
      window.nativeCurrentTime,
    );
  });
  await p.click("#btn-open-pass");
  await p.waitForSelector("#pass-form");
  assert.equal(await p.locator("#pass-recover").count(), 1);
  await p.click("#pass-recover");
  await p.waitForSelector("#pass-recovery-form");
  assert.equal(await p.locator("#pass-recovery-name").count(), 1);
  assert.equal(await p.locator("#pass-recovery-email").count(), 1);
  await p.click("#pass-close");
  await p.waitForSelector(".pass-modal", { state: "detached" });

  // A recovered member sees their pass (name, balance, QR area) in-app,
  // without any exported-image action.
  await p.evaluate((memberId) => localStorage.setItem("juvia_client_id", memberId), uuid);
  await p.click("#btn-open-pass");
  await p.waitForSelector(".loyalty-card");
  const passView = await p.locator(".pass-view").evaluate((view) => ({
    holder: view.querySelector(".pass-holder h3").textContent.trim(),
    points: view.querySelector(".pass-points strong").textContent.trim(),
    hasQrArea: !!view.querySelector("#pass-qr-box"),
    hasDownload: !!view.querySelector("#pass-download"),
  }));
  assert.deepEqual(passView, {
    holder: "Test Member",
    points: "20",
    hasQrArea: true,
    hasDownload: false,
  });
  console.log("mobile video autoplay and on-screen pass-only flow passed");

  for (const width of [320, 390, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(baseURL + "/staff-scan.html");
    await p.click("#staff-start-cam");
    await p.waitForSelector(".scan-success", { timeout: 15000 });
    await p.waitForSelector(".client-found");
    assert.deepEqual(await p.evaluate(() => lookups), [uuid]);
    assert.equal(
      await p.evaluate(() =>
        streams.every((s) =>
          s.getTracks().every((t) => t.readyState === "ended"),
        ),
      ),
      true,
    );
    console.log("real QR decoded and camera stopped", width);
  }
  await p.click("#staff-scan-another");
  await p.waitForSelector(".scan-success");
  await p.waitForSelector(".client-found");
  assert.deepEqual(await p.evaluate(() => lookups), [uuid, uuid]);
  console.log("scan another pass passed");
  await p.goto(baseURL + "/staff-scan.html");
  await p.evaluate(() => (window.failLookup = true));
  await p.click("#staff-start-cam");
  await p.waitForSelector("#staff-retry-cam");
  assert.match(
    await p.locator(".scan-cover h3").textContent(),
    /Pass introuvable/,
  );
  console.log("unknown member retry passed");
  await p.goto(baseURL + "/staff-scan.html");
  await p.evaluate(() => (window.cameraError = "NotAllowedError"));
  await p.click("#staff-start-cam");
  await p.waitForSelector("#staff-retry-cam");
  assert.match(await p.locator(".scan-cover h3").textContent(), /Permission/);
  console.log("permission denied passed");
  await p.goto(baseURL + "/staff-scan.html");
  await p.evaluate(() => (window.permissionWait = true));
  await p.click("#staff-start-cam");
  await p.waitForFunction(() => !!window.allowCamera);
  await p.click("#staff-lock-btn");
  await p.evaluate(() => window.allowCamera());
  await p.waitForFunction(
    () =>
      streams.length > 0 &&
      streams.every((s) =>
        s.getTracks().every((t) => t.readyState === "ended"),
      ),
  );
  assert.equal(await p.locator("#staff-pin-form").count(), 1);
  console.log("logout during permissions passed");
  await p.goto(baseURL + "/staff-scan.html");
  await p.evaluate(() => (window.blankCamera = true));
  await p.click("#staff-start-cam");
  await p.waitForSelector("#staff-stop-cam");
  await p.click("#staff-stop-cam");
  await p.waitForSelector("#staff-start-cam");
  await p.waitForFunction(() =>
    streams.every((s) => s.getTracks().every((t) => t.readyState === "ended")),
  );
  await p.evaluate(() => (window.blankCamera = false));
  await p.click("#staff-start-cam");
  await p.waitForSelector(".client-found");
  console.log("stop and restart passed");
  await p.goto(baseURL + "/staff-scan.html");
  await p.fill("#staff-manual-input", "juvia:" + uuid);
  await p.click("#staff-manual-btn");
  await p.waitForSelector(".client-found");
  assert.deepEqual(await p.evaluate(() => lookups), [uuid]);
  console.log("manual prefixed UUID passed");
  await ctx.route("**/js/vendor/html5-qrcode.min.js", (route) => route.abort());
  await p.goto(baseURL + "/staff-scan.html");
  await p.click("#staff-start-cam");
  await p.waitForSelector(".scan-note.warn");
  await p.fill("#staff-manual-input", uuid);
  await p.click("#staff-manual-btn");
  await p.waitForSelector(".client-found");
  assert.equal(
    await p.evaluate(() =>
      streams.every((s) =>
        s.getTracks().every((t) => t.readyState === "ended"),
      ),
    ),
    true,
  );
  console.log("missing decoder manual fallback passed");
  assert.deepEqual(errors, []);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
