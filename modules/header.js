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

var myElement = document.querySelector(".slide-down");

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(myElement);

// let the pan gesture support all directions.
// this will block the vertical scrolling on a touch-device while on the element
mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });

// listen to events...
mc.on("pandown", function () {
  headerLangList.classList.remove("is-open");
});
