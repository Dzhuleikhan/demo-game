import gsap from "gsap";
import { overlay } from "./game";

/**
 * Animations
 */
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

window.addEventListener("mousemove", (e) => {
  let cursorX = e.clientX;
  gsap.to(modalTigerImg, { x: -cursorX / 50 });
});

/**
 * Showing main modal window
 */
const firstModalRegBtn = document.querySelector(".reg-target-btn");
const mainOverlay = document.querySelector(".main-overlay");
const modalTigerImg = document.querySelector(".modal-tiger-img");

firstModalRegBtn.addEventListener("click", () => {
  localStorage.removeItem("modal");
  localStorage.setItem("mainModal", "open");
  overlay.classList.remove("is-open");
  mainOverlay.classList.add("is-open");
});

if (localStorage.mainModal) {
  mainOverlay.classList.add("is-open");
} else {
  mainOverlay.classList.remove("is-open");
}

/**
 * Tabs changing
 */
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
});

/**
 *  Currency dropdown
 */

const formCurrency = document.querySelectorAll(".form-currency");

formCurrency.forEach((cur) => {
  if (cur) {
    const currencyDropdownBtn = cur.querySelector(".form-currency-btn");
    const currencyDropdownList = cur.querySelector(".form-currency-dropdown");
    const currencyInput = cur.querySelector(".currency-input");

    function hideDropdown() {
      currencyDropdownBtn.classList.remove("active");
      currencyDropdownList.classList.remove("active");
    }

    currencyDropdownBtn.addEventListener("click", () => {
      currencyDropdownBtn.classList.toggle("active");
      currencyDropdownList.classList.toggle("active");
    });

    const currencyListItems = currencyDropdownList.querySelectorAll("li");

    currencyListItems.forEach((item) => {
      item.addEventListener("click", () => {
        currencyListItems.forEach((el) => {
          el.classList.remove("active");
        });
        item.classList.add("active");
        hideDropdown();

        // Taking currency value from item
        let curIcon = item.querySelector(".currency-item-icon").src;
        let curName = item.querySelector(".currency-item-name").textContent;
        let curSymbol = item.querySelector(".currency-item-symbol").textContent;
        let curAbbr = item.querySelector(".currency-item-abbr").textContent;

        currencyDropdownBtn.querySelector(".main-currency-icon").src = curIcon;
        currencyDropdownBtn.querySelector(".main-currency-name").textContent =
          curName;
        currencyInput.value = curAbbr;
      });
    });

    document.addEventListener("click", (event) => {
      if (!cur.contains(event.target)) {
        hideDropdown();
      }
    });
  }
});

/**
 *  Currency dropdown
 */

const formBonus = document.querySelectorAll(".form-bonus");

formBonus.forEach((bonus) => {
  if (bonus) {
    const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
    const bonusDropdownList = bonus.querySelector(".form-bonus-dropdown");
    const bonusInput = bonus.querySelector(".bonus-input");

    function hideDropdown() {
      bonusDropdownBtn.classList.remove("active");
      bonusDropdownList.classList.remove("active");
    }

    bonusDropdownBtn.addEventListener("click", () => {
      bonusDropdownBtn.classList.toggle("active");
      bonusDropdownList.classList.toggle("active");
    });

    const bonusListItems = bonusDropdownList.querySelectorAll("li");

    bonusListItems.forEach((item) => {
      item.addEventListener("click", () => {
        bonusListItems.forEach((el) => {
          el.classList.remove("active");
        });
        item.classList.add("active");
        hideDropdown();

        // Taking currency value from item
        let bonusIcon = item.querySelector(".bonus-item-icon").src;
        let bonusName = item.querySelector(".bonus-item-name").textContent;

        bonusDropdownBtn.querySelector(".main-bonus-icon").src = bonusIcon;
        bonusDropdownBtn.querySelector(".main-bonus-name").textContent =
          bonusName;
      });
    });

    document.addEventListener("click", (event) => {
      if (!bonus.contains(event.target)) {
        hideDropdown();
      }
    });

    // Promocode
    const promocodeBtn = document.querySelector(".promocode-btn");
    const promocodeBox = document.querySelector(".promocode-input-box");

    if (promocodeBtn) {
      promocodeBtn.addEventListener("click", () => {
        promocodeBtn.classList.add("hidden");
        promocodeBox.classList.remove("hidden");
        promocodeBox.classList.add("grid");
      });
    }
  }
});