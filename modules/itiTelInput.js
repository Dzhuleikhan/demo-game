import intlTelInput from "intl-tel-input/intlTelInputWithUtils";
import { Metadata, isValidPhoneNumber } from "libphonenumber-js/core";
import minMetadata from "libphonenumber-js/metadata.min.json";
import { geoData } from "./geoLocation";

const getPossibleLengths = (countryCode) => {
  try {
    const meta = new Metadata(minMetadata);
    meta.selectNumberingPlan(countryCode);
    return meta.numberingPlan.possibleLengths();
  } catch {
    return null;
  }
};

const getMaxDigitsForCountry = (countryCode) => {
  const lengths = getPossibleLengths(countryCode);
  return lengths ? Math.max(...lengths) : 15;
};

const stripDuplicatedDialCode = (digits, countryCode, dialCode) => {
  if (!dialCode || !digits.startsWith(dialCode)) return digits;
  const rest = digits.slice(dialCode.length);
  const lengths = getPossibleLengths(countryCode);
  if (!rest || !lengths) return digits;
  const maxLen = Math.max(...lengths);
  if (digits.length > maxLen && rest.length <= maxLen) return rest;
  if (isValidPhoneNumber("+" + dialCode + digits, minMetadata)) return digits;
  if (isValidPhoneNumber("+" + digits, minMetadata)) return rest;
  if (lengths.includes(rest.length) && !lengths.includes(digits.length)) {
    return rest;
  }
  return digits;
};

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

export const authIti = intlTelInput(authPhoneInput, baseOptions);
export const socialsIti = intlTelInput(socialsPhoneInput, baseOptions);

fixItiLTR(authPhoneInput);
fixItiLTR(socialsPhoneInput);

/* ---------- FORMAT LOGIC ---------- */

const setupPhoneFormat = (input, iti) => {
  let currentFormat = null;

  const updatePhoneFormat = () => {
    const placeholder = input.getAttribute("placeholder");
    if (!placeholder) return;
    currentFormat = placeholder;
  };

  const formatPhoneValue = () => {
    const countryData = iti.getSelectedCountryData();
    const countryCode = countryData.iso2?.toUpperCase();
    const dialCode = countryData.dialCode;
    const maxDigits = getMaxDigitsForCountry(countryCode);
    const raw = stripDuplicatedDialCode(
      input.value.replace(/\D/g, ""),
      countryCode,
      dialCode,
    );
    const digits = raw.slice(0, maxDigits);

    if (digits.length === 0) {
      input.value = "";
      return;
    }

    if (!currentFormat) {
      input.value = digits;
      input.setSelectionRange(digits.length, digits.length);
      return;
    }

    const templateDigits = (currentFormat.match(/X/g) || []).length;

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

    if (digits.length > templateDigits) {
      formatted += digits.slice(templateDigits);
      cursorPos = formatted.length;
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

setupPhoneFormat(authPhoneInput, authIti);
setupPhoneFormat(socialsPhoneInput, socialsIti);
