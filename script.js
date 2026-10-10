/* =========================================================
   Website Edukasi Kebakaran Hutan Kalimantan - BMKG
   Semua interaksi ditangani di sini.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Tahun otomatis di footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar: efek scroll ---------- */
  const navbar = document.getElementById("navbar");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Tombol kembali ke atas ---------- */
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Menu mobile (hamburger) ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const closeMenu = () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- Highlight menu aktif saat scroll ---------- */
  const sections = Array.from(document.querySelectorAll("main section[id], #beranda"));
  const linkMap = new Map();
  navLinks.querySelectorAll("a").forEach((a) => {
    const id = a.getAttribute("href").replace("#", "");
    linkMap.set(id, a);
  });
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
          const link = linkMap.get(entry.target.id);
          if (link) link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spyObserver.observe(s));

  /* ---------- Animasi reveal saat elemen muncul ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Hitung angka statistik (counter) ---------- */
  const statNums = document.querySelectorAll(".stat-num");
  const animateCount = (el) => {
    const target = Number(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.floor(eased * target);
      el.textContent = val.toLocaleString("id-ID") + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("id-ID") + suffix;
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  statNums.forEach((el) => statObserver.observe(el));

  /* ---------- Chart batang: animasi tumbuh ---------- */
  const animateChart = (chartEl) => {
    const bars = chartEl.querySelectorAll(".bar");
    const chartObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bars.forEach((b, i) => setTimeout(() => b.classList.add("grow"), i * 100));
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    chartObserver.observe(chartEl);
  };
  document.querySelectorAll(".chart").forEach(animateChart);

  /* ---------- Tab Dampak ---------- */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      tabPanels.forEach((p) => {
        const show = p.id === "tab-" + target;
        p.classList.toggle("active", show);
        p.hidden = !show;
      });
    });
  });

  /* ---------- Chat Template (bukan AI sungguhan) ---------- */
  const chatForm = document.getElementById("chatForm");
  const chatText = document.getElementById("chatText");
  const chatWindow = document.getElementById("chatWindow");
  const chatSuggest = document.getElementById("chatSuggest");

  // Basis jawaban template berdasarkan kata kunci.
  const answers = [
    {
      keys: ["apa itu", "pengertian", "definisi", "maksud"],
      text:
        "Kebakaran hutan dan lahan (karhutla) adalah terbakarnya hutan atau lahan, " +
        "baik secara alami maupun karena ulah manusia. Di Kalimantan, lahan gambut " +
        "yang kering membuat api mudah menyebar dan sulit dipadamkan.",
    },
    {
      keys: ["penyebab", "kenapa", "mengapa", "pemicu", "faktor"],
      text:
        "Penyebabnya ada dua: faktor alam (kemarau panjang, suhu tinggi, El Niño) " +
        "dan faktor manusia (membuka lahan dengan dibakar, mengeringkan gambut, serta " +
        "kelalaian seperti membuang puntung rokok). Di Kalimantan, faktor manusia paling dominan.",
    },
    {
      keys: ["dampak lingkungan", "lingkungan", "alam", "habitat"],
      text:
        "Dampak lingkungan: pencemaran udara, rusaknya habitat satwa, hilangnya " +
        "keanekaragaman hayati, kerusakan tanah gambut, dan meningkatnya emisi karbon " +
        "yang mempercepat pemanasan global.",
    },
    {
      keys: ["dampak masyarakat", "masyarakat", "kesehatan", "ekonomi", "sosial"],
      text:
        "Dampak bagi masyarakat: gangguan kesehatan (ISPA, sesak napas), sekolah " +
        "diliburkan, transportasi terganggu karena asap, kerugian ekonomi, bahkan asap " +
        "bisa menyebar ke negara tetangga.",
    },
    {
      keys: ["dampak"],
      text:
        "Dampaknya dua sisi. Lingkungan: pencemaran udara, habitat rusak, emisi karbon naik. " +
        "Masyarakat: gangguan kesehatan, sekolah libur, transportasi terhambat, dan kerugian ekonomi.",
    },
    {
      keys: ["flora", "fauna", "hewan", "tumbuhan", "satwa", "orangutan", "bekantan"],
      text:
        "Banyak spesies terancam, seperti orangutan Kalimantan, bekantan, beruang madu, " +
        "dan macan dahan. Tumbuhan seperti pohon ulin dan bunga Rafflesia juga ikut terdampak " +
        "karena habitatnya terbakar.",
    },
    {
      keys: ["cegah", "pencegahan", "mencegah", "antisipasi"],
      text:
        "Pencegahan: tidak membuka lahan dengan dibakar, menjaga gambut tetap basah " +
        "(rewetting), edukasi masyarakat, pemantauan titik panas lewat satelit, dan " +
        "penegakan hukum bagi pembakar lahan.",
    },
    {
      keys: ["tanggulang", "penanggulangan", "padam", "atasi", "mengatasi"],
      text:
        "Penanggulangan: pemadaman darat oleh Manggala Agni, pemadaman udara (water bombing), " +
        "teknologi modifikasi cuaca untuk hujan buatan, posko kesehatan + pembagian masker, " +
        "lalu reboisasi untuk memulihkan lahan.",
    },
    {
      keys: ["data", "statistik", "titik panas", "hotspot", "tahun"],
      text:
        "Secara umum, titik panas melonjak saat kemarau ekstrem. Tahun 2015 dan 2019 " +
        "dikenal sebagai karhutla parah akibat El Niño. Puncak kejadian biasanya pada " +
        "Juli–Oktober di Kalimantan Tengah, Barat, dan Selatan.",
    },
    {
      keys: ["gambut"],
      text:
        "Lahan gambut adalah tanah dari timbunan sisa tumbuhan selama ribuan tahun. " +
        "Saat kering, gambut sangat mudah terbakar dan apinya menjalar di bawah permukaan, " +
        "sehingga asapnya tebal dan sulit dipadamkan.",
    },
    {
      keys: ["pelajar", "siswa", "lakukan", "bisa apa"],
      text:
        "Sebagai pelajar kamu bisa: hemat kertas, ikut menanam pohon, menyebarkan info yang benar, " +
        "dan tidak membuang api sembarangan saat berkegiatan di alam. Langkah kecil tetap berarti!",
    },
  ];

  const fallback =
    "Terima kasih atas pertanyaannya! Untuk topik ini, coba jelajahi bagian " +
    "Pengertian, Penyebab, Dampak, atau Pencegahan di halaman ini. Kamu juga bisa " +
    "memilih salah satu pertanyaan cepat di atas kolom ketik.";

  const findAnswer = (q) => {
    const text = q.toLowerCase();
    for (const a of answers) {
      if (a.keys.some((k) => text.includes(k))) return a.text;
    }
    return fallback;
  };

  const scrollChat = () => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  const addMessage = (text, who) => {
    const msg = document.createElement("div");
    msg.className = "msg msg-" + who;
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = who === "bot" ? "🤖" : "🧑";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    msg.append(avatar, bubble);
    chatWindow.appendChild(msg);
    scrollChat();
    return msg;
  };

  const showTyping = () => {
    const msg = document.createElement("div");
    msg.className = "msg msg-bot";
    msg.innerHTML =
      '<span class="avatar">🤖</span>' +
      '<div class="bubble typing"><span></span><span></span><span></span></div>';
    chatWindow.appendChild(msg);
    scrollChat();
    return msg;
  };

  const handleQuestion = (q) => {
    const question = q.trim();
    if (!question) return;
    addMessage(question, "user");
    chatText.value = "";
    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      addMessage(findAnswer(question), "bot");
    }, 700);
  };

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleQuestion(chatText.value);
    });
  }
  if (chatSuggest) {
    chatSuggest.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => handleQuestion(chip.dataset.q));
    });
  }
});
