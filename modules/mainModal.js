import gsap from "gsap";
import { overlay } from "./game";
import { showCurrentModal, showMethod, updateUrl } from "./params";

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
const headerAuthBtns = document.querySelectorAll(".header-auth-btn");

headerAuthBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    mainOverlay.classList.add("is-open");
    localStorage.setItem("mainModal", "open");
  });
});

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

const regWithEmailBtns = document.querySelectorAll(".reg-with-email-btn");

regWithEmailBtns.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showCurrentModal("main");
      updateUrl("modal", "auth");
    });
  }
});
