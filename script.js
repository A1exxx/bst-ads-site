/* ============================================================
   BST PHUKET — interactivity + i18n (EN / RU)
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var I18N = window.BST_I18N || { en: {} };

  /* ============================================================
     FORM DELIVERY — where contact-form leads are sent.
     Leave both fields empty  → demo mode (logs to console, shows success).
     To receive leads in Telegram:
       1. In Telegram open @BotFather → /newbot → copy the token.
       2. Message your new bot once, then open
          https://api.telegram.org/bot<TOKEN>/getUpdates  to find your chat id
          (or add the bot to a group and use the group id).
       3. Paste both values below.
     Note: the token becomes visible in page source. For a small business
     that is usually fine; for stricter security send the form to a small
     serverless function instead.
     ============================================================ */
  var FORM_CONFIG = {
    telegramBotToken: "",
    telegramChatId: ""
  };

  /* ---------- THEME TOGGLE (light / dark, persisted) ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var storedTheme = localStorage.getItem("bst-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    root.setAttribute("data-theme", storedTheme);
  }
  function syncThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", root.getAttribute("data-theme") === "light" ? "#FBFBF7" : "#0E0E11");
  }
  syncThemeColor();
  themeToggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bst-theme", next);
    syncThemeColor();
  });

  /* ---------- LANGUAGE (i18n) ---------- */
  var currentLang = localStorage.getItem("bst-lang");
  if (!I18N[currentLang]) currentLang = "en";

  function fillYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function buildMarquee(dict) {
    var track = document.getElementById("marqueeTrack");
    if (!track) return;
    var items = dict.marquee || [];
    track.innerHTML = "";
    // Render the list twice for a seamless -50% loop.
    for (var pass = 0; pass < 2; pass++) {
      items.forEach(function (text) {
        var span = document.createElement("span");
        span.textContent = text;
        var dot = document.createElement("span");
        dot.className = "m-dot";
        dot.textContent = "●";
        track.appendChild(span);
        track.appendChild(dot);
      });
    }
  }

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.en;
    currentLang = lang;
    localStorage.setItem("bst-lang", lang);
    root.setAttribute("lang", lang);

    // Text content (or a target attribute when data-i18n-attr is set)
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = dict[key];
      if (val == null) return;
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });

    // Rich text (innerHTML — keeps inline markup like <br> / <span> / <a>)
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    // Placeholders
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
    });

    if (dict["meta.title"]) document.title = dict["meta.title"];

    buildMarquee(dict);
    fillYear(); // footer.rights innerHTML was just rebuilt — refill the year span

    // Reflect active state on every language switch control
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
    });
  });

  applyLang(currentLang);

  function t(key) {
    var dict = I18N[currentLang] || I18N.en;
    return dict[key] != null ? dict[key] : (I18N.en[key] || key);
  }

  /* ---------- STICKY HEADER SHADOW ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- MOBILE MENU ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    burger.classList.remove("open");
    mobileMenu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  }
  burger.addEventListener("click", function () {
    var open = burger.classList.toggle("open");
    mobileMenu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- HERO LIGHTBOX ROTATOR ---------- */
  var rotator = document.getElementById("adRotator");
  if (rotator) {
    var slides = rotator.querySelectorAll(".ad-slide");
    var device = document.querySelector(".ad-device");
    var idx = 0;
    function applyGlow() {
      if (!device) return;
      var g = slides[idx].getAttribute("data-glow");
      if (g) device.style.setProperty("--glow", g);
    }
    applyGlow(); // tint the lightbox to the first poster on load
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(function () {
        slides[idx].classList.remove("is-active");
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add("is-active");
        applyGlow();
      }, 3400);
    }
  }

  /* ---------- SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          setTimeout(function () { el.classList.add("in"); }, i * 70);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- FAQ — single-open accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- RENTAL CALCULATOR ---------- */
  var calcDays = document.getElementById("calcDays");
  if (calcDays) {
    var calcDaysVal = document.getElementById("calcDaysVal");
    var calcRate = document.getElementById("calcRate");
    var calcTotal = document.getElementById("calcTotal");
    var calcPlan = document.getElementById("calcPlan");
    function calcUpdate() {
      var days = parseInt(calcDays.value, 10) || 1;
      var rate, planKey;
      // Tiers: up to 30 days = Basic, 30+ = Standard, 90+ = Premium
      if (days >= 90) { rate = 300; planKey = "pricing.rent.p3.name"; }
      else if (days >= 30) { rate = 500; planKey = "pricing.rent.p2.name"; }
      else { rate = 700; planKey = "pricing.rent.p1.name"; }
      calcDaysVal.textContent = days;
      calcRate.textContent = rate + " ฿";
      calcTotal.textContent = (days * rate).toLocaleString("en-US") + " ฿";
      calcPlan.setAttribute("data-i18n", planKey);
      calcPlan.textContent = t(planKey);
    }
    calcDays.addEventListener("input", calcUpdate);
    calcUpdate();
  }

  /* ---------- CONTACT FORM ---------- */
  var form = document.getElementById("leadForm");
  var success = document.getElementById("formSuccess");
  var submitBtn = document.getElementById("submitBtn");

  function setError(input, message) {
    input.classList.toggle("invalid", !!message);
    var box = form.querySelector('.field-error[data-for="' + input.id + '"]');
    if (box) box.textContent = message || "";
  }

  function validate() {
    var ok = true;
    var name = document.getElementById("f-name");
    var phone = document.getElementById("f-phone");

    if (!name.value.trim()) { setError(name, t("form.err.name")); ok = false; }
    else { setError(name, ""); }

    var digits = phone.value.replace(/\D/g, "");
    if (digits.length < 7) { setError(phone, t("form.err.phone")); ok = false; }
    else { setError(phone, ""); }

    return ok;
  }

  ["f-name", "f-phone"].forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener("input", function () {
      if (input.classList.contains("invalid")) setError(input, "");
    });
  });

  var formError = document.getElementById("formError");

  function showSuccess() {
    success.hidden = false;
    success.setAttribute("role", "status");
  }
  function showError() {
    if (formError) formError.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = t("form.submit");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (formError) formError.hidden = true;

    if (!validate()) {
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t("form.sending");

    var d = Object.fromEntries(new FormData(form).entries());
    var text = [
      "New request — BST Phuket",
      "",
      "Name: " + (d.name || "—"),
      "Phone: " + (d.phone || "—"),
      "Messenger: " + (d.messenger || "—"),
      "Interested in: " + (d.interest || "—"),
      "Promo code: " + (d.promo || "—")
    ].join("\n");

    // No Telegram configured yet → demo mode (see FORM_CONFIG at the top).
    if (!FORM_CONFIG.telegramBotToken || !FORM_CONFIG.telegramChatId) {
      console.log("[BST] Lead (demo — set FORM_CONFIG to deliver to Telegram):\n" + text);
      setTimeout(showSuccess, 700);
      return;
    }

    // Deliver the lead to Telegram.
    fetch("https://api.telegram.org/bot" + FORM_CONFIG.telegramBotToken + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: FORM_CONFIG.telegramChatId, text: text })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) { if (res && res.ok) { showSuccess(); } else { showError(); } })
      .catch(showError);
  });
})();
