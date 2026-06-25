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

// | EMAIL-GUARD (Zeruh): typo-correction + deliverability check.
// Подгружаем общий сниппет (раздаётся nginx-ом со всех доменов по /email-guard.js).
// Вся логика проверки/UI/fail-open внутри сниппета; здесь — только гейтинг кнопки.
(function loadEmailGuard() {
  if (document.querySelector("script[data-eg-loader]")) return;
  const s = document.createElement("script");
  s.src = "/email-guard.js?v=1.0.7";
  s.defer = true;
  s.setAttribute("data-eg-loader", "");
  s.setAttribute(
    "data-eg-lang",
    localStorage.getItem("preferredLanguage") ||
      document.documentElement.lang ||
      "en",
  );
  document.head.appendChild(s);
})();

// | PHONE-GUARD (IPQS): проверка реальности/активности номера (valid/active), fail-open.
// Подгружаем общий сниппет (раздаётся nginx-ом со всех доменов по /phone-guard.js),
// зеркально email-guard. Скоуп-селектор ОБЯЗАТЕЛЕН: на странице есть второй
// input[type="tel"] (auth-форма) — IPQS не должен цепляться к нему. Вся логика
// проверки/UI/хинта/fail-open внутри сниппета; здесь — только гейтинг кнопки.
(function loadPhoneGuard() {
  if (window.PhoneGuard || document.querySelector("script[data-pg-loader]"))
    return;
  const s = document.createElement("script");
  s.src = "/phone-guard.js?v=1.0.1";
  s.defer = true;
  s.setAttribute("data-pg-loader", "");
  s.setAttribute("data-pg-debug", "false");
  s.setAttribute("data-pg-phone-selector", "[data-pg='phone']");
  const lang = localStorage.getItem("preferredLanguage");
  if (lang) s.setAttribute("data-pg-lang", lang);
  document.head.appendChild(s);
})();

// | SHOWING BONUS BASED ON PARAMS

const bonusSumAndWager = [
  { currency: "EUR", amount: 20 },
  { currency: "USD", amount: 20 },
  { currency: "CAD", amount: 32 },
  { currency: "NZD", amount: 40 },
  { currency: "AUD", amount: 35 },
  { currency: "ARS", amount: 32000 },
  { currency: "COP", amount: 85000 },
  { currency: "CLP", amount: 21220 },
  { currency: "MXN", amount: 400 },
  { currency: "BRL", amount: 115 },
  { currency: "TRY", amount: 1062 },
  { currency: "INR", amount: 2227 },
  { currency: "AZN", amount: 40 },
  { currency: "UZS", amount: 279640 },
  { currency: "IDR", amount: 406160 },
  { currency: "UAH", amount: 1030 },
  { currency: "BDT", amount: 2875 },
  { currency: "KGS", amount: 2055 },
  { currency: "KZT", amount: 10850 },
  { currency: "XOF", amount: 13119 },
  { currency: "HUF", amount: 7250 },
  { currency: "XAF", amount: 13000 },
  { currency: "GHS", amount: 250 },
  { currency: "DKK", amount: 150 },
  { currency: "EGP", amount: 1258 },
  { currency: "ZMW", amount: 438 },
  { currency: "KES", amount: 3026 },
  { currency: "CHF", amount: 20 },
  { currency: "MAD", amount: 200 },
  { currency: "NGN", amount: 32216 },
  { currency: "NOK", amount: 218 },
  { currency: "PLN", amount: 85 },
  { currency: "RWF", amount: 34254 },
  { currency: "RON", amount: 100 },
  { currency: "TZS", amount: 61034 },
  { currency: "UGX", amount: 88100 },
  { currency: "CZK", amount: 500 },
  { currency: "ZAR", amount: 550 },
  { currency: "SLL", amount: 90 },
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

    // Показываем единственный таб, заданный method-type (phone-only режим тоже = phone).
    if (isPhoneOnlyMode || formTabParam === "phone") {
      emailTabBtn.classList.add("hidden");
      emailTabBtn.classList.remove("active");
      phoneTabBtn.classList.remove("hidden");
      phoneTabBtn.classList.add("active");

      emailGroup.classList.remove("active");
      emailGroup.classList.add("hidden");
      phoneGroup.classList.add("active");
    } else {
      phoneTabBtn.classList.add("hidden");
      phoneTabBtn.classList.remove("active");
      emailTabBtn.classList.remove("hidden");
      emailTabBtn.classList.add("active");

      phoneGroup.classList.remove("active");
      phoneGroup.classList.add("hidden");
      emailGroup.classList.add("active");
    }

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
      bonusSumWagerAmount.textContent = wager || "20";
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
      emalInput.setAttribute("data-eg", "email");

      // Алерт «занято» лежит ВНЕ группы (группа h-[64px] обрезала бы абсолют) — ищем через formStep1.
      const emailAlertEl = formStep1.querySelector(".socials-email-alert");
      const emailSpinnerEl = formStep1.querySelector(".socials-email-spinner");

      const currentEmail = () => normalizeEmail(emalInput.value);
      // Email-Guard (Zeruh): если сниппет не загрузился — fail-open (как раньше).
      const egOk = () =>
        window.EmailGuard && window.EmailGuard.isValid
          ? window.EmailGuard.isValid(emalInput)
          : true;

      // Email валиден: синтаксис + Email-Guard + проверка занятости (fail-open на ошибке).
      const isEmailFieldValid = () => {
        if (!emalInput.value.match(emailRegEx) || !egOk()) return false;
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return false; // ждём вердикт занятости
        if (st.errored) return true; // сеть/таймаут/4xx/5xx → fail-open
        return st.available === true; // занято → false
      };

      const updateEmailAlert = () => {
        const st = getEmailStatus(currentEmail());
        const taken =
          emalInput.value.match(emailRegEx) &&
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

      const updateEmailSpinner = () => {
        if (!emailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking =
          !!emalInput.value.match(emailRegEx) && egOk() && !!st && st.pending;
        emailSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Запуск проверки занятости (только после формата + Email-Guard).
      const maybeCheckEmail = () => {
        if (!emalInput.value.match(emailRegEx) || !egOk()) return;
        checkEmailAvailability(currentEmail()).then(() => {
          if (formTab === "email") {
            formStepBtnNext.disabled = !isEmailFieldValid();
            updateEmailAlert();
          }
          updateEmailSpinner(); // гаснет на вердикт/таймаут
        });
        updateEmailSpinner(); // запись уже pending → спиннер появляется в тот же тик
      };

      emalInput.addEventListener("focusout", () => {
        if (emalInput.value === "") {
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          formGroupEmail.classList.remove("not-valid");
        } else if (emalInput.value.match(emailRegEx)) {
          // Синтаксис ок: убираем красный значок, дальше гейтит Email-Guard.
          // Вердикт Zeruh приходит асинхронно → кнопку включит emailguard:result.
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          formGroupEmail.classList.remove("not-valid");
          formStepBtnNext.disabled = !isEmailFieldValid();
          // Фолбэк-запуск проверки занятости (если Email-Guard уже отдал вердикт).
          maybeCheckEmail();
          updateEmailAlert();
        } else {
          formGroupEmail.classList.add("not-valid");
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
          formStepBtnNext.disabled = true;
        }
      });

      emalInput.addEventListener("input", () => {
        formStepBtnNext.disabled = !isEmailFieldValid();
        // Значение сменилось → запись по новому ключу = null → алерт/спиннер гаснут.
        updateEmailAlert();
        updateEmailSpinner();
      });

      // Асинхронный вердикт Zeruh → запустить проверку занятости и пересчитать кнопку.
      emalInput.addEventListener("emailguard:result", () => {
        if (formTab !== "email") return;
        if (emalInput.value.match(emailRegEx)) {
          maybeCheckEmail();
          formStepBtnNext.disabled = !isEmailFieldValid();
          updateEmailAlert();
        }
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // Алерт/спиннер «занято» — вне группы (как у почты), ищем через formStep1.
      const phoneAlertEl = formStep1.querySelector(".socials-phone-alert");
      const phoneSpinnerEl = formStep1.querySelector(".socials-phone-spinner");

      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(/\D/g, "")}`;

      // Занятость номера для гейта (fail-open на ошибке).
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };

      // | IPQS phone-guard (valid/active, fail-open) — ТРЕТИЙ сигнал РЯДОМ с занятостью.
      // Гейт телефона: формат → IPQS → занятость.
      phoneInput.setAttribute("data-pg", "phone");

      // separateDialCode → e164 собирает сам ленд и кладёт в data-атрибуты, ТОЛЬКО
      // при валидном формате (чтобы не бить IPQS по неполному вводу).
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

      let isIpqsChecking = false; // флаг спиннера: set на blur, clear на result/input
      let ipqsVerifiedKey = null; // e164, для которого ПРИШЁЛ phoneguard:result

      // Доверяем вердикту ТОЛЬКО если он свежий именно для текущего e164 — иначе
      // isValid()/isPending() сниппета врут после re-paste того же номера.
      const phoneGuardFresh = () => ipqsVerifiedKey === phoneE164();
      const phoneGuardOk = () =>
        !window.PhoneGuard ||
        (phoneGuardFresh() && window.PhoneGuard.isValid(phoneInput));

      // Кнопка disabled ПО УМОЛЧАНИЮ; открыть её можно ТОЛЬКО здесь и только при
      // свежем вердикте (формат → IPQS → занятость все прошли).
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

      const updatePhoneSpinner = () => {
        if (!phoneSpinnerEl) return;
        const st = getPhoneStatus(phoneE164());
        const checking =
          socialsIti.isValidNumber() &&
          (isIpqsChecking || (!!st && st.pending));
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
          formGroupPhone.classList.remove("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          // Формат ок. Решение «включить» тут НЕ принимаем — только единый гейт
          // (формат → IPQS → занятость). Проверки запускает focusout.
          recalcPhoneBtn();
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

      // Validating Phone input. Запуск проверки занятости вешаем на сам focusout
      // (раз за blur), а не внутри validatePhoneNumber — иначе .then ретраил бы
      // errored-запись бесконечно.
      phoneInput.addEventListener("focusout", () => {
        syncPhoneGuardData(); // до того как сниппет прочтёт номер на blur
        validatePhoneNumber();
        if (socialsIti.isValidNumber()) {
          // Только флаг спиннера — verify() на blur запускает САМ сниппет; ручной
          // вызов удвоил бы запросы к IPQS и ускорил rate-limit → fail-open.
          if (window.PhoneGuard) isIpqsChecking = true;
          checkPhoneAvailability(phoneE164()).then(() => {
            updatePhoneAlert();
            recalcPhoneBtn();
            updatePhoneSpinner();
          });
          updatePhoneSpinner(); // запись уже pending (модуль ставит синхронно)
        }
      });
      // e164 сменился → вердикт устарел: сброс свежести, спиннер/алерт гаснут,
      // кнопку НИКОГДА не включаем синхронно (только через гейт).
      phoneInput.addEventListener("input", () => {
        syncPhoneGuardData();
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        recalcPhoneBtn();
        updatePhoneSpinner();
        updatePhoneAlert();
      });
      phoneInput.addEventListener("countrychange", () => {
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        syncPhoneGuardData();
        recalcPhoneBtn();
        updatePhoneSpinner();
        updatePhoneAlert();
      });
      // Вердикт IPQS пришёл → пометить свежим, снять флаг, пересчитать гейт
      // (единственный асинхронный путь, ОТКРЫВАЮЩИЙ кнопку по IPQS).
      phoneInput.addEventListener("phoneguard:result", () => {
        isIpqsChecking = false;
        ipqsVerifiedKey = phoneE164();
        recalcPhoneBtn();
        updatePhoneSpinner();
      });

      // Переход шаг1→шаг2.
      const advanceToStep2 = () => {
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      };

      // Фейловер: если по активному каналу нет однозначного вердикта занятости —
      // не пускаем дальше, добиваем проверку, и переходим ТОЛЬКО если не занято.
      // Регистрируется РАНЬШЕ штатного advance-хендлера (ниже) → отрабатывает первым.
      formStepBtnNext.addEventListener("click", (e) => {
        if (formTab === "email") {
          if (!emalInput.value.match(emailRegEx) || !egOk()) return; // формат/EG гейтят сами
          const st = getEmailStatus(currentEmail());
          if (st && !st.pending) {
            // вердикт уже есть: свободно/fail-open → штатный advance; занято → блок
            if (isEmailFieldValid()) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            updateEmailAlert();
            return;
          }
          // вердикта нет — добить проверку
          e.preventDefault();
          e.stopImmediatePropagation();
          checkEmailAvailability(currentEmail()).then(() => {
            updateEmailSpinner();
            updateEmailAlert();
            if (isEmailFieldValid()) advanceToStep2();
            else formStepBtnNext.disabled = true;
          });
          updateEmailSpinner();
        } else if (formTab === "phone") {
          // Кнопка disabled по умолчанию; гейт (формат → IPQS → занятость)
          // открывает её только при свежем вердикте. Клик при не-открытом гейте →
          // стоп: вердикт сам придёт на focusout и откроет кнопку (без «добивания»).
          if (!isPhoneGateOpen()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            validatePhoneNumber();
            return;
          }
          // гейт открыт → не мешаем второму хендлеру выполнить переход
        }
      });

      formStepBtnNext.addEventListener("click", (e) => {
        e.preventDefault();
        advanceToStep2();
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
              formStepBtnNext.disabled = !isEmailFieldValid();
            }
            if (tab === "phone") {
              formGroupEmail.classList.remove("not-valid");
              emalInput.value = "";
              // НЕ включаем по одному формату — только через единый гейт.
              recalcPhoneBtn();
            }

            // Поле другого канала очищено → его алерт «занято» больше не актуален.
            updateEmailAlert();
            updatePhoneAlert();
            updateEmailSpinner();
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

      // Перерисовка ОБОИХ алертов при смене языка (у текстов нет data-translate,
      // штатный механизм переводов их не трогает).
      new MutationObserver(() => {
        updateEmailAlert();
        updatePhoneAlert();
        // Хинт IPQS рисует сниппет — перерисуем его на новом языке.
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
