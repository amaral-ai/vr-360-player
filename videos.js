// ======================================================================
// videos.js — VR 360 Dynamic Video Loader
// Compatível com vídeos locais (File API) e modo remoto temporário
// ======================================================================

(function () {

  const VR360 = (window.VR360 = window.VR360 || {});

  const state = {
    files: [],               // vídeos locais selecionados
    isPlaying: false,        // play/pause global
    currentIndex: [null, null, null, null, null, null]
  };

  VR360.state = state;

  const folderInput = document.querySelector("#folderInput");
  const playPauseBtn = document.querySelector("#playPauseBtn");
  const reloadBtn = document.querySelector("#reloadBtn");
  const statusEl = document.querySelector("#status");

  const assets = document.querySelector("#assets");

  // Painéis A-Frame
  const planes = Array.from({ length: 6 }, (_, i) =>
    document.querySelector(`#panel-${i}`)
  );
  VR360.panelEntities = planes;

  // Lista de elementos <video>
  VR360.panelVideos = [];

  // ======================================================================
  // UTILIDADES
  // ======================================================================

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function randomLocalFile() {
    return state.files[Math.floor(Math.random() * state.files.length)];
  }

  // Cria dinamicamente elementos <video>
  function createVideoElement(id) {
    const v = document.createElement("video");
    v.id = id;
    v.className = "vr-video hidden-video";
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.muted = true;
    v.preload = "auto";

    assets.appendChild(v);
    return v;
  }

  // ======================================================================
  // CARREGA UM VÍDEO LOCAL EM UM PAINEL
  // ======================================================================

  function loadLocalVideoInto(panelIndex) {
    const file = randomLocalFile();
    if (!file) return;

    const vid = VR360.panelVideos[panelIndex];
    if (!vid) return;

    if (vid.dataset.url) {
      URL.revokeObjectURL(vid.dataset.url);
    }

    const url = URL.createObjectURL(file);
    vid.src = url;
    vid.dataset.url = url;

    // Garantir textura só quando houver frame válido
    vid.onloadeddata = () => {
      const entity = planes[panelIndex];
      entity.setAttribute("material", "src", `#${vid.id}`);

      if (state.isPlaying) vid.play();
    };

    vid.onended = () => loadLocalVideoInto(panelIndex);

    vid.load();
  }

  // ======================================================================
  // INICIALIZAÇÃO DOS PAINÉIS (após seleção de pasta)
  // ======================================================================

  function initializeLocalPanels() {
    VR360.panelVideos = [];

    // Criar <video>
    for (let i = 0; i < 6; i++) {
      let vid = createVideoElement(`panel-video-${i}`);
      VR360.panelVideos.push(vid);
    }

    // Popular vídeos
    for (let i = 0; i < 6; i++) {
      loadLocalVideoInto(i);
    }

    setStatus("Vídeos carregados.");
    playPauseBtn.disabled = false;
    reloadBtn.disabled = false;
  }

  // ======================================================================
  // PLAY/PAUSE GLOBAL
  // ======================================================================

  function togglePlayPause() {
    state.isPlaying = !state.isPlaying;

    VR360.panelVideos.forEach(v => {
      if (!v) return;
      if (state.isPlaying) v.play();
      else v.pause();
    });

    playPauseBtn.textContent = state.isPlaying ? "Pause" : "Play";
  }

  // ======================================================================
  // SELEÇÃO DE PASTA (MODO NORMAL)
  // ======================================================================

  folderInput.onchange = () => {
    const list = Array.from(folderInput.files).filter(f => f.type.startsWith("video"));

    if (!list.length) {
      setStatus("Pasta sem vídeos.");
      return;
    }

    state.files = list;
    state.isPlaying = false;

    initializeLocalPanels();
  };

  playPauseBtn.onclick = togglePlayPause;
  reloadBtn.onclick = initializeLocalPanels;

})();
  

// ======================================================================
// 🔧 MÓDULO TEMPORÁRIO — TESTE COM VÍDEOS REMOTOS
// Ativa vídeos públicos para testar no GitHub Pages
// Basta trocar TESTAR_VIDEOS_REMOTOS para true/false
// ======================================================================
(function () {

  const TESTAR_VIDEOS_REMOTOS = true;   // 🔥 Defina FALSE para desativar

  if (!TESTAR_VIDEOS_REMOTOS) return;

  console.warn("🔧 Modo de teste com vídeos remotos ATIVADO.");

  // Lista de vídeos públicos
  const REMOTE_VIDEOS = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4"
  ];

  function randomRemote() {
    return REMOTE_VIDEOS[Math.floor(Math.random() * REMOTE_VIDEOS.length)];
  }

  // Aguarda a cena estar pronta
  window.addEventListener("load", () => {
    let tries = 0;

    const interval = setInterval(() => {
      tries++;

      if (!window.VR360 || !VR360.panelVideos) return;

      console.log("🔧 Pré-inicializando vídeos remotos…");

      VR360.panelVideos.forEach((vid, index) => {
        if (!vid) return;

        const url = randomRemote();
        vid.src = url;
        vid.load();

        vid.onloadeddata = () => {
          const entity = VR360.panelEntities[index];
          entity.setAttribute("material", "src", `#${vid.id}`);
          vid.play().catch(() => {});
        };

        vid.onended = () => {
          const newUrl = randomRemote();
          vid.src = newUrl;
          vid.load();
        };
      });

      clearInterval(interval);
      console.log("🔧 Vídeos remotos carregados nos painéis.");

    }, 300);
  });

})();
