const gameWrapper = document.querySelector(".game-wrapper");
const gameWrapperFrame = document.querySelector(".game-wrapper iframe");
const fullScreenBtn = document.querySelector(".fullscreen-btn");
const overlay = document.querySelector(".overlay");

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
  overlay.classList.remove("hidden");
  overlay.classList.add("grid");
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
