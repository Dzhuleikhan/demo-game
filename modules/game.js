import gsap from "gsap";
import {
  countriesPayments,
  countryFlags,
  countryCurrencyData,
} from "../public/data";
import horizontalLoop from "./marquee";
import { getLocation } from "./geoLocation";

export const overlay = document.querySelector(".overlay");
const headerFlagGeo = document.querySelector(".header-country-flag");

const gameWrapper = document.querySelector(".game-wrapper");
const fullScreenBtn = document.querySelector(".fullscreen-btn");

const gameFrame = document.querySelector(".game-frame");
let gameURL =
  "https://demo.spribe.io/launch/plinko?lang=nl&currency=EUR&mute=1";

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
} else {
  overlay.classList.remove("is-open");
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

function settingGeoLocation(countryInput) {
  let flagSet = false;

  countryFlags.forEach((location) => {
    if (location.slug.includes(countryInput)) {
      headerFlagGeo.setAttribute("src", `./img/flags/${countryInput}.svg`);
      headerFlagGeo.setAttribute("alt", location.name);
      flagSet = true;
      setTimeout(() => {
        headerFlagGeo.classList.remove("hidden");
      }, 1000);
    }
  });

  if (!flagSet) {
    headerFlagGeo.setAttribute("src", "");
    headerFlagGeo.setAttribute("alt", "");
  }
}

export function getCountryCurrencyABBR(inputCountry) {
  for (const data of countryCurrencyData) {
    if (data.countries.includes(inputCountry)) {
      return data.countryCurrency;
    }
  }
  return "USD"; // or some default value if country is not found
}

export function getCountryCurrencyFullName(inputCountry) {
  for (const data of countryCurrencyData) {
    if (data.countries.includes(inputCountry)) {
      return data.countryCurrencyFullName;
    }
  }
  return "US Dollar"; // or some default value if country is not found
}

export function getCountryCurrencyIcon(inputCountry) {
  for (const data of countryCurrencyData) {
    if (data.countries.includes(inputCountry)) {
      return data.countryCurrencyIcon;
    }
  }
  return "./img/currencies/usd.svg"; // or some default value if country is not found
}

async function main() {
  try {
    let locationData = await getLocation();
    const countryInput = locationData.country.toLowerCase();

    settingGeoLocation(countryInput);

    // Currency
    const currencyName = getCountryCurrencyABBR(locationData.country);

    gameURL = `https://demo.spribe.io/launch/plinko?lang=${countryInput}&currency=${currencyName}&mute=1`;

    if (gameFrame) {
      gameFrame.setAttribute("src", gameURL);
    }

    countriesPayments.forEach((country) => {
      if (country.name === locationData.country) {
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

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.textContent = translations[lang][key];
  });
}
