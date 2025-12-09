// ======================================================================
// videos.js — VR 360 Dynamic Video Loader
// ======================================================================

(function () {

  const VR360 = (window.VR360 = window.VR360 || {});

  const state = {
    files: [],
    isPlaying: false
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

  VR360.panelVideos = [];

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function randomLocalFile() {
    return state.files[Math.floor(Math.random() * state.files.length)];
  }

  function createVideoElement(id) {
    const v = document.createElement("video");
    v.id = id;
    v.className = "hidden-video";
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.muted = true;
    v.preload = "auto";
    assets.appendChild(v);
    return v;
  }

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

    vid.onloadeddata = () => {
      const entity = planes[panelIndex];
      entity.setAttribute("material", "src", `#${vid.id}`);

      vid.play().then(() => {
        console.log("🎬 Vídeo local tocando:", vid.id);
      }).catch(err => {
        console.warn("⚠️ Autoplay bloqueado (local):", vid.id, err);
      });
    };

    vid.onended = () => loadLocalVideoInto(panelIndex);

    vid.load();
  }

  function initializeLocalPanels() {
    VR360.panelVideos = [];

    for (let i = 0; i < 6; i++) {
      let vid = createVideoElement(`panel-video-${i}`);
      VR360.panelVideos.push(vid);
    }

    for (let i = 0; i < 6; i++) {
      loadLocalVideoInto(i);
    }

    setStatus("Vídeos carregados.");
    playPauseBtn.disabled = false;
    reloadBtn.disabled = false;
  }

  function togglePlayPause() {
    state.isPlaying = !state.isPlaying;

    VR360.panelVideos.forEach(v => {
      if (!v) return;
      if (state.isPlaying) {
        v.play().catch(()=>{});
      } else {
        v.pause();
      }
    });

    playPauseBtn.textContent = state.isPlaying ? "Pause" : "Play";
  }

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
// 🔧 MODO TEMPORÁRIO PARA TESTE NO GITHUB PAGES — VÍDEOS REMOTOS
// ======================================================================
(function () {

  const TESTAR_VIDEOS_REMOTOS = true;

  if (!TESTAR_VIDEOS_REMOTOS) return;

  console.warn("🔧 Modo de teste com vídeos remotos ATIVADO.");

  const REMOTE_VIDEOS = [
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4",
  
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4",
  
    "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
    "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_5MB.mp4",
    "https://test-videos.co.uk/vids/sintel/mp4/h264/1080/Sintel_1080_10s_1MB.mp4",
  
    "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",
    "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_5MB.mp4",
    "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4"
  ];


  function randomRemote() {
    return REMOTE_VIDEOS[Math.floor(Math.random() * REMOTE_VIDEOS.length)];
  }

  window.addEventListener("load", () => {

    console.log("🔧 Inicializando vídeos remotos…");

    // Cria 6 vídeos invisíveis
    if (!window.VR360) return;
    VR360.panelVideos = [];
    const assets = document.querySelector("#assets");

    for (let i = 0; i < 6; i++) {
      const vid = document.createElement("video");
      vid.id = `remote-video-${i}`;
      vid.className = "hidden-video";
      vid.setAttribute("playsinline", "");
      vid.setAttribute("webkit-playsinline", "");
      vid.muted = true;
      vid.preload = "auto";
      assets.appendChild(vid);
      VR360.panelVideos.push(vid);
    }

    VR360.panelEntities.forEach((entity, index) => {
      const vid = VR360.panelVideos[index];
      const url = randomRemote();

      vid.src = url;
      vid.load();

      vid.onloadeddata = () => {
        entity.setAttribute("material", "src", `#${vid.id}`);

        vid.play().then(() => {
          console.log("🎬 Vídeo remoto tocando:", url);
        }).catch(err => {
          console.warn("⚠️ Autoplay bloqueado (remoto):", url, err);
        });
      };

      vid.onended = () => {
        const newUrl = randomRemote();
        vid.src = newUrl;
        vid.load();
      };
    });

    console.log("🔧 Vídeos remotos carregados nos painéis.");

  });

})();
