/* ===========================================================
   ACCOUNT LOGIN PAGE — DEMO MOCK
   Front-end simulation only.
   - Credentials are compared locally in the browser.
   - Nothing is sent anywhere: no fetch, no XHR, no beacons.
   =========================================================== */
(function () {
  "use strict";

  /* ---------- the ONLY credentials accepted by this mock ---------- */
  var DEMO_USER = "genesispro";
  var DEMO_PASS = "s=uW!3D62026";
  var DEMO_OTP  = "123456";

  /* ---------- element handles ---------- */
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var views = {
    login: $("#view-login"),
    geo:   $("#view-geo"),
    ok:    $("#view-ok"),
    unavailable: $("#view-unavailable")
  };

  var lastView = "login";

  var loginForm  = $("#loginForm");
  var otpForm    = $("#otpForm");
  var usernameEl = $("#username");
  var passwordEl = $("#password");
  var alertBox   = $("#formAlert");
  var loginBtn   = $("#loginBtn");
  var otpBtn     = $("#otpBtn");

  /* ===========================================================
     VIEW SWITCHING
     =========================================================== */
  function showView(name) {
    if (name !== "unavailable" && views[name]) lastView = name;
    Object.keys(views).forEach(function (k) {
      views[k].classList.toggle("is-hidden", k !== name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ===========================================================
     LINKS / BUTTONS  -> open the small "not available" page
     Every clickable link on the page reacts the same way.
     =========================================================== */
  document.addEventListener("click", function (e) {
    var link = e.target.closest("a");
    var demo = e.target.closest("[data-demo]");
    if (!link && !demo) return;
    e.preventDefault();
    showView("unavailable");
  });

  /* ===========================================================
     TABS  (password / one-time code)
     =========================================================== */
  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$(".tab").forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      var name = tab.getAttribute("data-tab");
      $$(".tabpane").forEach(function (p) {
        p.classList.toggle("is-hidden", p.getAttribute("data-pane") !== name);
      });
      hideAlert();
    });
  });

  /* ===========================================================
     PASSWORD SHOW / HIDE
     =========================================================== */
  var pwToggle = $("#pwToggle");
  pwToggle.addEventListener("click", function () {
    var isHidden = passwordEl.type === "password";
    passwordEl.type = isHidden ? "text" : "password";
    pwToggle.classList.toggle("is-on", isHidden);
    pwToggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    passwordEl.focus();
  });

  /* ===========================================================
     VALIDATION HELPERS
     =========================================================== */
  function setFieldError(input, errEl, msg) {
    if (msg) {
      input.classList.add("has-error");
      errEl.textContent = msg;
      errEl.hidden = false;
    } else {
      input.classList.remove("has-error");
      errEl.textContent = "";
      errEl.hidden = true;
    }
  }

  function showAlert(msg, ok) {
    alertBox.textContent = msg;
    alertBox.classList.toggle("is-ok", !!ok);
    alertBox.hidden = false;
  }

  function hideAlert() {
    alertBox.hidden = true;
    alertBox.textContent = "";
  }

  function loading(btn, on) {
    btn.classList.toggle("is-loading", on);
    btn.disabled = on;
  }

  /* ===========================================================
     GEO SCREEN
     No location / IP / reference data is generated or shown:
     the screen only states that the service is unavailable.
     =========================================================== */
  function fillGeoMeta() {
    /* intentionally empty — no fake detection data */
  }

  /* ===========================================================
     LOGIN  (password)
     =========================================================== */
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideAlert();

    var u = usernameEl.value.trim();
    var p = passwordEl.value;
    var uOk = true, pOk = true;

    if (!u) { setFieldError(usernameEl, $("#err-username"), "Please enter your username."); uOk = false; }
    else { setFieldError(usernameEl, $("#err-username"), ""); }

    if (!p) { setFieldError(passwordEl, $("#err-password"), "Please enter your password."); pOk = false; }
    else { setFieldError(passwordEl, $("#err-password"), ""); }

    if (!uOk || !pOk) return;

    loading(loginBtn, true);

    // small artificial delay so the loading state is visible
    setTimeout(function () {
      loading(loginBtn, false);

      var userMatch = (u.toLowerCase() === DEMO_USER);
      var passMatch = (p === DEMO_PASS);

      if (!userMatch || !passMatch) {
        showAlert("Invalid username or password.");
        setFieldError(usernameEl, $("#err-username"), userMatch ? "" : "Unknown username.");
        setFieldError(passwordEl, $("#err-password"), userMatch ? "Incorrect password." : "");
        passwordEl.select();
        return;
      }

      // credentials accepted -> remember the username if asked
      if ($("#remember").checked) {
        try { localStorage.setItem("mock_user", u); } catch (err) {}
      } else {
        try { localStorage.removeItem("mock_user"); } catch (err) {}
      }

      // account accepted -> geo restriction screen
      fillGeoMeta();
      showView("geo");
    }, 650);
  });

  /* ===========================================================
     LOGIN  (one-time code)
     =========================================================== */
  otpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var u = $("#otpUser").value.trim();
    var c = $("#otpCode").value.trim();
    var err = $("#err-otp");

    if (u.toLowerCase() !== DEMO_USER) {
      err.textContent = "Invalid username or one-time code.";
      err.hidden = false;
      return;
    }
    if (c !== DEMO_OTP) {
      err.textContent = "Invalid username or one-time code.";
      err.hidden = false;
      return;
    }
    err.hidden = true;
    loading(otpBtn, true);
    setTimeout(function () {
      loading(otpBtn, false);
      fillGeoMeta();
      showView("geo");
    }, 600);
  });

  /* ===========================================================
     GEO VIEW BUTTONS
     =========================================================== */
  $("#geoBack").addEventListener("click", function () {
    showView("login");
    passwordEl.value = "";
    passwordEl.focus();
  });

  $("#okBack").addEventListener("click", function () {
    usernameEl.value = "";
    passwordEl.value = "";
    showView("login");
    usernameEl.focus();
  });

  $("#unavailBack").addEventListener("click", function () {
    showView(lastView === "unavailable" ? "login" : lastView);
  });

  /* ===========================================================
     INIT
     =========================================================== */
  try {
    var saved = localStorage.getItem("mock_user");
    if (saved) { usernameEl.value = saved; $("#remember").checked = true; }
  } catch (err) {}

  fillGeoMeta();
})();
