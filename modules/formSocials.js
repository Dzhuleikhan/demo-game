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
import { geoData, getSupportedLanguage } from "./geoLocation.js";
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

const PHONE_ONLY_COUNTRIES = [];
const hideEmail = false;
const isPhoneOnlyMode =
  PHONE_ONLY_COUNTRIES.includes(geoData.countryCode) || hideEmail;

// | SHOWING BONUS BASED ON PARAMS

const bonusSumAndWager = [
  { currency: "EUR", amount: 50 },
  { currency: "USD", amount: 50 },
  { currency: "CAD", amount: 70 },
  { currency: "NZD", amount: 90 },
  { currency: "AUD", amount: 75 },
  { currency: "ARS", amount: 72500 },
  { currency: "COP", amount: 180000 },
  { currency: "CLP", amount: 46500 },
  { currency: "MXN", amount: 875 },
  { currency: "BRL", amount: 250 },
  { currency: "TRY", amount: 2500 },
  { currency: "INR", amount: 5000 },
  { currency: "AZN", amount: 100 },
  { currency: "UZS", amount: 600000 },
  { currency: "IDR", amount: 900000 },
  { currency: "UAH", amount: 2250 },
  { currency: "BDT", amount: 6000 },
  { currency: "KGS", amount: 4000 },
  { currency: "KZT", amount: 25000 },
  { currency: "XOF", amount: 28500 },
  { currency: "HUF", amount: 15500 },
  { currency: "XAF", amount: 28500 },
  { currency: "GHS", amount: 600 },
  { currency: "DKK", amount: 350 },
  { currency: "EGP", amount: 2500 },
  { currency: "ZMW", amount: 900 },
  { currency: "KES", amount: 6500 },
  { currency: "CHF", amount: 50 },
  { currency: "MAD", amount: 500 },
  { currency: "NGN", amount: 68100 },
  { currency: "NOK", amount: 500 },
  { currency: "PLN", amount: 200 },
  { currency: "RWF", amount: 73200 },
  { currency: "RON", amount: 250 },
  { currency: "TZS", amount: 130000 },
  { currency: "UGX", amount: 188000 },
  { currency: "CZK", amount: 1100 },
  { currency: "ZAR", amount: 830 },
  { currency: "SLL", amount: 1230 },
];

function getAmountForCurrency(currencyCode) {
  const item = bonusSumAndWager.find((p) => p.currency === currencyCode);
  return item ? item.amount : 20;
}

function getCurrencyOrDefault(currencyCode) {
  const exists = bonusSumAndWager.some((p) => p.currency === currencyCode);
  return exists ? currencyCode : "EUR";
}

const modalType = getUrlParameter("modal");

if (modalType === "socials") {
  addUrlParameter("landType", "ndb");
}

export function setNewBonusBasedOnParams(currencyCode) {
  const landType = getUrlParameter("landType");
  if (landType) {
    document.querySelector(".form-type-buttons").style.gridTemplateColumns =
      "1fr";

    const emailTabBtn = document.querySelector(
      ".socials-form-type-btn[data-tab='email']",
    );
    const phoneTabBtn = document.querySelector(
      ".socials-form-type-btn[data-tab='phone']",
    );
    const emailGroup = document.querySelector(".socials-form-group-email");
    const phoneGroup = document.querySelector(".socials-form-group-phone");

    if (isPhoneOnlyMode || formTabParam === "phone") {
      // Show phone only
      emailTabBtn.classList.add("hidden");
      emailTabBtn.classList.remove("active");
      phoneTabBtn.classList.remove("hidden");
      phoneTabBtn.classList.add("active");

      emailGroup.classList.remove("active");
      emailGroup.classList.add("hidden");
      phoneGroup.classList.remove("hidden");
      phoneGroup.classList.add("active");
    } else {
      // Show email only
      phoneTabBtn.classList.add("hidden");
      phoneTabBtn.classList.remove("active");
      emailTabBtn.classList.remove("hidden");
      emailTabBtn.classList.add("active");

      phoneGroup.classList.remove("active");
      phoneGroup.classList.add("hidden");
      emailGroup.classList.remove("hidden");
      emailGroup.classList.add("active");
    }

    addUrlParameter("currency", getCurrencyOrDefault(currencyCode));
    addUrlParameter("sumAmount", getAmountForCurrency(currencyCode));
    addUrlParameter("wager", 25);

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
    document.querySelector(".sign-up-text-dynamic").classList.remove("hidden");

    bonusSumAmount.textContent = sumAmount;
    bonusSumCurrency.textContent = currency;

    document.querySelector(".bonus-subtext-current").classList.add("hidden");

    if (wager) {
      document.querySelector(".bonus-subtext-current").classList.add("hidden");
      document
        .querySelector(".bonus-subtext-dynamic")
        .classList.remove("hidden");
      bonusSumWagerAmount.textContent = wager || "25";
    } else {
      bonusSumWager.style.display = "none";
    }
  } else {
    removeUrlParameter(landType);
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

let formTab = isPhoneOnlyMode || formTabParam === "phone" ? "phone" : "email";

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
      const emailSpinner = formGroupEmail.querySelector(".email-spinner");

      // | EMAIL-GUARD (Zeruh) ADAPTER
      // Email-Guard verdict (deliverability). If the snippet didn't load —
      // fail-open (treat as ok), the lead is never lost.
      const egOk = () => {
        if (
          window.EmailGuard &&
          typeof window.EmailGuard.isValid === "function"
        ) {
          return window.EmailGuard.isValid(emalInput);
        }
        return true; // snippet not loaded → fail-open
      };

      // | AVAILABILITY (занятость) — email
      // Cache key normalized exactly like the backend (trim + toLowerCase).
      const currentEmail = () => normalizeEmail(emalInput.value);

      // Email is valid only when syntax passes AND Email-Guard verified the
      // address as deliverable AND availability says it's free.
      // Gate of the availability verdict:
      //   no record / pending → NOT valid (wait); errored → valid (fail-open);
      //   available === true → valid; available === false → NOT valid (taken).
      const isEmailValid = () => {
        if (!emailRegEx.test(emalInput.value.trim()) || !egOk()) return false;
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return false; // ждём вердикт занятости
        if (st.errored) return true; // fail-open
        return st.available === true; // занято → false
      };

      // Alert lives OUTSIDE the fixed-height group (sibling) — find via formStep1.
      const emailAlertEl = formStep1.querySelector(".socials-email-alert");
      const emailSpinnerEl = formStep1.querySelector(".socials-email-spinner");

      const updateEmailAlert = () => {
        const st = getEmailStatus(currentEmail());
        const taken =
          emailRegEx.test(emalInput.value.trim()) &&
          egOk() &&
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

      // Our own availability spinner — shows while the record is pending.
      const updateEmailSpinner = () => {
        if (!emailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking =
          emailRegEx.test(emalInput.value.trim()) &&
          egOk() &&
          !!st &&
          st.pending;
        emailSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Launch the availability check ONLY after syntax + Email-Guard pass.
      const maybeCheckEmail = () => {
        if (!emailRegEx.test(emalInput.value.trim()) || !egOk()) return;
        checkEmailAvailability(currentEmail()).then(() => {
          if (formTab === "email") {
            formStepBtnNext.disabled = !isEmailValid();
            updateEmailAlert();
          }
          updateEmailSpinner(); // гаснет на вердикт/таймаут
        });
        updateEmailSpinner(); // запись уже pending → спиннер в тот же тик
      };

      // Spinner inside the email input while Zeruh verification is in flight.
      const showEmailSpinner = () =>
        emailSpinner && emailSpinner.classList.remove("hidden");
      const hideEmailSpinner = () =>
        emailSpinner && emailSpinner.classList.add("hidden");

      // Recalculate the "Next" button for the email tab. Keeps the button
      // disabled until a deliverable verdict arrives (no race, gated by disabled).
      const recalcEmailButton = () => {
        if (formTab !== "email") return;
        formStepBtnNext.disabled = !isEmailValid();
      };

      emalInput.addEventListener("focusout", () => {
        if (emalInput.value === "") {
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          formGroupEmail.classList.remove("not-valid");
          hideEmailSpinner();
        } else if (emalInput.value.match(emailRegEx)) {
          // Syntax ok — hide the landing's red icon and wait for Zeruh.
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          formGroupEmail.classList.remove("not-valid");
          // Verification went to Zeruh — spin until the verdict comes back.
          if (window.EmailGuard?.isPending?.(emalInput)) showEmailSpinner();
          // Fallback: if Zeruh already resolved ok, kick off the availability
          // check now (the emailguard:result handler covers the async case).
          maybeCheckEmail();
          recalcEmailButton();
        } else {
          formGroupEmail.classList.add("not-valid");
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
          formStepBtnNext.disabled = true;
          hideEmailSpinner();
        }
      });

      emalInput.addEventListener("input", () => {
        // Editing the field cancels any active check — spinner off, re-gate.
        // New value → no availability record yet → alert/spinner clear.
        hideEmailSpinner();
        updateEmailSpinner();
        updateEmailAlert();
        recalcEmailButton();
      });

      // Async Zeruh verdict — hide spinner (unless still pending on an
      // intermediate sync state), then run the availability check (gated on a
      // deliverable verdict) and recompute the button.
      emalInput.addEventListener("emailguard:result", () => {
        if (!window.EmailGuard?.isPending?.(emalInput)) hideEmailSpinner();
        maybeCheckEmail();
        recalcEmailButton();
        updateEmailAlert();
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // Phone-Guard: пометить поле для сниппета (IPQS attach по data-pg="phone").
      phoneInput.setAttribute("data-pg", "phone");

      // | AVAILABILITY (занятость) — phone
      // E.164 for the API: `+${dialCode}${digits}` (different from the redirect
      // URL, where the phone goes WITHOUT the leading `+`).
      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(/\D/g, "")}`;

      // Alert lives OUTSIDE the fixed-height group (sibling) — find via formStep1.
      const phoneAlertEl = formStep1.querySelector(".socials-phone-alert");
      const phoneSpinnerEl = formStep1.querySelector(".socials-phone-spinner");

      // | IPQS PHONE-GUARD (реальность/живость номера, fail-open).
      // separateDialCode → код страны вне инпута, сниппет сам e164 не соберёт:
      // ленд кладёт готовый номер (цифры без "+") + страну в data-атрибуты поля,
      // ТОЛЬКО при валидном формате (чтобы не бить IPQS по неполному вводу).
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
      // Флаг «IPQS-запрос в полёте» — ставится на blur, снимается на вердикте.
      // НЕ завязывать спиннер на isPending: он true уже во время ввода (§5).
      let isIpqsChecking = false;

      // Свежесть вердикта IPQS отслеживаем САМИ: сниппет на re-paste того же
      // номера НЕ сбрасывает свой внутренний _pgChecked (сбрасывает только на
      // blur), из-за чего его isPending() врёт (false), а isValid() отдаёт
      // устаревший «ok». Поэтому доверяем вердикту, только если он подтверждён
      // через phoneguard:result ИМЕННО для текущего e164. Сбрасываем на любое
      // изменение номера (input/paste/countrychange).
      let ipqsVerifiedKey = null;
      const phoneGuardFresh = () => ipqsVerifiedKey === phoneE164();
      // Номер прошёл IPQS и не плохой (нет сниппета → fail-open).
      const phoneGuardOk = () =>
        !window.PhoneGuard ||
        (phoneGuardFresh() && window.PhoneGuard.isValid(phoneInput));

      // Availability verdict for the gate (same shape as email):
      //   no record / pending → false; errored → true (fail-open);
      //   available === true → true; available === false → false (taken).
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };

      // | ЕДИНЫЙ ГЕЙТ КНОПКИ (таб phone). Кнопка по умолчанию ВСЕГДА выключена;
      // открыть её можно ТОЛЬКО здесь — когда номер полностью проверен:
      // формат + СВЕЖИЙ вердикт IPQS (valid/active) + занятость (оба fail-open).
      // Любой ввод/paste/смена страны сбрасывают свежесть → кнопка снова off.
      const isPhoneGateOpen = () =>
        socialsIti.isValidNumber() && phoneGuardOk() && phoneAvailOk();
      const recalcPhoneBtn = () => {
        if (formTab === "phone") formStepBtnNext.disabled = !isPhoneGateOpen();
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

      // Спиннер телефона: показываем, пока летит IPQS ИЛИ проверка занятости.
      const updatePhoneSpinner = () => {
        if (!phoneSpinnerEl) return;
        const st = getPhoneStatus(phoneE164());
        const checking =
          socialsIti.isValidNumber() &&
          (isIpqsChecking || (!!st && st.pending));
        phoneSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Подсветка поля (красный/иконка). Решение «включить кнопку» НЕ здесь —
      // только через recalcPhoneBtn (полный гейт: формат → IPQS → занятость),
      // который и зовём в конце.
      function validatePhoneNumber() {
        let ok = false;
        if (phoneInput.value === "") {
          formGroupPhone.classList.remove("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
        } else if (socialsIti.isValidNumber()) {
          formGroupPhone.classList.remove("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          updatePhoneAlert();
          ok = true;
        } else {
          formGroupPhone.classList.add("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
        }
        recalcPhoneBtn(); // кнопка откроется только если пройден ВЕСЬ гейт
        return ok;
      }

      // Validating Phone input. На blur валидного номера запускаем проверку
      // занятости (раз за blur). IPQS на blur запускает сам сниппет.
      phoneInput.addEventListener("focusout", () => {
        // Кормим сниппет ДО того как он прочтёт номер на blur.
        syncPhoneGuardData();
        validatePhoneNumber();
        if (socialsIti.isValidNumber()) {
          // IPQS-проверку на blur запускает сам сниппет (его blur-хендлер) —
          // вердикт придёт через phoneguard:result и пометит номер свежим.
          // Свою verify() НЕ зовём, чтобы не удваивать запросы к IPQS (это
          // ускоряет rate-limit, после которого сервис уходит в fail-open).
          if (window.PhoneGuard) isIpqsChecking = true; // флаг для спиннера
          checkPhoneAvailability(phoneE164()).then(() => {
            updatePhoneAlert();
            recalcPhoneBtn();
            updatePhoneSpinner();
          });
          updatePhoneSpinner(); // запись уже pending → спиннер в тот же тик
        }
      });

      // При редактировании номера: пере-кормить сниппет, сбросить свежесть
      // вердикта IPQS (кнопка снова off — включится лишь после новой проверки
      // на blur, никогда синхронно на input) и спрятать спиннер занятости.
      phoneInput.addEventListener("input", () => {
        syncPhoneGuardData();
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        recalcPhoneBtn();
        updatePhoneSpinner();
        updatePhoneAlert();
      });

      // Смена страны (separateDialCode) меняет e164 → сбросить свежесть вердикта,
      // пере-кормить сниппет и выключить кнопку.
      phoneInput.addEventListener("countrychange", () => {
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        syncPhoneGuardData();
        recalcPhoneBtn();
      });

      // Пришёл вердикт IPQS ДЛЯ ТЕКУЩЕГО номера — пометить свежим, снять флаг,
      // пересчитать гейт (единственный путь, открывающий кнопку для IPQS).
      phoneInput.addEventListener("phoneguard:result", () => {
        isIpqsChecking = false;
        ipqsVerifiedKey = phoneE164();
        recalcPhoneBtn();
        updatePhoneSpinner();
      });

      // | FAILOVER on step1 → step2. Registered BEFORE the plain advance
      // handler below so it runs first and can veto the transition. For the
      // ACTIVE tab only: if there's no unambiguous verdict yet, finish the
      // check and advance only when the channel isn't taken.
      // NB: must not "verdict exists → return" blindly — the tab-switch handler
      // can enable the button by FORMAT alone (phone), so re-check the gate.
      const advanceToStep2 = () => {
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      };

      formStepBtnNext.addEventListener("click", (e) => {
        if (formTab === "email") {
          const st = getEmailStatus(currentEmail());
          if (st && !st.pending) {
            if (isEmailValid()) return; // свободно/fail-open → штатный advance
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            updateEmailAlert();
            return; // занято → блок
          }
          e.preventDefault();
          e.stopImmediatePropagation();
          checkEmailAvailability(currentEmail()).then(() => {
            updateEmailSpinner();
            updateEmailAlert();
            if (isEmailValid()) advanceToStep2();
            else formStepBtnNext.disabled = true;
          });
          updateEmailSpinner();
        } else if (formTab === "phone") {
          // Кнопка активна ТОЛЬКО когда гейт полностью пройден (формат + свежий
          // IPQS + занятость). Если клик всё же случился, а гейт не открыт —
          // блокируем переход (иначе второй, безусловный advance-хендлер ниже
          // пустит дальше) и выключаем кнопку. Никакого "добивания" проверок:
          // нужный вердикт придёт сам на focusout и откроет кнопку.
          if (!isPhoneGateOpen()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            validatePhoneNumber();
            return;
          }
          // Гейт открыт → не мешаем второму хендлеру выполнить переход.
        }
      });

      formStepBtnNext.addEventListener("click", (e) => {
        e.preventDefault();
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
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
              if (emalInput.value != "" && isEmailValid()) {
                formStepBtnNext.disabled = false;
              } else {
                formStepBtnNext.disabled = true;
              }
            }
            if (tab === "phone") {
              formGroupEmail.classList.remove("not-valid");
              emalInput.value = "";
              // Открыть кнопку только если номер уже полностью проверен (формат
              // + свежий IPQS + занятость), иначе выключена. НЕ включать по
              // одному формату — иначе плохой номер прошёл бы через таб-свитч.
              recalcPhoneBtn();
            }

            // The other field was cleared above — drop its stale alert/spinner.
            updateEmailAlert();
            updateEmailSpinner();
            updatePhoneAlert();
            updatePhoneSpinner();

            formGroups.forEach((group) => {
              group.classList.remove("active");
            });
            document
              .querySelector(`.socials-form-group-${tab}`)
              .classList.add("active");
          });
        }
      });

      // Re-render taken-alerts on language switch — ONE observer must call BOTH
      // updaters (alerts have no data-translate, so the i18n engine skips them).
      new MutationObserver(() => {
        updateEmailAlert();
        updatePhoneAlert();
        // Перерисовать хинт IPQS на новом языке, если номер заблокирован.
        if (
          window.PhoneGuard &&
          phoneInput.getAttribute("data-pg-state") === "blocked"
        )
          window.PhoneGuard.verify(phoneInput);
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
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
            passwordShowIcon.src = "./img/password-visible.svg";
          } else {
            passwordInput.setAttribute("type", "password");
            passwordShowIcon.src = "./img/password-invisible.svg";
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
let promocode = getUrlParameter("promocode");
// if (landType) {
//   promocode = getUrlParameter("promocode");
// }

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
        (window.EmailGuard?.tags?.() || "");
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
