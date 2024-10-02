import gsap from "gsap";

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

const tigerImg = gsap.utils.toArray(".modal-tiger-img");

tigerImg.forEach((img) => {
  if (img) {
    window.addEventListener("mousemove", (e) => {
      let cursorX = e.clientX;
      gsap.to(img, { x: -cursorX / 50 });
    });
  }
});
