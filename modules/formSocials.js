import gsap from "gsap";
import horizontalLoop from "./marquee";
import { Power1 } from "gsap";
import { socialsIti } from "./itiTelInput.js";
import { getUrlParameter, removeUrlParameter } from "./params.js";
import { hiddenSelect } from "./hiddenSelect.js";
import { newDomain } from "./fetchingDomain.js";
import { checkTir1CurrencyMatch } from "./modalCurrency.js";
import { getSupportedLanguage } from "./geoLocation.js";
import {
  checkPhoneAvailability,
  getPhoneStatus,
  phoneTakenMessage,
} from "./phoneAvailability.js";
import {
  checkEmailAvailability,
  getEmailStatus,
  normalizeEmail,
  emailTakenMessage,
} from "./emailAvailability.js";

// | EMAIL-GUARD (Zeruh) helpers
// Source of truth — VPS snippet /email-guard.js (see EMAIL_GUARD docs).
// Deliverability + disposable + typo-correction live in the snippet now;
// the old local disposableEmail.js module is no longer used here.
// fail-open: if the snippet didn't load, validation falls back to regex only.
const egIsValid = (field) =>
  window.EmailGuard && window.EmailGuard.isValid
    ? window.EmailGuard.isValid(field)
    : true;
const egIsPending = (field) =>
  !!(
    window.EmailGuard &&
    window.EmailGuard.isPending &&
    window.EmailGuard.isPending(field)
  );
const egTags = () =>
  (window.EmailGuard && window.EmailGuard.tags && window.EmailGuard.tags()) ||
  "";

// | SHOWING BONUS BASED ON PARAMS

const landType = getUrlParameter("landType");
const onlyPhone = false;

export function setNewBonusBasedOnParams() {
  if (landType) {
    document.querySelector(".form-type-buttons").style.gridTemplateColumns =
      "1fr";
    if (!onlyPhone) {
      document
        .querySelector(".socials-form-type-btn[data-tab='phone']")
        .classList.add("hidden");
    }
    if (landType === "ndb") {
      const bonusSumAmount = document.querySelector(".bonus-sum-amount");
      const bonusSumCurrency = document.querySelector(".bonus-sum-currency");
      const bonusSumWager = document.querySelector(".bonus-sum-wager");
      const bonusSumWagerAmount = document.querySelector(
        ".bonus-sum-wager-amount",
      );

      const sumAmount = getUrlParameter("sumAmount");
      const currency = getUrlParameter("currency");
      const wager = getUrlParameter("wager");

      document.querySelector(".bonus-input-current").classList.add("hidden");
      document.querySelector(".bonus-input-dynamic").classList.remove("hidden");
      document.querySelector(".sign-up-text-current").classList.add("hidden");
      document
        .querySelector(".sign-up-text-dynamic")
        .classList.remove("hidden");

      bonusSumAmount.textContent = sumAmount || "275";
      bonusSumCurrency.textContent = currency || "CZK";

      document.querySelector(".bonus-subtext-current").classList.add("hidden");

      if (wager) {
        document
          .querySelector(".bonus-subtext-current")
          .classList.add("hidden");
        document
          .querySelector(".bonus-subtext-dynamic")
          .classList.remove("hidden");
        bonusSumWagerAmount.textContent = wager || "20";
      } else {
        bonusSumWager.style.display = "none";
      }
    } else {
      removeUrlParameter("landType");
    }
  }
}

// | SOCIALS FORM VALIDATING AND SUBMITTING
export let formStepCount = 1;
const formSteps = document.querySelectorAll(".socials-form-step");

const changingFormSteps = (stepCount) => {
  formSteps.forEach((step) => {
    if (step) {
      formSteps.forEach((el) => {
        el.classList.add("hidden");
      });
      document
        .querySelector(`.socials-form-step-${stepCount}`)
        .classList.remove("hidden");
    }
  });
};
changingFormSteps(formStepCount);

const formModals = document.querySelectorAll(".form-modal-socials");

let formTabParam = getUrlParameter("method-type");

let formTab = onlyPhone
  ? "phone"
  : formTabParam === "phone"
    ? "phone"
    : "email";

if (onlyPhone) {
  document.querySelector(".form-type-buttons").style.gridTemplateColumns =
    "1fr";
  document
    .querySelector(".socials-form-type-btn[data-tab='email']")
    .classList.add("hidden");
  document
    .querySelector(".socials-form-type-btn[data-tab='email']")
    .classList.remove("active");
  document
    .querySelector(".socials-form-type-btn[data-tab='phone']")
    .classList.add("active");
  document
    .querySelector(".socials-form-group-email")
    .classList.remove("active");
  document.querySelector(".socials-form-group-phone").classList.add("active");
} else if (formTab === "phone") {
  document.querySelector(".form-type-buttons").style.gridTemplateColumns =
    "1fr";
  document
    .querySelector(".socials-form-type-btn[data-tab='email']")
    .classList.add("hidden");
  document
    .querySelector(".socials-form-type-btn[data-tab='email']")
    .classList.remove("active");
  document
    .querySelector(".socials-form-type-btn[data-tab='phone']")
    .classList.remove("hidden");
  document
    .querySelector(".socials-form-type-btn[data-tab='phone']")
    .classList.add("active");
  document
    .querySelector(".socials-form-group-email")
    .classList.remove("active");
  document.querySelector(".socials-form-group-phone").classList.add("active");
} else {
  document.querySelector(".form-type-buttons").style.gridTemplateColumns =
    "1fr";
  document
    .querySelector(".socials-form-type-btn[data-tab='phone']")
    .classList.add("hidden");
}

formModals.forEach((modal) => {
  if (modal) {
    const formTypeBtns = document.querySelectorAll(".socials-form-type-btn");
    const formGroups = document.querySelectorAll(".socials-form-group");

    const formStep1 = modal.querySelector(".socials-form-step-1");
    const formStep2 = modal.querySelector(".socials-form-step-2");
    const formStepBtnPrev = document.querySelector(".form-step-btn-prev");

    // STEP 1
    if (formStep1) {
      const formStepBtnNext = formStep1.querySelector(".form-step-btn-next");

      // Validating Email input
      const emailRegEx =
        /^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]{0,62}[a-zA-Z0-9]@(?:\[(?:\d{1,3}\.){3}\d{1,3}\]|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+)$/;
      const formGroupEmail = formStep1.querySelector(
        ".socials-form-group-email",
      );
      const emalInput = formGroupEmail.querySelector(".email-input");
      const emailNotValidIcon = formGroupEmail.querySelector(".not-valid-icon");
      const emailSpinner = formGroupEmail.querySelector(".email-check-spinner");

      const showEmailSpinner = () =>
        emailSpinner && emailSpinner.classList.remove("hidden");
      const hideEmailSpinner = () =>
        emailSpinner && emailSpinner.classList.add("hidden");
      const showEmailError = () => {
        formGroupEmail.classList.add("not-valid");
        emailNotValidIcon.classList.remove("hidden");
      };
      const clearEmailError = () => {
        formGroupEmail.classList.remove("not-valid");
        emailNotValidIcon.classList.add("hidden");
      };

      // | EMAIL AVAILABILITY (occupancy) helpers — runs AFTER syntax + Zeruh.
      const currentEmail = () => normalizeEmail(emalInput.value);
      // alert lives OUTSIDE the fixed-height group (block sibling) — see §5.2
      const emailAlertEl = formStep1.querySelector(".socials-email-alert");
      const emailSpinnerEl = formStep1.querySelector(".socials-email-spinner");

      // email is valid only when syntax passes AND Email-Guard (Zeruh)
      // confirms deliverability AND occupancy check says it's free.
      // egIsValid() is fail-open if snippet absent; occupancy is fail-open too.
      const isEmailValid = () => {
        if (!emailRegEx.test(emalInput.value.trim()) || !egIsValid(emalInput))
          return false;
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return false; // waiting for occupancy verdict
        if (st.errored) return true; // fail-open
        return st.available === true; // taken → false
      };

      const updateEmailAlert = () => {
        const st = getEmailStatus(currentEmail());
        const taken =
          emailRegEx.test(emalInput.value.trim()) &&
          egIsValid(emalInput) &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        if (emailAlertEl) {
          emailAlertEl.textContent = taken
            ? emailTakenMessage(document.documentElement.lang || "en")
            : "";
          emailAlertEl.classList.toggle("hidden", !taken);
        }
      };

      const updateEmailSpinner = () => {
        if (!emailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking =
          emailRegEx.test(emalInput.value.trim()) &&
          egIsValid(emalInput) &&
          !!st &&
          st.pending;
        emailSpinnerEl.classList.toggle("hidden", !checking);
      };

      // launch occupancy check once syntax + Zeruh pass; reconcile gate + UI
      const maybeCheckEmail = () => {
        if (!emailRegEx.test(emalInput.value.trim()) || !egIsValid(emalInput))
          return;
        checkEmailAvailability(currentEmail()).then(() => {
          if (formTab === "email") {
            formStepBtnNext.disabled = !isEmailValid();
            updateEmailAlert();
          }
          updateEmailSpinner();
        });
        updateEmailSpinner(); // entry is pending now → spinner appears same tick
      };

      emalInput.addEventListener("focusout", () => {
        const value = emalInput.value.trim();
        if (value === "") {
          hideEmailSpinner();
          clearEmailError();
          formStepBtnNext.disabled = true;
          return;
        }
        if (!emailRegEx.test(value)) {
          hideEmailSpinner();
          showEmailError();
          formStepBtnNext.disabled = true;
          return;
        }
        // syntax ok — gate on the Zeruh verdict; show spinner while it checks.
        // deferred so Email-Guard's own blur handler marks the field pending first.
        clearEmailError();
        formStepBtnNext.disabled = !isEmailValid();
        if (window.EmailGuard) {
          setTimeout(() => {
            if (egIsPending(emalInput)) showEmailSpinner();
          }, 0);
        }
        // fallback: if Zeruh already passed (no snippet / cached), kick occupancy
        maybeCheckEmail();
        updateEmailAlert();
      });

      emalInput.addEventListener("input", () => {
        // editing the field restarts the check on the next blur
        hideEmailSpinner();
        clearEmailError();
        formStepBtnNext.disabled = !isEmailValid();
      });

      // async Zeruh verdict → reconcile spinner, error icon and the button
      emalInput.addEventListener("emailguard:result", (e) => {
        if (!egIsPending(emalInput)) hideEmailSpinner();
        const state = e.detail && e.detail.state;
        if (state === "blocked" || state === "invalid") {
          showEmailError();
        } else {
          clearEmailError();
          // Zeruh passed → now run the occupancy check
          maybeCheckEmail();
        }
        if (formTab === "email") {
          formStepBtnNext.disabled = !isEmailValid();
          updateEmailAlert();
        }
      });

      // editing the field resets occupancy UI (entry becomes null → spinner off)
      emalInput.addEventListener("input", () => {
        updateEmailSpinner();
        updateEmailAlert();
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // | PHONE AVAILABILITY (occupancy) helpers
      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(/\D/g, "")}`;
      // alert lives OUTSIDE the fixed-height group (block sibling) — see §5.2
      const phoneAlertEl = formStep1.querySelector(".socials-phone-alert");
      const phoneSpinnerEl = formStep1.querySelector(".socials-phone-spinner");

      // occupancy gate (fail-open): no verdict/pending → not ok; errored → ok;
      // available===true → ok; available===false → taken → not ok.
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };

      const updatePhoneAlert = () => {
        const st = getPhoneStatus(phoneE164());
        const taken =
          socialsIti.isValidNumber() &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        if (phoneAlertEl) {
          phoneAlertEl.textContent = taken
            ? phoneTakenMessage(document.documentElement.lang || "en")
            : "";
          phoneAlertEl.classList.toggle("hidden", !taken);
        }
      };

      const updatePhoneSpinner = () => {
        if (!phoneSpinnerEl) return;
        const st = getPhoneStatus(phoneE164());
        const checking = socialsIti.isValidNumber() && !!st && st.pending;
        phoneSpinnerEl.classList.toggle("hidden", !checking);
      };

      function validatePhoneNumber() {
        if (phoneInput.value === "") {
          formGroupPhone.classList.remove("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
        } else if (!phoneInput.value.trim()) {
          formGroupPhone.classList.add("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
          formStepBtnNext.disabled = true;
          return false;
        } else if (socialsIti.isValidNumber()) {
          // format ok — gate the button on the occupancy verdict; DON'T launch
          // the check here (the .then re-runs this fn → would loop on errored).
          formGroupPhone.classList.remove("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          formStepBtnNext.disabled = !phoneAvailOk();
          updatePhoneAlert();
          return true;
        } else {
          formGroupPhone.classList.add("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
          formStepBtnNext.disabled = true;
          return false;
        }
      }

      // Validating Phone input — launch occupancy check on blur (once per blur),
      // keeping validatePhoneNumber() pure (see §5.2 b).
      phoneInput.addEventListener("focusout", () => {
        validatePhoneNumber();
        if (socialsIti.isValidNumber()) {
          checkPhoneAvailability(phoneE164()).then(() => {
            if (formTab === "phone") {
              formStepBtnNext.disabled = !phoneAvailOk();
              updatePhoneAlert();
            }
            updatePhoneSpinner();
          });
          updatePhoneSpinner(); // entry is pending now → spinner appears same tick
        }
      });
      // e164 changed → entry becomes null → spinner/alert reset
      phoneInput.addEventListener("input", () => {
        updatePhoneSpinner();
        updatePhoneAlert();
      });

      const advanceToStep2 = () => {
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      };

      // | OCCUPANCY FAILOVER on step1 → step2 (registered BEFORE the advance
      // handler so it can stop it). Only checks the ACTIVE tab's channel.
      // The button may be enabled by format alone (tab-switch handler) — so we
      // gate strictly on the field being valid, not merely "verdict exists".
      formStepBtnNext.addEventListener("click", (e) => {
        if (formTab === "email") {
          const st = getEmailStatus(currentEmail());
          if (st && !st.pending) {
            if (isEmailValid()) return; // free / fail-open → let advance run
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            updateEmailAlert();
            return;
          }
          // no verdict yet — finish the check before deciding
          e.preventDefault();
          e.stopImmediatePropagation();
          checkEmailAvailability(currentEmail()).then(() => {
            updateEmailSpinner();
            updateEmailAlert();
            if (isEmailValid()) advanceToStep2();
            else formStepBtnNext.disabled = true;
          });
          updateEmailSpinner();
          return;
        }
        if (formTab === "phone") {
          if (!socialsIti.isValidNumber()) return; // format gate handles it
          const st = getPhoneStatus(phoneE164());
          if (st && !st.pending) {
            if (phoneAvailOk()) return; // free / fail-open → let advance run
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            updatePhoneAlert();
            return;
          }
          e.preventDefault();
          e.stopImmediatePropagation();
          checkPhoneAvailability(phoneE164()).then(() => {
            updatePhoneSpinner();
            updatePhoneAlert();
            if (phoneAvailOk()) advanceToStep2();
            else formStepBtnNext.disabled = true;
          });
          updatePhoneSpinner();
        }
      });

      formStepBtnNext.addEventListener("click", (e) => {
        e.preventDefault();
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      });

      // re-translate occupancy alerts on language switch (one observer, BOTH
      // updaters — see §4 grabli)
      new MutationObserver(() => {
        updateEmailAlert();
        updatePhoneAlert();
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
      });
      if (formStepBtnPrev) {
        formStepBtnPrev.addEventListener("click", () => {
          formStepCount--;
          changingFormSteps(formStepCount);
          formStepBtnPrev.classList.add("hidden");
        });
      }

      // Changing tabs in step 1
      formTypeBtns.forEach((btn) => {
        if (btn) {
          btn.addEventListener("click", (e) => {
            let tab = e.target.getAttribute("data-tab");
            formTypeBtns.forEach((el) => {
              el.classList.remove("active");
            });
            btn.classList.add("active");
            formTab = tab;

            if (tab === "email") {
              formGroupPhone.classList.remove("not-valid");
              phoneInput.value = "";
              formStepBtnNext.disabled = !isEmailValid();
            }
            if (tab === "phone") {
              formGroupEmail.classList.remove("not-valid");
              emalInput.value = "";
              if (phoneInput.value != "" && socialsIti.isValidNumber()) {
                formStepBtnNext.disabled = false;
              } else {
                formStepBtnNext.disabled = true;
              }
            }

            formGroups.forEach((group) => {
              group.classList.remove("active");
            });
            document
              .querySelector(`.socials-form-group-${tab}`)
              .classList.add("active");
          });
        }
      });
    }

    // STEP 2
    if (formStep2) {
      const formStepBtnNext = formStep2.querySelector(".form-step-btn-next");

      // Password validation
      const formGroupPassword = formStep2.querySelector(
        ".socials-form-group-password",
      );
      const passwordInput = formGroupPassword.querySelector(".password-input");
      const passwordShowIcon =
        formGroupPassword.querySelector(".show-password-btn");

      if (formGroupPassword) {
        passwordShowIcon.addEventListener("click", () => {
          if (passwordInput.type === "password") {
            passwordInput.setAttribute("type", "text");
            passwordShowIcon.src =
              "https://3344112-img.b-cdn.net/graphic/landings/socialsFormImages/password-visible.svg";
          } else {
            passwordInput.setAttribute("type", "password");
            passwordShowIcon.src =
              "https://3344112-img.b-cdn.net/graphic/landings/socialsFormImages/password-invisible.svg";
          }
        });
      }

      const validatePassword = () => {
        if (passwordInput.value.length >= 6) {
          formStepBtnNext.disabled = false;
          formGroupPassword.classList.remove("not-valid");
          formGroupPassword
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
        } else {
          formStepBtnNext.disabled = true;
          formGroupPassword.classList.add("not-valid");
          formGroupPassword
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
        }
      };

      // CHECKBOX VALIDATION
      const checkboxInput = formStep2.querySelector(".checkbox-input");

      passwordInput.addEventListener("focusout", validatePassword);
      passwordInput.addEventListener("input", () => {
        if (passwordInput.value.length >= 6) {
          formStepBtnNext.disabled = false;
        } else {
          formStepBtnNext.disabled = true;
        }
      });

      checkboxInput.addEventListener("change", () => {
        if (formTab === "email") {
          if (
            checkboxInput.checked === true &&
            passwordInput.value.length >= 6
          ) {
            formStepBtnNext.disabled = false;
          } else {
            formStepBtnNext.disabled = true;
          }
        }
        if (formTab === "phone") {
          if (checkboxInput.checked === true) {
            formStepBtnNext.disabled = false;
          } else {
            formStepBtnNext.disabled = true;
          }
        }
      });
    }
  }
});

const mainForm = document.querySelector(".socials-form");

function disableFormWhileSubmitting() {
  mainForm.classList.add("loading");
  mainForm.querySelector(".main-form-submit-btn").disabled = true;
}

let cid = getUrlParameter("cid");
let partner = getUrlParameter("partner");
let offer = getUrlParameter("offer");
let lang = localStorage.getItem("preferredLanguage");
let promocode;
if (landType) {
  promocode = getUrlParameter("promocode");
}

if (mainForm) {
  mainForm.addEventListener("keydown", (e) => {
    const step1btn = mainForm.querySelector(".form-step-btn-1");
    const submitBtn = mainForm.querySelector("button[type='submit']");
    const formStepBtnPrev = document.querySelector(".form-step-btn-prev");

    const email = mainForm.querySelector(".email-input");
    const phone = mainForm.querySelector(".phone-input");
    const password = mainForm.querySelector(".password-input");
    const currency = mainForm.querySelector(".currency-input");
    const bonus = mainForm
      .querySelector(".bonus-input")
      .getAttribute("data-bonus");

    let formData = {};
    formData.email = email.value;
    formData.phone = phone.value;
    formData.password = password.value;
    formData.currency = currency.value;
    formData.bonus = bonus;
    formData.lang = lang;

    let code = socialsIti.getSelectedCountryData().dialCode;
    let phoneNumber = phone.value.trim();

    formData.bonus = checkTir1CurrencyMatch(formData.currency, formData.bonus);

    if (code && phoneNumber) {
      let sanitizedPhoneNumber = phoneNumber.replace(/\D/g, "");
      let fullPhoneNumber = `${code}${sanitizedPhoneNumber}`;
      if (socialsIti.isValidNumber()) {
        formData.phone = fullPhoneNumber;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (formStepCount === 1) {
        if (!step1btn.disabled) {
          formStepCount++;
          changingFormSteps(formStepCount);
          formStepBtnPrev.classList.remove("hidden");
        }
      }
      if (formStepCount === 2) {
        if (!submitBtn.disabled) {
          if (formTab === "email") {
            disableFormWhileSubmitting();

            window.location.href =
              `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}` +
              egTags();
            console.log(
              `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
            );
          } else if (formTab === "phone") {
            disableFormWhileSubmitting();

            window.location.href = `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;
            console.log(
              `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
            );
          }
        }
      }
    }
  });

  mainForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const step1btn = mainForm.querySelector(".form-step-btn-1");

    const email = mainForm.querySelector(".email-input");
    const phone = mainForm.querySelector(".phone-input");
    const password = mainForm.querySelector(".password-input");
    const currency = mainForm.querySelector(".currency-input");
    const bonus = mainForm
      .querySelector(".bonus-input")
      .getAttribute("data-bonus");

    let formData = {};
    formData.email = email.value;
    formData.phone = phone.value;
    formData.password = password.value;
    formData.currency = currency.value;
    formData.bonus = bonus;
    formData.lang = lang;

    let code = socialsIti.getSelectedCountryData().dialCode;
    let phoneNumber = phone.value.trim();

    formData.bonus = checkTir1CurrencyMatch(formData.currency, formData.bonus);

    if (code && phoneNumber) {
      let sanitizedPhoneNumber = phoneNumber.replace(/\D/g, "");
      let fullPhoneNumber = `${code}${sanitizedPhoneNumber}`;
      if (socialsIti.isValidNumber()) {
        formData.phone = fullPhoneNumber;
      }
    }

    if (formStepCount === 1) {
      if (!step1btn.disabled) {
        formStepCount++;
        changingFormSteps(formStepCount);
      }
    }

    if (formTab === "email") {
      disableFormWhileSubmitting();

      window.location.href =
        `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}` +
        egTags();
      console.log(
        `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
      );
    } else if (formTab === "phone") {
      disableFormWhileSubmitting();

      window.location.href = `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;
      console.log(
        `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
      );
    }
  });
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

const formSocialLinks = document.querySelectorAll(".socials-form-social-link");

formSocialLinks.forEach((link) => {
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const type = e.target.getAttribute("data-reg-type");
      let bonus = mainForm
        .querySelector(".bonus-input")
        .getAttribute("data-bonus");

      const lang = getSupportedLanguage(
        localStorage.getItem("preferredLanguage").toUpperCase(),
      );

      let currencyStoredData = localStorage.getItem("currencyData");
      let currencyData = JSON.parse(currencyStoredData);
      let currency = currencyData.abbr;

      bonus = checkTir1CurrencyMatch(currency, bonus);

      window.location.href = `https://${newDomain}/api/register?env=prod&type=${type}&currency=${currency}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;
      console.log(
        `https://${newDomain}/api/register?env=prod&type=${type}&currency=${currency}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
      );
    });
  }
});

// | SOCIALS FORM ANIMATIONS

horizontalLoop(".yellow-line-1", {
  repeat: -1,
  paused: false,
  speed: 0.3,
});

gsap.set(".marquee-1", {
  left: "-40px",
  bottom: "250px",
  rotate: 12,
  transformOrigin: "center center",
});
gsap.set(".marquee-2", {
  left: "-80px",
  bottom: "230px",
  rotate: -18,
  transformOrigin: "center center",
});
gsap.set(".wallet-image", {
  left: "50%",
  top: "50%",
  xPercent: -50,
  yPercent: -50,
});

const modalTimeLine = gsap.timeline();

modalTimeLine
  .to(
    ".marquee-1",
    {
      rotate: 5,
      ease: "none",
      duration: 2,
      yoyo: true,
      repeat: -1,
    },
    "<",
  )
  .to(
    ".marquee-2",
    {
      rotate: -12,
      ease: "none",
      duration: 2,
      yoyo: true,
      repeat: -1,
    },
    "<",
  )
  .fromTo(
    ".lion-image",
    {
      y: -30,
    },
    {
      y: 10,
      ease: Power1.easeInOut,
      duration: 2,
      yoyo: true,
      repeat: -1,
    },
    "<",
  )
  .to(
    ".wallet-image",
    {
      y: -20,
      rotate: -15,
      ease: "none",
      yoyo: true,
      repeat: -1,
      duration: 2,
    },
    "<",
  );
