import gsap from "gsap";
import { countries, paymentIcons } from "../public/data";
import horizontalLoop from "./marquee";

const gameWrapper = document.querySelector(".game-wrapper");
const fullScreenBtn = document.querySelector(".fullscreen-btn");
const overlay = document.querySelector(".overlay");

const gameFrame = document.querySelector(".game-frame");
const gamePreviewImg = document.querySelector(".game-preview-img");
let gameURL = "https://demo.spribe.io/launch/plinko?lang=rucurrency=EUR&mute=1";

document.addEventListener("DOMContentLoaded", () => {
  if (gameFrame) {
    gameFrame.setAttribute("src", gameURL);
  }
});

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

async function getLocation() {
  let url = "https://ipinfo.io/json?token=d5361631d79bbd";
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

const loop = horizontalLoop(".payments-list", {
  repeat: -1,
  paused: false,
  speed: 0.3,
});

function createPaymentIcons(country) {
  for (let i = 0; i < country.payments.length; i++) {
    const paymentName = country.payments[i];
    let item = document.createElement("li");
    let itemIcon = document.createElement("img");
    item.appendChild(itemIcon);
    document.querySelector(".payments-list").appendChild(item);
    itemIcon.setAttribute("src", country.payments[i]);
  }
}

async function main() {
  try {
    let locationData = await getLocation();
    console.log(locationData.country);

    countries.forEach((country) => {
      if (country.name === locationData.country) {
        console.log(country.payments);

        createPaymentIcons(country);
        createPaymentIcons(country);
        createPaymentIcons(country);
        createPaymentIcons(country);
        createPaymentIcons(country);
        createPaymentIcons(country);
      }
    });
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
}
main();
