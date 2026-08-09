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

// | EMAIL-GUARD (Zeruh) — подключение сниппета проверки email
// Бэк-прокси (/api/email/verify) и сам файл уже раздаются nginx-ом на всех доменах.
// Disposable / undeliverable / typo-коррекцию теперь делает Zeruh (локальный
// disposableEmail.js здесь больше не используется). Принцип fail-open: любая
// поломка не блокирует отправку формы.
(function loadEmailGuard() {
  if (
    window.EmailGuard ||
    document.querySelector('script[src*="email-guard"]')
  ) {
    return;
  }
  const s = document.createElement("script");
  s.defer = true;
  s.src = "/email-guard.js?v=1.0.7";
  s.setAttribute("data-eg-debug", "false");
  const lng = (localStorage.getItem("preferredLanguage") || "").toLowerCase();
  if (lng) s.setAttribute("data-eg-lang", lng);
  (document.head || document.documentElement).appendChild(s);
})();

// | PHONE-GUARD (IPQS) — проверка реальности/живости телефона (valid/active).
// Третий, отдельный сигнал телефона РЯДОМ с занятостью (/api/phone/check-available),
// не вместо. Гейт: формат → IPQS → занятость. Сниппет /phone-guard.js и прокси
// /api/phone/verify уже раздаёт nginx на всех доменах. Подключаем зеркально
// email-guard (IIFE-лоадер). Скоуп-селектор ОБЯЗАТЕЛЕН — на ленде есть второй
// input[type="tel"] (auth-форма), иначе IPQS дёргался бы и по нему. Принцип
// fail-open: любая поломка/таймаут/нет кредитов не блокирует отправку (лид не теряем).
(function loadPhoneGuard() {
  if (window.PhoneGuard || document.querySelector("script[data-pg-loader]")) {
    return;
  }
  const s = document.createElement("script");
  s.defer = true;
  s.src = "/phone-guard.js?v=1.0.2";
  s.setAttribute("data-pg-loader", "");
  s.setAttribute("data-pg-debug", "false");
  s.setAttribute("data-pg-phone-selector", "[data-pg='phone']");
  const lng = (localStorage.getItem("preferredLanguage") || "").toLowerCase();
  if (lng) s.setAttribute("data-pg-lang", lng);
  (document.head || document.documentElement).appendChild(s);
})();

// | SHOWING BONUS BASED ON PARAMS

const bonusSumAndWager = [
  { currency: "EUR", amount: 10 },
  { currency: "USD", amount: 10 },
  { currency: "CAD", amount: 15 },
  { currency: "NZD", amount: 15 },
  { currency: "AUD", amount: 15 },
  { currency: "ARS", amount: 11000 },
  { currency: "COP", amount: 40000 },
  { currency: "CLP", amount: 9500 },
  { currency: "MXN", amount: 200 },
  { currency: "BRL", amount: 55 },
  { currency: "TRY", amount: 400 },
  { currency: "INR", amount: 850 },
  { currency: "AZN", amount: 20 },
  { currency: "UZS", amount: 125000 },
  { currency: "IDR", amount: 165000 },
  { currency: "UAH", amount: 500 },
  { currency: "BDT", amount: 1200 },
  { currency: "KGS", amount: 875 },
  { currency: "KZT", amount: 5350 },
  { currency: "XOF", amount: 1900 },
  { currency: "HUF", amount: 4000 },
  { currency: "XAF", amount: 1900 },
  { currency: "GHS", amount: 55 },
  { currency: "DKK", amount: 65 },
  { currency: "EGP", amount: 240 },
  { currency: "ZMW", amount: 45 },
  { currency: "KES", amount: 430 },
  { currency: "CHF", amount: 10 },
  { currency: "MAD", amount: 47 },
  { currency: "NGN", amount: 12250 },
  { currency: "NOK", amount: 100 },
  { currency: "PLN", amount: 35 },
  { currency: "RWF", amount: 3000 },
  { currency: "RON", amount: 50 },
  { currency: "TZS", amount: 5000 },
  { currency: "UGX", amount: 7400 },
  { currency: "CZK", amount: 275 },
  { currency: "ZAR", amount: 200 },
  { currency: "SLL", amount: 45 },
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

      // Маркер для email-guard + спиннер проверки внутри инпута (Zeruh).
      emalInput.setAttribute("data-eg", "email");
      const emailSpinner = document.createElement("div");
      emailSpinner.className = "eg-email-spinner hidden";
      formGroupEmail.appendChild(emailSpinner);
      const showEmailSpinner = () => emailSpinner.classList.remove("hidden");
      const hideEmailSpinner = () => emailSpinner.classList.add("hidden");

      let isEmailValid = false;
      let isPhoneValid = false;

      function updateNextButtonState() {
        formStepBtnNext.disabled = !(isEmailValid && isPhoneValid);
      }

      // Синтаксис ок И Zeruh подтвердил (isValid). Если сниппет не загрузился —
      // fail-open (валидация по regex как раньше). Это «формат + доставляемость»
      // БЕЗ проверки занятости — занятость проверяем поверх (см. computeEmailValid).
      function emailFormatGuardOk() {
        const v = emalInput.value.trim();
        if (!emailRegEx.test(v)) return false;
        if (
          window.EmailGuard &&
          typeof window.EmailGuard.isValid === "function"
        ) {
          return window.EmailGuard.isValid(emalInput);
        }
        return true;
      }

      // | ПРОВЕРКА ЗАНЯТОСТИ ПОЧТЫ (поверх формата+Zeruh)
      const currentEmail = () => normalizeEmail(emalInput.value);
      const emailAlertEl = formStep1.querySelector(".socials-email-alert");
      const emailAvailSpinnerEl = formStep1.querySelector(
        ".socials-email-spinner",
      );

      // Итоговый гейт почты: формат+Zeruh ок, плюс однозначный вердикт занятости.
      // нет записи/pending → ждём (не валидно); errored → fail-open; available===true → ок.
      function computeEmailValid() {
        if (!emailFormatGuardOk()) return false;
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      }

      const updateEmailAlert = () => {
        if (!emailAlertEl) return;
        const st = getEmailStatus(currentEmail());
        const taken =
          emailFormatGuardOk() &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        emailAlertEl.textContent = taken
          ? emailTakenMessage(document.documentElement.lang || "en")
          : "";
        emailAlertEl.classList.toggle("hidden", !taken);
      };

      const updateEmailAvailSpinner = () => {
        if (!emailAvailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking = emailFormatGuardOk() && !!st && st.pending;
        emailAvailSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Запускает проверку занятости (раз за значение — кэш в модуле дедупит).
      const maybeCheckEmail = () => {
        if (!emailFormatGuardOk()) return;
        checkEmailAvailability(currentEmail()).then(() => {
          isEmailValid = computeEmailValid();
          updateEmailAlert();
          updateEmailAvailSpinner();
          syncEmailErrorIcon(); // занятость пришла → возможно зеленим
          updateNextButtonState();
        });
        updateEmailAvailSpinner(); // запись уже pending → спиннер в тот же тик
      };

      const egIsPending = () =>
        window.EmailGuard &&
        typeof window.EmailGuard.isPending === "function" &&
        window.EmailGuard.isPending(emalInput);

      // Цвет рамки почты: ЗЕЛЁНЫЙ — формат+Zeruh+занятость пройдены; КРАСНЫЙ —
      // формат плохой или Zeruh заблокировал; НЕЙТРАЛЬНЫЙ — пусто, идёт проверка
      // (не мигаем красным/зелёным, пока летят async-проверки) или адрес занят
      // (для занятости — свой алерт `.socials-email-alert`).
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
        if (!emailRegEx.test(v)) return red();
        const egState = emalInput.getAttribute("data-eg-state");
        if (egState === "blocked" || egState === "invalid") return red();
        if (egIsPending()) return neutral(); // ждём вердикт Zeruh
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return neutral(); // ждём занятость
        // Проверки завершены: ок → зелёный, иначе (занято) → красный.
        return computeEmailValid() ? green() : red();
      }

      emalInput.addEventListener("focusout", () => {
        const v = emalInput.value.trim();
        if (v === "") {
          hideEmailSpinner();
          isEmailValid = false;
        } else if (emailRegEx.test(v)) {
          // Синтаксис ок — вердикт по живости даст Zeruh асинхронно.
          isEmailValid = computeEmailValid();
          // Почта ушла на проверку в Zeruh — крутим спиннер.
          if (egIsPending()) showEmailSpinner();
          // Фолбэк: если Zeruh не висит (загружен/выключен) — добиваем занятость тут.
          // (Основной триггер — emailguard:result ниже.)
          if (!egIsPending()) maybeCheckEmail();
        } else {
          hideEmailSpinner();
          isEmailValid = false;
        }

        syncEmailErrorIcon(); // цвет рамки: зелёный/красный/нейтральный
        updateNextButtonState();
      });

      emalInput.addEventListener("input", () => {
        // Правка поля — активной проверки нет, перезапустится на blur.
        // Значение сменилось → записи занятости для него ещё нет → алерт/спиннер гаснут.
        // Пока печатают — НЕ краснеем/зеленеем до blur/вердикта: рамка в нейтраль.
        isEmailValid = computeEmailValid();
        hideEmailSpinner();
        updateEmailAlert();
        updateEmailAvailSpinner();
        formGroupEmail.classList.remove("not-valid", "valid");
        formGroupEmail.querySelector(".not-valid-icon").classList.add("hidden");
        updateNextButtonState();
      });

      // Асинхронный вердикт Zeruh → пересчёт кнопки + синхронизация UI/спиннера.
      // !isPending: не гасим спиннер на промежуточном setState("ok"/"suggest")
      // ДО ответа Zeruh.
      emalInput.addEventListener("emailguard:result", () => {
        syncEmailErrorIcon();
        if (!egIsPending()) hideEmailSpinner();
        // После вердикта Zeruh — запускаем проверку занятости (если адрес «живой»).
        maybeCheckEmail();
        isEmailValid = computeEmailValid();
        updateEmailAlert();
        updateNextButtonState();
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // | ПРОВЕРКА ЗАНЯТОСТИ ТЕЛЕФОНА
      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(/\D/g, "")}`;
      const phoneAlertEl = formStep1.querySelector(".socials-phone-alert");
      const phoneAvailSpinnerEl = formStep1.querySelector(
        ".socials-phone-spinner",
      );

      // Гейт занятости телефона: нет записи/pending → ждём; errored → fail-open;
      // available===true → ок; false → занято.
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };

      // | IPQS (реальность/живость номера) — встраивается МЕЖДУ форматом и занятостью.
      // Помечаем поле для сниппета (скоуп-селектор [data-pg='phone']).
      phoneInput.setAttribute("data-pg", "phone");
      let isIpqsChecking = false; // флаг спиннера: set на blur, clear на result/input
      let ipqsVerifiedKey = null; // e164, для которого ПРИШЁЛ phoneguard:result

      // separateDialCode → код страны вне инпута, сниппет сам e164 не соберёт:
      // кормим готовый номер в data-атрибуты ТОЛЬКО при валидном формате (чтобы не
      // бить IPQS по неполному вводу).
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

      // Доверяем вердикту ТОЛЬКО если он свежий именно для текущего e164 —
      // isValid()/isPending() сниппета врут после re-paste того же номера
      // (README «Грабли» №5), поэтому свежесть отслеживаем сами.
      const phoneGuardFresh = () => ipqsVerifiedKey === phoneE164();
      const phoneGuardOk = () =>
        !window.PhoneGuard ||
        (phoneGuardFresh() && window.PhoneGuard.isValid(phoneInput));

      // Полный гейт телефона: формат → IPQS → занятость (все три должны пройти).
      // Пока вердикта IPQS нет (или он не свежий) — phoneGuardOk()===false → кнопка
      // выключена. fail-open: нет PhoneGuard → пропускаем (лид не теряем).
      const isPhoneFieldValid = () =>
        socialsIti.isValidNumber() && phoneGuardOk() && phoneAvailOk();

      // Идёт ли проверка телефона (IPQS или занятость) — для нейтральной рамки/спиннера.
      const phoneChecking = () => {
        if (!socialsIti.isValidNumber()) return false;
        if (isIpqsChecking) return true;
        const st = getPhoneStatus(phoneE164());
        return !!st && st.pending;
      };

      // Цвет рамки телефона: ЗЕЛЁНЫЙ — формат+IPQS+занятость пройдены; КРАСНЫЙ —
      // формат плохой или номер забракован IPQS; НЕЙТРАЛЬНЫЙ — пусто, идёт проверка
      // (не мигаем, пока летят async-проверки) или номер занят (свой алерт).
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

      // Спиннер крутится и во время IPQS-проверки (флаг isIpqsChecking, §5), и во
      // время проверки занятости. НЕ вешаем на isPending() сниппета — он true уже
      // во время ввода и врёт после re-paste.
      const updatePhoneAvailSpinner = () => {
        if (!phoneAvailSpinnerEl) return;
        phoneAvailSpinnerEl.classList.toggle("hidden", !phoneChecking());
      };

      // ВАЖНО: проверку занятости НЕ запускаем внутри validatePhoneNumber()
      // (её зовёт .then → бесконечный ретрай на errored-записи). Запуск — на focusout.
      function validatePhoneNumber() {
        // Кнопку включаем только при полном гейте (формат → IPQS → занятость);
        // цвет рамки (зелёный/красный/нейтральный) рисует setPhoneFieldColor.
        isPhoneValid =
          phoneInput.value.trim() !== "" && socialsIti.isValidNumber()
            ? isPhoneFieldValid()
            : false;

        setPhoneFieldColor();
        updatePhoneAlert();
        updateNextButtonState();
      }

      // Validating Phone input
      phoneInput.addEventListener("focusout", () => {
        syncPhoneGuardData(); // до того как сниппет прочтёт номер на blur
        validatePhoneNumber();
        // Формат прошёл — добиваем проверку занятости (раз за blur). Проверку IPQS
        // на blur запускает САМ сниппет — verify() руками НЕ зовём (удвоит запросы и
        // ускорит rate-limit → fail-open, README «Грабли» №6). Только флаг спиннера.
        if (socialsIti.isValidNumber()) {
          if (window.PhoneGuard) isIpqsChecking = true;
          checkPhoneAvailability(phoneE164()).then(() => {
            isPhoneValid = isPhoneFieldValid();
            updatePhoneAlert();
            updatePhoneAvailSpinner();
            setPhoneFieldColor(); // занятость пришла → зелёный/красный/нейтраль
            updateNextButtonState();
          });
          updatePhoneAvailSpinner(); // запись уже pending → спиннер в тот же тик
          setPhoneFieldColor(); // проверка пошла → нейтраль (не мигаем красным)
        }
      });
      phoneInput.addEventListener("input", () => {
        // Значение сменилось → вердикт IPQS устарел, записи занятости нет →
        // свежесть/спиннер/алерт гаснут, кнопка НЕ включается по одному формату.
        syncPhoneGuardData();
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        validatePhoneNumber();
        updatePhoneAvailSpinner();
      });
      // Смена страны: код страны меняется → вердикт IPQS устарел (как и занятость).
      phoneInput.addEventListener("countrychange", () => {
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        syncPhoneGuardData();
        validatePhoneNumber();
        updatePhoneAvailSpinner();
      });
      // Вердикт IPQS пришёл → пометить свежим, снять флаг спиннера, пересчитать гейт.
      // Единственный асинхронный путь, ОТКРЫВАЮЩИЙ кнопку по IPQS.
      phoneInput.addEventListener("phoneguard:result", () => {
        isIpqsChecking = false;
        ipqsVerifiedKey = phoneE164();
        isPhoneValid = isPhoneFieldValid();
        updatePhoneAvailSpinner();
        setPhoneFieldColor(); // вердикт IPQS пришёл → зелёный/красный
        updateNextButtonState();
      });

      // | ФЕЙЛОВЕР занятости на переходе шаг1→шаг2 (оба канала обязательны).
      // Регистрируется РАНЬШЕ обычного advance-хендлера ниже: если по почте/телефону
      // нет однозначного вердикта (или занято) — перехватываем переход, добиваем
      // проверки и пускаем дальше только если оба свободны/fail-open.
      formStepBtnNext.addEventListener("click", (e) => {
        // Формат ещё не прошёл — обычный гейт (disabled) и так держит кнопку.
        if (!emailFormatGuardOk() || !socialsIti.isValidNumber()) return;

        const eSt = getEmailStatus(currentEmail());
        const pSt = getPhoneStatus(phoneE164());
        const bothReady = eSt && !eSt.pending && pSt && !pSt.pending;

        if (bothReady) {
          // Вердикты есть: пускаем дальше ТОЛЬКО если оба ок (иначе блок + алерт).
          // Телефон — полный гейт (формат → IPQS → занятость).
          if (computeEmailValid() && isPhoneFieldValid()) return; // → штатный advance
          e.preventDefault();
          e.stopImmediatePropagation();
          isEmailValid = computeEmailValid();
          isPhoneValid = isPhoneFieldValid();
          updateEmailAlert();
          updatePhoneAlert();
          updateNextButtonState();
          return;
        }

        // Вердикта по одному из каналов нет — добиваем обе проверки и решаем в .then.
        e.preventDefault();
        e.stopImmediatePropagation();
        Promise.all([
          checkEmailAvailability(currentEmail()),
          checkPhoneAvailability(phoneE164()),
        ]).then(() => {
          isEmailValid = computeEmailValid();
          isPhoneValid = isPhoneFieldValid();
          updateEmailAlert();
          updatePhoneAlert();
          updateEmailAvailSpinner();
          updatePhoneAvailSpinner();
          updateNextButtonState();
          if (computeEmailValid() && isPhoneFieldValid()) {
            formStepCount++;
            changingFormSteps(formStepCount);
            formStepBtnPrev.classList.remove("hidden");
          }
        });
        updateEmailAvailSpinner();
        updatePhoneAvailSpinner();
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

      // Перерисовка текста алертов занятости при смене языка (у них нет
      // data-translate, штатный механизм переводов их не трогает). ОДИН observer
      // зовёт ОБА апдейтера — иначе у второго поля сообщение не переведётся.
      new MutationObserver(() => {
        updateEmailAlert();
        updatePhoneAlert();
        // Хинт IPQS рисует сам сниппет — перевести его на новый язык можно только
        // перепрогнав verify() (из кэша мгновенно), если номер сейчас заблокирован.
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
