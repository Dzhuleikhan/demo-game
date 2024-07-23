import gsap from "gsap";

const gameWrapper = document.querySelector(".game-wrapper");
const gameWrapperFrame = document.querySelector(".game-wrapper iframe");
const fullScreenBtn = document.querySelector(".fullscreen-btn");
const overlay = document.querySelector(".overlay");

const gameFrame = document.querySelector(".game-frame");
const gamePreviewImg = document.querySelector(".game-preview-img");
let gameURL = "https://demo.spribe.io/launch/plinko?lang=rucurrency=EUR&mute=1";

// document.addEventListener("DOMContentLoaded", () => {
//   if (gameFrame) {
//     gameFrame.setAttribute("src", "#");
//   }
// });

if (fullScreenBtn) {
  fullScreenBtn.addEventListener("click", () => {
    gameWrapper.classList.toggle("fullscreen");
  });
}

window.addEventListener("keydown", (e) => {
  const key = e.key;
  if (key === "Escape") {
    if (gameWrapper.classList.contains("fullscreen")) {
      gameWrapper.classList.remove("fullscreen");
    } else return;
  }
});

function showModal() {
  if (gameWrapper.classList.contains("fullscreen")) {
    gameWrapper.classList.remove("fullscreen");
  }
  overlay.classList.add("is-open");
  gsap.fromTo(
    ".modal",
    { scale: 0 },
    { scale: 1, ease: "none", duration: 0.3 },
  );
  document.body.style.overflow = "hidden";
}

window.focus();
const frameListener = window.addEventListener("blur", () => {
  if (document.activeElement === document.querySelector("iframe")) {
    window.localStorage.setItem("modal", "open");
    showModal();
  }
  window.removeEventListener("blur", frameListener);
});

if (localStorage.modal) {
  showModal();
}
