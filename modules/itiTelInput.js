import intlTelInput from "intl-tel-input/intlTelInputWithUtils";

const authPhoneInput = document.querySelector(".auth-phone-input");
const socialsPhoneInput = document.querySelector(".socials-phone-input");

const geoIpLookup = (success, failure) => {
  const cachedData = localStorage.getItem("geoIpData");
  if (cachedData) {
    success(JSON.parse(cachedData).countryCode);
  } else {
    fetch("https://cdndigitaloceanspaces.cloud/geoip")
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("geoIpData", JSON.stringify(data));
        success(data.countryCode);
      })
      .catch(() => {
        failure();
      });
  }
};

export const authIti = intlTelInput(authPhoneInput, {
  initialCountry: "auto",
  separateDialCode: true,
  useFullscreenPopup: false,
  autoPlaceholder: "polite",
  geoIpLookup: geoIpLookup,
});
export const socialsIti = intlTelInput(socialsPhoneInput, {
  initialCountry: "auto",
  separateDialCode: true,
  useFullscreenPopup: false,
  autoPlaceholder: "polite",
  geoIpLookup: geoIpLookup,
});
