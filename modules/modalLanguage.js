import { modalTranslations } from "../public/modalTranslations";
import { setPaymentMethods } from "./footerPayments";
import { paymentCountries } from "../public/payments";
import { geoData } from "./geoLocation";
import { availableLang } from "./language";
import { settingBonusValueAndAmount } from "./settingBonusValue";

function applyDirection(lang) {
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lang);
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
  if (preferredLanguage) {
    updateContent(preferredLanguage);
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
    const countryCode = location.countryCode.toUpperCase();

    if (countryCode === "NG") {
      const browserLang = (navigator.language || "en")
        .split("-")[0]
        .toLowerCase();
      const nigeriaLangs = ["ha", "yo", "ig"];
      updateContent(nigeriaLangs.includes(browserLang) ? browserLang : "ha");
    } else if (countryCode === "GH") {
      updateContent("tw");
    } else {
      changeLanguage(location.countryCode.toLowerCase());
    }

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
