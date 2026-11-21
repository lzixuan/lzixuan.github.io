(function () {
  "use strict";

  const root = document.documentElement;
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // 1. Theme Toggle (Light / Dark)
  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);
    });
  }

  // 2. Mobile Navigation Toggle
  const menuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Publication Category Filtering
  const filterBtns = document.querySelectorAll(".filter-btn");
  const pubCards = document.querySelectorAll(".pub-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });

      pubCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });

  // 4. BibTeX Toggle & Copy
  document.querySelectorAll("[data-bibtex-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-bibtex-toggle");
      const box = document.getElementById(targetId);
      if (!box) return;
      const isOpen = box.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });

  async function copyText(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast(successMsg);
    } catch {
      showToast("Copy failed — please copy manually.");
    }
  }

  document.querySelectorAll("[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = document.getElementById(btn.getAttribute("data-copy-target"));
      if (el) copyText(el.textContent.trim(), "BibTeX copied to clipboard");
    });
  });

  document.querySelectorAll("[data-copy-text]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy-text");
      if (text) copyText(text, `Copied: ${text}`);
    });
  });

  // 5. Poster Lightbox Modal
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxOpenOriginal = document.getElementById("lightbox-original");
  const lightboxClose = document.getElementById("lightbox-close");

  function openLightbox(src, title) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = title || "Research Poster";
    if (lightboxCaption) lightboxCaption.textContent = title || "Research Poster";
    if (lightboxOpenOriginal) lightboxOpenOriginal.href = src;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-poster-src]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(
        trigger.getAttribute("data-poster-src"),
        trigger.getAttribute("data-poster-title")
      );
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });
})();
