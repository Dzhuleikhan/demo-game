import { modalTranslations } from "../public/modalTranslations";
import { setPaymentMethods } from "./footerPayments";
import { paymentCountries } from "../public/payments";
import { geoData } from "./geoLocation";
import { availableLang } from "./language";
import { settingBonusValueAndAmount } from "./settingBonusValue";
import { countryCurrencyData } from "../public/data";
import { getUrlParameter } from "./params";

function applyDirection(lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll(".form-modal-socials").forEach((el) => {
    el.setAttribute("dir", dir);
  });
}

function updateContent(lang) {
  if (!availableLang.includes(lang)) {
    lang = "en";
  }
  applyDirection(lang);
  const elements = document.querySelectorAll("[data-modal-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-modal-translate");
    element.innerHTML =
      modalTranslations[lang][key] || modalTranslations["en"][key];
  });
}

const preferredLanguage = localStorage.getItem("preferredLanguage");

function changeLanguage(lang) {
  const urlLang = getUrlParameter("lang");
  if (urlLang && modalTranslations[urlLang]) {
    updateContent(urlLang);
  } else {
    if (modalTranslations[lang]) {
      updateContent(lang);
    } else {
      updateContent("en");
    }
  }
}

export function changeModalLanguage(lang) {
  if (modalTranslations[lang]) {
    updateContent(lang);
  } else {
    updateContent("en");
  }
}

async function setModalLanguage() {
  try {
    const location = geoData;
    const browserLang = (navigator.language || "en").split("-")[0].toLowerCase();
    changeLanguage(availableLang.includes(browserLang) ? browserLang : "en");
    setTimeout(() => {
      settingBonusValueAndAmount(location.countryCode.toLowerCase());
      setPaymentMethods(paymentCountries, location.countryCode.toLowerCase());
    }, 500);
  } catch (error) {
    console.log(error);
    changeLanguage("en");
  }
}
setModalLanguage();
