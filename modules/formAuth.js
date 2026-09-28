import gsap from "gsap";
import { authIti } from "./itiTelInput";
import { hiddenSelect } from "./hiddenSelect";
import { getUrlParameter, updateUrl } from "./params";
import { newDomain } from "./fetchingDomain";
import { checkTir1CurrencyMatch } from "./modalCurrency";
import {
  checkPhoneAvailability,
  getPhoneStatus,
  phoneTakenMessage,
} from "./phoneAvailability";
import {
  checkEmailAvailability,
  getEmailStatus,
  emailTakenMessage,
} from "./emailAvailability";
import {
  checkPromocode,
  getPromocodeStatus,
  promocodeInvalidMessage,
} from "./promocodeCheck";
import { modalTranslations } from "../public/modalTranslations";

// | FIELD ERROR TEXT (red message under a field)
// Текст хранится ключом в data-error-key, чтобы при смене языка его можно было
// перевести заново (см. MutationObserver на <html lang> внизу файла).
const currentLang = () => document.documentElement.lang || "en";
const translateModal = (key) =>
  modalTranslations[currentLang()]?.[key] || modalTranslations.en?.[key] || "";

// Создаёт <p> для ошибки сразу ПОСЛЕ блока поля (внутри grid-формы).
function ensureFieldAlert(fieldBox, className) {
  let el = fieldBox.nextElementSibling;
  if (el && el.classList.contains(className)) return el;
  el = document.createElement("p");
  el.className = `${className} field-alert mt-1 hidden text-center text-xs text-[#FF5530]`;
  fieldBox.insertAdjacentElement("afterend", el);
  return el;
}

// Показ/скрытие текста ошибки сдвигает всё, что ниже поля. Ошибка появляется на
// blur, а blur случается на mousedown по СЛЕДУЮЩЕМУ элементу («I have a promo
// code», «Sign up», вкладки…): элемент уезжает вниз до mouseup — и клик теряется.
// Поэтому на время жеста (pointerdown … click) смену раскладки откладываем до
// конца клика. На тач-устройствах blur приходит уже ПОСЛЕ pointerup (с
// эмулированным mousedown), поэтому жест считается законченным только на click
// (или по таймауту, если клика не будет — например, скролл пальцем).
let pointerIsDown = false;
let gestureTimer = null;
const deferredLayout = [];
const endGesture = () => {
  clearTimeout(gestureTimer);
  pointerIsDown = false;
  setTimeout(() => {
    while (deferredLayout.length) deferredLayout.shift()();
  }, 0);
};
document.addEventListener(
  "pointerdown",
  () => {
    clearTimeout(gestureTimer);
    pointerIsDown = true;
  },
  true,
);
["pointerup", "pointercancel"].forEach((type) =>
  document.addEventListener(
    type,
    () => {
      clearTimeout(gestureTimer);
      gestureTimer = setTimeout(endGesture, 500);
    },
    true,
  ),
);
document.addEventListener("click", endGesture, true);

function setAlertText(el, text) {
  if (!el) return;
  // Последнее желаемое состояние: отложенный apply применит именно его, а не
  // устаревший текст, если между ними поле успели перепроверить.
  el._alertText = text || "";
  const apply = () => {
    el._alertQueued = false;
    el.textContent = el._alertText;
    el.classList.toggle("hidden", !el._alertText);
  };
  // Текст уже виден и лишь меняется (например, перевод) — раскладка не прыгает.
  const layoutChanges = el.classList.contains("hidden") === !!text;
  if (layoutChanges && pointerIsDown) {
    if (!el._alertQueued) {
      el._alertQueued = true;
      deferredLayout.push(apply);
    }
  } else {
    apply();
  }
}

// key — ключ из modalTranslations; null — скрыть.
function setFieldAlert(el, key) {
  if (!el) return;
  el.dataset.errorKey = key || "";
  setAlertText(el, key ? translateModal(key) : "");
}

// Availability ("занятость") alert updaters. Declared at module scope so a single
// <html lang> MutationObserver (bottom of file) can re-translate BOTH alerts on
// language change. Reassigned inside the email/phone blocks below; no-ops until then.
let updateEmailAlert = () => {};
let updatePhoneAlert = () => {};

// Adapter that feeds the phone-guard snippet the E.164 number + ISO country via
// data-attributes (separateDialCode → the snippet can't assemble e164 itself).
// Module-scoped so the submit gate (bottom) can re-sync before awaiting the verdict.
// Reassigned inside the `if (phoneForm)` block; no-op until then.
let syncPhoneGuardData = () => {};

// | EMAIL-GUARD (Zeruh) — deliverability + typo-correction.
// Snippet + nginx backend are deployed on the VPS for every domain; here we only
// load it. Absolute path (/email-guard.js) so it resolves from the landing domain
// root, not the CDN base. Injected dynamically to bypass Vite's base rewriting.
// Fail-open: any failure never blocks form submit. See GB_DOCS/Zeruh.
(function loadEmailGuard() {
  if (document.querySelector("script[data-eg-loader]")) return;
  const s = document.createElement("script");
  s.src = "/email-guard.js?v=1.0.8";
  s.defer = true;
  s.setAttribute("data-eg-loader", "");
  document.head.appendChild(s);
})();

// | PHONE-GUARD (IPQS) — реальность/живость номера (valid/active).
// Сниппет + nginx-бэкенд развёрнуты на VPS для каждого домена; здесь только грузим.
// Абсолютный путь (/phone-guard.js) — резолвится с корня домена ленда, не с CDN-базы.
// Скоуп-селектор обязателен: на странице есть второй телефонный инпут (socials,
// type="phone") — снимок цепляем ТОЛЬКО к помеченному data-pg="phone" (auth-форма).
// Принцип fail-open: любая ошибка/таймаут НЕ блокирует сабмит. См. GB_DOCS/ipqs.
(function loadPhoneGuard() {
  if (window.PhoneGuard || document.querySelector("script[data-pg-loader]"))
    return;
  const s = document.createElement("script");
  s.src = "/phone-guard.js?v=1.0.2";
  s.defer = true;
  s.setAttribute("data-pg-loader", "");
  s.setAttribute("data-pg-debug", "false");
  s.setAttribute("data-pg-phone-selector", "[data-pg='phone']");
  const lang = localStorage.getItem("preferredLanguage");
  if (lang) s.setAttribute("data-pg-lang", lang);
  document.head.appendChild(s);
})();

// | AUTH FORM VALIDATION AND SUBMITTING

const emailForm = document.querySelector(".auth-form-type-email");
const phoneForm = document.querySelector(".auth-form-type-phone");
const socialForm = document.querySelectorAll(".auth-form-type-social");
const oneClickForm = document.querySelector(".auth-form-type-oneclick");

// Validate email input
function validateEmailInput() {
  const formEmail = document.querySelector(".auth-form-email");
  if (formEmail) {
    const formEmailInput = formEmail.querySelector("input");
    const emailRegEx =
      /^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]{0,62}[a-zA-Z0-9]@(?:\[(?:\d{1,3}\.){3}\d{1,3}\]|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+)$/;

    // Availability ("занятость") alert lives as a sibling AFTER the flex .auth-form-email
    // box (a <p> inside the flex row would render inline), so resolve via the parent.
    const emailAlertEl =
      formEmail.parentElement?.querySelector(".auth-email-alert");

    // Zeruh (email-guard): состояние поля пишет сам сниппет в data-eg-state.
    // blocked — недоставляемый/одноразовый адрес (domain.com и т.п.), invalid — синтаксис.
    // Нет сниппета / нет вердикта → не мешаем (fail-open).
    const emailGuardState = () => formEmailInput.getAttribute("data-eg-state");
    const emailGuardBlocked = () =>
      ["blocked", "invalid"].includes(emailGuardState());
    const emailGuardPending = () =>
      !!window.EmailGuard?.isPending?.(formEmailInput);
    // Свой хинт сниппет рисует в .eg-hint — если он уже что-то пишет, наш текст
    // формата не дублируем.
    const emailGuardHintShown = () => {
      const hint = formEmail.parentElement?.querySelector(".eg-hint");
      return !!hint && hint.textContent.trim() !== "";
    };

    // Ошибка формата показывается после blur и сбрасывается при правке.
    let emailFormatError = false;

    // Под полем: «неверный формат» или «почта занята» (только при однозначном
    // available:false; pending/errored/free → скрыто, fail-open).
    updateEmailAlert = () => {
      if (!emailAlertEl) return;
      const v = formEmailInput.value.trim();
      const st = getEmailStatus(v);
      const taken =
        !!v &&
        emailRegEx.test(v) &&
        !emailGuardBlocked() &&
        st &&
        !st.pending &&
        !st.errored &&
        st.available === false;

      let text = "";
      if (emailFormatError && !!v && !emailGuardHintShown()) {
        text = translateModal("wrongEmail");
      } else if (taken) {
        text = emailTakenMessage(currentLang());
      }
      setAlertText(emailAlertEl, text);
    };

    // formEmailInput.addEventListener("input", () => {
    function emailInputValidate() {
      let inputValue = formEmailInput.value.toLowerCase();
      if (inputValue === "") {
        formEmail.classList.remove("valid");
        formEmail.classList.remove("non-valid");
      } else {
        formEmail.querySelector(".validation-cta").classList.remove("hidden");
        emailFormatError = !inputValue.match(emailRegEx);
        if (inputValue.match(emailRegEx) && emailGuardBlocked()) {
          // Zeruh: адрес недоставляемый/одноразовый (хинт рисует сниппет) → красный.
          formEmail.classList.remove("valid");
          formEmail.classList.add("non-valid");
        } else if (inputValue.match(emailRegEx)) {
          formEmail.classList.remove("non-valid");
          // Format OK, but DON'T flash the green check yet — wait for the
          // availability verdict. Otherwise a taken e-mail keeps a green tick
          // until (and unless) the async check flips it. Stay neutral meanwhile.
          formEmail.classList.remove("valid");
          const checkedEmail = formEmailInput.value;
          checkEmailAvailability(checkedEmail).then((st) => {
            // Value changed while in flight → ignore this stale verdict.
            if (formEmailInput.value !== checkedEmail) return;
            if (emailGuardBlocked()) {
              formEmail.classList.add("non-valid"); // Zeruh заблокировал → красный
              formEmail.classList.remove("valid");
            } else if (st && st.available === false) {
              formEmail.classList.add("non-valid"); // занято → красный
              formEmail.classList.remove("valid");
            } else if (emailGuardPending()) {
              // Zeruh ещё думает → нейтраль; перекрасим на emailguard:result.
              formEmail.classList.remove("valid");
              formEmail.classList.remove("non-valid");
            } else if (st && st.available === true) {
              formEmail.classList.add("valid"); // свободно → зелёная галочка
              formEmail.classList.remove("non-valid");
            } else {
              // errored/timeout → fail-open: остаёмся нейтральными, без зелёной
              // галочки (submit добьёт проверку как backstop).
              formEmail.classList.remove("valid");
              formEmail.classList.remove("non-valid");
            }
            updateEmailAlert();
          });
        } else {
          formEmail.classList.remove("valid");
          formEmail.classList.add("non-valid");
        }
      }
      if (inputValue === "") emailFormatError = false;
      updateEmailAlert();
    }
    // });

    formEmailInput.addEventListener("focusout", emailInputValidate);
    formEmailInput.addEventListener("focusin", () => {
      formEmail.classList.remove("valid");
      formEmail.classList.remove("non-valid");
    });
    // Editing the address invalidates any shown verdict → hide stale alert.
    formEmailInput.addEventListener("input", () => {
      emailFormatError = false;
      updateEmailAlert();
    });
    // Email-Guard (Zeruh) typo-correction rewrites the value programmatically
    // (e.g. gmial.com → gmail.com) WITHOUT a blur, so emailInputValidate never
    // re-runs and the field keeps the stale green tick from the old address.
    // Re-validate on its verdict event so the corrected address goes through
    // the availability check too.
    formEmailInput.addEventListener("emailguard:result", emailInputValidate);
  }
}
validateEmailInput();

// Validate password input
function validatePasswordInput() {
  const formPassword = document.querySelectorAll(".auth-form-password");

  formPassword.forEach((formPassword) => {
    if (formPassword) {
      const formPasswordInput = formPassword.querySelector("input");
      const showPasswordBtn = formPassword.querySelector(".show-password");
      const passwordAlertEl = ensureFieldAlert(
        formPassword,
        "auth-password-alert",
      );

      function passwordInputValidation() {
        let inputValue = formPasswordInput.value;
        if (inputValue === "") {
          formPassword.classList.remove("valid");
          formPassword.classList.remove("non-valid");
          setFieldAlert(passwordAlertEl, null);
        } else {
          if (inputValue.length >= 6) {
            formPassword.classList.remove("non-valid");
            formPassword.classList.add("valid");
            setFieldAlert(passwordAlertEl, null);
          } else {
            formPassword.classList.add("non-valid");
            formPassword.classList.remove("valid");
            setFieldAlert(passwordAlertEl, "wrongPassword");
          }
        }
      }

      formPasswordInput.addEventListener("focusout", passwordInputValidation);
      formPasswordInput.addEventListener("focusin", () => {
        formPassword.classList.remove("non-valid");
        formPassword.classList.remove("valid");
      });
      formPasswordInput.addEventListener("input", () =>
        setFieldAlert(passwordAlertEl, null),
      );

      // Toggle password visibility (eye is always visible; icon reflects state)
      if (showPasswordBtn) {
        const eyeOpen = showPasswordBtn.querySelector(".eye-open");
        const eyeClosed = showPasswordBtn.querySelector(".eye-closed");

        // Keep focus in the input: otherwise mousedown blurs it, focusout
        // validation shows ✗/✓ and shifts the eye, so the click misses it.
        showPasswordBtn.addEventListener("mousedown", (e) => e.preventDefault());

        showPasswordBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const isHidden = formPasswordInput.type === "password";
          formPasswordInput.type = isHidden ? "text" : "password";
          eyeOpen?.classList.toggle("hidden", isHidden);
          eyeClosed?.classList.toggle("hidden", !isHidden);
        });
      }
    }
  });
}
validatePasswordInput();

// Password input placeholder
const passwordInput = document.querySelectorAll(".auth-password-input");

passwordInput.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.length >= 1) {
      input.nextElementSibling.classList.add("hidden");
    } else {
      input.nextElementSibling.classList.remove("hidden");
    }
  });
});
// Promocode input placeholder
const promocodeInput = document.querySelectorAll(".auth-promocode-input");

promocodeInput.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.length >= 1) {
      input.nextElementSibling.classList.add("hidden");
    } else {
      input.nextElementSibling.classList.remove("hidden");
    }
  });
});

// Validate socials input

socialForm.forEach((socialForm) => {
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

    const btnText1 = submitBtn.querySelector(".btn--1");
    const btnText2 = submitBtn.querySelector(".btn--2");

    btnText2.style.display = "none";

    inputs.forEach((inp) => {
      inp.addEventListener("input", () => {
        // enabled/disabled state is handled by updateSubmitState (terms + choice)
        btnText1.style.display = "none";
        btnText2.style.display = "block";
      });
    });
  }
});

// Validate phone input
if (phoneForm) {
  const phone = phoneForm.querySelector(".auth-form-phone");
  const input = phone.querySelector("input[name='phone']");

  // E.164 ("+<dialCode><digits>") — the key both the API and the cache use.
  const phoneE164 = () =>
    `+${authIti.getSelectedCountryData().dialCode}${input.value.replace(/\D/g, "")}`;

  // Feed the phone-guard snippet the E.164 (digits, NO "+") + ISO country, but
  // ONLY while the format is valid (don't hit IPQS on partial input). Cleared
  // otherwise so a stale/incomplete number can't be checked. separateDialCode →
  // the snippet can't assemble e164 itself, so the landing supplies it.
  syncPhoneGuardData = () => {
    if (authIti.isValidNumber()) {
      const { dialCode, iso2 } = authIti.getSelectedCountryData();
      input.dataset.pgE164 = `${dialCode}${input.value.replace(/\D/g, "")}`;
      input.dataset.pgCountry = (iso2 || "").toUpperCase();
    } else {
      delete input.dataset.pgE164;
      delete input.dataset.pgCountry;
    }
  };

  // IPQS gate (fail-open): нет сниппета → ok; pending → ждём вердикт; isValid → ok;
  // blocked (valid:false/active:false) → нет. На await-сабмите вердикт добивается
  // через verify(), поэтому ранний isValid/isPending здесь — только для подсветки.
  const phoneGuardOk = () =>
    !window.PhoneGuard || window.PhoneGuard.isValid(input);
  const phoneGuardPending = () =>
    !!window.PhoneGuard && window.PhoneGuard.isPending(input);

  // Alert lives as a sibling AFTER the bordered .auth-form-phone box (so the
  // text sits below the input, not inside the frame), so resolve via the parent.
  const phoneAlertEl = phone.parentElement?.querySelector(".auth-phone-alert");
  // Ошибка формата показывается после blur и сбрасывается при правке.
  let phoneFormatError = false;

  // Под полем: «неверный номер» (формат) или «номер занят» (только при
  // однозначном available:false). IPQS-хинт рисует сам сниппет в .pg-hint.
  updatePhoneAlert = () => {
    if (!phoneAlertEl) return;
    const st = getPhoneStatus(phoneE164());
    const taken =
      authIti.isValidNumber() &&
      st &&
      !st.pending &&
      !st.errored &&
      st.available === false;
    let text = "";
    if (phoneFormatError) text = translateModal("wrongNumber");
    else if (taken) text = phoneTakenMessage(currentLang());
    setAlertText(phoneAlertEl, text);
  };

  // Border/icon state machine — красит ВЕСЬ гейт (формат → IPQS → занятость) одной
  // функцией, а не одним toggle (GB_DOCS/ipqs README «Грабли» №8). Зелёный ТОЛЬКО
  // когда пройдены все три; формат-плохой / IPQS-блок / занято → красный; пусто или
  // идёт async-проверка → нейтраль (не мигаем). Этот ленд красит лишь рамку+иконку,
  // НЕ текст инпута → -webkit-text-fill-color (грабли №7) тут не требуется.
  const setPhoneFieldColor = () => {
    const red = () => {
      phone.classList.add("non-valid");
      phone.classList.remove("valid");
    };
    const green = () => {
      phone.classList.add("valid");
      phone.classList.remove("non-valid");
    };
    const neutral = () => phone.classList.remove("valid", "non-valid");

    if (!input.value.trim()) return red(); // пусто на blur → красный (как было)
    if (!authIti.isValidNumber()) return red(); // формат плохой → красный
    if (phoneGuardPending()) return neutral(); // IPQS летит → нейтраль
    if (!phoneGuardOk()) return red(); // IPQS valid:false/active:false → красный
    const st = getPhoneStatus(phoneE164());
    if (!st || st.pending) return neutral(); // занятость летит → нейтраль
    if (st.errored) return neutral(); // занятость fail-open → нейтраль (без зелёного)
    if (st.available === false) return red(); // занято → красный
    return green(); // всё прошло → зелёный
  };

  function validatePhoneNumber() {
    syncPhoneGuardData(); // до того как сниппет прочтёт dataset на blur
    phoneFormatError = !authIti.isValidNumber();
    updatePhoneAlert();
    if (input.value.trim() && authIti.isValidNumber()) {
      const checkedE164 = phoneE164();
      // (.then только перекрашивает поле/alert — функцию не перезапускает, поэтому
      // errored/fail-open запись не запускает retry-петлю.)
      checkPhoneAvailability(checkedE164).then((st) => {
        // Value changed while in flight → ignore this stale verdict.
        if (phoneE164() !== checkedE164) return;
        setPhoneFieldColor();
        updatePhoneAlert();
      });
    }
    setPhoneFieldColor();
    return authIti.isValidNumber();
  }

  input.addEventListener("focusout", validatePhoneNumber);
  input.addEventListener("focusin", () => {
    phone.classList.remove("non-valid");
    phone.classList.remove("valid");
  });
  // Editing the number: пишем актуальный e164 для сниппета + прячем устаревший alert.
  input.addEventListener("input", () => {
    syncPhoneGuardData();
    phoneFormatError = false;
    updatePhoneAlert();
  });
  // Смена страны: переписать e164 под новый dial-код.
  input.addEventListener("countrychange", syncPhoneGuardData);
  // Async-вердикт IPQS пришёл → перекрасить рамку (красный хинт рисует/убирает сам
  // сниппет в .pg-hint; отдельный <p> для IPQS не нужен).
  input.addEventListener("phoneguard:result", setPhoneFieldColor);
}

/**
 *  Promocode
 */
const promocodeWrapper = document.querySelectorAll(".auth-promocode-wrapper");

// Промокод проверяется по API (/api/v2/promocode/check-available) на blur и
// перед сабмитом. Зелёный — только при available:true; available:false → красная
// рамка + текст под полем, форма не уходит. Ошибка API → нейтраль (fail-open).
const promoAlertUpdaters = [];

promocodeWrapper.forEach((promo) => {
  if (promo) {
    const promocodeBtn = promo.querySelector(".promocode-btn");
    const promocodeBox = promo.querySelector(".promocode-input-box");
    const iconValid = promo.querySelector(".icon-valid");
    const iconInvalidalid = promo.querySelector(".icon-invalid");
    const promocodeInput = promo.querySelector("input");
    const promoAlertEl = ensureFieldAlert(promocodeBox, "auth-promocode-alert");

    const setNeutral = () => {
      promocodeBox.classList.remove("non-valid", "valid");
      iconValid.classList.add("hidden");
      iconInvalidalid.classList.remove("hidden");
    };

    const paint = () => {
      const code = promocodeInput.value.trim();
      const st = getPromocodeStatus(code);
      const invalid = !!code && st && !st.pending && st.available === false;
      const ok = !!code && st && !st.pending && st.available === true;

      if (ok) {
        promocodeBox.classList.add("valid");
        promocodeBox.classList.remove("non-valid");
        iconValid.classList.remove("hidden");
        iconInvalidalid.classList.add("hidden");
      } else if (invalid) {
        // Серая «галочка» при ошибке сбивает с толку — прячем обе иконки,
        // остаются красная рамка и текст под полем.
        promocodeBox.classList.add("non-valid");
        promocodeBox.classList.remove("valid");
        iconValid.classList.add("hidden");
        iconInvalidalid.classList.add("hidden");
      } else {
        setNeutral();
      }

      setAlertText(
        promoAlertEl,
        invalid ? promocodeInvalidMessage(currentLang()) : "",
      );
    };
    promoAlertUpdaters.push(paint);

    promocodeInput.addEventListener("focusout", () => {
      const code = promocodeInput.value.trim();
      if (!code) return paint();
      checkPromocode(code).then(() => {
        if (promocodeInput.value.trim() !== code) return; // устаревший ответ
        paint();
      });
      paint();
    });

    promocodeInput.addEventListener("input", () => {
      setNeutral();
      setAlertText(promoAlertEl, "");
    });

    promocodeBtn.addEventListener("click", () => {
      promocodeBtn.classList.add("hidden");
      promocodeBox.classList.remove("hidden");
      promocodeBox.classList.add("grid");
    });
  }
});

/**
 *  Bonus dropdown
 */

const formBonus = document.querySelectorAll(".auth-form-bonus");

formBonus.forEach((bonus) => {
  if (bonus) {
    const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
    const bonusDropdownList = bonus.querySelector(".form-bonus-dropdown");
    const bonusListItems = bonusDropdownList.querySelectorAll("li");

    // Function to hide the dropdown
    function hideDropdown() {
      bonusDropdownBtn.classList.remove("active");
      bonusDropdownList.classList.remove("active");
    }

    // Event listener for dropdown button
    bonusDropdownBtn.addEventListener("click", () => {
      bonusDropdownBtn.classList.toggle("active");
      bonusDropdownList.classList.toggle("active");
    });

    // Event listener for list items
    bonusListItems.forEach((item) => {
      item.addEventListener("click", () => {
        // Get the selected bonus details
        let bonusIcon = item.querySelector(".bonus-item-icon").src;
        let bonusName = item.querySelector(".bonus-item-name").textContent;
        let bonusId = item.getAttribute("data-bonus-id");

        // Update all form bonus elements with the selected bonus details
        formBonus.forEach((bonus) => {
          const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
          const bonusInput = bonus.querySelector(".bonus-input");
          const bonusListItems = bonus.querySelectorAll("li");

          // Update the dropdown button and input for the current bonus
          bonusDropdownBtn.querySelector(".main-bonus-icon").src = bonusIcon;
          bonusDropdownBtn.querySelector(".main-bonus-name").textContent =
            bonusName;
          bonusInput.value = bonusId;

          // Update the list items' active state
          bonusListItems.forEach((el) => {
            el.classList.remove("active");
            if (
              el.querySelector(".bonus-item-name").textContent === bonusName
            ) {
              el.classList.add("active");
            }
          });
        });

        hideDropdown();

        // Save selected bonus to localStorage
        localStorage.setItem(
          "selectedBonus",
          JSON.stringify({ bonusIcon, bonusId }),
        );
      });
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!bonus.contains(event.target)) {
        hideDropdown();
      }
    });

    // Load selected bonus from localStorage if it exists
    const savedBonus = JSON.parse(localStorage.getItem("selectedBonus"));
    if (savedBonus) {
      formBonus.forEach((bonus) => {
        const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
        const bonusInput = bonus.querySelector(".bonus-input");
        const bonusListItems = bonus.querySelectorAll("li");

        bonusListItems.forEach((item) => {
          let itemIcon = item.querySelector(".bonus-item-icon").src;
          let itemName = item.querySelector(".bonus-item-name").textContent;

          if (
            itemIcon === savedBonus.bonusIcon &&
            itemName === savedBonus.bonusName
          ) {
            item.classList.add("active");
            bonusDropdownBtn.querySelector(".main-bonus-icon").src =
              savedBonus.bonusIcon;
            bonusDropdownBtn.querySelector(".main-bonus-name").textContent =
              savedBonus.bonusName;
            bonusInput.value = savedBonus.bonusName;
          }
        });
      });
    }
  }
});

/**
 *  Submitting form
 */
function submitForm(form, newDomain) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const socials = form.querySelector(".socials");
    const currency = form.querySelector(".form-currency");
    const email = form.querySelector(".auth-form-email");
    const phone = form.querySelector(".auth-form-phone");
    const password = form.querySelector(".auth-form-password");
    const bonus = form.querySelector(".auth-form-bonus");
    const promoCode = form.querySelector(".promocode-input-box");
    const promoCodeWrapper = form.querySelector(".auth-promocode-wrapper");
    const terms = form.querySelector(".checkbox");
    const formbtn = form.querySelector(".form-yellow-btn");

    let formType = form.getAttribute("data-from-type");

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
      let code = authIti.getSelectedCountryData().dialCode;
      let phoneNumber = input.value.trim();
      if (input.value === "" || !authIti.isValidNumber()) {
        phone.classList.add("non-valid");
        isValid = false;
        input.dispatchEvent(new Event("focusout")); // текст ошибки под полем
      } else {
        if (code && phoneNumber) {
          let sanitizedPhoneNumber = phoneNumber.replace(/\D/g, "");
          let fullPhoneNumber = `${code}${sanitizedPhoneNumber}`;
          if (authIti.isValidNumber()) {
            formData.phone = fullPhoneNumber;
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
        input.dispatchEvent(new Event("focusout")); // текст ошибки под полем
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
        input.dispatchEvent(new Event("focusout")); // текст ошибки под полем
      }
    }

    // Checking Bonus
    if (bonus) {
      let input = bonus.querySelector("input");
      formData.bonus = input.value;
    }

    // Checking Promocode
    let promoInputEl = null;
    if (promoCode) {
      promoInputEl = promoCode.querySelector("input");

      if (promoInputEl.value.trim().length >= 1) {
        formData.promocode = promoInputEl.value.trim();
      }
    }

    // Checking terms and  conditions
    if (terms) {
      const input = terms.querySelector("input");
      if (!input.checked) {
        input.classList.add("non-valid");
        isValid = false;
      } else {
        input.classList.remove("non-valid");
      }
    }

    function disableEmailForm() {
      currency.classList.add("submit-disabled");
      email.classList.add("submit-disabled");
      password.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
    }

    function disablePhoneForm() {
      currency.classList.add("submit-disabled");
      phone.classList.add("submit-disabled");
      password.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
    }

    function disableSocialForm() {
      socials.classList.add("submit-disabled");
      currency.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
      formbtn.querySelector(".btn--2").style.display = "none";
    }

    function disableOneClickForm() {
      currency.classList.add("submit-disabled");
      bonus.classList.add("submit-disabled");
      promoCodeWrapper.classList.add("submit-disabled");
      terms.classList.add("submit-disabled");
      formbtn.disabled = true;
      formbtn.classList.add("loading");
    }

    formData.bonus = checkTir1CurrencyMatch(formData.currency, formData.bonus);

    let lang = localStorage.getItem("preferredLanguage") || "en";

    let cid = getUrlParameter("cid");
    let partner = getUrlParameter("partner");
    let offer = getUrlParameter("offer");

    // IPQS gate before redirect: реальный/живой ли номер. Если форма иначе валидна —
    // дождаться вердикта (из кэша мгновенно, иначе ≤ таймаут). valid:false/active:false
    // → красная рамка (хинт сниппет уже показал) + не редиректим. Любая ошибка/таймаут
    // → fail-open (verify не бросает), бэкенд `register` — backstop. Идёт ПЕРЕД занятостью.
    if (
      isValid &&
      formType === "phone" &&
      formData.phone &&
      window.PhoneGuard
    ) {
      const phoneInputEl = phone.querySelector("input[name='phone']");
      syncPhoneGuardData();
      await window.PhoneGuard.verify(phoneInputEl);
      if (!window.PhoneGuard.isValid(phoneInputEl)) {
        phone.classList.add("non-valid");
        phone.classList.remove("valid");
        isValid = false;
      }
    }

    // Failover availability gate before redirect: if the field is otherwise valid,
    // await the verdict. Definitive available:false → block + show alert, no redirect.
    // Any error/timeout → fail-open (await ≤1.5s); backend `register` is the backstop.
    if (isValid && formType === "phone" && formData.phone) {
      const st = await checkPhoneAvailability(`+${formData.phone}`);
      if (st && st.available === false) {
        phone.classList.add("non-valid");
        phone.classList.remove("valid");
        updatePhoneAlert();
        return;
      }
    }
    // Zeruh gate: дождаться вердикта доставляемости (verify не бросает, по
    // таймауту — fail-open). blocked/invalid (domain.com, одноразовые, опечатки
    // домена) → красная рамка, хинт рисует сниппет, редиректа нет.
    if (isValid && formType === "email" && formData.email && window.EmailGuard) {
      const emailInputEl = email.querySelector("input");
      try {
        await window.EmailGuard.verify(emailInputEl);
      } catch {
        /* fail-open */
      }
      if (
        ["blocked", "invalid"].includes(
          emailInputEl.getAttribute("data-eg-state"),
        )
      ) {
        email.classList.add("non-valid");
        email.classList.remove("valid");
        updateEmailAlert();
        return;
      }
    }

    if (isValid && formType === "email" && formData.email) {
      const st = await checkEmailAvailability(formData.email);
      if (st && st.available === false) {
        email.classList.add("non-valid");
        email.classList.remove("valid");
        updateEmailAlert();
        return;
      }
    }

    // Promocode gate: однозначный available:false → не регистрируем, показываем
    // ошибку под полем. Ошибка/таймаут API → fail-open, код уходит как есть.
    if (isValid && formData.promocode) {
      const st = await checkPromocode(formData.promocode);
      promoAlertUpdaters.forEach((fn) => fn());
      if (st && st.available === false) {
        promoInputEl?.focus();
        return;
      }
    }

    if (isValid) {
      if (formType === "email") {
        disableEmailForm();

        console.log(formData);

        window.location.href = `https://${newDomain}/api/register?env=prod&type=${formType}&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}${window.EmailGuard?.tags?.() || ""}`;
        console.log(
          `https://${newDomain}/api/register?env=prod&type=${formType}&currency=${formData.currency}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
        );
      } else if (formType === "phone") {
        disablePhoneForm();

        window.location.href = `https://${newDomain}/api/register?env=prod&type=${formType}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;
        console.log(
          `https://${newDomain}/api/register?env=prod&type=${formType}&currency=${formData.currency}&phone=${formData.phone}&password=${encodeURIComponent(formData.password)}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
        );
      } else if (formType === "social") {
        disableSocialForm();
        window.location.href = `https://${newDomain}/api/register?env=prod&type=${formData.social}&currency=${formData.currency}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;
        console.log(
          `https://${newDomain}/api/register?env=prod&type=${formData.social}&currency=${formData.currency}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
        );
      } else if (formType === "oneclick") {
        disableOneClickForm();
        window.location.href = `https://${newDomain}/api/register?env=prod&type=${formType}&currency=${formData.currency}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;
        console.log(
          `https://${newDomain}/api/register?env=prod&type=${formType}&currency=${formData.currency}${formData.bonus === "0" ? "&bonus=0" : "&bonus=" + formData.bonus}${formData.promocode ? "&promocode=" + formData.promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`,
        );
      }
    }
  });
}

submitForm(emailForm, newDomain);
submitForm(phoneForm, newDomain);
submitForm(oneClickForm, newDomain);

socialForm.forEach((socialForm) => {
  submitForm(socialForm, newDomain);
});

// | SUBMIT BUTTON STATE
// Sign up is disabled until the required fields have data and terms are
// accepted. Format/availability errors are still shown by the submit handler.
const isFilled = (input) => {
  if (!input) return false;
  if (input.value.trim() !== "") return true;
  // Chrome hides autofilled values from JS until the first user gesture.
  try {
    return input.matches(":autofill");
  } catch {
    try {
      return input.matches(":-webkit-autofill");
    } catch {
      return false;
    }
  }
};

function updateSubmitState(form) {
  if (!form) return;
  const btn = form.querySelector(".form-yellow-btn");
  if (!btn || btn.classList.contains("loading")) return;

  const terms = form.querySelector(".checkbox input[type='checkbox']");
  let ready = !terms || terms.checked;

  switch (form.getAttribute("data-from-type")) {
    case "email":
      ready =
        ready &&
        isFilled(form.querySelector(".auth-form-email input")) &&
        isFilled(form.querySelector(".auth-form-password input"));
      break;
    case "phone":
      ready =
        ready &&
        isFilled(form.querySelector(".auth-form-phone input[name='phone']")) &&
        isFilled(form.querySelector(".auth-form-password input"));
      break;
    case "social":
      ready =
        ready && !!form.querySelector("input[name='social-variant']:checked");
      break;
  }

  btn.disabled = !ready;
}

[emailForm, phoneForm, oneClickForm, ...socialForm].forEach((form) => {
  if (!form) return;
  const update = () => updateSubmitState(form);
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  // Programmatic value changes (Zeruh typo-fix) and browser autofill.
  form.addEventListener("emailguard:result", update, true);
  form.addEventListener("animationstart", update, true);
  update();
  setTimeout(update, 500);
});

// Re-translate the availability alerts on language change. One observer drives
// BOTH updaters — the alert text has no data-translate, so the regular i18n
// pass never touches it (see LANDING_INTERGARION.md §4).
new MutationObserver(() => {
  updateEmailAlert();
  updatePhoneAlert();
  promoAlertUpdaters.forEach((fn) => fn());
  document.querySelectorAll(".field-alert[data-error-key]").forEach((el) => {
    if (el.dataset.errorKey) el.textContent = translateModal(el.dataset.errorKey);
  });
  // Re-translate the phone-guard (IPQS) hint: re-run verify on a blocked number so
  // the snippet repaints .pg-hint in the new language (verdict comes from cache).
  const pIn = phoneForm && phoneForm.querySelector("input[name='phone']");
  if (
    window.PhoneGuard &&
    pIn &&
    pIn.getAttribute("data-pg-state") === "blocked"
  ) {
    window.PhoneGuard.verify(pIn);
  }
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["lang"],
});

/**
 *  Validation CTA
 */
const validationCta = document.querySelectorAll(".validation-cta");

validationCta.forEach((el) => {
  if (el) {
    let error = el.querySelector(".error-alert");
    let x = el.querySelector(".wrong");

    x.addEventListener("mouseenter", () => {
      error.classList.add("is-visible");
    });
    x.addEventListener("mouseleave", () => {
      error.classList.remove("is-visible");
    });
  }
});

// | CHANGING FORM TABS

const modalTabs = document.querySelector(".modal-tabs");
const modalTabContents = document.querySelectorAll(".form-content");

function showActualModal(tabName) {
  modalTabContents.forEach((c) => {
    c.classList.remove("active");
  });
  document.querySelector(`.form-content-${tabName}`).classList.add("active");
}

modalTabs.addEventListener("click", (e) => {
  modalTabs.querySelectorAll("button").forEach((el) => {
    el.classList.remove("active");
  });
  const btn = e.target.closest("button");
  btn.classList.add("active");
  let tab = btn.getAttribute("data-tab");
  showActualModal(tab);
  updateUrl("method", tab);
});

// | AUTH ANIMATIONS

gsap.fromTo(
  ".shine-img",
  { opacity: 1 },
  {
    opacity: 0,
    duration: 0.5,
    ease: "none",
    yoyo: true,
    stagger: 0.3,
    repeat: -1,
  },
);

const tigerImg = gsap.utils.toArray(".modal-tiger-img");

tigerImg.forEach((img) => {
  if (img) {
    window.addEventListener("mousemove", (e) => {
      let cursorX = e.clientX;
      gsap.to(img, { x: -cursorX / 50 });
    });
  }
});

const modalCloseBtns = document.querySelectorAll(".main-modal-close-btn");

modalCloseBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = `https://${newDomain}`;
  });
});

const formOverlay = document.querySelector(".form-overlay");

if (formOverlay) {
  formOverlay.addEventListener("click", (e) => {
    if (!e.target.closest(".modal-content")) {
      window.location.href = `https://${newDomain}`;
    }
  });
}
