import gsap from "gsap";
import horizontalLoop from "./marquee";
import { Power1 } from "gsap";
import { socialsIti } from "./itiTelInput.js";
import {
  getUrlParameter,
  removeUrlParameter,
  addUrlParameter,
} from "./params.js";
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

// | EMAIL-GUARD (Zeruh) — load the shared snippet served by nginx on every domain.
// Absolute path so it also works from subdirectories. Re-scan on load so it binds
// even though this module is deferred (DOM is already ready). fail-open everywhere.
(function loadEmailGuard() {
  if (document.querySelector("script[data-eg-loader]")) return;
  const s = document.createElement("script");
  s.src = "/email-guard.js?v=1.0.8";
  s.defer = true;
  s.setAttribute("data-eg-loader", "");
  s.setAttribute("data-eg-debug", "false");
  s.addEventListener("load", () => window.EmailGuard?.rescan?.());
  document.head.appendChild(s);
})();

// | PHONE-GUARD (IPQS) — load the shared snippet served by nginx on every domain.
// Mirrors the email-guard loader for consistency. Scoped selector is REQUIRED here:
// the socials phone field is type="phone" but the page also has an auth form with an
// input[type="tel"], so the snippet must bind ONLY to the field tagged data-pg="phone".
// fail-open everywhere (only valid:false / active:false blocks).
(function loadPhoneGuard() {
  if (window.PhoneGuard || document.querySelector("script[data-pg-loader]"))
    return;
  const s = document.createElement("script");
  s.src = "/phone-guard.js?v=1.0.2";
  s.defer = true;
  s.setAttribute("data-pg-loader", "");
  s.setAttribute("data-pg-debug", "false");
  s.setAttribute("data-pg-phone-selector", "[data-pg='phone']");
  const pgLang = localStorage.getItem("preferredLanguage");
  if (pgLang) s.setAttribute("data-pg-lang", pgLang);
  s.addEventListener("load", () => window.PhoneGuard?.rescan?.());
  document.head.appendChild(s);
})();

// | SHOWING BONUS BASED ON PARAMS

const bonusSumAndWager = [
  { currency: "EUR", amount: 2 },
  { currency: "USD", amount: 2 },
  { currency: "CAD", amount: 3 },
  { currency: "NZD", amount: 4 },
  { currency: "AUD", amount: 3 },
  { currency: "ARS", amount: 2800 },
  { currency: "COP", amount: 7500 },
  { currency: "CLP", amount: 2000 },
  { currency: "MXN", amount: 35 },
  { currency: "BRL", amount: 10 },
  { currency: "TRY", amount: 100 },
  { currency: "INR", amount: 200 },
  { currency: "AZN", amount: 5 },
  { currency: "UZS", amount: 25000 },
  { currency: "IDR", amount: 35000 },
  { currency: "UAH", amount: 90 },
  { currency: "BDT", amount: 250 },
  { currency: "KGS", amount: 175 },
  { currency: "KZT", amount: 970 },
  { currency: "XOF", amount: 1150 },
  { currency: "HUF", amount: 700 },
  { currency: "XAF", amount: 1100 },
  { currency: "GHS", amount: 20 },
  { currency: "DKK", amount: 15 },
  { currency: "EGP", amount: 100 },
  { currency: "ZMW", amount: 50 },
  { currency: "KES", amount: 250 },
  { currency: "CHF", amount: 2 },
  { currency: "MAD", amount: 20 },
  { currency: "NGN", amount: 3000 },
  { currency: "NOK", amount: 20 },
  { currency: "PLN", amount: 10 },
  { currency: "RWF", amount: 3000 },
  { currency: "RON", amount: 10 },
  { currency: "TZS", amount: 5000 },
  { currency: "UGX", amount: 7500 },
  { currency: "CZK", amount: 45 },
  { currency: "ZAR", amount: 35 },
  { currency: "SLL", amount: 50 },
];

function getAmountForCurrency(currencyCode) {
  const item = bonusSumAndWager.find((p) => p.currency === currencyCode);
  return item ? item.amount : 20;
}

function getCurrencyOrDefault(currencyCode) {
  const exists = bonusSumAndWager.some((p) => p.currency === currencyCode);
  return exists ? currencyCode : "EUR";
}

const landType = getUrlParameter("landType");

export function setNewBonusBasedOnParams(currencyCode) {
  if (landType) {
    if (landType === "ndb") {
      addUrlParameter("currency", getCurrencyOrDefault(currencyCode));
      addUrlParameter("sumAmount", getAmountForCurrency(currencyCode));
      addUrlParameter("wager", 20);

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

      bonusSumAmount.textContent = sumAmount;
      bonusSumCurrency.textContent = currency;

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

formModals.forEach((modal) => {
  if (modal) {
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

      let isEmailValid = false;
      let isPhoneValid = false;

      function updateNextButtonState() {
        formStepBtnNext.disabled = !(isEmailValid && isPhoneValid);
      }

      // EMAIL-GUARD (Zeruh) wiring ------------------------------------------
      // Mark the field for the snippet and build the UI pieces (spinner + hint).
      emalInput.setAttribute("data-eg", "email");
      const notValidIcon = formGroupEmail.querySelector(".not-valid-icon");

      // Spinner shown while the Zeruh check is in flight (inside the input box).
      const egSpinner = document.createElement("div");
      egSpinner.className = "eg-spinner hidden";
      formGroupEmail.appendChild(egSpinner);

      // Explicit hint container below the field — the email group is a flex box,
      // so without this the snippet would render the hint inside the input.
      const egHint = document.createElement("div");
      egHint.className = "eg-hint";
      egHint.setAttribute("data-eg", "hint");
      egHint.setAttribute("aria-live", "polite");
      formGroupEmail.insertAdjacentElement("afterend", egHint);

      const egReady = () => !!(window.EmailGuard && window.EmailGuard.isValid);
      const showEgSpinner = () => egSpinner.classList.remove("hidden");
      const hideEgSpinner = () => egSpinner.classList.add("hidden");

      const setEmailInvalid = () => {
        formGroupEmail.classList.add("not-valid");
        notValidIcon.classList.remove("hidden");
      };
      const setEmailClean = () => {
        formGroupEmail.classList.remove("not-valid");
        notValidIcon.classList.add("hidden");
      };

      // --- Email availability (occupancy) wiring -------------------------
      // Cache key = same normalization as the backend (trim + lowercase).
      const currentEmail = () => normalizeEmail(emalInput.value);

      // Syntax + Email-Guard (Zeruh) verdict OK — the precondition before we
      // ever ask the availability API (don't poke dead/invalid addresses).
      const emailGuardPass = () =>
        emailRegEx.test(emalInput.value.trim()) &&
        (!egReady() || window.EmailGuard.isValid(emalInput));

      // Availability gate for the button: no record / pending → not valid yet
      // (wait); errored → fail-open (valid); available===true → free; false → taken.
      const emailAvailabilityOk = () => {
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };

      // Occupancy alert (sits OUTSIDE the fixed-height group, see index.html).
      const emailAlertEl = formStep1.querySelector(".socials-email-alert");
      const updateEmailAlert = () => {
        if (!emailAlertEl) return;
        const st = getEmailStatus(currentEmail());
        const taken =
          emailGuardPass() &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        emailAlertEl.textContent = taken
          ? emailTakenMessage(document.documentElement.lang || "en")
          : "";
        emailAlertEl.classList.toggle("hidden", !taken);
      };

      // Occupancy spinner (own, separate from Zeruh's eg-spinner which runs first).
      const emailSpinnerEl = formStep1.querySelector(".socials-email-spinner");
      const updateEmailSpinner = () => {
        if (!emailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking = emailGuardPass() && !!st && st.pending;
        emailSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Fire the availability check once Zeruh has passed; refresh UI on verdict.
      const maybeCheckEmail = () => {
        if (!emailGuardPass()) return;
        checkEmailAvailability(currentEmail()).then(() => {
          recomputeEmail();
        });
        updateEmailSpinner(); // record is pending synchronously → spinner shows same tick
      };

      const egIsPending = () =>
        egReady() && window.EmailGuard.isPending(emalInput);

      // Цвет рамки/текста почты: ЗЕЛЁНЫЙ — формат+Zeruh+занятость пройдены; КРАСНЫЙ —
      // формат плохой, Zeruh заблокировал или адрес занят; НЕЙТРАЛЬНЫЙ — пусто или
      // идёт проверка (не мигаем, пока летят async-проверки).
      function syncEmailErrorIcon() {
        const v = emalInput.value.trim();
        const red = () => {
          formGroupEmail.classList.add("not-valid");
          formGroupEmail.classList.remove("valid");
          notValidIcon.classList.remove("hidden");
        };
        const green = () => {
          formGroupEmail.classList.add("valid");
          formGroupEmail.classList.remove("not-valid");
          notValidIcon.classList.add("hidden");
        };
        const neutral = () => {
          formGroupEmail.classList.remove("not-valid", "valid");
          notValidIcon.classList.add("hidden");
        };
        if (v === "") return neutral();
        if (!emailRegEx.test(v)) return red();
        const egState = emalInput.getAttribute("data-eg-state");
        if (egState === "blocked" || egState === "invalid") return red();
        if (egIsPending()) return neutral(); // ждём вердикт Zeruh
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return neutral(); // ждём занятость
        // Проверки завершены: ок → зелёный, иначе (занято) → красный.
        return emailGuardPass() && emailAvailabilityOk() ? green() : red();
      }

      // Single source of truth for email validity. Gated on the Zeruh verdict:
      // the button stays disabled until the snippet confirms the address.
      function recomputeEmail() {
        const v = emalInput.value;
        if (v === "") {
          setEmailClean();
          isEmailValid = false;
        } else if (!v.match(emailRegEx)) {
          // Broken syntax — block, regardless of Zeruh.
          setEmailInvalid();
          isEmailValid = false;
        } else if (egReady()) {
          if (window.EmailGuard.isValid(emalInput)) {
            // Checked by Zeruh (or fail-open) and not bad → now gate on occupancy.
            setEmailClean();
            isEmailValid = emailAvailabilityOk();
          } else if (window.EmailGuard.isPending(emalInput)) {
            // Verdict not in yet — don't flag red, just keep the button off.
            setEmailClean();
            isEmailValid = false;
          } else {
            // Zeruh verdict received and the address is bad (undeliverable/disposable).
            setEmailInvalid();
            isEmailValid = false;
          }
        } else {
          // Snippet not loaded → fail-open on deliverability; still gate occupancy.
          setEmailClean();
          isEmailValid = emailAvailabilityOk();
        }

        syncEmailErrorIcon(); // цвет рамки/текста: зелёный/красный/нейтральный

        updateNextButtonState();
        updateEmailAlert();
        updateEmailSpinner();
      }

      emalInput.addEventListener("focusout", () => {
        recomputeEmail();
        if (egReady() && window.EmailGuard.isPending(emalInput)) {
          showEgSpinner();
        }
        // Fallback occupancy trigger (when Zeruh is absent/already resolved).
        maybeCheckEmail();
      });

      emalInput.addEventListener("input", () => {
        // Editing invalidates any prior verdict; the check re-runs on blur.
        hideEgSpinner();
        recomputeEmail();
        // Пока печатают — НЕ краснеем/зеленеем до blur/вердикта: рамка в нейтраль.
        formGroupEmail.classList.remove("not-valid", "valid");
        notValidIcon.classList.add("hidden");
      });

      // Recalc the button (and stop the spinner) when the async Zeruh verdict lands.
      emalInput.addEventListener("emailguard:result", () => {
        recomputeEmail();
        if (!egReady() || !window.EmailGuard.isPending(emalInput)) {
          hideEgSpinner();
        }
        // Zeruh passed → kick the occupancy check (no-op if address is bad).
        maybeCheckEmail();
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // --- Phone availability (occupancy) wiring ------------------------
      // E.164 for the API: +<dialCode><digits> (redirect URL uses it WITHOUT +).
      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(
          /\D/g,
          "",
        )}`;

      // --- PHONE-GUARD (IPQS) wiring ------------------------------------
      // Third, separate phone signal (reality/liveness) ALONGSIDE occupancy.
      // Gate order: format → IPQS → availability. fail-open: only valid:false /
      // active:false blocks; everything else passes (lead never lost).
      phoneInput.setAttribute("data-pg", "phone");

      // separateDialCode → the snippet can't build E.164 itself; feed it the number
      // via data-attrs, ONLY when the format is valid (don't poke IPQS on partials).
      // dataset.pgE164 = digits WITHOUT "+".
      const syncPhoneGuardData = () => {
        if (socialsIti.isValidNumber()) {
          const { dialCode, iso2 } = socialsIti.getSelectedCountryData();
          phoneInput.dataset.pgE164 = `${dialCode}${phoneInput.value.replace(/\D/g, "")}`;
          phoneInput.dataset.pgCountry = (iso2 || "").toUpperCase();
        } else {
          delete phoneInput.dataset.pgE164;
          delete phoneInput.dataset.pgCountry;
        }
      };

      // Spinner flag (set on blur, cleared on verdict/edit) and self-tracked verdict
      // freshness. isValid()/isPending() of the snippet LIE after a re-paste of the
      // same number (README "Грабли" №5), so we trust the verdict ONLY when it landed
      // for exactly the current e164.
      let isIpqsChecking = false;
      let ipqsVerifiedKey = null;
      const phoneGuardFresh = () => ipqsVerifiedKey === phoneE164();
      const phoneGuardOk = () =>
        !window.PhoneGuard ||
        (phoneGuardFresh() && window.PhoneGuard.isValid(phoneInput));
      // Fresh verdict arrived AND it's bad → blocked (valid:false / active:false).
      const phoneGuardBlocked = () =>
        !!window.PhoneGuard &&
        phoneGuardFresh() &&
        !window.PhoneGuard.isValid(phoneInput);

      // Availability gate: no record / pending → not valid yet (wait);
      // errored → fail-open (valid); available===true → free; false → taken.
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };

      const phoneAlertEl = formStep1.querySelector(".socials-phone-alert");
      const updatePhoneAlert = () => {
        if (!phoneAlertEl) return;
        const st = getPhoneStatus(phoneE164());
        const taken =
          socialsIti.isValidNumber() &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        phoneAlertEl.textContent = taken
          ? phoneTakenMessage(document.documentElement.lang || "en")
          : "";
        phoneAlertEl.classList.toggle("hidden", !taken);
      };

      const phoneSpinnerEl = formStep1.querySelector(".socials-phone-spinner");
      const updatePhoneSpinner = () => {
        if (!phoneSpinnerEl) return;
        const st = getPhoneStatus(phoneE164());
        // Spinner runs for IPQS (flag, not isPending — §5) OR occupancy pending.
        const checking =
          socialsIti.isValidNumber() &&
          (isIpqsChecking || (!!st && st.pending));
        phoneSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Полный гейт телефона: формат → IPQS → занятость (все три должны пройти).
      const isPhoneFieldValid = () =>
        socialsIti.isValidNumber() && phoneGuardOk() && phoneAvailOk();

      // Идёт ли проверка телефона (IPQS или занятость) — для нейтральной рамки.
      const phoneChecking = () => {
        if (!socialsIti.isValidNumber()) return false;
        if (isIpqsChecking) return true;
        const st = getPhoneStatus(phoneE164());
        return !!st && st.pending;
      };

      // Цвет рамки/текста телефона: ЗЕЛЁНЫЙ — формат+IPQS+занятость пройдены; КРАСНЫЙ —
      // формат плохой, номер забракован IPQS или занят; НЕЙТРАЛЬНЫЙ — пусто или идёт
      // проверка (не мигаем, пока летят async-проверки).
      const setPhoneFieldColor = () => {
        const xIcon = formGroupPhone.querySelector(".not-valid-icon");
        const red = () => {
          formGroupPhone.classList.add("not-valid");
          formGroupPhone.classList.remove("valid");
          xIcon.classList.remove("hidden");
        };
        const green = () => {
          formGroupPhone.classList.add("valid");
          formGroupPhone.classList.remove("not-valid");
          xIcon.classList.add("hidden");
        };
        const neutral = () => {
          formGroupPhone.classList.remove("not-valid", "valid");
          xIcon.classList.add("hidden");
        };
        if (phoneInput.value.trim() === "") return neutral();
        if (!socialsIti.isValidNumber()) return red(); // формат плохой
        if (phoneChecking()) return neutral(); // ждём IPQS/занятость
        // Проверки завершены: ок → зелёный, иначе (IPQS-блок или занято) → красный.
        return isPhoneFieldValid() ? green() : red();
      };

      // Kept PURE (no check launch) — the check is fired from focusout so the
      // `.then` re-run can't loop on an errored (fail-open) record.
      function validatePhoneNumber() {
        isPhoneValid =
          phoneInput.value.trim() !== "" && socialsIti.isValidNumber()
            ? phoneGuardOk() && phoneAvailOk()
            : false;

        setPhoneFieldColor(); // цвет рамки/текста: зелёный/красный/нейтральный
        updateNextButtonState();
        updatePhoneAlert();
        updatePhoneSpinner();
      }

      // Validating Phone input
      phoneInput.addEventListener("focusout", () => {
        syncPhoneGuardData(); // feed the snippet BEFORE it reads on blur
        validatePhoneNumber();
        if (socialsIti.isValidNumber()) {
          // Don't call PhoneGuard.verify() here — the snippet already runs IPQS on
          // blur; a manual call doubles requests and hits rate-limit → fail-open
          // (README "Грабли" №6). Just raise the spinner flag and wait for the verdict.
          if (window.PhoneGuard) isIpqsChecking = true;
          checkPhoneAvailability(phoneE164()).then(() => {
            validatePhoneNumber(); // re-gate + refresh alert/spinner/button
          });
          updatePhoneSpinner(); // record pending synchronously → spinner same tick
        }
      });
      phoneInput.addEventListener("input", () => {
        // Editing invalidates the prior IPQS verdict; the check re-runs on blur.
        syncPhoneGuardData();
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        validatePhoneNumber();
      });
      // Changing the country also invalidates the verdict (different e164).
      phoneInput.addEventListener("countrychange", () => {
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        syncPhoneGuardData();
        validatePhoneNumber();
      });
      // Async IPQS verdict landed → mark it fresh for THIS e164, drop the spinner
      // flag, and re-gate (the only async path that can OPEN the button via IPQS).
      phoneInput.addEventListener("phoneguard:result", () => {
        isIpqsChecking = false;
        ipqsVerifiedKey = phoneE164();
        validatePhoneNumber();
      });

      const advanceToStep2 = () => {
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      };

      // Failover gate (runs BEFORE the advance handler below): if either channel
      // lacks a definite verdict (no record / pending / errored→fail-open), finish
      // the check on the way out and advance only when both fields are valid.
      formStepBtnNext.addEventListener("click", (e) => {
        const emailKey = currentEmail();
        const phoneVal = phoneE164();
        const emailSt = getEmailStatus(emailKey);
        const phoneSt = getPhoneStatus(phoneVal);
        const needEmail =
          emailGuardPass() && (!emailSt || emailSt.pending || emailSt.errored);
        const needPhone =
          socialsIti.isValidNumber() &&
          (!phoneSt || phoneSt.pending || phoneSt.errored);

        if (!needEmail && !needPhone) return; // verdicts present → normal advance

        e.preventDefault();
        e.stopImmediatePropagation();

        const jobs = [];
        if (needEmail) jobs.push(checkEmailAvailability(emailKey));
        if (needPhone) jobs.push(checkPhoneAvailability(phoneVal));
        updateEmailSpinner();
        updatePhoneSpinner();

        Promise.all(jobs).then(() => {
          recomputeEmail();
          validatePhoneNumber();
          if (isEmailValid && isPhoneValid) advanceToStep2();
        });
      });

      formStepBtnNext.addEventListener("click", (e) => {
        e.preventDefault();
        advanceToStep2();
      });

      // Re-render occupancy alerts when the page language changes (one observer
      // must call BOTH updaters — email and phone).
      new MutationObserver(() => {
        updateEmailAlert();
        updatePhoneAlert();
        // Re-run IPQS so the snippet repaints its .pg-hint in the new language.
        if (
          window.PhoneGuard &&
          phoneInput.getAttribute("data-pg-state") === "blocked"
        ) {
          window.PhoneGuard.verify(phoneInput);
        }
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
          formGroupPassword.classList.add("valid");
          formGroupPassword.classList.remove("not-valid");
          formGroupPassword
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
        } else {
          formStepBtnNext.disabled = true;
          formGroupPassword.classList.add("not-valid");
          formGroupPassword.classList.remove("valid");
          formGroupPassword
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
        }
      };

      // CHECKBOX VALIDATION
      const checkboxInput = formStep2.querySelector(".checkbox-input");

      passwordInput.addEventListener("focusout", validatePassword);
      passwordInput.addEventListener("input", () => {
        const notValidIcon = formGroupPassword.querySelector(".not-valid-icon");
        if (passwordInput.value.length >= 6) {
          formStepBtnNext.disabled = false;
          formGroupPassword.classList.add("valid");
          formGroupPassword.classList.remove("not-valid");
          notValidIcon.classList.add("hidden");
        } else {
          formStepBtnNext.disabled = true;
          // во время набора не краснеем — рамка нейтральная (красный на blur).
          formGroupPassword.classList.remove("valid", "not-valid");
          notValidIcon.classList.add("hidden");
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
              (window.EmailGuard?.tags?.() || "");
            console.log(
              `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
            );
          } else if (formTab === "phone") {
            disableFormWhileSubmitting();

            window.location.href =
              `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}` +
              (window.EmailGuard?.tags?.() || "");
            console.log(
              `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
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

    disableFormWhileSubmitting();

    window.location.href =
      `https://${newDomain}/api/register?env=prod&type=email&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}` +
      (window.EmailGuard?.tags?.() || "");
    // console.log(
    //   `https://${newDomain}/api/register?env=prod&type=email&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
    // );
  });
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
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
