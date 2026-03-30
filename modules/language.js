import { geoData } from "./geoLocation";
import { translations } from "/public/translations";
import gsap from "gsap";
import { setNewBonusBasedOnParams } from "./formSocials";

let lang;

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.innerHTML = translations[lang][key];
  });
}

function changeLanguage(lang) {
  updateContent(lang);
}

export const availableLang = [
  "en",
  "es",
  "fr",
  "uk",
  "ru",
  "bd",
  "id",
  "pt",
  "de",
  "it",
  "hu",
  "ro",
  "pl",
  "cs",
  "ee",
  "lv",
  "lt",
  "hr",
  "dk",
  "fi",
  "bg",
  "sw",
  "rw",
  "ar",
];

async function determineLanguage() {
  const location = geoData;

  const countryLangMap = {
    EN: "en",
    ES: "es",
    FR: "fr",
    UA: "uk",
    RU: "ru",
    BD: "bd",
    ID: "id",
    PT: "pt",
    DE: "de",
    IT: "it",
    HU: "hu",
    RO: "ro",
    PL: "pl",
    CZ: "cs",
    EE: "ee",
    LV: "lv",
    LT: "lt",
    HR: "hr",
    FI: "fi",
    DK: "dk",
    BG: "bg",
    KE: "sw",
    TZ: "sw",
    UG: "sw",
    RW: "rw",
    SA: "ar",
    EG: "ar",
    AE: "ar",
    IQ: "ar",
    JO: "ar",
    KW: "ar",
    QA: "ar",
    BH: "ar",
    OM: "ar",
    YE: "ar",
    LB: "ar",
    SY: "ar",
    LY: "ar",
    SD: "ar",
    TN: "ar",
    DZ: "ar",
    MA: "ar",
  };
  lang = countryLangMap[location.countryCode] || "en";

  return lang;
}

async function mainFunction() {
  try {
    lang = await determineLanguage();

    changeLanguage(lang);
    document.querySelector(".wrapper").classList.remove("hidden");

    let currencyStoredData = localStorage.getItem("currencyData");
    let currencyData = JSON.parse(currencyStoredData);
    let currency = currencyData.abbr;

    setTimeout(() => {
      setNewBonusBasedOnParams(currency);
    }, 500);
  } catch (error) {
    console.error("Error determining language:", error);
  }
}
mainFunction();
gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
