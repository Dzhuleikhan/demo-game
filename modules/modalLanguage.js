import { modalTranslations } from "../public/modalTranslations";
import { setPaymentMethods } from "./footerPayments";
import { paymentCountries } from "../public/payments";
import { getLocation } from "./geoLocation";

function updateContent(lang) {
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
    const location = await getLocation();
    changeLanguage(location.countryCode.toLowerCase());
    setPaymentMethods(paymentCountries, location.countryCode.toLowerCase());
  } catch (error) {
    console.log(error);
    changeLanguage("en");
  }
}
setModalLanguage();
