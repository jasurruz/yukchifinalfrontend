// =======================================
//  SUPABASE ULANISHI
// =======================================
const { createClient } = supabase;

// Siz bergan loyiha ma'lumotlari
const supabaseUrl = 'https://thlasmikahqmsugltmfc.supabase.co'; 
const supabaseKey = 'sb_publishable_hiv6IRiaOJ-1d591pxjWDg_dQ5hYTV2';

const _supabase = createClient(supabaseUrl, supabaseKey);

// LocalStorage'dan foydalanuvchini aniqlash
const username = localStorage.getItem("username");
const userType = localStorage.getItem("profileType");

// Login qilinmagan bo‘lsa → qaytarish
if (!username) {
    window.location.href = "kirish1.html";
}

// DOM elementlar
const nameEl = document.getElementById("profileName");
const usernameEl = document.getElementById("p_username");
const profileTypeEl = document.getElementById("profileType");
const driverSection = document.getElementById("driver-section");
const profileImage = document.getElementById("profileImage");

// UI boshlang'ich sozlamalar
nameEl.textContent = username;
usernameEl.textContent = username;

if (userType === "driver") {
    profileTypeEl.textContent = "Haydovchi";
    driverSection.style.display = "block";
} else {
    profileTypeEl.textContent = "Foydalanuvchi";
    driverSection.style.display = "none";
}

// =======================================
//  PROFIL MA'LUMOTLARINI SUPABASE'DAN YUKLASH
// =======================================
async function loadUserInfo() {
    try {
        const { data: profile, error } = await _supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .maybeSingle(); 

        if (error) throw error;

        if (profile) {
            // Shaxsiy ma'lumotlar
            document.getElementById("p_age").textContent = profile.age || "Kiritilmagan";
            document.getElementById("p_country").textContent = profile.country || "Kiritilmagan";
            document.getElementById("p_phone").textContent = profile.phone || "Kiritilmagan";
            
            // Rasm (Agar bazada rasm linki bo'lsa)
            if (profile.avatar_url) {
                profileImage.src = profile.avatar_url;
            }

            // Haydovchi ma'lumotlari
            if (userType === "driver") {
                document.getElementById("p_transport").textContent = profile.transport || "Kiritilmagan";
                document.getElementById("p_carNumber").textContent = profile.car_number || "Kiritilmagan";
                document.getElementById("p_license").textContent = profile.license || "Kiritilmagan";
            }
        } else {
            // Foydalanuvchi bazada yo'q bo'lsa, avtomatik yaratish
            await _supabase.from('profiles').insert([{ username: username, user_type: userType }]);
        }
    } catch (err) {
        console.error("Yuklashda xato:", err.message);
    }
}

loadUserInfo();

// =======================================
//  RASMNI STORAGE'GA YUKLASH
// =======================================
document.getElementById("uploadPhoto").addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // Rasm nomi unikalligi uchun vaqt belgisini qo'shamiz
    const fileExt = file.name.split('.').pop();
    const fileName = `${username}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Buket ichidagi yo'l

    try {
        // 1. Storage'ga yuklash
        let { error: uploadError } = await _supabase.storage
            .from('rasm')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Rasmni public URL manzilini olish
        const { data } = _supabase.storage.from('rasm').getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        // 3. Bazadagi profilni yangilash
        const { error: updateError } = await _supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('username', username);

        if (updateError) throw updateError;

        profileImage.src = publicUrl;
        alert("Profil rasmi yangilandi!");
    } catch (err) {
        alert("Rasm yuklashda xato: " + err.message);
    }
});

// =======================================
//  SHAXSIY MA'LUMOTLARNI SAQLASH
// =======================================
document.getElementById("editUserBtn").addEventListener("click", () => {
    document.getElementById("editUserForm").style.display = "block";
});

document.getElementById("saveUserBtn").addEventListener("click", async () => {
    const age = document.getElementById("in_age").value;
    const country = document.getElementById("in_country").value;
    const phone = document.getElementById("in_phone").value;

    const { error } = await _supabase
        .from('profiles')
        .update({ age: age, country: country, phone: phone })
        .eq('username', username);

    if (!error) {
        alert("Ma'lumotlar saqlandi!");
        loadUserInfo();
        document.getElementById("editUserForm").style.display = "none";
    } else {
        alert("Xatolik yuz berdi: " + error.message);
    }
});

// =======================================
//  HAYDOVCHI MA'LUMOTLARINI SAQLASH
// =======================================
document.getElementById("editDriverBtn").addEventListener("click", () => {
    document.getElementById("driverView").style.display = "none";
    document.getElementById("driverEdit").style.display = "grid";
    document.getElementById("editDriverBtn").style.display = "none";
    document.getElementById("saveDriverBtn").style.display = "inline-block";
});

document.getElementById("saveDriverBtn").addEventListener("click", async () => {
    const tr = document.getElementById("edit_transport").value;
    const car = document.getElementById("edit_carNumber").value;
    const lic = document.getElementById("edit_license").value;

    const { error } = await _supabase
        .from('profiles')
        .update({ transport: tr, car_number: car, license: lic })
        .eq('username', username);

    if (!error) {
        alert("Haydovchi ma'lumotlari saqlandi!");
        loadUserInfo();
        document.getElementById("driverView").style.display = "grid";
        document.getElementById("driverEdit").style.display = "none";
        document.getElementById("editDriverBtn").style.display = "inline-block";
        document.getElementById("saveDriverBtn").style.display = "none";
    } else {
        alert("Xatolik: " + error.message);
    }
});

// =======================================
//  CHIQISH
// =======================================
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "kirish1.html";
});