const headerLangBtn = document.querySelector(".header-lang-btn");
const headerLangList = document.querySelector(".header-lang-list");
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

if (headerLangBtn) {
  headerLangBtn.addEventListener("click", () => {
    if (window.innerWidth < 768) {
      menuOverlay.classList.toggle("is-visible");
    }
    headerLangList.classList.toggle("is-open");
  });
}
if (window.innerWidth > 768) {
  if (headerLangList) {
    headerLangList.addEventListener("pointerleave", () => {
      headerLangList.classList.remove("is-open");
    });
  }
}

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

var pull = document.querySelector(".slide-down");

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
    headerLangList.style.bottom = 0;
  } else {
    headerLangList.style.bottom = 0;
  }
});
