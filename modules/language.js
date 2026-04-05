import { geoData } from "./geoLocation";
import { translations } from "/public/translations";
import gsap from "gsap";
import { setNewBonusBasedOnParams } from "./formSocials";
import { SupportedLanguages } from "../public/data";
import { modalTranslations } from "../public/modalTranslations";
import { settingBonusValueAndAmount } from "./settingBonusValue";
import { setPaymentMethods } from "./footerPayments";
import { paymentCountries } from "../public/payments";

function applyDirection(lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll(".form-modal-socials").forEach((el) => {
    el.setAttribute("dir", dir);
  });
  document.documentElement.setAttribute("lang", lang);
}

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
  applyDirection(lang);
  updateContent(lang);
}

function determineLanguage() {
  const browserLang = (navigator.language || "en").split("-")[0].toLowerCase();
  return SupportedLanguages.includes(browserLang) ? browserLang : "en";
}

async function initLanguage() {
  const lang = determineLanguage();
  localStorage.setItem("preferredLanguage", lang);
  changeLanguage(lang);

  document.querySelector(".wrapper").classList.remove("hidden");
  setTimeout(() => {
    setNewBonusBasedOnParams();
    settingBonusValueAndAmount(geoData.countryCode.toLowerCase());
    setPaymentMethods(paymentCountries, geoData.countryCode.toLowerCase());
  }, 500);
}
initLanguage();

gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
