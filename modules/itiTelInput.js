import intlTelInput from "intl-tel-input/intlTelInputWithUtils";
import { geoData } from "./geoLocation";

const authPhoneInput = document.querySelector(".auth-phone-input");
const socialsPhoneInput = document.querySelector(".socials-phone-input");

const geoIpLookup = (success, failure) => {
  if (geoData && geoData.countryCode) {
    success(geoData.countryCode);
  } else {
    success("PL");
  }
};

const baseOptions = {
  initialCountry: "auto",
  separateDialCode: true,
  useFullscreenPopup: false,
  autoPlaceholder: "aggressive",
  geoIpLookup,
  customPlaceholder: function (selectedCountryPlaceholder) {
    return selectedCountryPlaceholder.replace(/[0-9]/g, "X");
  },
};

const fixItiLTR = (input) => {
  const container = input
    .closest(".iti")
    ?.querySelector(".iti__country-container");
  if (container) {
    container.style.left = "0px";
    container.style.right = "auto";
  }
};

export let authIti = intlTelInput(authPhoneInput, baseOptions);
export let socialsIti = intlTelInput(socialsPhoneInput, baseOptions);

fixItiLTR(authPhoneInput);
fixItiLTR(socialsPhoneInput);

/* ---------- FORMAT LOGIC ---------- */

const setupPhoneFormat = (input) => {
  let currentFormat = null;

  const updatePhoneFormat = () => {
    const placeholder = input.getAttribute("placeholder");
    if (!placeholder) return;
    currentFormat = placeholder;
  };

  const formatPhoneValue = () => {
    if (!currentFormat) return;

    const maxDigits = (currentFormat.match(/X/g) || []).length;
    const digits = input.value.replace(/\D/g, "").slice(0, maxDigits);

    if (digits.length === 0) {
      input.value = "";
      return;
    }

    let formatted = "";
    let digitIndex = 0;
    let cursorPos = 0;

    for (let i = 0; i < currentFormat.length; i++) {
      if (currentFormat[i] === "X") {
        if (digitIndex < digits.length) {
          formatted += digits[digitIndex++];
          cursorPos = formatted.length;
        } else {
          formatted += "X";
        }
      } else {
        formatted += currentFormat[i];
      }
    }

    input.value = formatted;
    input.setSelectionRange(cursorPos, cursorPos);
  };

  input.addEventListener("focus", updatePhoneFormat);
  input.addEventListener("input", formatPhoneValue);
  input.addEventListener("countrychange", () => {
    currentFormat = null;
    input.value = "";
    updatePhoneFormat();
  });
};

setupPhoneFormat(authPhoneInput);
setupPhoneFormat(socialsPhoneInput);
