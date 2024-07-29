import gsap from "gsap";
import { overlay } from "./game";

/**
 * Animations
 */
gsap.fromTo(
  ".shine-img",
  { opacity: 1 },
  {
    opacity: 0,
    duration: 0.5,
    ease: "none",
    yoyo: true,
    stagger: 0.3,
    repeat: -1,
  },
);

window.addEventListener("mousemove", (e) => {
  let cursorX = e.clientX;
  gsap.to(modalTigerImg, { x: -cursorX / 50 });
});

/**
 * Showing main modal window
 */
const firstModalRegBtn = document.querySelector(".reg-target-btn");
const mainOverlay = document.querySelector(".main-overlay");
const modalTigerImg = document.querySelector(".modal-tiger-img");

firstModalRegBtn.addEventListener("click", () => {
  localStorage.removeItem("modal");
  localStorage.setItem("mainModal", "open");
  overlay.classList.remove("is-open");
  mainOverlay.classList.add("is-open");
});

if (localStorage.mainModal) {
  mainOverlay.classList.add("is-open");
} else {
  mainOverlay.classList.remove("is-open");
}

/**
 * Tabs changing
 */
const modalTabs = document.querySelector(".modal-tabs");
const modalTabContents = document.querySelectorAll(".form-content");

function showActualModal(tabName) {
  modalTabContents.forEach((c) => {
    c.classList.remove("active");
  });
  document.querySelector(`.form-content-${tabName}`).classList.add("active");
}

modalTabs.addEventListener("click", (e) => {
  modalTabs.querySelectorAll("button").forEach((el) => {
    el.classList.remove("active");
  });
  const btn = e.target.closest("button");
  btn.classList.add("active");
  let tab = btn.getAttribute("data-tab");
  showActualModal(tab);
});
