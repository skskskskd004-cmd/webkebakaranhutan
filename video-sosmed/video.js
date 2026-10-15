/* =========================================================
   "Video" Bijak Bermedia Sosial
   - Alur adegan: opening -> inti -> closing
   - Narasi suara via Web Speech API (TTS)
   - Musik latar sederhana via Web Audio API
   - Timeline, progress, kontrol pause/mute/replay
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("playBtn");
  const screenStart = document.getElementById("screenStart");
  const scenesWrap = document.getElementById("scenes");
  const controls = document.getElementById("controls");
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const progressFill = document.getElementById("progressFill");
  const timeLabel = document.getElementById("timeLabel");
  const btnReplay = document.getElementById("btnReplay");
  const btnPause = document.getElementById("btnPause");
  const btnMute = document.getElementById("btnMute");

  /* -------- Naskah tiap adegan: durasi (detik) + narasi -------- */
  const script = [
    { dur: 8,  text: "Bijak bermedia sosial. Dunia digital ada di genggaman kita. Yuk, gunakan dengan bijak." },
    { dur: 12, text: "Kenapa perlu bijak? Setiap hari kita membagikan dan membaca ribuan informasi. Sayangnya, tidak semuanya benar, dan tidak semua pantas disebar." },
    { dur: 12, text: "Tips pertama. Saring sebelum sharing. Periksa kebenaran informasi sebelum membagikannya. Jangan sampai ikut menyebarkan berita bohong atau hoaks." },
    { dur: 12, text: "Tips kedua. Jaga sopan santun. Berkomentarlah dengan santun. Hindari ujaran kebencian, perundungan, dan kata-kata yang menyakiti orang lain." },
    { dur: 12, text: "Tips ketiga. Lindungi data pribadi. Jangan mudah membagikan alamat, nomor telepon, atau data pribadimu. Privasimu adalah tanggung jawabmu sendiri." },
    { dur: 12, text: "Tips keempat. Atur waktu layar. Gunakan media sosial secukupnya. Jangan sampai lupa belajar, istirahat, dan berinteraksi dengan dunia nyata." },
    { dur: 12, text: "Jadilah pengguna yang bijak. Berpikirlah sebelum mengunggah. Terima kasih sudah menonton." },
  ];

  const totalDur = script.reduce((a, s) => a + s.dur, 0);

  let current = -1;
  let elapsed = 0;          // detik berjalan total
  let sceneElapsed = 0;     // detik berjalan di adegan ini
  let timer = null;         // interval
  let paused = false;
  let muted = false;
  let finished = false;

  /* -------- Musik latar sederhana (Web Audio) -------- */
  let audioCtx = null;
  let musicNodes = [];
  const startMusic = () => {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const master = audioCtx.createGain();
      master.gain.value = 0.06; // volume lembut agar tidak menutupi narasi
      master.connect(audioCtx.destination);
      musicNodes.push(master);

      // Progresi akord lembut yang berulang (pad)
      const chords = [
        [261.63, 329.63, 392.0],   // C
        [293.66, 349.23, 440.0],   // Dm
        [349.23, 440.0, 523.25],   // F
        [392.0, 493.88, 587.33],   // G
      ];
      let chordIndex = 0;
      const playChord = () => {
        if (!audioCtx || paused) return;
        const notes = chords[chordIndex % chords.length];
        chordIndex++;
        notes.forEach((freq) => {
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0, audioCtx.currentTime);
          g.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.6);
          g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3.6);
          osc.connect(g);
          g.connect(master);
          osc.start();
          osc.stop(audioCtx.currentTime + 3.8);
        });
      };
      playChord();
      const musicTimer = setInterval(() => {
        if (!audioCtx) { clearInterval(musicTimer); return; }
        playChord();
      }, 3600);
      musicNodes.push({ stop: () => clearInterval(musicTimer) });
    } catch (e) {
      // Jika Web Audio tidak didukung, lanjut tanpa musik.
    }
  };
  const stopMusic = () => {
    musicNodes.forEach((n) => { if (n.stop) n.stop(); });
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
    musicNodes = [];
  };

  /* -------- Narasi suara (TTS) -------- */
  const speak = (text) => {
    if (muted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    u.rate = 1.0;
    u.pitch = 1.0;
    // Pilih suara Indonesia bila tersedia
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => /id|indones/i.test(v.lang + v.name));
    if (idVoice) u.voice = idVoice;
    window.speechSynthesis.speak(u);
  };

  /* -------- Format waktu m:ss -------- */
  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  };

  /* -------- Pindah ke adegan tertentu -------- */
  const goToScene = (i) => {
    scenes.forEach((s, idx) => s.classList.toggle("active", idx === i));
    current = i;
    sceneElapsed = 0;
    speak(script[i].text);
  };

  /* -------- Loop utama tiap 100ms -------- */
  const tick = () => {
    if (paused) return;
    elapsed += 0.1;
    sceneElapsed += 0.1;

    const pct = Math.min((elapsed / totalDur) * 100, 100);
    progressFill.style.width = pct + "%";
    timeLabel.textContent = fmt(elapsed);

    if (current >= 0 && sceneElapsed >= script[current].dur) {
      if (current < scenes.length - 1) {
        goToScene(current + 1);
      } else {
        endVideo();
      }
    }
  };

  const endVideo = () => {
    finished = true;
    clearInterval(timer);
    timer = null;
    progressFill.style.width = "100%";
    timeLabel.textContent = fmt(totalDur);
    btnPause.textContent = "⏸";
    stopMusic();
  };

  /* -------- Mulai video -------- */
  const startVideo = () => {
    screenStart.style.display = "none";
    scenesWrap.hidden = false;
    controls.hidden = false;
    elapsed = 0;
    finished = false;
    paused = false;
    // "Bangunkan" TTS (beberapa browser perlu panggilan awal)
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    startMusic();
    goToScene(0);
    clearInterval(timer);
    timer = setInterval(tick, 100);
  };

  /* -------- Kontrol -------- */
  playBtn.addEventListener("click", startVideo);

  btnReplay.addEventListener("click", () => {
    stopMusic();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearInterval(timer);
    startVideo();
  });

  btnPause.addEventListener("click", () => {
    if (finished) { btnReplay.click(); return; }
    paused = !paused;
    btnPause.textContent = paused ? "▶" : "⏸";
    if (paused) {
      if ("speechSynthesis" in window) window.speechSynthesis.pause();
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.resume();
    }
  });

  btnMute.addEventListener("click", () => {
    muted = !muted;
    btnMute.textContent = muted ? "🔇" : "🔊";
    if (muted) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      stopMusic();
    } else {
      startMusic();
      // ucapkan ulang narasi adegan sekarang
      if (current >= 0 && !finished) speak(script[current].text);
    }
  });

  // Beberapa browser memuat daftar suara secara async
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
});
