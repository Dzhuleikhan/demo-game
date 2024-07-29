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

const emailForm = document.querySelector(".form-type-email");
const phoneForm = document.querySelector(".form-type-phone");
const socialForm = document.querySelector(".form-type-social");
const oneClickForm = document.querySelector(".form-type-oneclick");

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

// Validate socials input
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

  inputs.forEach((inp) => {
    inp.addEventListener("input", () => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    });
  });
}

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
    const icon = promo.querySelector(".promocode-check-icon");
    const promocodeInput = promo.querySelector("input");

    promocodeInput.addEventListener("focusout", () => {
      if (promocodeInput.value.length >= 1) {
        promocodeBox.classList.add("valid");
        promocodeBox.classList.remove("non-valid");
        icon.classList.remove("fill-lightGray");
        icon.classList.add("fill-successGreen");
      } else {
        promocodeBox.classList.add("non-valid");
        promocodeBox.classList.remove("valid");
        icon.classList.add("fill-lightGray");
        icon.classList.remove("fill-successGreen");
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
    const terms = form.querySelector(".terms-input");

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
      let phoneNumber = input.value;
      if (input.value === "") {
        phone.classList.add("non-valid");
        isValid = false;
      } else {
        if (code && phoneNumber) {
          let fullPhoneNumber = `+${code}${phoneNumber.replace(/\s+/g, "")}`;
          alert(fullPhoneNumber);
          if (iti.isValidNumber()) {
            formData.phone = +fullPhoneNumber;
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
        icon.classList.remove("fill-lightGray");
        icon.classList.add("fill-successGreen");
      }
    }

    if (terms) {
      // Checking terms and conditions
      if (!terms.checked) {
        terms.classList.add("non-valid");
        isValid = false;
      } else {
        terms.classList.remove("non-valid");
      }
    }

    if (isValid) {
      alert(JSON.stringify(formData));
      resetForm(form);
    }
  });
}

/**
 *  Reseting form
 */
function resetForm(form) {
  form.reset();
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
  }
}
submitForm(emailForm);
submitForm(phoneForm);
submitForm(socialForm);
submitForm(oneClickForm);

/**
 *  Validation CTA
 */
const validationCta = document.querySelectorAll(".validation-cta");

validationCta.forEach((el) => {
  if (el) {
    let error = el.querySelector(".error-alert");
    let x = el.querySelector(".wrong");

    x.addEventListener("pointerenter", () => {
      error.classList.add("is-visible");
    });
    x.addEventListener("pointerleave", () => {
      error.classList.remove("is-visible");
    });
  }
});
