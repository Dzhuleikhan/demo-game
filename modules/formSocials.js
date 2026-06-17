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

// | EMAIL-GUARD (Zeruh) — подключение сниппета проверки email
// Бэк-прокси (/api/email/verify) и сам файл уже раздаются nginx-ом на всех доменах.
// Disposable / undeliverable / typo-коррекцию теперь делает Zeruh (локальный
// disposableEmail.js здесь больше не используется). Принцип fail-open: любая
// поломка не блокирует отправку формы.
(function loadEmailGuard() {
  if (window.EmailGuard || document.querySelector('script[src*="email-guard"]')) {
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

// | SHOWING BONUS BASED ON PARAMS

const bonusSumAndWager = [
  { currency: "EUR", amount: 10 },
  { currency: "USD", amount: 10 },
  { currency: "CAD", amount: 15 },
  { currency: "NZD", amount: 20 },
  { currency: "AUD", amount: 15 },
  { currency: "ARS", amount: 14000 },
  { currency: "COP", amount: 36800 },
  { currency: "CLP", amount: 10000 },
  { currency: "MXN", amount: 200 },
  { currency: "BRL", amount: 60 },
  { currency: "TRY", amount: 450 },
  { currency: "INR", amount: 950 },
  { currency: "AZN", amount: 20 },
  { currency: "UZS", amount: 121800 },
  { currency: "IDR", amount: 169500 },
  { currency: "UAH", amount: 450 },
  { currency: "BDT", amount: 1300 },
  { currency: "KGS", amount: 900 },
  { currency: "KZT", amount: 4850 },
  { currency: "HUF", amount: 3500 },
  { currency: "DKK", amount: 70 },
  { currency: "CHF", amount: 10 },
  { currency: "NOK", amount: 100 },
  { currency: "PLN", amount: 50 },
  { currency: "RON", amount: 50 },
  { currency: "CZK", amount: 200 },
  { currency: "ZAR", amount: 200 },
  { currency: "XOF", amount: 6000 },
  { currency: "XAF", amount: 5700 },
  { currency: "GHS", amount: 100 },
  { currency: "EGP", amount: 550 },
  { currency: "ZMW", amount: 200 },
  { currency: "KES", amount: 1500 },
  { currency: "MAD", amount: 100 },
  { currency: "NGN", amount: 15000 },
  { currency: "RWF", amount: 15000 },
  { currency: "TZS", amount: 25000 },
  { currency: "UGX", amount: 40000 },
  { currency: "SLL", amount: 250 },
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

      // Почта валидна только если синтаксис ок И Zeruh подтвердил (isValid).
      // Если сниппет не загрузился — fail-open (валидация по regex как раньше).
      function computeEmailValid() {
        const v = emalInput.value.trim();
        if (!emailRegEx.test(v)) return false;
        if (window.EmailGuard && typeof window.EmailGuard.isValid === "function") {
          return window.EmailGuard.isValid(emalInput);
        }
        return true;
      }

      const egIsPending = () =>
        window.EmailGuard &&
        typeof window.EmailGuard.isPending === "function" &&
        window.EmailGuard.isPending(emalInput);

      // Синхронизируем «родную» красную иконку с вердиктом Zeruh.
      function syncEmailErrorIcon() {
        const st = emalInput.getAttribute("data-eg-state");
        if (st === "blocked" || st === "invalid") {
          formGroupEmail.classList.add("not-valid");
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
        } else {
          formGroupEmail.classList.remove("not-valid");
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
        }
      }

      emalInput.addEventListener("focusout", () => {
        if (emalInput.value.trim() === "") {
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          formGroupEmail.classList.remove("not-valid");
          hideEmailSpinner();
          isEmailValid = false;
        } else if (emailRegEx.test(emalInput.value.trim())) {
          // Синтаксис ок — вердикт по живости даст Zeruh асинхронно.
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          formGroupEmail.classList.remove("not-valid");
          isEmailValid = computeEmailValid();
          // Почта ушла на проверку в Zeruh — крутим спиннер.
          if (egIsPending()) showEmailSpinner();
        } else {
          formGroupEmail.classList.add("not-valid");
          formGroupEmail
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
          hideEmailSpinner();
          isEmailValid = false;
        }

        updateNextButtonState();
      });

      emalInput.addEventListener("input", () => {
        // Правка поля — активной проверки нет, перезапустится на blur.
        isEmailValid = computeEmailValid();
        hideEmailSpinner();
        updateNextButtonState();
      });

      // Асинхронный вердикт Zeruh → пересчёт кнопки + синхронизация UI/спиннера.
      // !isPending: не гасим спиннер на промежуточном setState("ok"/"suggest")
      // ДО ответа Zeruh.
      emalInput.addEventListener("emailguard:result", () => {
        isEmailValid = computeEmailValid();
        syncEmailErrorIcon();
        if (!egIsPending()) hideEmailSpinner();
        updateNextButtonState();
      });

      // Phone validation
      const formGroupPhone = formStep1.querySelector(
        ".socials-form-group-phone",
      );
      const phoneInput = formGroupPhone.querySelector(".phone-input");

      function validatePhoneNumber() {
        if (phoneInput.value === "") {
          formGroupPhone.classList.remove("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          isPhoneValid = false;
        } else if (!phoneInput.value.trim()) {
          formGroupPhone.classList.add("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
          isPhoneValid = false;
        } else if (socialsIti.isValidNumber()) {
          formGroupPhone.classList.remove("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.add("hidden");
          isPhoneValid = true;
        } else {
          formGroupPhone.classList.add("not-valid");
          formGroupPhone
            .querySelector(".not-valid-icon")
            .classList.remove("hidden");
          isPhoneValid = false;
        }

        updateNextButtonState();
      }

      // Validating Phone input
      phoneInput.addEventListener("focusout", validatePhoneNumber);
      phoneInput.addEventListener("input", validatePhoneNumber);

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
