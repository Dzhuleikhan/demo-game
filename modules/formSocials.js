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

// Язык для сообщений «занято» (у алертов нет data-translate — переводим из модуля).
const takenAlertLang = () =>
  document.documentElement.getAttribute("lang") ||
  localStorage.getItem("preferredLanguage") ||
  "en";

// | SHOWING BONUS BASED ON PARAMS

const bonusSumAndWager = [
  { currency: "EUR", amount: 5 },
  { currency: "USD", amount: 5 },
  { currency: "CAD", amount: 7 },
  { currency: "NZD", amount: 10 },
  { currency: "AUD", amount: 7 },
  { currency: "ARS", amount: 7000 },
  { currency: "COP", amount: 18500 },
  { currency: "CLP", amount: 5000 },
  { currency: "MXN", amount: 100 },
  { currency: "BRL", amount: 25 },
  { currency: "TRY", amount: 220 },
  { currency: "INR", amount: 500 },
  { currency: "AZN", amount: 10 },
  { currency: "UZS", amount: 61000 },
  { currency: "IDR", amount: 85000 },
  { currency: "UAH", amount: 250 },
  { currency: "BDT", amount: 650 },
  { currency: "KGS", amount: 450 },
  { currency: "KZT", amount: 2500 },
  { currency: "HUF", amount: 1500 },
  { currency: "DKK", amount: 35 },
  { currency: "CHF", amount: 5 },
  { currency: "NOK", amount: 50 },
  { currency: "PLN", amount: 20 },
  { currency: "RON", amount: 25 },
  { currency: "CZK", amount: 100 },
  { currency: "ZAR", amount: 100 },
  { currency: "XOF", amount: 3000 },
  { currency: "XAF", amount: 3000 },
  { currency: "GHS", amount: 50 },
  { currency: "EGP", amount: 300 },
  { currency: "ZMW", amount: 100 },
  { currency: "KES", amount: 700 },
  { currency: "MAD", amount: 50 },
  { currency: "NGN", amount: 7000 },
  { currency: "RWF", amount: 8000 },
  { currency: "TZS", amount: 13000 },
  { currency: "UGX", amount: 20000 },
  { currency: "SLL", amount: 150 },
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
      const emailNotValidIcon = formGroupEmail.querySelector(".not-valid-icon");
      const emailSpinner = formGroupEmail.querySelector(".email-spinner");

      let isEmailValid = false;
      let isPhoneValid = false;

      function updateNextButtonState() {
        formStepBtnNext.disabled = !(isEmailValid && isPhoneValid);
      }

      // | EMAIL-GUARD (Zeruh) — deliverability + typo-correction + disposable.
      // Snippet (email-guard.js) drives the typo hint and the Zeruh check on blur;
      // here we только read its verdict to gate the button and show a spinner.
      // fail-open: если сниппет не загрузился, валидируем по regex как раньше.
      const emailGuardSaysValid = () => {
        if (window.EmailGuard && window.EmailGuard.isValid) {
          return window.EmailGuard.isValid(emalInput);
        }
        return true; // сниппет недоступен → не блокируем лид
      };
      const emailGuardPending = () =>
        !!(
          window.EmailGuard &&
          window.EmailGuard.isPending &&
          window.EmailGuard.isPending(emalInput)
        );

      const showEmailSpinner = () => {
        if (emailSpinner) emailSpinner.classList.remove("hidden");
      };
      const hideEmailSpinner = () => {
        if (emailSpinner) emailSpinner.classList.add("hidden");
      };

      // | EMAIL AVAILABILITY (наш API /api/email/check-available) — занятость в БД.
      // Запускаем ТОЛЬКО после того, как пройдены формат и Zeruh (см. maybeCheckEmail).
      // fail-open: блокируем кнопку только при однозначном available:false.
      const currentEmail = () => normalizeEmail(emalInput.value);
      const emailAlertEl = formStep1.querySelector(".socials-email-alert");
      const emailAvailSpinnerEl = formStep1.querySelector(
        ".socials-email-spinner",
      );

      // Сообщение «этот e-mail нельзя использовать» — только при однозначном «занято».
      const updateEmailAlert = () => {
        if (!emailAlertEl) return;
        const st = getEmailStatus(currentEmail());
        const taken =
          emailRegEx.test(emalInput.value.trim()) &&
          emailGuardSaysValid() &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        emailAlertEl.textContent = taken
          ? emailTakenMessage(takenAlertLang())
          : "";
        emailAlertEl.classList.toggle("hidden", !taken);
      };

      // Спиннер занятости почты — крутится, пока запись pending.
      const updateEmailSpinner = () => {
        if (!emailAvailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking =
          emailRegEx.test(emalInput.value.trim()) &&
          emailGuardSaysValid() &&
          !!st &&
          st.pending;
        emailAvailSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Запустить проверку занятости — только если формат ок и Zeruh не против.
      const maybeCheckEmail = () => {
        if (!emailRegEx.test(emalInput.value.trim()) || !emailGuardSaysValid())
          return;
        checkEmailAvailability(currentEmail()).then(() => {
          evaluateEmail(); // пересчёт кнопки + алерт + спиннер по вердикту
        });
        updateEmailSpinner(); // запись уже pending → спиннер в тот же тик
      };

      // Цвет рамки/ТЕКСТА почты (как в эталоне landing 10): ЗЕЛЁНЫЙ — формат+Zeruh+
      // занятость пройдены; КРАСНЫЙ — плохой формат, ЛИБО Zeruh забраковал
      // (читаем data-eg-state="blocked"/"invalid" НАПРЯМУЮ — надёжнее, чем
      // EmailGuard.isValid, который может врать), ЛИБО адрес занят; НЕЙТРАЛЬНЫЙ —
      // пусто или ещё идёт async-проверка (не мигаем красным/зелёным).
      function syncEmailErrorIcon() {
        const v = emalInput.value.trim();
        const xIcon = formGroupEmail.querySelector(".not-valid-icon");
        const red = () => {
          formGroupEmail.classList.add("not-valid");
          formGroupEmail.classList.remove("valid");
          xIcon.classList.remove("hidden");
        };
        const green = () => {
          formGroupEmail.classList.add("valid");
          formGroupEmail.classList.remove("not-valid");
          xIcon.classList.add("hidden");
        };
        const neutral = () => {
          formGroupEmail.classList.remove("not-valid", "valid");
          xIcon.classList.add("hidden");
        };
        if (v === "") return neutral();
        if (!emailRegEx.test(v)) return red(); // плохой формат
        const egState = emalInput.getAttribute("data-eg-state");
        if (egState === "blocked" || egState === "invalid") return red(); // Zeruh забраковал
        if (emailGuardPending()) return neutral(); // ждём вердикт Zeruh
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return neutral(); // ждём занятость
        // Проверки завершены: занято → красный, иначе (свободно/fail-open) → зелёный.
        return st.errored || st.available === true ? green() : red();
      }

      // Пересчёт состояния кнопки + покраска поля на основе вердиктов.
      function evaluateEmail() {
        const value = emalInput.value.trim();
        if (value === "" || !emailRegEx.test(value) || emailGuardPending()) {
          isEmailValid = false;
        } else if (emailGuardSaysValid()) {
          const st = getEmailStatus(currentEmail());
          if (!st || st.pending) isEmailValid = false; // ждём вердикт занятости
          else if (st.errored) isEmailValid = true; // fail-open
          else isEmailValid = st.available === true; // занято → false (алерт)
        } else {
          isEmailValid = false; // Zeruh забраковал
        }

        syncEmailErrorIcon(); // единая покраска red/green/neutral
        updateNextButtonState();
        updateEmailAlert();
        updateEmailSpinner();
      }

      emalInput.addEventListener("focusout", () => {
        evaluateEmail();
        // почта ушла в Zeruh (синтаксис ок, вердикта ещё нет) → крутим спиннер
        if (emailGuardPending()) showEmailSpinner();
        // Фолбэк (Zeruh не загрузился) → запускаем проверку занятости на blur.
        maybeCheckEmail();
      });

      emalInput.addEventListener("input", () => {
        // правка поля → активной проверки нет, перезапустится на blur
        hideEmailSpinner();
        evaluateEmail();
      });

      // Асинхронный вердикт Zeruh прилетает событием на инпут → пересчитываем кнопку.
      emalInput.addEventListener("emailguard:result", () => {
        if (!emailGuardPending()) hideEmailSpinner();
        evaluateEmail();
        // Zeruh подтвердил доставляемость → запускаем проверку занятости.
        maybeCheckEmail();
      });

      // Клик по крестику — очистка поля. Сам сброс состояния (рамка, красный
      // текст, тултип, алерт «почта занята», спиннеры, дизейбл кнопки) уже
      // делает хендлер `input` выше, поэтому не дублируем его руками: чистим
      // value и диспатчим bubbling-событие `input`. На него же подписаны и
      // внешние валидаторы (EmailGuard / Zeruh / проверка занятости).
      emailNotValidIcon?.addEventListener("click", () => {
        emalInput.value = "";
        emalInput.dispatchEvent(new Event("input", { bubbles: true }));
        emalInput.focus();
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // | PHONE AVAILABILITY (наш API /api/phone/check-available) — занятость в БД.
      // E.164: +<dialCode><digits>. fail-open: блокируем только при available:false.
      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(/\D/g, "")}`;
      const phoneAlertEl = formStep1.querySelector(".socials-phone-alert");
      const phoneAvailSpinnerEl = formStep1.querySelector(
        ".socials-phone-spinner",
      );

      // | IPQS PHONE-GUARD (реальность/живость номера, fail-open). Третий, отдельный
      // телефонный сигнал РЯДОМ с занятостью. Гейт телефона: формат → IPQS → занятость.
      // separateDialCode → код страны вне инпута: сниппет сам e164 не соберёт, поэтому
      // ленд кладёт готовый номер (цифры без "+") + страну в data-атрибуты поля, ТОЛЬКО
      // при валидном формате (чтобы не бить IPQS по неполному вводу). На blur сниппет
      // сам прочтёт их и запустит проверку — свою verify() НЕ зовём (удваивает запросы).
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
      // НЕ завязывать спиннер на isPending: он true уже во время ввода.
      let isIpqsChecking = false;

      // Свежесть вердикта IPQS отслеживаем САМИ: на re-paste того же номера сниппет
      // НЕ сбрасывает свой внутренний _pgChecked, из-за чего его isPending() врёт
      // (false), а isValid() отдаёт устаревший «ok». Поэтому доверяем вердикту, только
      // если он подтверждён через phoneguard:result ИМЕННО для текущего e164. Сброс —
      // на любое изменение номера (input/paste/countrychange).
      let ipqsVerifiedKey = null;
      const phoneGuardFresh = () => ipqsVerifiedKey === phoneE164();
      // Номер прошёл IPQS и не плохой (нет сниппета → fail-open).
      const phoneGuardOk = () =>
        !window.PhoneGuard ||
        (phoneGuardFresh() && window.PhoneGuard.isValid(phoneInput));

      // Гейт занятости телефона (fail-open).
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false; // ждём вердикт
        if (st.errored) return true; // fail-open
        return st.available === true; // занято → false
      };

      // Полный гейт телефона: формат → IPQS → занятость (все три должны пройти).
      const isPhoneFieldValid = () =>
        socialsIti.isValidNumber() && phoneGuardOk() && phoneAvailOk();

      // Идёт ли проверка (IPQS или занятость) — для нейтральной рамки/спиннера.
      const phoneChecking = () => {
        if (!socialsIti.isValidNumber()) return false;
        if (isIpqsChecking) return true;
        const st = getPhoneStatus(phoneE164());
        return !!st && st.pending;
      };

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
          ? phoneTakenMessage(takenAlertLang())
          : "";
        phoneAlertEl.classList.toggle("hidden", !taken);
      };

      // Спиннер телефона: крутится, пока летит IPQS ИЛИ проверка занятости.
      const updatePhoneSpinner = () => {
        if (!phoneAvailSpinnerEl) return;
        phoneAvailSpinnerEl.classList.toggle("hidden", !phoneChecking());
      };

      // Цвет рамки/ТЕКСТА телефона (как в эталоне landing 10 / как у почты выше):
      // ЗЕЛЁНЫЙ — формат+IPQS+занятость пройдены; КРАСНЫЙ — плохой формат, ЛИБО
      // IPQS забраковал номер, ЛИБО номер занят; НЕЙТРАЛЬНЫЙ — пусто или идёт
      // async-проверка (не мигаем красным/зелёным, пока летят проверки).
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
        if (!socialsIti.isValidNumber()) return red(); // плохой формат
        if (phoneChecking()) return neutral(); // ждём IPQS/занятость
        // Проверки завершены: ок → зелёный, иначе (IPQS-блок или занято) → красный.
        return isPhoneFieldValid() ? green() : red();
      };

      function validatePhoneNumber() {
        isPhoneValid =
          phoneInput.value.trim() !== "" && socialsIti.isValidNumber()
            ? isPhoneFieldValid()
            : false;

        setPhoneFieldColor(); // единая покраска red/green/neutral
        updateNextButtonState();
        updatePhoneAlert();
        updatePhoneSpinner();
      }

      // Validating Phone input. Проверку занятости НЕ запускаем внутри
      // validatePhoneNumber() (иначе .then ретраит errored-запись бесконечно) —
      // вешаем на сам focusout (раз за blur).
      phoneInput.addEventListener("focusout", () => {
        // Кормим сниппет ДО того как он прочтёт номер на blur.
        syncPhoneGuardData();
        validatePhoneNumber();
        if (socialsIti.isValidNumber()) {
          // IPQS-проверку на blur запускает сам сниппет (его blur-хендлер) — вердикт
          // придёт через phoneguard:result и пометит номер свежим. Свою verify() НЕ
          // зовём, чтобы не удваивать запросы к IPQS (это ускоряет rate-limit).
          if (window.PhoneGuard) isIpqsChecking = true; // флаг для спиннера
          checkPhoneAvailability(phoneE164()).then(() => {
            validatePhoneNumber(); // пересчёт кнопки + алерт + спиннер по вердикту
          });
          updatePhoneSpinner(); // запись уже pending → спиннер в тот же тик
        }
      });

      // Любой ввод/вставка: прошлый вердикт IPQS больше не действителен → сброс
      // свежести, кнопка снова выключена (включится после повторной проверки на blur).
      phoneInput.addEventListener("input", () => {
        syncPhoneGuardData();
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        validatePhoneNumber();
      });

      // Смена страны (separateDialCode) меняет e164 → сбросить свежесть вердикта,
      // пере-кормить сниппет и пересчитать формат/занятость/кнопку.
      phoneInput.addEventListener("countrychange", () => {
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        syncPhoneGuardData();
        validatePhoneNumber();
      });

      // Пришёл вердикт IPQS ДЛЯ ТЕКУЩЕГО номера — пометить свежим, снять флаг,
      // пересчитать гейт (единственный путь, открывающий кнопку по IPQS).
      phoneInput.addEventListener("phoneguard:result", () => {
        isIpqsChecking = false;
        ipqsVerifiedKey = phoneE164();
        validatePhoneNumber();
      });

      // Перевод уже показанных сообщений «занято» (почта/телефон) при смене языка.
      // Один observer зовёт ОБА апдейтера (у алертов нет data-translate).
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

      // Фейловер занятости на переходе шаг1→шаг2: если по почте/телефону нет
      // однозначного вердикта (fail-open включил кнопку) — придержать переход,
      // добить проверки и перейти только если ничего не занято. Регистрируется
      // РАНЬШЕ штатного advance-хендлера ниже → при блоке перебивает его.
      const isDefinitive = (st) =>
        !!st && !st.pending && !st.errored && typeof st.available === "boolean";

      formStepBtnNext.addEventListener("click", async (e) => {
        const needEmail =
          emailRegEx.test(emalInput.value.trim()) &&
          emailGuardSaysValid() &&
          !isDefinitive(getEmailStatus(currentEmail()));
        const needPhone =
          socialsIti.isValidNumber() &&
          !isDefinitive(getPhoneStatus(phoneE164()));

        if (!needEmail && !needPhone) return; // вердикты есть → штатный advance

        e.preventDefault();
        e.stopImmediatePropagation();
        const tasks = [];
        if (needEmail) tasks.push(checkEmailAvailability(currentEmail()));
        if (needPhone) tasks.push(checkPhoneAvailability(phoneE164()));
        updateEmailSpinner();
        updatePhoneSpinner();
        await Promise.all(tasks);
        evaluateEmail(); // пересчёт кнопки/алертов/спиннеров по вердиктам
        validatePhoneNumber();

        const emailTaken = getEmailStatus(currentEmail())?.available === false;
        const phoneTaken = getPhoneStatus(phoneE164())?.available === false;
        if (!emailTaken && !phoneTaken) {
          formStepCount++;
          changingFormSteps(formStepCount);
          formStepBtnPrev.classList.remove("hidden");
        }
        // занято → остаёмся на шаге: алерт показан, кнопка станет disabled
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
