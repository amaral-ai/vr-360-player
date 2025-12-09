// ======================================================
// VIDEO MANAGER (dinâmico, sem erros WebGL)
// ======================================================
(function () {

  const VR360 = (window.VR360 = window.VR360 || {});

  const state = {
    files: [],
    isPlaying: false,
    currentIndex: [null, null, null, null, null, null]
  };

  VR360.state = state;

  const folderInput = document.querySelector("#folderInput");
  const playPauseBtn = document.querySelector("#playPauseBtn");
  const reloadBtn = document.querySelector("#reloadBtn");
  const statusEl = document.querySelector("#status");

  const assets = document.querySelector("#assets");

  const planes = Array.from({ length: 6 }, (_, i) =>
    document.querySelector(`#panel-${i}`)
  );

  VR360.panelVideos = [];

  // ------------------------------------------------------
  // UTIL: texto de status
  // ------------------------------------------------------
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // ------------------------------------------------------
  // UTIL: vídeo aleatório
  // ------------------------------------------------------
  function randomFile() {
    return state.files[Math.floor(Math.random() * state.files.length)];
  }

  // ------------------------------------------------------
  // Cria o elemento <video> dinamicamente
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Associa vídeo a um painel
  // ------------------------------------------------------
  function loadRandomVideoInto(panelIndex) {
    const file = randomFile();
    if (!file) return;

    const vid = VR360.panelVideos[panelIndex];
    if (!vid) return;

    // Remover URL antigo
    if (vid.dataset.url) {
        URL.revokeObjectURL(vid.dataset.url);
    }

    const url = URL.createObjectURL(file);
    vid.src = url;
    vid.dataset.url = url;

    // AQUI ESTÁ A MUDANÇA: só aplica material depois do vídeo ter frame válido
    vid.onloadeddata = () => {
        const panelEntity = planes[panelIndex];
        panelEntity.setAttribute("material", "src", `#${vid.id}`);

        // Se estiver tocando, inicia
        if (state.isPlaying) vid.play();
    };

    vid.load();
  }

  // ------------------------------------------------------
  // Inicializa os vídeos depois de selecionar a pasta
  // ------------------------------------------------------
  function initializePanels() {

    // Criar 6 vídeos novos
    VR360.panelVideos = [];

    for (let i = 0; i < 6; i++) {
      let vid = createVideoElement(`panel-video-${i}`);
      VR360.panelVideos.push(vid);

      vid.onended = () => loadRandomVideoInto(i);
    }

    for (let i = 0; i < 6; i++) {
      loadRandomVideoInto(i);
    }

    setStatus("Vídeos carregados.");
    playPauseBtn.disabled = false;
    reloadBtn.disabled = false;
  }

  // ------------------------------------------------------
  // Play / Pause global
  // ------------------------------------------------------
  function togglePlayPause() {
    state.isPlaying = !state.isPlaying;

    VR360.panelVideos.forEach(v => {
      if (!v) return;
      if (state.isPlaying) v.play();
      else v.pause();
    });

    playPauseBtn.textContent = state.isPlaying ? "Pause" : "Play";
  }

  // ------------------------------------------------------
  // Seleção da pasta
  // ------------------------------------------------------
  folderInput.onchange = () => {
    const list = Array.from(folderInput.files).filter(f => f.type.startsWith("video"));

    if (!list.length) {
      setStatus("Pasta sem vídeos.");
      return;
    }

    state.files = list;
    setStatus("Carregando vídeos...");

    initializePanels();
  };

  playPauseBtn.onclick = togglePlayPause;
  reloadBtn.onclick = initializePanels;

})();
