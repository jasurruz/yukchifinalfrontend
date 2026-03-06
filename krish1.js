// ═══════════════════════════════════════════
//  KIRISH / RO'YXATDAN O'TISH
//  (api.js dan keyin yuklaning!)
// ═══════════════════════════════════════════

// ── RO'YXATDAN O'TISH ──────────────────────
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn         = this.querySelector("button[type=submit]");
    const username    = document.getElementById("signup-username").value.trim();
    const password    = document.getElementById("signup-password").value;
    const profileType = document.getElementById("regProfileType").value;

    if (!username || !password) { showMessage("Foydalanuvchi nomi va parolni kiriting!", "error"); return; }
    btn.disabled = true; btn.textContent = "Yuklanmoqda...";

    try {
      const data = await Auth.signup(username, password, profileType);
      if (data.status === "ok") {
        showMessage("Ro'yxatdan o'tdingiz! Endi kiring.");
        setTimeout(showLogin, 1000);
      } else {
        showMessage(data.message || "Xatolik!", "error");
      }
    } catch { showMessage("Server bilan aloqa yo'q!", "error"); }
    finally { btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish"; }
  });
}

// ── KIRISH ─────────────────────────────────
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn      = this.querySelector("button[type=submit]");
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!username || !password) { showMessage("Login va parolni kiriting!", "error"); return; }
    btn.disabled = true; btn.textContent = "Kirilmoqda...";

    try {
      const data = await Auth.login(username, password);
      if (data.status === "ok") {
        showMessage("Xush kelibsiz, " + username + "!");
        setTimeout(() => { window.location.href = "truck.html"; }, 800);
      } else {
        showMessage(data.message || "Login yoki parol noto'g'ri!", "error");
      }
    } catch { showMessage("Server bilan aloqa yo'q!", "error"); }
    finally { btn.disabled = false; btn.textContent = "Kirish"; }
  });
}

// ── FORMALAR ALMASHTIRISH ───────────────────
const showLoginBtn  = document.getElementById("show-login");
const showSignupBtn = document.getElementById("show-signup");
if (showLoginBtn)  showLoginBtn.addEventListener("click", showLogin);
if (showSignupBtn) showSignupBtn.addEventListener("click", showSignup);

function showLogin() {
  const s = document.getElementById("signup-container");
  const l = document.getElementById("login-container");
  if (s) s.style.display = "none";
  if (l) l.style.display = "block";
}
function showSignup() {
  const s = document.getElementById("signup-container");
  const l = document.getElementById("login-container");
  if (s) s.style.display = "block";
  if (l) l.style.display = "none";
}

// ── ROL TUGMALARI ───────────────────────────
document.querySelectorAll(".type-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    const inp = document.getElementById("regProfileType");
    if (inp) inp.value = this.dataset.type === "driver" ? "Haydovchi" : "Foydalanuvchi";
  });
});
