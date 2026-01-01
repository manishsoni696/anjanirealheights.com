# 📑 Anjani Real Heights - Website Maintenance Reference
**Last Updated:** 02 Jan 2026

Yeh file aage ke badlav aur purane updates ko yaad rakhne ke liye banayi gayi hai.

---

## 🛠 1. Email & Lead System (script.js)
Humne EmailJS ko configure kiya hai taaki enquiries seedha Gmail par aayein aur customer ko auto-reply mile.

- **Lead Template ID:** `template_794vzd3` (Aapke paas enquiry aane ke liye).
- **Auto-Reply Template ID:** `template_tlucta5` (Customer ko confirmation bhejane ke liye).
- **Logic:** Auto-reply tabhi jayega jab customer Email field bharega.
- **Gmail Setting:** Gmail mein `ARH LEADS` label banaya gaya hai taaki saari leads ek jagah dikhein.

---

## 🖼 2. Images & Performance (index.html)
Website ki speed aur look ko behtar banane ke liye ye badlav kiye gaye:

- **Manish Soni Photo:** `manish.jpg` ko compress karke **200KB** se kam kiya gaya taaki loading circle na ghoome.
- **Cache Fix:** Code mein `manish.jpg?v=1.1` use kiya gaya hai. Jab bhi photo badlein, `v=1.1` ko `v=1.2` kar dein taaki browser naya photo turant dikhaye.
- **Speed Tip:** Sabhi images mein `loading="lazy"` attribute lagaya gaya hai taaki website turant khule.

---

## 📝 3. Aage Kya Karna Hai (Pending Tasks)

1. **Abhimanyu Soni Photo:** `index.html` mein line 176 par placeholder link ko asli photo se badalna hai.
2. **Office Photo:** Hero section mein placeholder image hata kar office ki original photo lagani hai.
3. **Professional Email:** SMTP connect karna hai taaki sender ka naam `contact@anjanirealheights.com` dikhe.
4. **Maps:** `assets/maps/` folder mein PDF maps upload karne hain.

---

## 🚀 Zaroori Commands
- **Hard Refresh:** Badlav dekhne ke liye hamesha `Ctrl + Shift + R` ka use karein.
- **Image Compression:** Nayi photo lagane se pehle use [TinyJPG](https://tinyjpg.com) par compress zaroor karein.
