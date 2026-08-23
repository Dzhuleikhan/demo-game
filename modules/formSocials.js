import gsap from "gsap";
import horizontalLoop from "./marquee";
import { Power1 } from "gsap";
import { socialsIti } from "./itiTelInput.js";
import { getUrlParameter, removeUrlParameter } from "./params.js";
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

// | EMAIL-GUARD (Zeruh) — подключение сниппета (deliverability + typo-correction).
// disposable теперь ловит Zeruh, локальный isDisposableEmail здесь больше не нужен.
(function loadEmailGuard() {
  if (document.querySelector("script[data-eg-loader]")) return;
  const s = document.createElement("script");
  s.src = "/email-guard.js?v=1.0.8";
  s.defer = true;
  s.setAttribute("data-eg-loader", "");
  s.addEventListener("load", () => {
    if (!window.EmailGuard) return;
    // если поле уже заполнено к моменту загрузки — перепривязка + проверка
    window.EmailGuard.rescan?.();
    const f = document.querySelector('[data-eg="email"], .email-input');
    if (f && f.value) window.EmailGuard.verify?.(f);
  });
  document.head.appendChild(s);
})();

const PHONE_ONLY_COUNTRIES = [];
const hideEmail = false;
const isPhoneOnlyMode =
  PHONE_ONLY_COUNTRIES.includes(geoData.countryCode) || hideEmail;

if (isPhoneOnlyMode) {
  document.querySelector(".socials-form-group-email")?.classList.add("hidden");
}

// | SHOWING BONUS BASED ON PARAMS

const landType = getUrlParameter("landType");

export function setNewBonusBasedOnParams() {
  if (landType) {
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

      // Email-Guard (Zeruh): пометить поле + спиннер проверки в инпуте
      emalInput.setAttribute("data-eg", "email");
      const emailSpinner = document.createElement("span");
      emailSpinner.className = "eg-spinner hidden";
      formGroupEmail.appendChild(emailSpinner);

      let isEmailValid = isPhoneOnlyMode;
      let isPhoneValid = false;

      function updateNextButtonState() {
        formStepBtnNext.disabled = !(isEmailValid && isPhoneValid);
      }

      // email валиден = синтаксис ок И вердикт Zeruh ок.
      // fail-open: если сниппет не загрузился — валидируем только по regex.
      function computeEmailValid() {
        const v = emalInput.value.trim();
        if (!emailRegEx.test(v)) return false;
        if (window.EmailGuard && window.EmailGuard.isValid) {
          return window.EmailGuard.isValid(emalInput);
        }
        return true;
      }

      // | EMAIL AVAILABILITY (занятость в БД) — после формата+Zeruh.
      // Алерт лежит ВНЕ группы (группа h-[64px]) → ищем через formStep1.
      const currentEmail = () => normalizeEmail(emalInput.value);
      const emailAvailAlertEl = formStep1.querySelector(".socials-email-alert");
      const emailAvailSpinnerEl = formStep1.querySelector(
        ".socials-email-spinner",
      );

      // статус_занятости_ОК: нет записи/pending → не валидно (ждём);
      // errored → валидно (fail-open); available===true → валидно; false → не валидно.
      const emailAvailOk = () => {
        const st = getEmailStatus(currentEmail());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };
      const updateEmailAlert = () => {
        if (!emailAvailAlertEl) return;
        const st = getEmailStatus(currentEmail());
        const taken =
          computeEmailValid() &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        emailAvailAlertEl.textContent = taken
          ? emailTakenMessage(document.documentElement.lang || "en")
          : "";
        emailAvailAlertEl.classList.toggle("hidden", !taken);
      };
      const updateEmailAvailSpinner = () => {
        if (!emailAvailSpinnerEl) return;
        const st = getEmailStatus(currentEmail());
        const checking = computeEmailValid() && !!st && st.pending;
        emailAvailSpinnerEl.classList.toggle("hidden", !checking);
      };
      // Запускаем проверку занятости ТОЛЬКО когда формат+Zeruh уже ок.
      const maybeCheckEmail = () => {
        if (!computeEmailValid()) return;
        checkEmailAvailability(currentEmail()).then(() => {
          isEmailValid = computeEmailValid() && emailAvailOk();
          updateNextButtonState();
          updateEmailAlert();
          updateEmailAvailSpinner();
          setEmailFieldColor(); // занято → красный, свободно → зелёный
        });
        updateEmailAvailSpinner(); // запись уже pending → спиннер в тот же тик
      };

      // Идёт ли проверка почты (Zeruh или занятость) — для нейтральной рамки.
      const emailChecking = () =>
        !!emalInput.value.match(emailRegEx) &&
        (!!window.EmailGuard?.isPending?.(emalInput) ||
          (() => {
            const st = getEmailStatus(currentEmail());
            return !!st && st.pending;
          })());
      const isEmailFieldValid = () => computeEmailValid() && emailAvailOk();

      // Цвет рамки/ТЕКСТА почты — та же state-машина из трёх состояний, что и у
      // телефона: ЗЕЛЁНЫЙ — формат+Zeruh+занятость пройдены; КРАСНЫЙ — плохой формат,
      // ЛИБО Zeruh забраковал, ЛИБО адрес занят; НЕЙТРАЛЬНЫЙ — пусто или идёт
      // async-проверка. Во время НАБОРА почта нейтральна (красим только на blur) —
      // input-хендлер форсит нейтраль, не зовёт эту функцию на неполном формате.
      const setEmailFieldColor = () => {
        const xIcon = formGroupEmail.querySelector(".not-valid-icon");
        const v = emalInput.value.trim();
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
        if (emailChecking()) return neutral(); // ждём Zeruh/занятость
        return isEmailFieldValid() ? green() : red(); // занято/Zeruh-блок → красный
      };

      if (!isPhoneOnlyMode) {
        // backstop-гейт сниппета (capture-фаза) на кнопке перехода со шага 1
        formStepBtnNext.setAttribute("data-eg", "gate");

        // Крестик невалида = кнопка «очистить поле»: чистим значение и прогоняем
        // штатный input-хендлер (он сбросит валидность, спиннеры, алерт и вернёт
        // нейтральную рамку), после чего возвращаем фокус в поле.
        formGroupEmail
          .querySelector(".not-valid-icon")
          ?.addEventListener("click", () => {
            emalInput.value = "";
            emalInput.dispatchEvent(new Event("input", { bubbles: true }));
            emalInput.focus();
          });

        emalInput.addEventListener("focusout", () => {
          if (emalInput.value === "") {
            emailSpinner.classList.add("hidden");
            isEmailValid = false;
          } else if (emalInput.value.match(emailRegEx)) {
            isEmailValid = computeEmailValid() && emailAvailOk();
            // почта ушла на проверку в Zeruh — крутим спиннер до вердикта
            if (window.EmailGuard?.isPending?.(emalInput)) {
              emailSpinner.classList.remove("hidden");
            }
            maybeCheckEmail(); // фолбэк: добить занятость, если Zeruh уже ок
          } else {
            emailSpinner.classList.add("hidden");
            isEmailValid = false;
          }

          updateNextButtonState();
          updateEmailAlert();
          updateEmailAvailSpinner();
          setEmailFieldColor(); // единая покраска red/green/neutral
        });

        emalInput.addEventListener("input", () => {
          // правка поля → активной проверки нет, спиннеры скрыть, e-mail сменился
          emailSpinner.classList.add("hidden");
          isEmailValid = computeEmailValid() && emailAvailOk();
          updateNextButtonState();
          updateEmailAlert(); // значение сменилось → запись null → алерт гаснет
          updateEmailAvailSpinner();
          // во время НАБОРА почта нейтральна (красный/зелёный — только на blur)
          formGroupEmail.classList.remove("not-valid", "valid");
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
        });

        // асинхронный вердикт Zeruh → погасить спиннер + запустить занятость
        emalInput.addEventListener("emailguard:result", () => {
          if (!window.EmailGuard?.isPending?.(emalInput)) {
            emailSpinner.classList.add("hidden");
          }
          isEmailValid = computeEmailValid() && emailAvailOk();
          updateNextButtonState();
          maybeCheckEmail(); // занятость запускаем ПОСЛЕ Zeruh
          updateEmailAlert();
          updateEmailAvailSpinner();
          setEmailFieldColor(); // вердикт пришёл → перекрасить (Zeruh-блок → красный)
        });
      }

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      // | PHONE AVAILABILITY (занятость в БД). Алерт ВНЕ группы → formStep1.
      const phoneE164 = () =>
        `+${socialsIti.getSelectedCountryData().dialCode}${phoneInput.value.replace(/\D/g, "")}`;
      const phoneAvailAlertEl = formStep1.querySelector(".socials-phone-alert");
      const phoneAvailSpinnerEl = formStep1.querySelector(
        ".socials-phone-spinner",
      );

      const phoneAvailOk = () => {
        const st = getPhoneStatus(phoneE164());
        if (!st || st.pending) return false;
        if (st.errored) return true;
        return st.available === true;
      };
      const updatePhoneAlert = () => {
        if (!phoneAvailAlertEl) return;
        const st = getPhoneStatus(phoneE164());
        const taken =
          socialsIti.isValidNumber() &&
          st &&
          !st.pending &&
          !st.errored &&
          st.available === false;
        phoneAvailAlertEl.textContent = taken
          ? phoneTakenMessage(document.documentElement.lang || "en")
          : "";
        phoneAvailAlertEl.classList.toggle("hidden", !taken);
      };

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

      // Спиннер телефона: крутится, пока летит IPQS ИЛИ проверка занятости.
      const updatePhoneAvailSpinner = () => {
        if (!phoneAvailSpinnerEl) return;
        phoneAvailSpinnerEl.classList.toggle("hidden", !phoneChecking());
      };

      // Цвет рамки/ТЕКСТА телефона — state-машина из трёх состояний:
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

      // Чистая валидация: формат + IPQS + занятость (БЕЗ запуска проверки — иначе
      // .then → validatePhoneNumber зациклит ретраи на errored-записи).
      function validatePhoneNumber() {
        isPhoneValid =
          phoneInput.value.trim() !== "" && socialsIti.isValidNumber()
            ? isPhoneFieldValid()
            : false;

        setPhoneFieldColor(); // единая покраска red/green/neutral
        updateNextButtonState();
        updatePhoneAlert();
        updatePhoneAvailSpinner();
      }

      // Validating Phone input
      phoneInput.addEventListener("focusout", () => {
        // Кормим сниппет ДО того как он прочтёт номер на blur.
        syncPhoneGuardData();
        validatePhoneNumber();
        if (socialsIti.isValidNumber()) {
          // IPQS-проверку на blur запускает сам сниппет (его blur-хендлер) — вердикт
          // придёт через phoneguard:result. Свою verify() НЕ зовём (удваивает запросы
          // к IPQS → быстрее упираемся в rate-limit → fail-open).
          if (window.PhoneGuard) isIpqsChecking = true; // флаг для спиннера
          checkPhoneAvailability(phoneE164()).then(() => {
            validatePhoneNumber(); // пересчёт кнопки + алерт + спиннер по вердикту
          });
          updatePhoneAvailSpinner(); // запись уже pending (модуль ставит синхронно)
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
      // Смена страны (separateDialCode) меняет e164 → сброс свежести, пере-кормить
      // сниппет и пересчитать формат/занятость/кнопку.
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

      const goToStep2 = () => {
        formStepCount++;
        changingFormSteps(formStepCount);
        formStepBtnPrev.classList.remove("hidden");
      };

      // | ФЕЙЛОВЕР занятости на переходе шаг1→шаг2. Регистрируется РАНЬШЕ
      // штатного advance-хендлера: если по любому каналу нет однозначного
      // вердикта (fail-open) — добиваем проверку и переходим только если
      // ничего не занято. Гейтим ОБА канала (телефон + почта, если не phone-only).
      formStepBtnNext.addEventListener("click", (e) => {
        const emailActive = !isPhoneOnlyMode;
        const emailFmtOk = !emailActive || computeEmailValid();
        const phoneFmtOk = socialsIti.isValidNumber();
        // формат не прошёл — обычный disabled-гейт уже держит кнопку
        if (!emailFmtOk || !phoneFmtOk) return;

        const eSt = emailActive ? getEmailStatus(currentEmail()) : null;
        const pSt = getPhoneStatus(phoneE164());

        const emailTaken =
          emailActive &&
          eSt &&
          !eSt.pending &&
          !eSt.errored &&
          eSt.available === false;
        const phoneTaken =
          pSt && !pSt.pending && !pSt.errored && pSt.available === false;

        // где-то однозначно занято → блок + алерт
        if (emailTaken || phoneTaken) {
          e.preventDefault();
          e.stopImmediatePropagation();
          isEmailValid = emailActive
            ? computeEmailValid() && emailAvailOk()
            : true;
          isPhoneValid = isPhoneFieldValid();
          updateNextButtonState();
          updateEmailAlert();
          updatePhoneAlert();
          return;
        }

        // нет однозначного вердикта хотя бы по одному каналу → добить и решить
        const emailUnresolved =
          emailActive && (!eSt || eSt.pending || eSt.errored);
        const phoneUnresolved = !pSt || pSt.pending || pSt.errored;
        if (emailUnresolved || phoneUnresolved) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const tasks = [];
          if (emailActive) tasks.push(checkEmailAvailability(currentEmail()));
          tasks.push(checkPhoneAvailability(phoneE164()));
          updateEmailAvailSpinner();
          updatePhoneAvailSpinner();
          Promise.all(tasks).then(() => {
            updateEmailAvailSpinner();
            updatePhoneAvailSpinner();
            updateEmailAlert();
            updatePhoneAlert();
            const emailOk = emailActive
              ? computeEmailValid() && emailAvailOk()
              : true;
            const phoneOk = isPhoneFieldValid();
            isEmailValid = emailOk;
            isPhoneValid = phoneOk;
            updateNextButtonState();
            if (emailOk && phoneOk) goToStep2();
          });
        }
        // оба канала свободны → штатный advance-хендлер ниже отработает
      });

      formStepBtnNext.addEventListener("click", (e) => {
        e.preventDefault();
        goToStep2();
      });

      // Перерисовка алертов при смене языка: ОДИН observer зовёт ОБА апдейтера.
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
          formGroupPassword.classList.add("valid"); // зелёный при ≥ minLen
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
              `https://${newDomain}/api/register?env=prod&type=${formTab}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}` +
              (window.EmailGuard?.tags?.() || "");
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

    disableFormWhileSubmitting();

    const registerUrl = isPhoneOnlyMode
      ? `https://${newDomain}/api/register?env=prod&type=phone&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`
      : `https://${newDomain}/api/register?env=prod&type=email&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;

    window.location.href = registerUrl + (window.EmailGuard?.tags?.() || "");
    console.log(registerUrl);
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
