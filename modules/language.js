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
  "kg",
  "it",
  "hu",
  "ro",
  "pl",
  "cs",
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
    KG: "kg",
    IT: "it",
    HU: "hu",
    RO: "ro",
    PL: "pl",
    CZ: "cs",
    TZ: "sw",
    KE: "sw",
    UG: "sw",
    RW: "rw",
    SA: "ar",
    AE: "ar",
    EG: "ar",
    IQ: "ar",
    JO: "ar",
    KW: "ar",
    LB: "ar",
    LY: "ar",
    MA: "ar",
    OM: "ar",
    QA: "ar",
    SD: "ar",
    SY: "ar",
    TN: "ar",
    YE: "ar",
    BH: "ar",
    DZ: "ar",
  };
  lang = countryLangMap[location.countryCode] || "en";

  return lang;
}

async function mainFunction() {
  try {
    lang = await determineLanguage();

    changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
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
