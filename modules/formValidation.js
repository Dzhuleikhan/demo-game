import intlTelInput from "intl-tel-input/intlTelInputWithUtils";

const input = document.querySelector(".phone-input");

const geoIpLookup = (success, failure) => {
  const cachedData = localStorage.getItem("geoIpData");
  if (cachedData) {
    success(JSON.parse(cachedData).country);
  } else {
    fetch("https://ipinfo.io/json?token=fcd65e5fcfdda1")
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("geoIpData", JSON.stringify(data));
        success(data.country);
      })
      .catch(() => {
        failure();
      });
  }
};

const iti = intlTelInput(input, {
  initialCountry: "auto",
  separateDialCode: true,
  useFullscreenPopup: false,
  autoPlaceholder: "polite",
  geoIpLookup: geoIpLookup,
});

const emailForm = document.querySelector(".form-type-email");
const phoneForm = document.querySelector(".form-type-phone");
const socialForm = document.querySelectorAll(".form-type-social");
const oneClickForm = document.querySelector(".form-type-oneclick");
const termsCheckbox = document.querySelectorAll(".terms-checkbox");
const formsWrapper = document.querySelectorAll(".form");

formsWrapper.forEach((form) => {
  if (form) {
    let emailInput = form.querySelector("input[type='email']");
    let telInput = form.querySelector("input[type='tel']");
    if (emailInput) {
      emailInput.addEventListener("input", () => {
        localStorage.setItem("emailValue", emailInput.value);
      });
      emailInput.value = localStorage.getItem("emailValue");
    }
    if (telInput) {
      telInput.addEventListener("input", () => {
        localStorage.setItem("phoneValue", telInput.value);
      });
      telInput.value = localStorage.getItem("phoneValue");
    }
  }
});

// Validate email input
function validateEmailInput() {
  const formEmail = document.querySelector(".form-email");
  if (formEmail) {
    const formEmailInput = formEmail.querySelector("input");
    const emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // formEmailInput.addEventListener("input", () => {
    function emailInputValidate() {
      let inputValue = formEmailInput.value.toLowerCase();
      if (inputValue === "") {
        formEmail.classList.remove("valid");
        formEmail.classList.remove("non-valid");
      } else {
        formEmail.querySelector(".validation-cta").classList.remove("hidden");
        if (inputValue.match(emailRegEx)) {
          console.log("valid");
          formEmail.classList.remove("non-valid");
          formEmail.classList.add("valid");
        } else {
          console.log("not valid");
          formEmail.classList.remove("valid");
          formEmail.classList.add("non-valid");
        }
      }
    }
    // });

    formEmailInput.addEventListener("focusout", emailInputValidate);
    formEmailInput.addEventListener("focusin", () => {
      formEmail.classList.remove("valid");
      formEmail.classList.remove("non-valid");
    });
  }
}
validateEmailInput();

// Validate password input
function validatePasswordInput() {
  const formPassword = document.querySelector(".form-password");

  if (formPassword) {
    const formPasswordInput = formPassword.querySelector("input");
    const showPasswordBtn = formPassword.querySelector(".show-password");

    function passwordInputValidation() {
      let inputValue = formPasswordInput.value;
      if (inputValue === "") {
        formPassword.classList.remove("valid");
        formPassword.classList.remove("non-valid");
        showPasswordBtn.classList.add("hidden");
      } else {
        showPasswordBtn.classList.remove("hidden");
        if (inputValue.length >= 6) {
          formPassword.classList.remove("non-valid");
          formPassword.classList.add("valid");
        } else {
          formPassword.classList.add("non-valid");
          formPassword.classList.remove("valid");
        }
      }
    }

    formPasswordInput.addEventListener("focusout", passwordInputValidation);
    formPasswordInput.addEventListener("focusin", () => {
      formPassword.classList.remove("non-valid");
      formPassword.classList.remove("valid");
    });

    // Toggle password visibility

    if (showPasswordBtn) {
      showPasswordBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log(formPasswordInput.type);

        if (formPasswordInput.type === "password") {
          formPasswordInput.type = "text";
        } else {
          formPasswordInput.type = "password";
        }
      });
    }
  }
}
validatePasswordInput();

// Password input placeholder
const passwordInput = document.querySelectorAll(".password-input");

passwordInput.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.length >= 1) {
      input.nextElementSibling.classList.add("hidden");
    } else {
      input.nextElementSibling.classList.remove("hidden");
    }
  });
});

// Validate socials input

socialForm.forEach((socialForm) => {
  if (socialForm) {
    let inputs = socialForm.querySelectorAll("input[name='social-variant']");
    const submitBtn = socialForm.querySelector(".form-submit-btn");

    let socialInput = document.querySelector(
      'input[name="social-variant"]:checked',
    );
    if (!socialInput) {
      socialForm.querySelector(".form-submit-btn").disabled = true;
    } else {
      socialForm.querySelector(".form-submit-btn").disabled = false;
    }

    const btnText1 = submitBtn.querySelector(".btn--1");
    const btnText2 = submitBtn.querySelector(".btn--2");

    btnText2.style.display = "none";

    inputs.forEach((inp) => {
      inp.addEventListener("input", () => {
        submitBtn.disabled = false;
        btnText1.style.display = "none";
        btnText2.style.display = "block";
      });
    });
  }
});

// Terms validation
termsCheckbox.forEach((el) => {
  if (el) {
    const input = el.querySelector("input");
    input.addEventListener("input", () => {
      const text = el.querySelector("span");
      if (input.checked) {
        text.style.color = "#8A95C1";
      } else {
        text.style.color = "#FF5530";
      }
    });
  }
});

// Validate phone input
if (phoneForm) {
  const phone = phoneForm.querySelector(".form-phone");
  const input = phone.querySelector("input[name='phone']");

  function validatePhoneNumber() {
    if (!input.value.trim()) {
      phone.classList.remove("non-valid");
      phone.classList.add("non-valid");
      return false;
    } else if (iti.isValidNumber()) {
      phone.classList.remove("non-valid");
      phone.classList.add("valid");
      return true;
    } else {
      phone.classList.add("non-valid");
      phone.classList.remove("valid");
      return false;
    }
  }

  input.addEventListener("focusout", validatePhoneNumber);
  input.addEventListener("focusin", () => {
    phone.classList.remove("non-valid");
    phone.classList.remove("valid");
  });
}

/**
 *  Promocode
 */
const promocodeWrapper = document.querySelectorAll(".promocode-wrapper");

promocodeWrapper.forEach((promo) => {
  if (promo) {
    const promocodeBtn = promo.querySelector(".promocode-btn");
    const promocodeBox = promo.querySelector(".promocode-input-box");
    const iconValid = promo.querySelector(".icon-valid");
    const iconInvalidalid = promo.querySelector(".icon-invalid");
    const promocodeInput = promo.querySelector("input");

    promocodeInput.addEventListener("focusout", () => {
      if (promocodeInput.value.length >= 1) {
        promocodeBox.classList.add("valid");
        promocodeBox.classList.remove("non-valid");
        iconValid.classList.remove("hidden");
        iconInvalidalid.classList.add("hidden");
      } else {
        promocodeBox.classList.remove("non-valid");
        promocodeBox.classList.remove("valid");
        iconValid.classList.add("hidden");
        iconInvalidalid.classList.remove("hidden");
      }
    });

    promocodeBtn.addEventListener("click", () => {
      promocodeBtn.classList.add("hidden");
      promocodeBox.classList.remove("hidden");
      promocodeBox.classList.add("grid");
    });
  }
});

/**
 *  Bonus dropdown
 */

const formBonus = document.querySelectorAll(".form-bonus");

formBonus.forEach((bonus) => {
  if (bonus) {
    const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
    const bonusDropdownList = bonus.querySelector(".form-bonus-dropdown");
    const bonusListItems = bonusDropdownList.querySelectorAll("li");

    // Function to hide the dropdown
    function hideDropdown() {
      bonusDropdownBtn.classList.remove("active");
      bonusDropdownList.classList.remove("active");
    }

    // Event listener for dropdown button
    bonusDropdownBtn.addEventListener("click", () => {
      bonusDropdownBtn.classList.toggle("active");
      bonusDropdownList.classList.toggle("active");
    });

    // Event listener for list items
    bonusListItems.forEach((item) => {
      item.addEventListener("click", () => {
        // Get the selected bonus details
        let bonusIcon = item.querySelector(".bonus-item-icon").src;
        let bonusName = item.querySelector(".bonus-item-name").textContent;
        let bonusId = item.getAttribute("data-bonus-id");

        // Update all form bonus elements with the selected bonus details
        formBonus.forEach((bonus) => {
          const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
          const bonusInput = bonus.querySelector(".bonus-input");
          const bonusListItems = bonus.querySelectorAll("li");

          // Update the dropdown button and input for the current bonus
          bonusDropdownBtn.querySelector(".main-bonus-icon").src = bonusIcon;
          bonusDropdownBtn.querySelector(".main-bonus-name").textContent =
            bonusName;
          bonusInput.value = bonusId;

          // Update the list items' active state
          bonusListItems.forEach((el) => {
            el.classList.remove("active");
            if (
              el.querySelector(".bonus-item-name").textContent === bonusName
            ) {
              el.classList.add("active");
            }
          });
        });

        hideDropdown();

        // Save selected bonus to localStorage
        localStorage.setItem(
          "selectedBonus",
          JSON.stringify({ bonusIcon, bonusId }),
        );
      });
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!bonus.contains(event.target)) {
        hideDropdown();
      }
    });

    // Load selected bonus from localStorage if it exists
    const savedBonus = JSON.parse(localStorage.getItem("selectedBonus"));
    if (savedBonus) {
      formBonus.forEach((bonus) => {
        const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
        const bonusInput = bonus.querySelector(".bonus-input");
        const bonusListItems = bonus.querySelectorAll("li");

        bonusListItems.forEach((item) => {
          let itemIcon = item.querySelector(".bonus-item-icon").src;
          let itemName = item.querySelector(".bonus-item-name").textContent;

          if (
            itemIcon === savedBonus.bonusIcon &&
            itemName === savedBonus.bonusName
          ) {
            item.classList.add("active");
            bonusDropdownBtn.querySelector(".main-bonus-icon").src =
              savedBonus.bonusIcon;
            bonusDropdownBtn.querySelector(".main-bonus-name").textContent =
              savedBonus.bonusName;
            bonusInput.value = savedBonus.bonusName;
          }
        });
      });
    }
  }
});

// Hidden select
const hiddenSelect = document.getElementById("hidden-select");

document.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    if (hiddenSelect.classList.contains("hidden")) {
      hiddenSelect.classList.remove("hidden");
      hiddenSelect.focus();
    } else {
      hiddenSelect.classList.add("hidden");
    }
  }
});

let pressTimer;

// Mobile touch support
document.addEventListener("touchstart", function () {
  pressTimer = setTimeout(function () {
    if (hiddenSelect.classList.contains("hidden")) {
      hiddenSelect.classList.remove("hidden");
      hiddenSelect.focus();
    } else {
      hiddenSelect.classList.add("hidden");
    }
  }, 1000);
});

document.addEventListener("touchend", function () {
  clearTimeout(pressTimer);
});

/**
 *  Submitting form
 */
function submitForm(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const socials = form.querySelector(".socials");
    const currency = form.querySelector(".form-currency");
    const email = form.querySelector(".form-email");
    const phone = form.querySelector(".form-phone");
    const password = form.querySelector(".form-password");
    const bonus = form.querySelector(".form-bonus");
    const promoCode = form.querySelector(".promocode-input-box");
    const promoCodeWrapper = form.querySelector(".promocode-wrapper");
    const terms = form.querySelector(".checkbox");
    const formbtn = form.querySelector(".form-yellow-btn");

    let formType = form.getAttribute("data-from-type");

    let formData = {};
    let isValid = true;

    // Checking socials
    if (socials) {
      let inputs = socials.querySelectorAll(".social-variant-input");
      let checked = socials.querySelector(
        'input[name="social-variant"]:checked',
      );
      if (!checked) {
        isValid = false;
        submitBtn.disabled = true;
      } else {
        formData.social = checked.value;
      }
    }

    // Checking currency
    if (currency) {
      let input = currency.querySelector("input");
      formData.currency = input.value;
    }

    // Checking Phone
    if (phone) {
      const input = phone.querySelector("input[name='phone']");
      let code = iti.getSelectedCountryData().dialCode;
      let phoneNumber = input.value.trim();
      if (input.value === "" || !iti.isValidNumber()) {
        phone.classList.add("non-valid");
        isValid = false;
      } else {
        if (code && phoneNumber) {
          let sanitizedPhoneNumber = phoneNumber.replace(/\D/g, "");
          let fullPhoneNumber = `${code}${sanitizedPhoneNumber}`;
          if (iti.isValidNumber()) {
            formData.phone = fullPhoneNumber;
          } else {
            isValid = false;
          }
        } else {
          console.error("Unable to retrieve the dial code or phone number.");
        }
      }
    }

    // checking email
    if (email) {
      let input = email.querySelector("input");

      if (
        input.value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ) {
        email.classList.remove("non-valid");
        formData.email = input.value;
      } else {
        email.classList.add("non-valid");
        isValid = false;
      }
    }

    // checking password
    if (password) {
      let input = password.querySelector("input");
      if (input.value.length >= 6) {
        password.classList.remove("non-valid");
        formData.password = input.value;
      } else {
        password.classList.add("non-valid");
        isValid = false;
      }
    }

    // Checking Bonus
    if (bonus) {
      let input = bonus.querySelector("input");
      formData.bonus = input.value;
    }

    // Checking Promocode
    if (promoCode) {
      let input = promoCode.querySelector("input");
      let icon = promoCode.querySelector(".promocode-check-icon");

      if (input.value.length >= 1) {
        formData.promocode = input.value;
      }
    }

    // Checking terms and  conditions
    if (terms) {
      const input = terms.querySelector("input");
      if (!input.checked) {
        input.classList.add("non-valid");
        isValid = false;
      } else {
        input.classList.remove("non-valid");
      }
    }

    function disableEmailForm() {
      currency.classList.add("submit-disabled");
      email.classList.add("submit-disabled");
      password.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
    }

    function disablePhoneForm() {
      currency.classList.add("submit-disabled");
      phone.classList.add("submit-disabled");
      password.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
    }

    function disableSocialForm() {
      socials.classList.add("submit-disabled");
      currency.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
      formbtn.querySelector(".btn--2").style.display = "none";
    }

    function disableOneClickForm() {
      currency.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
    }

    let lang = localStorage.getItem("preferredLanguage");

    if (isValid) {
      if (formType === "email") {
        disableEmailForm();
        window.location.href = `https://${hiddenSelect.value === "prod" ? "" : "dev."}gbetauth.com/api/register?env=dev&type=${formType}&currency=${formData.currency}&email=${formData.email}&password=${formData.password}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}?utm_campaign=100110754_1705949_nodescription&utm_content=100110754&utm_medium=casap&utm_source=aff`;
      } else if (formType === "phone") {
        disablePhoneForm();
        window.location.href = `https://${hiddenSelect.value === "prod" ? "" : "dev."}gbetauth.com/api/register?env=dev&type=${formType}&currency=${formData.currency}&phone=${formData.phone}&password=${formData.password}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}?utm_campaign=100110754_1705949_nodescription&utm_content=100110754&utm_medium=casap&utm_source=aff`;
      } else if (formType === "social") {
        disableSocialForm();
        window.location.href = `https://${hiddenSelect.value === "prod" ? "" : "dev."}gbetauth.com/api/register?env=dev&type=${formData.social}&currency=${formData.currency}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}?utm_campaign=100110754_1705949_nodescription&utm_content=100110754&utm_medium=casap&utm_source=aff`;
      } else if (formType === "oneclick") {
        disableOneClickForm();
        window.location.href = `https://${hiddenSelect.value === "prod" ? "" : "dev."}gbetauth.com/api/register?env=dev&type=${formType}&currency=${formData.currency}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}?utm_campaign=100110754_1705949_nodescription&utm_content=100110754&utm_medium=casap&utm_source=aff`;
      }
    }
  });
}

/**
 *  Resetting form
 */
function resetForm(form) {
  form.reset();
  promocodeWrapper.forEach((el) => {
    let valid = el.querySelector(".icon-valid");
    let invalid = el.querySelector(".icon-invalid");
    valid.classList.add("hidden");
    invalid.classList.remove("hidden");
  });
  form
    .querySelectorAll(".non-valid")
    .forEach((el) => el.classList.remove("non-valid"));
  form.querySelectorAll(".valid").forEach((el) => el.classList.remove("valid"));
  const showPasswordBtn = form.querySelector(".show-password");
  if (showPasswordBtn) {
    showPasswordBtn.classList.add("hidden");
  }
  const submitBtn = form.querySelector(".form-submit-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Choose a social";
  }
}
submitForm(emailForm);
submitForm(phoneForm);
submitForm(oneClickForm);

socialForm.forEach((socialForm) => {
  submitForm(socialForm);
});

/**
 *  Validation CTA
 */
const validationCta = document.querySelectorAll(".validation-cta");

validationCta.forEach((el) => {
  if (el) {
    let error = el.querySelector(".error-alert");
    let x = el.querySelector(".wrong");

    x.addEventListener("mouseenter", () => {
      error.classList.add("is-visible");
    });
    x.addEventListener("mouseleave", () => {
      error.classList.remove("is-visible");
    });
  }
});
