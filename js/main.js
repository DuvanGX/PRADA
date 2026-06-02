const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const currentYear = document.querySelector("#currentYear");
const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const parallaxSections = document.querySelectorAll("[data-parallax]");
const albums = document.querySelectorAll(".album-card");
const prevButton = document.querySelector(".carousel-btn.prev");
const nextButton = document.querySelector(".carousel-btn.next");

let activeAlbum = 0;
let countersPlayed = false;
let ticking = false;

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const closeMenu = () => {
  menuButton?.classList.remove("is-active");
  navMenu?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
};

menuButton?.addEventListener("click", () => {
  const isOpen = navMenu?.classList.toggle("is-open");
  menuButton.classList.toggle("is-active", Boolean(isOpen));
  menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const formatNumber = (value) => new Intl.NumberFormat("es-CO", {
  notation: value >= 1000000 ? "compact" : "standard",
  maximumFractionDigits: value >= 1000000 ? 1 : 0
}).format(value);

const animateCounter = (counter) => {
  const target = Number(counter.dataset.counter || 0);
  const duration = 1800;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = formatNumber(Math.floor(target * eased));

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counter.textContent = formatNumber(target);
    }
  };

  requestAnimationFrame(step);
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16, rootMargin: "0px 0px -40px" });

reveals.forEach((element) => revealObserver.observe(element));

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !countersPlayed) {
      countersPlayed = true;
      counters.forEach(animateCounter);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.35 });

const statsGrid = document.querySelector(".stats-grid");
if (statsGrid) {
  statsObserver.observe(statsGrid);
}

const updateParallax = () => {
  const viewportHeight = window.innerHeight;

  parallaxSections.forEach((section) => {
    const layer = section.querySelector(".bg-layer");
    if (!layer) return;

    const rect = section.getBoundingClientRect();
    const speed = Number(section.dataset.speed || 0.08);
    const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
    layer.style.transform = `translate3d(0, ${centerOffset * -speed}px, 0) scale(1.08)`;
  });
};

const onScroll = () => {
  updateHeader();

  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
    ticking = true;
  }
};

const showAlbum = (index) => {
  albums.forEach((album, albumIndex) => {
    album.classList.toggle("active", albumIndex === index);
  });
};

prevButton?.addEventListener("click", () => {
  activeAlbum = (activeAlbum - 1 + albums.length) % albums.length;
  showAlbum(activeAlbum);
});

nextButton?.addEventListener("click", () => {
  activeAlbum = (activeAlbum + 1) % albums.length;
  showAlbum(activeAlbum);
});

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateParallax);
window.addEventListener("load", () => {
  document.body.classList.add("is-loaded");
  updateHeader();
  updateParallax();
});
