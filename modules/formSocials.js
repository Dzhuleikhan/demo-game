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

// | EMAIL-GUARD (typo-correction + Zeruh deliverability). Disposable-проверка
// теперь полностью на стороне Zeruh, поэтому локальный disposableEmail больше
// не используется. Подробности — в EMAIL_GUARD.md / EMAIL_GUARD_INTEGRATION.md.
(function loadEmailGuard() {
  if (window.EmailGuard || document.querySelector("script[data-eg-loader]"))
    return;
  const s = document.createElement("script");
  s.src = "/email-guard.js?v=1.0.8";
  s.defer = true;
  s.setAttribute("data-eg-loader", "");
  const lang = localStorage.getItem("preferredLanguage");
  if (lang) s.setAttribute("data-eg-lang", lang);
  document.head.appendChild(s);
})();

// | PHONE-GUARD (IPQS valid/active, fail-open). Третий, отдельный телефонный
// сигнал — РЯДОМ с занятостью (phoneAvailability), не вместо. Гейт телефона:
// формат → IPQS → занятость. Подробности — в ipqs/LANDING_INTEGRATION.md (§6.2).
// Скоуп-селектор обязателен: на ленде есть второе input (auth, type="tel"),
// а телефон соцформы — type="phone"; цепляемся ТОЛЬКО к data-pg="phone".
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

// Тег-строка качества почты для register-редиректа (&email_status=…&email_flags=…).
// Если сниппет не загрузился / почта не проверялась — пустая строка (fail-open).
const egTags = () => window.EmailGuard?.tags?.() || "";

// Почта валидна, если: сниппет не загрузился (fail-open) ИЛИ Zeruh её подтвердил.
const egEmailOk = (field) =>
  !window.EmailGuard?.isValid || window.EmailGuard.isValid(field);

// Zeruh ещё проверяет почту (формат-ок, вердикта нет) → красным не красим.
const egEmailPending = (field) =>
  !!window.EmailGuard?.isPending && window.EmailGuard.isPending(field);

// Zeruh забраковал почту (недоставляемая/невалидная) → красим красным.
const egEmailBlocked = (field) => {
  const st = field.getAttribute("data-eg-state");
  return st === "blocked" || st === "invalid";
};

const PHONE_ONLY_COUNTRIES = [];
const hideEmail = false;
const isPhoneOnlyMode =
  PHONE_ONLY_COUNTRIES.includes(geoData.countryCode) || hideEmail;

// | SHOWING BONUS BASED ON PARAMS

const bonusSumAndWager = [
  { currency: "EUR", amount: 15 },
  { currency: "USD", amount: 20 },
  { currency: "CAD", amount: 25 },
  { currency: "NZD", amount: 30 },
  { currency: "AUD", amount: 25 },
  { currency: "ARS", amount: 25600 },
  { currency: "COP", amount: 57000 },
  { currency: "CLP", amount: 16000 },
  { currency: "MXN", amount: 300 },
  { currency: "BRL", amount: 90 },
  { currency: "TRY", amount: 810 },
  { currency: "INR", amount: 1700 },
  { currency: "AZN", amount: 30 },
  { currency: "UZS", amount: 206200 },
  { currency: "IDR", amount: 310500 },
  { currency: "UAH", amount: 770 },
  { currency: "BDT", amount: 2200 },
  { currency: "KGS", amount: 1500 },
  { currency: "KZT", amount: 8000 },
  { currency: "XOF", amount: 10000 },
  { currency: "HUF", amount: 5400 },
  { currency: "XAF", amount: 10000 },
  { currency: "GHS", amount: 200 },
  { currency: "DKK", amount: 120 },
  { currency: "EGP", amount: 850 },
  { currency: "ZMW", amount: 310 },
  { currency: "KES", amount: 2070 },
  { currency: "CHF", amount: 14 },
  { currency: "MAD", amount: 160 },
  { currency: "NGN", amount: 23600 },
  { currency: "NOK", amount: 170 },
  { currency: "PLN", amount: 65 },
  { currency: "RWF", amount: 25200 },
  { currency: "RON", amount: 80 },
  { currency: "TZS", amount: 45000 },
  { currency: "UGX", amount: 63200 },
  { currency: "CZK", amount: 370 },
  { currency: "ZAR", amount: 280 },
  { currency: "SLL", amount: 420 },
];

function getAmountForCurrency(currencyCode) {
  const item = bonusSumAndWager.find((p) => p.currency === currencyCode);
  return item ? item.amount : 15;
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

    // method-type=phone должен вести себя как phone-only режим:
    // показываем телефонную вкладку как единственный заголовок.
    const isPhoneTab =
      isPhoneOnlyMode || getUrlParameter("method-type") === "phone";

    if (isPhoneTab) {
      const emailTabBtn = document.querySelector(
        ".socials-form-type-btn[data-tab='email']",
      );
      const phoneTabBtn = document.querySelector(
        ".socials-form-type-btn[data-tab='phone']",
      );
      const emailGroup = document.querySelector(".socials-form-group-email");
      const phoneGroup = document.querySelector(".socials-form-group-phone");

      emailTabBtn.classList.add("hidden");
      emailTabBtn.classList.remove("active");
      phoneTabBtn.classList.remove("hidden");
      phoneTabBtn.classList.add("active");

      emailGroup.classList.remove("active");
      emailGroup.classList.add("hidden");
      phoneGroup.classList.add("active");
    } else {
      document
        .querySelector(".socials-form-type-btn[data-tab='phone']")
        .classList.add("hidden");
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

      // Email-Guard: пометить поле для сниппета и кнопку как backstop-гейт.
      emalInput.setAttribute("data-eg", "email");
      formStepBtnNext.setAttribute("data-eg", "gate");

      // | ПРОВЕРКА ЗАНЯТОСТИ ПОЧТЫ (после формата + Zeruh, fail-open).
      const currentEmail = () => normalizeEmail(emalInput.value);
      const emailAlertEl = formStep1.querySelector(".socials-email-alert");
      const emailSpinnerEl = formStep1.querySelector(".socials-email-spinner");

      // Спиннер занятости почты: показываем, пока запрос в полёте.
      const updateEmailSpinner = () => {
        if (!emailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking =
          emailRegEx.test(emalInput.value.trim()) &&
          egEmailOk(emalInput) &&
          !!st &&
          st.pending;
        emailSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Поле почты валидно: синтаксис + Zeruh + вердикт занятости (fail-open).
      const isEmailFieldValid = () => {
        if (!emailRegEx.test(emalInput.value.trim()) || !egEmailOk(emalInput))
          return false;
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return false; // ждём вердикт занятости
        if (st.errored) return true; // fail-open
        return st.available === true; // занято → false
      };

      // Цвет поля почты по вердикту (зовётся на blur и на приход асинхронных
      // вердиктов — НЕ во время набора, иначе краснело бы на неполном вводе):
      //   формат невалиден      → красный + X-иконка + тултип "Wrong email"
      //   Zeruh забраковал/занято → красный (рамка+текст; сообщение даёт хинт/алерт)
      //   формат-ок, вердикт летит → нейтрально (крутится проверка)
      //   всё прошло / fail-open  → зелёный
      const updateEmailColor = () => {
        const icon = formGroupEmail.querySelector(".not-valid-icon");
        const set = (state) => {
          formGroupEmail.classList.toggle("valid", state === "valid");
          formGroupEmail.classList.toggle("not-valid", state === "format");
          formGroupEmail.classList.toggle("eg-bad", state === "bad");
          icon.classList.toggle("hidden", state !== "format");
        };
        const v = emalInput.value.trim();
        if (v === "") return set("none");
        if (!emailRegEx.test(v)) return set("format");
        if (egEmailPending(emalInput)) return set("none");
        if (egEmailBlocked(emalInput)) return set("bad");
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return set("none");
        if (!st.errored && st.available === false) return set("bad"); // занято
        return set("valid");
      };

      const updateEmailAlert = () => {
        const st = getEmailStatus(currentEmail());
        const taken =
          emailRegEx.test(emalInput.value.trim()) &&
          egEmailOk(emalInput) &&
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

      // Запустить проверку занятости только когда формат и Zeruh уже ок.
      const maybeCheckEmail = () => {
        if (!emailRegEx.test(emalInput.value.trim()) || !egEmailOk(emalInput))
          return;
        checkEmailAvailability(currentEmail()).then(() => {
          if (formTab === "email") {
            formStepBtnNext.disabled = !isEmailFieldValid();
            updateEmailAlert();
            updateEmailColor();
          }
          updateEmailSpinner();
        });
        updateEmailSpinner();
      };

      // Полная валидация на blur: синтаксис ок + вердикт Zeruh (или fail-open).
      // Пока вердикта нет — egEmailOk вернёт false и кнопка останется выключенной.
      const recalcEmailBtn = () => {
        if (emalInput.value.match(emailRegEx)) {
          // Формат + Zeruh ок → запускаем проверку занятости и гейтим по ней.
          maybeCheckEmail();
          formStepBtnNext.disabled = !isEmailFieldValid();
          updateEmailAlert();
        } else {
          formStepBtnNext.disabled = true;
        }
        updateEmailColor(); // цвет/иконка/тултип — единая точка по вердикту
      };

      emalInput.addEventListener("focusout", recalcEmailBtn);

      emalInput.addEventListener("input", () => {
        // Во время ввода ошибку/успех не показываем — поле нейтральное; держим
        // кнопку выключенной, пока свежая почта не пройдёт Zeruh + занятость.
        formGroupEmail.classList.remove("not-valid", "eg-bad", "valid");
        formGroupEmail.querySelector(".not-valid-icon").classList.add("hidden");
        updateEmailAlert();
        updateEmailSpinner();
        formStepBtnNext.disabled = !isEmailFieldValid();
      });

      // Асинхронный вердикт Zeruh пришёл — пересчитать кнопку.
      emalInput.addEventListener("emailguard:result", () => {
        if (formTab === "email") recalcEmailBtn();
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // Phone-Guard: пометить поле для сниппета (IPQS attach по data-pg="phone").
      phoneInput.setAttribute("data-pg", "phone");

      // | ПРОВЕРКА ЗАНЯТОСТИ ТЕЛЕФОНА (после валидного формата, fail-open).
      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(/\D/g, "")}`;
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

      // Спиннер телефона: показываем, пока летит IPQS ИЛИ проверка занятости.
      const updatePhoneSpinner = () => {
        if (!phoneSpinnerEl) return;
        const st = getPhoneStatus(phoneE164());
        const checking =
          socialsIti.isValidNumber() &&
          (isIpqsChecking || (!!st && st.pending));
        phoneSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Вердикт занятости для гейта кнопки (fail-open).
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false; // ждём вердикт
        if (st.errored) return true; // fail-open
        return st.available === true; // занято → false
      };

      // | ЕДИНЫЙ ГЕЙТ КНОПКИ (таб phone). Кнопка по умолчанию ВСЕГДА выключена;
      // открыть её можно ТОЛЬКО здесь — когда номер полностью проверен:
      // формат + СВЕЖИЙ вердикт IPQS (valid/active) + занятость (оба fail-open).
      // Любой ввод/paste/смена страны сбрасывают свежесть → кнопка снова off,
      // включится лишь после прихода новых вердиктов (focusout → проверки).
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

      // Подсветка поля (красный/иконка). Решение «включить кнопку» НЕ здесь —
      // только через recalcPhoneBtn (полный гейт), который и зовём в конце.
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
      // занятости (раз за blur — без рекурсии: модуль сам ретраит на ошибке).
      phoneInput.addEventListener("focusout", () => {
        // Кормим сниппет ДО того как он прочтёт номер.
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
          updatePhoneSpinner();
        }
      });

      // При редактировании номера: обновляем данные для IPQS и прячем спиннер
      // занятости (e164 сменился).
      phoneInput.addEventListener("input", () => {
        syncPhoneGuardData();
        // Любой ввод/вставка: прошлый вердикт IPQS больше не действителен →
        // сбрасываем свежесть, кнопка снова выключена. Включится ТОЛЬКО после
        // повторной полной проверки на blur (никогда синхронно на input).
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        recalcPhoneBtn();
        updatePhoneSpinner();
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
      // пересчитать гейт (это единственный путь, открывающий кнопку для IPQS).
      phoneInput.addEventListener("phoneguard:result", () => {
        isIpqsChecking = false;
        ipqsVerifiedKey = phoneE164();
        recalcPhoneBtn();
        updatePhoneSpinner();
      });

      // Фейловер занятости на переходе шаг1→шаг2: если по активному каналу нет
      // однозначного вердикта (fail-open), добиваем проверку перед переходом и
      // идём дальше, только если не занято. Регистрируется РАНЬШЕ advance-хендлера.
      const advanceToStep2 = () => {
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      };

      formStepBtnNext.addEventListener("click", (e) => {
        if (formTab === "email") {
          // Почта невалидна по формату/Zeruh → стоп (иначе второй, безусловный
          // advance-хендлер ниже пустит дальше невалидную почту).
          if (
            !emailRegEx.test(emalInput.value.trim()) ||
            !egEmailOk(emalInput)
          ) {
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            updateEmailColor();
            return;
          }
          const st = getEmailStatus(currentEmail());
          if (st && !st.pending) {
            // вердикт уже есть: свободно/fail-open → пускаем дальше; занято → блок
            if (isEmailFieldValid()) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            formStepBtnNext.disabled = true;
            updateEmailAlert();
            return;
          }
          // вердикта ещё нет — добиваем проверку перед переходом
          e.preventDefault();
          e.stopImmediatePropagation();
          checkEmailAvailability(currentEmail()).then(() => {
            updateEmailSpinner();
            updateEmailAlert();
            updateEmailColor();
            if (isEmailFieldValid()) advanceToStep2();
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

      // Перерисовка сообщений «занято» при смене языка (lang на <html>).
      // ВАЖНО: один observer зовёт ОБА апдейтера (и почта, и телефон).
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
              formStepBtnNext.disabled = !(
                emalInput.value != "" &&
                emalInput.value.match(emailRegEx) &&
                egEmailOk(emalInput)
              );
            }
            if (tab === "phone") {
              formGroupEmail.classList.remove("not-valid");
              emalInput.value = "";
              updateEmailColor(); // почта очищена → снять зелёную рамку
              // Открыть кнопку только если номер уже полностью проверен
              // (свежий IPQS + занятость), иначе выключена.
              recalcPhoneBtn();
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
