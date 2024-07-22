const headerLangBtn = document.querySelector(".header-lang-btn");
const headerLangList = document.querySelector(".header-lang-list");
const headerLangListLinks = document.querySelectorAll(".header-lang-list li a");
const burgerBtn = document.querySelector(".burger");
const sideMenu = document.querySelector(".sidemenu");
const menuOverlay = document.querySelector(".menu-overlay");

if (sideMenu) {
  if (window.innerWidth >= 576) {
    sideMenu.classList.add("is-open");
  }

  if (sideMenu.classList.contains("is-open")) {
    menuOverlay.classList.add("is-visible");
  }
}

function closeLanguageMenu() {
  if (window.innerWidth < 768) {
    menuOverlay.classList.remove("is-visible");
    document.body.classList.remove("scroll-lock");
  }
  headerLangList.classList.remove("is-open");
}

if (headerLangBtn) {
  headerLangBtn.addEventListener("click", () => {
    if (window.innerWidth < 768) {
      menuOverlay.classList.toggle("is-visible");
      document.body.classList.toggle("scroll-lock");
    }
    headerLangList.classList.toggle("is-open");
  });
}
if (window.innerWidth > 768) {
  if (headerLangList) {
    headerLangList.addEventListener("pointerleave", () => {
      closeLanguageMenu();
    });
  }
}

headerLangListLinks.forEach((link) => {
  if (link) {
    link.addEventListener("click", () => {
      closeLanguageMenu();
    });
  }
});

if (burgerBtn) {
  burgerBtn.addEventListener("click", () => {
    sideMenu.classList.toggle("is-open");
    document.body.classList.toggle("scroll-lock");
    if (sideMenu.classList.contains("is-open")) {
      menuOverlay.classList.add("is-visible");
    } else {
      menuOverlay.classList.remove("is-visible");
    }
  });
}

var pull = document.querySelectorAll(".pulldown");

pull.forEach((pull) => {
  if (pull) {
    if (window.innerWidth < 768) {
      let touchstartY = 0;
      pull.addEventListener("touchstart", (e) => {
        touchstartY = e.touches[0].clientY;
        console.log(touchstartY);
      });
      pull.addEventListener("touchmove", (e) => {
        const touchY = e.touches[0].clientY;
        const touchDiff = touchY - touchstartY;
        headerLangList.style.bottom = -touchDiff + "px";
        if (touchDiff > 50) {
          pull.classList.add("pulled");
          e.preventDefault();
        }
      });
      document.addEventListener("touchend", (e) => {
        if (pull.classList.contains("pulled")) {
          pull.classList.remove("pulled");
          headerLangList.classList.remove("is-open");
          menuOverlay.classList.remove("is-visible");
          document.body.classList.remove("scroll-lock");
          headerLangList.style.bottom = 0;
        } else {
          headerLangList.style.bottom = 0;
        }
      });
    }
  }
});
