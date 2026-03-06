// ═══════════════════════════════════════════
//   YUKCHI.UZ  —  API ulanish fayli
//   Barcha HTML sahifalarga shu faylni qo'shing
// ═══════════════════════════════════════════

const API_URL = "https://yukchi-production.up.railway.app";

// ── Token ──────────────────────────────────
function getToken()    { return localStorage.getItem("token"); }
function getUsername() { return localStorage.getItem("username"); }
function getRole()     { return localStorage.getItem("profileType"); }
function isLoggedIn()  { return !!localStorage.getItem("loggedIn"); }

// ── Universal fetch ────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  const res  = await fetch(API_URL + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return data;
}

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────
const Auth = {

  // Ro'yxatdan o'tish
  async signup(username, password, profileType) {
    return apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ username, password, profileType })
    });
  },

  // Kirish
  async login(username, password) {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (data.status === "ok") {
      localStorage.setItem("loggedIn",     "true");
      localStorage.setItem("username",     data.username);
      localStorage.setItem("profileType",  data.profileType);
      if (data.token) localStorage.setItem("token", data.token);
    }
    return data;
  },

  // Chiqish
  logout() {
    ["loggedIn","username","profileType","token"].forEach(k => localStorage.removeItem(k));
    window.location.href = "truck.html";
  }
};

// ─────────────────────────────────────────────
//  BUYURTMALAR
// ─────────────────────────────────────────────
const Orders = {

  // Yangi buyurtma yuborish
  async create(orderData) {
    return apiFetch("/order", {
      method: "POST",
      body: JSON.stringify(orderData)
    });
  },

  // Barcha buyurtmalar (haydovchi uchun)
  async getAll() {
    return apiFetch("/orders");
  },

  // Holat yangilash
  async updateStatus(id, status) {
    return apiFetch("/orders/" + id, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }
};

// ─────────────────────────────────────────────
//  UI YORDAMCHILARI
// ─────────────────────────────────────────────

// Chiroyli xabar (yashil/qizil)
function showMessage(msg, type) {
  // Eski xabarni o'chirish
  const old = document.getElementById("_api_msg");
  if (old) old.remove();

  const div = document.createElement("div");
  div.id = "_api_msg";
  div.textContent = msg;
  div.style.cssText = [
    "position:fixed", "top:20px", "right:20px", "z-index:99999",
    "padding:14px 22px", "border-radius:10px", "font-size:15px",
    "font-weight:600", "color:#fff", "box-shadow:0 4px 20px rgba(0,0,0,.3)",
    "background:" + (type === "error" ? "#ef4444" : "#22c55e"),
    "transition:opacity .4s"
  ].join(";");
  document.body.appendChild(div);
  setTimeout(() => { div.style.opacity = "0"; setTimeout(() => div.remove(), 400); }, 3000);
}

// Navigatsiya: kirgan/chiqganga qarab ko'rsatish
function updateNav() {
  const loggedIn   = isLoggedIn();
  const role       = getRole();
  const username   = getUsername();

  // Auth havolasi
  const authLink = document.querySelector(".auth-link");
  if (authLink) {
    if (loggedIn) {
      authLink.textContent = "Chiqish (" + (username || "") + ")";
      authLink.href = "#";
      authLink.onclick = (e) => { e.preventDefault(); Auth.logout(); };
    } else {
      authLink.textContent = "Kirish";
      authLink.href        = "index.html";
      authLink.onclick     = null;
    }
  }

  // Rol asosida nav linklari
  const navYukolish  = document.getElementById("nav-yukolish");
  const navYukberish = document.getElementById("nav-yukberish");

  if (!loggedIn) {
    if (navYukolish)  navYukolish.style.display  = "none";
    if (navYukberish) navYukberish.style.display = "none";
  } else if (role === "Haydovchi" || role === "driver") {
    if (navYukolish)  navYukolish.style.display  = "inline-block";
    if (navYukberish) navYukberish.style.display = "none";
  } else {
    if (navYukolish)  navYukolish.style.display  = "none";
    if (navYukberish) navYukberish.style.display = "inline-block";
  }
}

document.addEventListener("DOMContentLoaded", updateNav);
