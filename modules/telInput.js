import intlTelInput from "intl-tel-input/intlTelInputWithUtils";

const input = document.getElementById("phone-input");

const iti = intlTelInput(input, {
  initialCountry: "auto",
  separateDialCode: true,
  useFullscreenPopup: false,
  autoPlaceholder: "polite",
  geoIpLookup: function (success, failure) {
    fetch("https://ipapi.co/json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        success(data.country_code);
      })
      .catch(function () {
        failure();
      });
  },
});

document.querySelector(".form-type-phone").addEventListener("submit", (e) => {
  e.preventDefault();
  let code = iti.getSelectedCountryData().dialCode;
  let phoneNumber = input.value;

  if (code && phoneNumber) {
    let fullPhoneNumber = `+${code}${phoneNumber}`;
    console.log("Full phone number:", fullPhoneNumber);
  } else {
    console.error("Unable to retrieve the dial code or phone number.");
  }
});
