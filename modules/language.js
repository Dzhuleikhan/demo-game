import { geoData, language } from "./geoLocation";
import { translations } from "/public/translations";
import gsap from "gsap";
import { setNewBonusBasedOnParams } from "./formSocials";
import { SupportedLanguages } from "../public/data";
import { modalTranslations } from "../public/modalTranslations";
import { settingBonusValueAndAmount } from "./settingBonusValue";
import { setPaymentMethods } from "./footerPayments";
import { paymentCountries } from "../public/payments";

function updateContent(lang) {
  const contentElements = document.querySelectorAll("[data-translate]");
  contentElements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.innerHTML = translations[lang][key];
  });

  const modalElements = document.querySelectorAll("[data-modal-translate]");
  modalElements.forEach((element) => {
    const key = element.getAttribute("data-modal-translate");
    element.innerHTML =
      modalTranslations[lang][key] || modalTranslations["en"][key];
  });
}

function changeLanguage(lang) {
  updateContent(lang);
}

function getInitialLanguage(country, fallbackLang) {
  const browserLang = navigator.language.split("-")[0];
  const supportedLang = SupportedLanguages.includes(browserLang)
    ? browserLang
    : fallbackLang;

  if (country === "BE") {
    if (supportedLang && browserLang !== "nl") {
      return browserLang;
    }
    return "en";
  }
  if (country === "CH") {
    return supportedLang ?? "de";
  }
  if (country === "CA") {
    return supportedLang ?? "en";
  }
  if (country === "CA") {
    return supportedLang ?? "en";
  }
  if (country === "CY") {
    return supportedLang ?? "el";
  }
  if (country === "LU") {
    return supportedLang ?? "fr";
  }
  if (country === "EE") {
    return supportedLang ?? "et";
  }

  return fallbackLang;
}

async function initLanguage() {
  const initialLang = getInitialLanguage(geoData.countryCode, language);
  changeLanguage(initialLang);

  document.querySelector(".wrapper").classList.remove("hidden");
  setTimeout(() => {
    setNewBonusBasedOnParams();
    settingBonusValueAndAmount(geoData.countryCode.toLowerCase());
    setPaymentMethods(paymentCountries, geoData.countryCode.toLowerCase());
  }, 500);
}
initLanguage();

gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
