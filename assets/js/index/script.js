"use strict";
import {
  customDropdown,
  createFilterTab,
  getDateLightPick,
  contact,
} from "../../main/js/global.min.js";

const $ = jQuery;

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

function initParallaxSwiper(swiperEl, options = {}) {
  const interleaveOffset = 0.85;

  return new Swiper(swiperEl, {
    slidesPerView: 1,
    loop: true,
    speed: 1500,
    watchSlidesProgress: true,
    grabCursor: true,
    ...options,
    on: {
      progress(swiper) {
        swiper.slides.forEach((slide) => {
          const slideProgress = slide.progress || 0;
          const innerOffset = swiper.width * interleaveOffset;
          const innerTranslate = slideProgress * innerOffset;

          if (!isNaN(innerTranslate)) {
            const image = slide.querySelector(".image");
            if (image) {
              image.style.transform = `translate3d(${innerTranslate}px, 0, 0)`;
            }
          }
        });
      },
      touchStart(swiper) {
        swiper.slides.forEach((slide) => {
          slide.style.transition = "";
        });
      },
      setTransition(swiper, speed) {
        const easing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
        swiper.slides.forEach((slide) => {
          slide.style.transition = `${speed}ms ${easing}`;
          const image = slide.querySelector(".image");
          if (image) image.style.transition = `${speed}ms ${easing}`;
        });
      },
      ...(options.on || {}),
    },
  });
}

function initSwiper() {
  const containerSwiperEl = document.querySelector(".container-swiper");
  if (!containerSwiperEl) return;

  const swiperEl = containerSwiperEl.querySelector(".swiper-el-parallax");
  if (!swiperEl) return;

  const swiperParallax = initParallaxSwiper(swiperEl, {
    navigation: {
      nextEl: containerSwiperEl.querySelector(".swiper-button-next"),
      prevEl: containerSwiperEl.querySelector(".swiper-button-prev"),
    },
  });
}
function heroCover() {
  const cover = document.querySelector(".hero-cover");
  const hero = document.querySelector(".hero-container");
  if (!cover || !hero) return;

  let blindsCount;
  const screenWidth = window.innerWidth;

  if (screenWidth <= 767) {
    blindsCount = 25;
  } else if (screenWidth <= 1024) {
    blindsCount = 35;
  } else {
    blindsCount = 52;
  }

  const heroWidth = hero.clientWidth;
  const stripWidth = heroWidth / blindsCount;

  cover.innerHTML = "";

  for (let i = 0; i < blindsCount; i++) {
    const strip = document.createElement("div");
    strip.classList.add("blind-strip-v");
    strip.style.left = i * stripWidth - 0.5 + "px";
    strip.style.width = stripWidth + 1 + "px";
    strip.style.top = 0;
    strip.style.height = "100%";
    strip.style.background = "#B69F64"; // màu ban đầu
    strip.style.transformOrigin = "left center";
    strip.style.transform = "rotateY(-90deg)";
    strip.style.position = "absolute";
    strip.style.transformStyle = "preserve-3d";
    cover.appendChild(strip);
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 1025px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top+=10% top",
        end: "+=60%",
        scrub: true,
      },
    });

    tl.to(
      ".blind-strip-v",
      {
        backgroundColor: "#000",
        stagger: 0.005,
        ease: "power3.out",
        duration: 0.4, // đen nhanh hơn, kết thúc sớm hơn khi timeline chạy tới 40%
      },
      0,
    ).to(
      ".blind-strip-v",
      {
        rotationY: 0,
        stagger: 0.005,
        ease: "power3.out",
        duration: 1,
      },
      0,
    );

    return () => tl.kill();
  });

  mm.add("(max-width: 1024px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=50%", // rút ngắn từ 100% xuống 60%
        scrub: true,
      },
    });

    tl.to(
      ".blind-strip-v",
      {
        backgroundColor: "#000",
        stagger: 0.005,
        ease: "power3.out",
        duration: 0.4,
      },
      0,
    ).to(
      ".blind-strip-v",
      {
        rotationY: 0,
        stagger: 0.005,
        ease: "power3.out",
        duration: 1,
      },
      0,
    );

    return () => tl.kill();
  });
}

function init() {
  gsap.registerPlugin(ScrollTrigger);
  initSmoothAnchorScroll();
  contact();
  initContactQrScroll();
  customDropdown();
  createFilterTab();
  slider();
  // getDateLightPick();
}

function initSmoothAnchorScroll() {
  if (document.documentElement.dataset.anchorScrollInitialized === "true") {
    return;
  }

  document.documentElement.dataset.anchorScrollInitialized = "true";

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || !href.includes("#")) return;

    const url = new URL(href, window.location.href);
    if (
      url.origin !== window.location.origin ||
      url.pathname !== window.location.pathname ||
      url.search !== window.location.search ||
      !url.hash
    ) {
      return;
    }

    let targetId;
    try {
      targetId = decodeURIComponent(url.hash.slice(1));
    } catch {
      return;
    }

    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();

    const customOffset = Number.parseFloat(link.dataset.scrollOffset);
    const headerHeight = document.getElementById("header")?.offsetHeight || 0;
    const offset = Number.isFinite(customOffset) ? customOffset : -headerHeight;

    lenis.scrollTo(target, {
      duration: 3,
      offset,
      immediate: false,
      force: true,
    });

    if (window.location.hash !== url.hash) {
      window.history.pushState(null, "", url.hash);
    }
  });
}

function initContactQrScroll() {
  const qrWidget = document.querySelector(".contact-qr");
  if (!qrWidget || qrWidget.dataset.scrollInitialized === "true") return;

  qrWidget.dataset.scrollInitialized = "true";
  let isHidden = false;

  gsap.set(qrWidget, { x: 0, autoAlpha: 1 });

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const shouldHide = self.direction === 1 && self.scroll() > 12;
      if (shouldHide === isHidden) return;

      isHidden = shouldHide;
      gsap.to(qrWidget, {
        x: shouldHide ? 40 : 0,
        autoAlpha: shouldHide ? 0 : 1,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
  });
}

window.addEventListener("contact-qr:ready", () => {
  gsap.registerPlugin(ScrollTrigger);
  contact();
  initContactQrScroll();
  ScrollTrigger.refresh();
});

document.addEventListener("DOMContentLoaded", () => {
  init();
  initSwiper();
  heroCover();
  intro();
  // animationImage();
  animationText();
  animationBox();
  animationMake();
  headerMobile();
  animationMakeDesktop();
  footer();
});

let isLinkClicked = false;

document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (
    link?.href &&
    !link.href.startsWith("#") &&
    !link.href.startsWith("javascript:")
  ) {
    isLinkClicked = true;
  }
});

window.addEventListener("beforeunload", () => {
  if (!isLinkClicked) window.scrollTo(0, 0);
  isLinkClicked = false;
});
function headerMobile() {
  if (window.innerWidth > 768) return;
  const hamBtn = document.getElementById("ham-btn");
  const headerMenu = document.querySelector(".header-main");
  hamBtn.addEventListener("click", () => {
    hamBtn.classList.toggle("active");
    headerMenu.classList.toggle("show");
  });
  const menuSub = document.querySelectorAll("li.menu-item-has-children > a");

  console.log(menuSub);

  menuSub.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      console.log("click");

      const subMenu = this.parentElement.querySelector(".sub-menu");
      const allSubMenus = Array.from(
        document.querySelectorAll("#header .sub-menu"),
      ).filter((el) => el !== subMenu);

      allSubMenus.forEach((el) => {
        el.style.maxHeight = el.scrollHeight + "px";
        el.offsetHeight; // force reflow
        el.style.maxHeight = 0;
        el.classList.remove("open");
      });

      if (subMenu.classList.contains("open")) {
        subMenu.style.maxHeight = subMenu.scrollHeight + "px";
        subMenu.offsetHeight; // force reflow
        subMenu.style.maxHeight = 0;
        subMenu.classList.remove("open");
      } else {
        subMenu.classList.add("open");
        subMenu.style.maxHeight = subMenu.scrollHeight + "px";

        subMenu.addEventListener(
          "transitionend",
          function handler() {
            if (subMenu.classList.contains("open")) {
              subMenu.style.maxHeight = "none";
            }
            subMenu.removeEventListener("transitionend", handler);
          },
          { once: true },
        );
      }
    });
  });
}
function intro() {
  if (!document.querySelector(".intro")) return;
  if (window.innerWidth > 1024) {
    const radiusSection = document.querySelector(".intro");

    gsap.to(radiusSection, {
      borderTopLeftRadius: "100px",
      borderTopRightRadius: "100px",
      scrollTrigger: {
        trigger: radiusSection,
        start: "top 95%",
        end: "+=600",
        scrub: true,
        markers: false,
      },
    });
  }
}
function footer() {
  if (!document.querySelector("#footer")) return;
  const radiusSection = document.querySelector("#footer");

  gsap.to(radiusSection, {
    borderTopLeftRadius: "100px",
    borderTopRightRadius: "100px",
    scrollTrigger: {
      trigger: radiusSection,
      start: "top 90%",
      end: "top 75%",
      scrub: true,
      // markers: true,
    },
  });
}
// function animationImage() {
//   gsap.utils.toArray(".polygon-img-p").forEach((parent) => {
//     const container = parent.querySelector(".polygon-img");
//     if (!container) return;
//     if (parent.dataset.revealInitialized) return;
//     parent.dataset.revealInitialized = true;

//     gsap
//       .timeline({
//         scrollTrigger: {
//           trigger: parent,
//           start: "top 65%",
//           toggleActions: "play none none none",
//           once: true,
//           invalidateOnRefresh: true,
//         },
//       })
//       .fromTo(
//         container,
//         { clipPath: "polygon(0 0, 0 0, 0 0, 0 0)", scale: 1.5 },
//         {
//           clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
//           scale: 1,
//           duration: 1,
//           ease: "power1.out",
//         },
//       );
//   });
// }
function animationBox() {
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  if (isMobile) {
    document.querySelectorAll(".section-branch").forEach((section) => {
      const branchVisuals = section.querySelectorAll(
        ".section-branch__visual.polygon-box",
      );
      const branchTitles = section.querySelectorAll(
        ".section-branch__content h3",
      );
      const branchButtons = section.querySelectorAll(
        ".section-branch__content .button-global",
      );

      if (!branchVisuals.length) return;

      branchVisuals.forEach((visual) => {
        visual.dataset.revealInitialized = true;
      });

      gsap.set(branchVisuals, { autoAlpha: 0, y: 20 });
      gsap.set(branchTitles, { autoAlpha: 0, y: 30 });
      gsap.set(branchButtons, { autoAlpha: 0, y: 20 });

      const branchTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
          invalidateOnRefresh: true,
        },
      });

      branchTimeline
        .to(branchVisuals, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power1.out",
        })
        .to(branchTitles, {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(
          branchButtons,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.2",
        );
    });
  }

  gsap.utils.toArray(".polygon-box").forEach((box) => {
    if (isMobile && box.matches(".section-branch__visual")) return;
    if (box.dataset.revealInitialized) return;
    box.dataset.revealInitialized = true;

    const branchCard = box.matches(".section-branch__visual")
      ? box.closest(".section-branch__card")
      : null;
    const branchTitle = branchCard?.querySelector(
      ".section-branch__content h3",
    );
    const branchButton = branchCard?.querySelector(
      ".section-branch__content .button-global",
    );
    if (branchTitle) {
      gsap.set(branchTitle, { y: 30, autoAlpha: 0 });
    }

    if (branchButton) {
      gsap.set(branchButton, { autoAlpha: 0, y: 20 });
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: box,
        start: "top 65%",
        toggleActions: "play none none none",
        once: true,
        invalidateOnRefresh: true,
      },
    });

    timeline.fromTo(
      box,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        duration: 1,
        y: 0,
        ease: "power1.out",
      },
    );

    if (branchTitle) {
      timeline.to(branchTitle, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }

    if (branchButton) {
      timeline.to(
        branchButton,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        branchTitle ? "-=0.2" : undefined,
      );
    }
  });
}
function animationText() {
  document.fonts.ready.then(() => {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll(".el-title").forEach((headingElement) => {
      const wrapper = headingElement.parentElement;
      const logo = wrapper.querySelector(".el-logo");
      const descElement = wrapper.querySelector(".el-desc");
      const priceElement = wrapper.querySelector(".el-price");
      const button = wrapper.querySelector(".el-button");
      const fadeButtonGroup = headingElement
        .closest(".section-contact")
        ?.querySelector(".el-fade-buttons");

      gsap.set(headingElement, { y: 30, autoAlpha: 0 });

      if (descElement) {
        gsap.set(descElement, { y: 20, autoAlpha: 0 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headingElement,
          start: "top 80%",
          // markers: true,
        },
      });

      // Logo chạy đầu tiên
      if (logo) {
        tl.from(logo, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }

      tl.to(
        headingElement,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: "power2.out",
        },
        logo ? "-=0.15" : 0,
      );

      // Desc: y 20 -> 0 kèm opacity, giống button
      if (descElement) {
        tl.to(
          descElement,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3",
        );
      }

      if (priceElement) {
        tl.from(
          priceElement,
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.3",
        );
      }

      if (button) {
        tl.from(
          button,
          { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" },
          "-=0.15",
        );
      }

      if (fadeButtonGroup && !fadeButtonGroup.dataset.revealInitialized) {
        fadeButtonGroup.dataset.revealInitialized = true;
        const fadeButtons = fadeButtonGroup.querySelectorAll(".button-global");

        if (fadeButtons.length) {
          tl.to(
            fadeButtons,
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.75,
              stagger: 0.18,
              ease: "power2.out",
            },
            "+=0.12",
          );
        }
      }
    });

    // Button chạy riêng, không nằm trong timeline của heading
    gsap.utils.toArray(".el-button-v2").forEach((btn) => {
      if (btn.dataset.revealInitialized) return;
      btn.dataset.revealInitialized = true;

      gsap.from(btn, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: btn,
          start: "top 90%",
          once: true,
        },
      });
    });

    gsap.utils.toArray(".el-form").forEach((form) => {
      if (form.dataset.revealInitialized) return;
      form.dataset.revealInitialized = true;

      gsap.to(form, {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: form,
          start: "top 85%",
          once: true,
        },
      });
    });

    gsap.utils.toArray(".el-fade-buttons").forEach((group) => {
      if (group.dataset.revealInitialized) return;
      group.dataset.revealInitialized = true;

      const buttons = group.querySelectorAll(".button-global");
      if (!buttons.length) return;

      gsap.to(buttons, {
        y: 0,
        autoAlpha: 1,
        duration: 0.75,
        stagger: 0.18,
        ease: "power2.out",
        scrollTrigger: {
          trigger: group,
          start: "top 90%",
          once: true,
        },
      });
    });
  });
}
function slider() {
  document.querySelectorAll(".explore-slider").forEach((parent) => {
    const sliderEl = parent.querySelector(".slider-global");
    if (!sliderEl || sliderEl.swiper) return;

    new Swiper(sliderEl, {
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: parent.querySelector(".swiper-button-next"),
        prevEl: parent.querySelector(".swiper-button-prev"),
      },
      breakpoints: {
        768: {
          slidesPerView: 3.4,
          spaceBetween: 24,
        },
      },
    });
  });
}

// function animationMake() {
//   document.querySelectorAll(".make").forEach((section) => {
//     if (section.dataset.revealInitialized) return;
//     section.dataset.revealInitialized = true;

//     const items = section.querySelectorAll(".make-item");
//     if (!items.length) return;

//     const tl = gsap.timeline({
//       defaults: { ease: "none" },
//       scrollTrigger: {
//         trigger: section,
//         start: "top top",
//         end: () => "+=" + section.offsetHeight * 2,
//         pin: true,
//         scrub: 1,
//         invalidateOnRefresh: true,
//         // markers: true,
//       },
//     });

//     items.forEach((item, i) => {
//       tl.to(
//         item,
//         {
//           // chạy lên đến khi item ra khỏi mép trên của section
//           y: () => -(item.offsetTop + item.offsetHeight),
//           duration: 1,
//         },
//         i * 0.15, // item sau bắt đầu trễ hơn một chút
//       );
//     });
//   });
// }
// function animationMake() {
//   document.querySelectorAll(".make").forEach((section) => {
//     if (section.dataset.revealInitialized) return;
//     section.dataset.revealInitialized = true;

//     const items = section.querySelectorAll(".make-item");
//     const flowers = section.querySelectorAll(".flower-item");
//     if (!items.length) return;

//     items.forEach((item, i) => item.style.setProperty("--i", i));

//     const getMaxTravel = () =>
//       Math.max(...[...items].map((it) => it.offsetTop + it.offsetHeight));

//     const tl = gsap.timeline({
//       defaults: { ease: "none" },
//       scrollTrigger: {
//         trigger: section,
//         start: "top top",
//         end: () => "+=" + getMaxTravel(),
//         pin: true,
//         scrub: 1,
//         invalidateOnRefresh: true,
//         // markers: true,
//       },
//     });

//     tl.to(
//       items,
//       {
//         y: () => -getMaxTravel(),
//         duration: 1,
//       },
//       0,
//     );

//     const flowerScale = [1.4, 1.6, 1.3];
//     const flowerBlur = [6, 10, 4];

//     flowers.forEach((flower, i) => {
//       tl.fromTo(
//         flower,
//         {
//           scale: flowerScale[i] ?? 1.4,
//           filter: `blur(${flowerBlur[i] ?? 6}px)`,
//         },
//         {
//           scale: 1,
//           filter: "blur(0px)",
//           duration: 1,
//           transformOrigin: "50% 50%",
//         },
//         0,
//       );
//     });
//     makeMouseParallax(section, items);
//   });
// }

function animationMake() {
  if (window.innerWidth >= 992) return;
  document.querySelectorAll(".make").forEach((section) => {
    if (section.dataset.revealInitialized) return;
    section.dataset.revealInitialized = true;

    const items = section.querySelectorAll(".make-item");
    if (!items.length) return;

    const makeMain = section.querySelector(".make-main");
    const firstItem = items[0];
    const mobileMakeMedia = window.matchMedia("(max-width: 767px)");
    let isMakeMainHidden = false;

    const layoutMakeItems = () => {
      if (!mobileMakeMedia.matches) {
        items.forEach((item) => item.style.removeProperty("--make-item-top"));
        return;
      }

      const itemGap = 55;
      let nextItemTop = 48;

      items.forEach((item) => {
        item.style.setProperty("--make-item-top", `${nextItemTop}px`);
        nextItemTop += item.offsetHeight + itemGap;
      });
    };

    const updateMakeMainVisibility = () => {
      if (!makeMain) return;

      if (!mobileMakeMedia.matches) {
        if (isMakeMainHidden) {
          isMakeMainHidden = false;
          gsap.set(makeMain, {
            clearProps: "opacity,visibility,transform",
          });
        }
        return;
      }

      // Lower-third boundary: the item has travelled 1/3 into the viewport.
      const shouldHide =
        firstItem.getBoundingClientRect().top <= window.innerHeight * (2 / 3);
      if (shouldHide === isMakeMainHidden) return;

      isMakeMainHidden = shouldHide;
      gsap.to(makeMain, {
        autoAlpha: shouldHide ? 0 : 1,
        y: shouldHide ? -24 : 0,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    items.forEach((item, i) => item.style.setProperty("--i", i));
    layoutMakeItems();

    // --- Clone thêm flower ngẫu nhiên ---
    const flowerGroup = section.querySelector(".make-flower");
    const baseFlowers = flowerGroup
      ? [...flowerGroup.querySelectorAll(".flower-item")]
      : [];

    if (flowerGroup && baseFlowers.length) {
      const EXTRA_COUNT = 5; // số flower muốn thêm
      const TOTAL = baseFlowers.length + EXTRA_COUNT;

      // Vùng được phép đặt hoa, tính theo % section (chừa mép để hoa không bị cắt)
      const AREA = { xMin: 5, xMax: 95, yMin: 5, yMax: 95 };

      // Chia vùng thành lưới cols x rows sao cho đủ ô cho TOTAL bông
      const cols = Math.ceil(Math.sqrt(TOTAL));
      const rows = Math.ceil(TOTAL / cols);

      const cellW = (AREA.xMax - AREA.xMin) / cols;
      const cellH = (AREA.yMax - AREA.yMin) / rows;

      // Tạo danh sách toạ độ tâm từng ô, rồi xáo trộn để vị trí không theo hàng lối cứng
      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: AREA.xMin + cellW * (c + 0.5),
            y: AREA.yMin + cellH * (r + 0.5),
          });
        }
      }
      gsap.utils.shuffle(cells);

      const randBetween = (min, max) => Math.random() * (max - min) + min;

      // Jitter nhẹ trong ô để không bị đều tăm tắp như lưới, nhưng vẫn không chạm ô kế bên
      const jitterX = cellW * 0.3;
      const jitterY = cellH * 0.3;

      const getSpot = (cell) => ({
        x: cell.x + randBetween(-jitterX, jitterX),
        y: cell.y + randBetween(-jitterY, jitterY),
      });

      // Gán vị trí + kích thước ngẫu nhiên cho flower gốc trước (mỗi bông 1 ô riêng)
      baseFlowers.forEach((f, i) => {
        const spot = getSpot(cells[i]);
        f.style.setProperty("--fx", spot.x + "%");
        f.style.setProperty("--fy", spot.y + "%");
        f.style.setProperty("--fscale", gsap.utils.random(0.7, 1.3).toFixed(2));
      });

      for (let i = 0; i < EXTRA_COUNT; i++) {
        // clone ngẫu nhiên từ 1 trong các flower gốc (đổi ảnh)
        const source =
          baseFlowers[Math.floor(Math.random() * baseFlowers.length)];
        const clone = source.cloneNode(true);

        const spot = getSpot(cells[baseFlowers.length + i]);
        clone.style.setProperty("--fx", spot.x + "%");
        clone.style.setProperty("--fy", spot.y + "%");
        clone.style.setProperty(
          "--fscale",
          gsap.utils.random(0.7, 1.3).toFixed(2),
        );

        flowerGroup.appendChild(clone);
      }
    }

    const flowers = section.querySelectorAll(".flower-item"); // full list, gồm cả clone

    const getMaxTravel = () => {
      layoutMakeItems();
      const lastItem = items[items.length - 1];

      if (mobileMakeMedia.matches) {
        const mobileEndGap = 80;
        const finalItemTop = Math.max(
          0,
          window.innerHeight - lastItem.offsetHeight - mobileEndGap,
        );

        return Math.max(0, lastItem.offsetTop - finalItemTop);
      }

      return Math.max(
        ...[...items].map((item) => item.offsetTop + item.offsetHeight),
      );
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + getMaxTravel(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: updateMakeMainVisibility,
        onRefresh: () => {
          layoutMakeItems();
          updateMakeMainVisibility();
        },
        // markers: true,
      },
    });

    // Các item chạy lên
    tl.to(
      items,
      {
        y: () => -getMaxTravel(),
        duration: 1,
      },
      0,
    );

    // Flower lần lượt hiện, xen kẽ ngẫu nhiên kiểu blur / zoom
    const flowerList = [...flowers]; // giữ nguyên thứ tự DOM: gốc trước, clone sau
    // const flowerList = gsap.utils.shuffle([...flowers]); // dùng dòng này nếu muốn random luôn thứ tự xuất hiện

    // Chỉ bông đầu tiên hiện sẵn, các bông còn lại ẩn cho đến lượt của nó
    flowerList.forEach((flower, i) => {
      gsap.set(flower, { autoAlpha: i === 0 ? 1 : 0 });
    });

    // Timeline riêng cho phần flower, chạy suốt từ đầu đến cuối quãng scroll
    const remaining = flowerList.slice(1); // bỏ bông đầu ra, nó không cần animate hiện/ẩn

    remaining.forEach((flower, i) => {
      const isBlurType = Math.random() < 0.5; // 50% blur, 50% zoom
      const duration = gsap.utils.random(0.25, 0.4);
      const startAt =
        remaining.length === 1
          ? 1 - duration
          : (i / (remaining.length - 1)) * (1 - duration);

      if (isBlurType) {
        // Nhóm blur: từ ẩn + mờ → hiện + nét, scale giữ nguyên
        const blurFrom = gsap.utils.random(4, 12);

        tl.fromTo(
          flower,
          { autoAlpha: 0, scale: 1, filter: `blur(${blurFrom}px)` },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration },
          startAt,
        );
      } else {
        // Nhóm zoom: từ ẩn + to → hiện + về đúng size, không blur
        const scaleFrom = gsap.utils.random(1.3, 1.8);

        tl.fromTo(
          flower,
          { autoAlpha: 0, scale: scaleFrom, filter: "blur(0px)" },
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration,
            transformOrigin: "50% 50%",
          },
          startAt,
        );
      }
    });

    makeMouseParallax(section, items);
  });
}

function animationMakeDesktop() {
  if (window.innerWidth < 992) return;
  document.querySelectorAll(".make").forEach((section) => {
    if (section.dataset.revealInitialized) return;
    section.dataset.revealInitialized = true;

    const items = section.querySelectorAll(".make-item");
    if (!items.length) return;

    items.forEach((item, i) => item.style.setProperty("--i", i));

    // --- Clone thêm flower ngẫu nhiên ---
    const flowerGroup = section.querySelector(".make-flower");
    const baseFlowers = flowerGroup
      ? [...flowerGroup.querySelectorAll(".flower-item")]
      : [];

    if (flowerGroup && baseFlowers.length) {
      const EXTRA_COUNT = 5;
      const TOTAL = baseFlowers.length + EXTRA_COUNT;

      const AREA = { xMin: 5, xMax: 95, yMin: 5, yMax: 95 };

      const cols = Math.ceil(Math.sqrt(TOTAL));
      const rows = Math.ceil(TOTAL / cols);

      const cellW = (AREA.xMax - AREA.xMin) / cols;
      const cellH = (AREA.yMax - AREA.yMin) / rows;

      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: AREA.xMin + cellW * (c + 0.5),
            y: AREA.yMin + cellH * (r + 0.5),
          });
        }
      }
      gsap.utils.shuffle(cells);

      const randBetween = (min, max) => Math.random() * (max - min) + min;

      const jitterX = cellW * 0.3;
      const jitterY = cellH * 0.3;

      const getSpot = (cell) => ({
        x: cell.x + randBetween(-jitterX, jitterX),
        y: cell.y + randBetween(-jitterY, jitterY),
      });

      baseFlowers.forEach((f, i) => {
        const spot = getSpot(cells[i]);
        f.style.setProperty("--fx", spot.x + "%");
        f.style.setProperty("--fy", spot.y + "%");
        f.style.setProperty("--fscale", gsap.utils.random(0.7, 1.3).toFixed(2));
      });

      for (let i = 0; i < EXTRA_COUNT; i++) {
        const source =
          baseFlowers[Math.floor(Math.random() * baseFlowers.length)];
        const clone = source.cloneNode(true);

        const spot = getSpot(cells[baseFlowers.length + i]);
        clone.style.setProperty("--fx", spot.x + "%");
        clone.style.setProperty("--fy", spot.y + "%");
        clone.style.setProperty(
          "--fscale",
          gsap.utils.random(0.7, 1.3).toFixed(2),
        );

        flowerGroup.appendChild(clone);
      }
    }

    const flowers = section.querySelectorAll(".flower-item");
    gsap.set(flowers, { autoAlpha: 1 });
  });
}
function makeMouseParallax(section, items) {
  const mm = gsap.matchMedia();

  mm.add(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    () => {
      const maxMove = 4;
      const depths = [...items].map((_, i) => 0.6 + (i % 3) * 0.4);

      const setters = [...items].map((item) => ({
        x: gsap.quickTo(item, "xPercent", {
          duration: 0.8,
          ease: "power3.out",
        }),
        y: gsap.quickTo(item, "yPercent", {
          duration: 0.8,
          ease: "power3.out",
        }),
      }));

      const onMove = (e) => {
        const rect = section.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 → 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5;

        setters.forEach((s, i) => {
          s.x(-nx * 2 * maxMove * depths[i]);
          s.y(-ny * 2 * maxMove * depths[i]);
        });
      };

      const onLeave = () =>
        setters.forEach((s) => {
          s.x(0);
          s.y(0);
        });

      section.addEventListener("mousemove", onMove);
      section.addEventListener("mouseleave", onLeave);

      return () => {
        section.removeEventListener("mousemove", onMove);
        section.removeEventListener("mouseleave", onLeave);
        gsap.set(items, { xPercent: 0, yPercent: 0 });
      };
    },
  );
}
