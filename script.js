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

  /* ---------- Kontrol peta lokasi ---------- */
  const mapControls = document.getElementById("mapControls");
  const mapFrame = document.getElementById("mapFrame");
  const mapLink = document.getElementById("mapLink");
  // bbox: batas peta [kiri, bawah, kanan, atas]; marker: titik [lat, lon]; zoom + center untuk tautan.
  const mapLocations = {
    kalimantan: { bbox: "108.5,-4.3,119.3,4.3", marker: "-1.68,113.38", zoom: 6, lat: -1.68, lon: 113.38 },
    tengah: { bbox: "110.8,-3.6,115.8,0.6", marker: "-1.68,113.38", zoom: 7, lat: -1.68, lon: 113.38 },
    barat: { bbox: "108.3,-2.5,114.3,2.3", marker: "-0.02,109.33", zoom: 7, lat: -0.02, lon: 109.33 },
    selatan: { bbox: "113.5,-4.5,116.9,-1.3", marker: "-3.09,115.28", zoom: 7, lat: -3.09, lon: 115.28 },
  };
  if (mapControls && mapFrame) {
    mapControls.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const loc = mapLocations[btn.dataset.loc];
        if (!loc) return;
        mapControls.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        mapFrame.src =
          "https://www.openstreetmap.org/export/embed.html?bbox=" +
          loc.bbox +
          "&layer=mapnik&marker=" +
          loc.marker;
        if (mapLink) {
          mapLink.href =
            "https://www.openstreetmap.org/#map=" + loc.zoom + "/" + loc.lat + "/" + loc.lon;
        }
      });
    });
  }

  /* ---------- Progress baca ---------- */
  const readProgress = document.getElementById("readProgress");
  if (readProgress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
      readProgress.style.width = pct + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* ---------- Simulasi tingkat risiko kebakaran ---------- */
  const simSuhu = document.getElementById("simSuhu");
  if (simSuhu) {
    const simLembap = document.getElementById("simLembap");
    const simAngin = document.getElementById("simAngin");
    const simHujan = document.getElementById("simHujan");
    const simSuhuVal = document.getElementById("simSuhuVal");
    const simLembapVal = document.getElementById("simLembapVal");
    const simAnginVal = document.getElementById("simAnginVal");
    const simHujanVal = document.getElementById("simHujanVal");
    const simGaugeFill = document.getElementById("simGaugeFill");
    const simLevel = document.getElementById("simLevel");
    const simScore = document.getElementById("simScore");
    const simAdvice = document.getElementById("simAdvice");

    // Pemetaan skor -> level, warna, dan saran.
    const simLevels = [
      { max: 25, label: "Rendah", color: "#3ddc84", advice: "Kondisi aman. Risiko kebakaran kecil." },
      { max: 50, label: "Sedang", color: "#ffcf4d", advice: "Tetap waspada. Hindari menyalakan api di area terbuka." },
      { max: 75, label: "Tinggi", color: "#ffb020", advice: "Risiko besar. Dilarang membakar apa pun di lahan." },
      { max: 101, label: "Ekstrem", color: "#ff5a5a", advice: "Sangat berbahaya! Siaga penuh dan laporkan asap sekecil apa pun." },
    ];

    const hitungRisiko = () => {
      const suhu = Number(simSuhu.value);
      const lembap = Number(simLembap.value);
      const angin = Number(simAngin.value);
      const hujan = Number(simHujan.value);

      simSuhuVal.textContent = suhu + "°C";
      simLembapVal.textContent = lembap + "%";
      simAnginVal.textContent = angin + " km/jam";
      simHujanVal.textContent = hujan + " hari";

      // Semua dinormalkan ke 0-1 lalu diberi bobot. Kelembapan berbanding terbalik.
      const nSuhu = (suhu - 20) / (45 - 20);
      const nKering = 1 - lembap / 100;
      const nAngin = angin / 60;
      const nHujan = hujan / 60;
      let skor = (nSuhu * 0.3 + nKering * 0.3 + nAngin * 0.15 + nHujan * 0.25) * 100;
      skor = Math.round(Math.max(0, Math.min(100, skor)));

      const lvl = simLevels.find((l) => skor < l.max) || simLevels[simLevels.length - 1];
      simGaugeFill.style.width = 100 - skor + "%";
      simLevel.textContent = lvl.label;
      simLevel.style.color = lvl.color;
      simScore.textContent = skor;
      simAdvice.textContent = lvl.advice;
    };

    [simSuhu, simLembap, simAngin, simHujan].forEach((el) =>
      el.addEventListener("input", hitungRisiko)
    );
    hitungRisiko();
  }

  /* ---------- Kuis interaktif ---------- */
  const quizEl = document.getElementById("quiz");
  if (quizEl) {
    const questions = [
      {
        q: "Apa kepanjangan dari istilah 'karhutla'?",
        options: [
          "Kebakaran Hutan dan Lahan",
          "Kabut Hutan dan Lautan",
          "Karbon Hutan Terlalu Banyak",
          "Kawasan Hutan Terlindungi",
        ],
        correct: 0,
        explain: "Karhutla = Kebakaran Hutan dan Lahan.",
      },
      {
        q: "Jenis lahan apa di Kalimantan yang membuat api sangat sulit dipadamkan?",
        options: ["Lahan pasir", "Lahan gambut", "Lahan berbatu", "Lahan salju"],
        correct: 1,
        explain: "Lahan gambut mudah terbakar dan apinya menjalar di bawah permukaan tanah.",
      },
      {
        q: "Faktor apa yang menjadi penyebab terbesar kebakaran hutan di Kalimantan?",
        options: ["Petir", "Letusan gunung", "Aktivitas manusia", "Gempa bumi"],
        correct: 2,
        explain: "Sebagian besar karhutla di Kalimantan dipicu aktivitas manusia, seperti membuka lahan dengan dibakar.",
      },
      {
        q: "Penyakit apa yang sering meningkat saat terjadi kabut asap?",
        options: ["Demam berdarah", "ISPA", "Diare", "Patah tulang"],
        correct: 1,
        explain: "ISPA (Infeksi Saluran Pernapasan Akut) meningkat karena udara tercemar asap.",
      },
      {
        q: "Teknik memadamkan api dari udara dengan menjatuhkan air disebut?",
        options: ["Rewetting", "Reboisasi", "Water bombing", "Hujan asam"],
        correct: 2,
        explain: "Water bombing adalah pemadaman dari udara memakai helikopter atau pesawat.",
      },
    ];

    const qQuestion = document.getElementById("quizQuestion");
    const qOptions = document.getElementById("quizOptions");
    const qFeedback = document.getElementById("quizFeedback");
    const qNext = document.getElementById("quizNext");
    const qProgressText = document.getElementById("quizProgressText");
    const qProgressFill = document.getElementById("quizProgressFill");
    const quizResult = document.getElementById("quizResult");
    const qResultScore = document.getElementById("quizResultScore");
    const qResultEmoji = document.getElementById("quizResultEmoji");
    const qResultTitle = document.getElementById("quizResultTitle");
    const qResultMsg = document.getElementById("quizResultMsg");
    const qRetry = document.getElementById("quizRetry");

    let current = 0;
    let score = 0;
    let answered = false;

    const renderQuestion = () => {
      answered = false;
      const item = questions[current];
      qQuestion.textContent = item.q;
      qFeedback.hidden = true;
      qNext.hidden = true;
      qProgressText.textContent = "Soal " + (current + 1) + " dari " + questions.length;
      qProgressFill.style.width = ((current + 1) / questions.length) * 100 + "%";

      qOptions.innerHTML = "";
      item.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.textContent = opt;
        btn.addEventListener("click", () => selectAnswer(i, btn));
        qOptions.appendChild(btn);
      });
    };

    const selectAnswer = (choice, btn) => {
      if (answered) return;
      answered = true;
      const item = questions[current];
      const allBtns = qOptions.querySelectorAll(".quiz-option");
      allBtns.forEach((b, i) => {
        b.disabled = true;
        if (i === item.correct) b.classList.add("correct");
      });
      if (choice === item.correct) {
        score++;
        qFeedback.textContent = "✅ Benar! " + item.explain;
      } else {
        btn.classList.add("wrong");
        qFeedback.textContent = "❌ Kurang tepat. " + item.explain;
      }
      qFeedback.hidden = false;
      qNext.hidden = false;
      qNext.textContent = current < questions.length - 1 ? "Lanjut →" : "Lihat Hasil →";
    };

    const showResult = () => {
      quizEl.hidden = true;
      quizResult.hidden = false;
      qResultScore.textContent = score;
      let emoji, title, msg;
      if (score === questions.length) {
        emoji = "🏆"; title = "Luar biasa!";
        msg = "Nilai sempurna! Kamu sudah paham betul soal kebakaran hutan.";
      } else if (score >= 3) {
        emoji = "🎉"; title = "Kerja bagus!";
        msg = "Pemahamanmu sudah baik. Baca lagi bagian yang belum tepat ya.";
      } else {
        emoji = "📚"; title = "Terus belajar!";
        msg = "Jangan menyerah. Coba baca kembali materinya lalu ulangi kuis.";
      }
      qResultEmoji.textContent = emoji;
      qResultTitle.textContent = title;
      qResultMsg.textContent = msg;
    };

    qNext.addEventListener("click", () => {
      if (current < questions.length - 1) {
        current++;
        renderQuestion();
      } else {
        showResult();
      }
    });

    qRetry.addEventListener("click", () => {
      current = 0;
      score = 0;
      quizResult.hidden = true;
      quizEl.hidden = false;
      renderQuestion();
    });

    renderQuestion();
  }

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
