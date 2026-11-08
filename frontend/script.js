const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateVideoSources() {
  const splashVideo = document.querySelector(".bg-splash");
  const loopVideo = document.querySelector(".bg-loop");
  const isVertical = window.matchMedia("(max-aspect-ratio: 1/1)").matches;

  const splashSources = splashVideo.querySelectorAll("source");
  const loopSources = loopVideo.querySelectorAll("source");

  if (reducedMotion.matches) {
    splashVideo.pause();
    loopVideo.pause();
    return;
  }

  if (splashSources.length < 2 || loopSources.length < 2) return;

  if (isVertical) {
    splashSources[0].src = "assets/home/persona_3_splash_vertical.mp4";
    splashSources[1].src = "assets/home/persona_3_splash_vertical_h264.mp4";
    loopSources[0].src = "assets/home/persona_3_loop_vertical.mp4";
    loopSources[1].src = "assets/home/persona_3_loop_vertical_h264.mp4";
  } else {
    splashSources[0].src = "assets/home/persona_3_splash.mp4";
    splashSources[1].src = "assets/home/persona_3_splash_h264.mp4";
    loopSources[0].src = "assets/home/persona_3_loop.mp4";
    loopSources[1].src = "assets/home/persona_3_loop_h264.mp4";
  }

  splashVideo.load();
  loopVideo.load();
  if (document.body.classList.contains("splash-done")) {
    loopVideo.play().catch(() => {});
  } else {
    splashVideo.play().catch(() => {});
  }
}

window.addEventListener("DOMContentLoaded", () => {
  updateVideoSources();

  const splashVideo = document.querySelector(".bg-splash");
  const loopVideo = document.querySelector(".bg-loop");

  if (loopVideo) {
    loopVideo.preload = "auto";
  }

  splashVideo.addEventListener("ended", () => {
    document.body.classList.add("splash-done");
    if (loopVideo && loopVideo.paused) {
      loopVideo.play().catch(() => {});
    }
  });
});

reducedMotion.addEventListener("change", updateVideoSources);

window.addEventListener("resize", () => {
  const currentSrc = document.querySelector(".bg-splash source").src;
  const isVertical = window.matchMedia("(max-aspect-ratio: 1/1)").matches;
  const shouldBeVertical = currentSrc.includes("vertical");

  if (isVertical !== shouldBeVertical) {
    updateVideoSources();
  }
});

function positionTriangle(button) {
  const triangles = document.querySelectorAll(".triangle-indicator");
  if (!triangles.length || !button) return;
  const container = document.querySelector(".buttons");
  const containerRect = container.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();

  const ref = triangles[0];
  const tStyles = getComputedStyle(ref);
  const triangleWidth =
    parseFloat(tStyles.borderLeftWidth) + parseFloat(tStyles.borderRightWidth);

  const topOffset = parseFloat(tStyles.getPropertyValue("--top")) || 100;

  const baseLeft =
    btnRect.left - containerRect.left + (btnRect.width - triangleWidth) / 2;
  const baseTop = btnRect.bottom - containerRect.top - topOffset;

  const baseScale = 1 + (Math.random() * 0.1 - 0.05);
  const baseRot = Math.random() * 10 - 5;

  triangles.forEach((tri, idx) => {
    const offsetDir = idx === 0 ? 1 : 1.5;
    const offsetMag = idx === 0 ? 0 : 5;
    const leftPx = baseLeft + offsetDir * (offsetMag * 0.6);
    const topPx = baseTop + offsetDir * (offsetMag * 0.4);

    tri.style.left = leftPx + "px";
    tri.style.top = topPx + "px";

    const scale = baseScale * (idx === 0 ? 1 : 1.05 + Math.random() * 0.05);
    const rot = baseRot + (idx === 0 ? 0 : 1 + Math.random());

    tri.style.setProperty("--scale", scale.toFixed(3));
    tri.style.setProperty("--rot", rot.toFixed(2) + "deg");
  });

  document
    .querySelectorAll(".btn")
    .forEach((b) => b.classList.toggle("is-active", b === button));
}

const buttons = document.querySelectorAll(".btn");
const startButton = document.getElementById("startButton");

function positionCurrentSelection() {
  positionTriangle(
    document.querySelector(".btn:focus-visible") ||
      document.querySelector(".btn:hover") ||
      document.querySelector(".btn.is-active") ||
      startButton,
  );
}

window.addEventListener("load", () => {
  positionCurrentSelection();
  document.fonts?.ready.then(positionCurrentSelection);
});

buttons.forEach((button) => {
  button.addEventListener("mouseenter", () => positionTriangle(button));
  button.addEventListener("focus", () => positionTriangle(button));
});

window.addEventListener("resize", positionCurrentSelection);
