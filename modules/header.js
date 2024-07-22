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

if (headerLangList) {
  headerLangList.addEventListener("pointerleave", () => {
    headerLangList.classList.remove("is-open");
  });
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

const pull = document.querySelector(".slide-down");

// var hammertime = new Hammer(pull);
// hammertime.on("pandown", function (ev) {
//   console.log(ev);
// });
