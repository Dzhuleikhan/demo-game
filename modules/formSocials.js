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
      // Покраска поля почты — единой функцией setEmailColor() ниже (red/green/
      // neutral), как у телефона. Отдельные show/clearEmailError больше не нужны.

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

      // Цвет поля почты (red/green/neutral) — единая точка. Зовём на blur и на
      // приход асинхронных вердиктов, НЕ во время набора (иначе краснело бы на
      // неполном вводе). Состояния (как у телефона ниже, §6.2h):
      //   формат плохой / Zeruh забраковал / ЗАНЯТО → красный (+X-иконка)
      //   формат-ок, вердикт летит / пусто        → нейтрально (не мигаем)
      //   всё прошло / fail-open                   → зелёный
      const setEmailColor = () => {
        const green = () => {
          formGroupEmail.classList.add("valid");
          formGroupEmail.classList.remove("not-valid");
          emailNotValidIcon.classList.add("hidden");
        };
        const red = () => {
          formGroupEmail.classList.add("not-valid");
          formGroupEmail.classList.remove("valid");
          emailNotValidIcon.classList.remove("hidden");
        };
        const neutral = () => {
          formGroupEmail.classList.remove("not-valid", "valid");
          emailNotValidIcon.classList.add("hidden");
        };
        const v = emalInput.value.trim();
        if (v === "") return neutral();
        if (!emailRegEx.test(v)) return red(); // формат плохой
        if (egIsPending(emalInput)) return neutral(); // Zeruh ещё проверяет
        if (!egIsValid(emalInput)) return red(); // Zeruh забраковал
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return neutral(); // ждём вердикт занятости
        if (!st.errored && st.available === false) return red(); // занято
        return green(); // всё прошло / fail-open
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
          setEmailColor(); // занятость пришла → зелёный/красный
        });
        updateEmailSpinner(); // entry is pending now → spinner appears same tick
      };

      emalInput.addEventListener("focusout", () => {
        const value = emalInput.value.trim();
        if (value === "") {
          hideEmailSpinner();
          setEmailColor(); // нейтрально
          formStepBtnNext.disabled = true;
          return;
        }
        if (!emailRegEx.test(value)) {
          hideEmailSpinner();
          setEmailColor(); // красный (формат)
          formStepBtnNext.disabled = true;
          return;
        }
        // syntax ok — gate on the Zeruh verdict; show spinner while it checks.
        // deferred so Email-Guard's own blur handler marks the field pending first.
        formStepBtnNext.disabled = !isEmailValid();
        if (window.EmailGuard) {
          // Цвет тоже откладываем на тик: иначе setEmailColor увидит «ещё не
          // pending, ещё не valid» и мигнёт красным до вердикта Zeruh (§6.2h #2).
          setTimeout(() => {
            if (egIsPending(emalInput)) showEmailSpinner();
            setEmailColor();
          }, 0);
        } else {
          setEmailColor(); // нет сниппета (fail-open) → красить сразу можно
        }
        // fallback: if Zeruh already passed (no snippet / cached), kick occupancy
        maybeCheckEmail();
        updateEmailAlert();
      });

      emalInput.addEventListener("input", () => {
        // editing the field restarts the check on the next blur — поле нейтральное
        // во время набора (красный/зелёный только на blur и на async-вердикты).
        hideEmailSpinner();
        formGroupEmail.classList.remove("not-valid", "valid");
        emailNotValidIcon.classList.add("hidden");
        formStepBtnNext.disabled = !isEmailValid();
      });

      // async Zeruh verdict → reconcile spinner, error icon and the button
      emalInput.addEventListener("emailguard:result", (e) => {
        if (!egIsPending(emalInput)) hideEmailSpinner();
        const state = e.detail && e.detail.state;
        if (state !== "blocked" && state !== "invalid") {
          // Zeruh passed → now run the occupancy check
          maybeCheckEmail();
        }
        if (formTab === "email") {
          formStepBtnNext.disabled = !isEmailValid();
          updateEmailAlert();
        }
        setEmailColor(); // red на blocked/invalid, иначе зелёный/нейтраль
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

      // | IPQS PHONE-GUARD (реальность/живость номера, fail-open) — третий,
      // отдельный телефонный сигнал РЯДОМ с занятостью. Гейт: формат → IPQS →
      // занятость. Подробности — ipqs/LANDING_INTEGRATION.md §6.2.
      //
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
      // номера НЕ сбрасывает внутренний _pgChecked (сбрасывает только на blur),
      // из-за чего его isPending() врёт (false), а isValid() отдаёт устаревший
      // «ok». Поэтому доверяем вердикту, ТОЛЬКО если он подтверждён через
      // phoneguard:result ИМЕННО для текущего e164. Сброс на любое изменение
      // номера (input/paste/countrychange) — README «Грабли» №5.
      let ipqsVerifiedKey = null;
      const phoneGuardFresh = () => ipqsVerifiedKey === phoneE164();
      // Номер прошёл IPQS и не плохой (нет сниппета → fail-open).
      const phoneGuardOk = () =>
        !window.PhoneGuard ||
        (phoneGuardFresh() && window.PhoneGuard.isValid(phoneInput));

      // occupancy gate (fail-open): no verdict/pending → not ok; errored → ok;
      // available===true → ok; available===false → taken → not ok.
      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };

      // | ЕДИНЫЙ ГЕЙТ КНОПКИ (таб phone). Кнопка по умолчанию ВСЕГДА выключена;
      // открыть её можно ТОЛЬКО здесь — когда номер полностью проверен:
      // формат + СВЕЖИЙ вердикт IPQS (valid/active) + занятость (оба fail-open).
      // Любой ввод/paste/смена страны сбрасывают свежесть → кнопка снова off,
      // включится лишь после прихода новых вердиктов (focusout → проверки).
      const isPhoneFieldValid = () =>
        socialsIti.isValidNumber() && phoneGuardOk() && phoneAvailOk();
      const recalcPhoneBtn = () => {
        if (formTab === "phone") formStepBtnNext.disabled = !isPhoneFieldValid();
      };

      // Нейтраль, пока летит IPQS ИЛИ проверка занятости (поле не мигает).
      const phoneChecking = () => {
        if (!socialsIti.isValidNumber()) return false;
        if (isIpqsChecking) return true;
        const st = getPhoneStatus(phoneE164());
        return !!st && st.pending;
      };

      // Цвет поля телефона (red/green/neutral) — единая точка (§6.2h):
      //   пусто                              → нейтрально
      //   формат плохой                      → красный (+X-иконка)
      //   формат-ок, летит IPQS/занятость    → нейтрально (не мигаем)
      //   IPQS-блок ИЛИ ЗАНЯТО               → красный
      //   всё прошло / fail-open             → зелёный
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
        return isPhoneFieldValid() ? green() : red(); // занято/IPQS-блок → красный
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
          socialsIti.isValidNumber() && (isIpqsChecking || (!!st && st.pending));
        phoneSpinnerEl.classList.toggle("hidden", !checking);
      };

      // Подсветка поля делегируется setPhoneFieldColor (red/green/neutral),
      // включение кнопки — recalcPhoneBtn (полный гейт формат→IPQS→занятость).
      // Здесь НЕ принимаем решение «включить» и НЕ запускаем проверки.
      function validatePhoneNumber() {
        setPhoneFieldColor();
        updatePhoneAlert();
        recalcPhoneBtn();
        return isPhoneFieldValid();
      }

      // Validating Phone input. На blur валидного номера запускаем проверку
      // занятости (раз за blur); IPQS-проверку на blur запускает САМ сниппет
      // (его blur-хендлер) — свою verify() НЕ зовём, чтобы не удваивать запросы
      // к IPQS и не ускорять rate-limit → fail-open (README «Грабли» №6).
      phoneInput.addEventListener("focusout", () => {
        syncPhoneGuardData(); // кормим сниппет ДО того как он прочтёт номер
        const fmtOk = socialsIti.isValidNumber();
        // Сначала помечаем «проверка идёт» (флаг IPQS) и запускаем занятость —
        // тогда validatePhoneNumber() ниже увидит phoneChecking()===true и
        // оставит поле НЕЙТРАЛЬНЫМ, а не мигнёт красным, пока летят IPQS/
        // занятость (§5). IPQS-запрос на blur делает сам сниппет.
        if (fmtOk && window.PhoneGuard) isIpqsChecking = true;
        if (fmtOk) {
          checkPhoneAvailability(phoneE164()).then(() => {
            updatePhoneAlert();
            recalcPhoneBtn();
            updatePhoneSpinner();
            setPhoneFieldColor();
          });
        }
        validatePhoneNumber(); // цвет/алерт/кнопка (нейтраль, пока идут проверки)
        updatePhoneSpinner();
      });
      // Любой ввод/вставка: вердикт IPQS устарел → сброс свежести, кнопка снова
      // off (включится ТОЛЬКО после повторной полной проверки на blur, никогда
      // синхронно на input). Перекармливаем сниппет новым номером.
      phoneInput.addEventListener("input", () => {
        syncPhoneGuardData();
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        recalcPhoneBtn();
        updatePhoneSpinner();
        updatePhoneAlert();
        setPhoneFieldColor();
      });
      // Смена страны (separateDialCode) меняет e164 → сбросить свежесть вердикта,
      // пере-кормить сниппет, выключить кнопку.
      phoneInput.addEventListener("countrychange", () => {
        ipqsVerifiedKey = null;
        isIpqsChecking = false;
        syncPhoneGuardData();
        recalcPhoneBtn();
        setPhoneFieldColor();
      });
      // Пришёл вердикт IPQS ДЛЯ ТЕКУЩЕГО номера — пометить свежим, снять флаг,
      // пересчитать гейт/цвет/спиннер (единственный путь, ОТКРЫВАЮЩИЙ кнопку
      // по IPQS).
      phoneInput.addEventListener("phoneguard:result", () => {
        isIpqsChecking = false;
        ipqsVerifiedKey = phoneE164();
        recalcPhoneBtn();
        updatePhoneSpinner();
        setPhoneFieldColor();
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
          // Кнопка активна ТОЛЬКО когда гейт полностью пройден (формат + свежий
          // IPQS + занятость). Если клик всё же случился, а гейт не открыт —
          // блокируем переход (иначе второй, безусловный advance-хендлер ниже
          // пустит дальше) и выключаем кнопку. Никакого «добивания» проверок:
          // нужный вердикт придёт сам на focusout и откроет кнопку.
          if (!isPhoneFieldValid()) {
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
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      });

      // re-translate occupancy alerts on language switch (one observer, BOTH
      // updaters — see §4 grabli)
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
              // телефон очищен → снять подсветку (red/green) и сбросить свежесть
              // вердикта IPQS
              formGroupPhone.classList.remove("not-valid", "valid");
              formGroupPhone
                .querySelector(".not-valid-icon")
                .classList.add("hidden");
              phoneInput.value = "";
              ipqsVerifiedKey = null;
              isIpqsChecking = false;
              formStepBtnNext.disabled = !isEmailValid();
            }
            if (tab === "phone") {
              // почта очищена → снять подсветку
              formGroupEmail.classList.remove("not-valid", "valid");
              emailNotValidIcon.classList.add("hidden");
              emalInput.value = "";
              // НЕ включать кнопку по одному формату — только через полный гейт
              // (формат + свежий IPQS + занятость).
              recalcPhoneBtn();
              setPhoneFieldColor();
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
        // во время набора — нейтрально (красный/зелёный только на blur)
        formGroupPassword.classList.remove("not-valid", "valid");
        formGroupPassword.querySelector(".not-valid-icon").classList.add("hidden");
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
