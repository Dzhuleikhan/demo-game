import { geoData, getSupportedLanguage } from "./geoLocation";
import { translations } from "/public/translations";
import { modalTranslations } from "../public/modalTranslations";
import gsap from "gsap";
import { setNewBonusBasedOnParams } from "./formSocials";
import { settingBonusValueAndAmount } from "./settingBonusValue";
import { setPaymentMethods } from "./footerPayments";
import { paymentCountries } from "../public/payments";
import { getCountryCurrencyABBR } from "./modalCurrency";

export const availableLang = [
  "en",
  "bg",
  "hu",
  "el",
  "da",
  "ga",
  "es",
  "it",
  "lv",
  "lt",
  "lb",
  "mt",
  "nl",
  "de",
  "pl",
  "pt",
  "ro",
  "sk",
  "sl",
  "fi",
  "fr",
  "hr",
  "cs",
  "sv",
  "ar",
  "zh",
  "uk",
  "ru",
  "sw",
  "rw",
  "nb",
  "am",
  "lm",
  "ha",
  "yo",
  "ig",
  "tw",
];

function applyDirection(lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll(".form-modal-socials").forEach((el) => {
    el.setAttribute("dir", dir);
  });
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.dir = dir;
}

function updateContent(lang) {
  const contentElements = document.querySelectorAll("[data-translate]");
  contentElements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[lang]?.[key]) {
      element.innerHTML = translations[lang][key];
    }
  });

  const modalElements = document.querySelectorAll("[data-modal-translate]");
  modalElements.forEach((element) => {
    const key = element.getAttribute("data-modal-translate");
    element.innerHTML =
      modalTranslations[lang]?.[key] || modalTranslations["en"][key];
  });
}

function changeLanguage(lang) {
  applyDirection(lang);
  updateContent(lang);
}

function determineLanguage() {
  return getSupportedLanguage(geoData.countryCode);
}

async function initLanguage() {
  try {
    const lang = determineLanguage();
    localStorage.setItem("preferredLanguage", lang);
    changeLanguage(lang);

    document.querySelector(".wrapper").classList.remove("hidden");

    setTimeout(() => {
      setNewBonusBasedOnParams(getCountryCurrencyABBR(geoData.countryCode));
      settingBonusValueAndAmount(geoData.countryCode.toLowerCase());
      setPaymentMethods(paymentCountries, geoData.countryCode.toLowerCase());
    }, 500);
  } catch (error) {
    console.error("Error initializing language:", error);
  }
}
initLanguage();

gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
