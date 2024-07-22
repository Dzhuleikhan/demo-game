const headerLangBtn = document.querySelector(".header-lang-btn");
const headerLangList = document.querySelector(".header-lang-list");
const mobileLangList = document.querySelector(".language-mobile-list");
const languageLinks = document.querySelectorAll(".language-link");
const burgerBtn = document.querySelectorAll(".burger");
const sideMenu = document.querySelector(".sidemenu");
const menuOverlay = document.querySelector(".menu-overlay");
const langMenuOverlay = document.querySelector(".language-overlay");

let isMobile = window.innerWidth < 768;

if (sideMenu) {
  if (window.innerWidth >= 576) {
    sideMenu.classList.add("is-open");
  }

  if (sideMenu.classList.contains("is-open")) {
    menuOverlay.classList.add("is-visible");
  }
}

if (headerLangBtn) {
  headerLangBtn.addEventListener("click", () => {
    if (window.innerWidth > 768) {
      headerLangList.classList.toggle("is-open");
    } else {
      langMenuOverlay.classList.add("is-open");
      mobileLangList.style.bottom = 0;
      document.body.classList.add("scroll-lock");
    }
  });
}

function hideMobileLanguageMenu() {
  langMenuOverlay.classList.remove("is-open");
  mobileLangList.style.bottom = "-100%";
  document.body.classList.remove("scroll-lock");
}

if (langMenuOverlay) {
  langMenuOverlay.addEventListener("click", (e) => {
    if (e.target === langMenuOverlay) {
      hideMobileLanguageMenu();
    }
  });
}
if (window.innerWidth > 768) {
  if (headerLangList) {
    headerLangList.addEventListener("pointerleave", () => {
      headerLangList.classList.remove("is-open");
    });
  }
}

languageLinks.forEach((link) => {
  if (link) {
    link.addEventListener("click", () => {
      if (isMobile) {
        hideMobileLanguageMenu();
      } else {
        headerLangList.classList.remove("is-open");
      }
    });
  }
});

burgerBtn.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      sideMenu.classList.toggle("is-open");
      document.body.classList.toggle("scroll-lock");
      if (sideMenu.classList.contains("is-open")) {
        menuOverlay.classList.add("is-visible");
      } else {
        menuOverlay.classList.remove("is-visible");
      }
    });
  }
});

var pull = document.querySelectorAll(".pulldown");

pull.forEach((pull) => {
  if (pull) {
    if (isMobile) {
      let touchstartY = 0;
      pull.addEventListener("touchstart", (e) => {
        touchstartY = e.touches[0].clientY;
      });
      pull.addEventListener("touchmove", (e) => {
        const touchY = e.touches[0].clientY;
        const touchDiff = touchY - touchstartY;
        mobileLangList.style.bottom = -touchDiff + "px";
        if (touchDiff > 30) {
          pull.classList.add("pulled");
          e.preventDefault();
        }
      });
      document.addEventListener("touchend", (e) => {
        if (pull.classList.contains("pulled")) {
          pull.classList.remove("pulled");
          hideMobileLanguageMenu();
        }
      });
    }
  }
});
