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

// let TL = gsap.timeline();

// TL.fromTo(
//   ".shine-img",
//   { opacity: 1 },
//   {
//     opacity: 0,
//     duration: 0.05,
//     ease: "none",
//     yoyo: true,
//     stagger: 0.3,
//     repeat: -1,
//   },
// );
