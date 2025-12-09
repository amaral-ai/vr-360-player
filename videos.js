
// =========================
// videos.js
// =========================
/**
 * videos.js
 * - Gerencia seleção de pasta, randomizador e carregamento dos vídeos.
 * - Cada painel recebe um vídeo aleatório da pasta.
 * - Quando um vídeo termina, outro aleatório ocupa o painel.
 * - Integra com VR (play/pause global, etc.) via objeto global window.VR360.
 */

window.VR360 = window.VR360 || {};

(function () {
  const state = {
    videoFiles: [],
    currentPlayIndexByPanel: new Array(6).fill(null),
    isPlaying: false,
    lastFolderLabel: null,
  };

  const folderInput = document.getElementById("folderInput");
  const folderLabel = document.getElementById("folderLabel");
  const statusEl = document.getElementById("status");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const reloadBtn = document.getElementById("reloadBtn");

  const PANEL_COUNT = 6;
  const PANEL_VIDEO_IDS = Array.from({ length: PANEL_COUNT }).map(
    (_, i) => `panel-video-${i}`
  );

  const panelVideos = PANEL_VIDEO_IDS.map((id) =>
    document.getElementById(id)
  );

  // Expor no namespace global para outros scripts (vr.js)
  window.VR360.panelVideos = panelVideos;
  window.VR360.state = state;

  // Utilitário: embaralhar array (Fisher-Yates)
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Atualiza texto de status
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // Seleciona um arquivo aleatório
  function getRandomFileIndex() {
    if (!state.videoFiles.length) return null;
    const idx = Math.floor(Math.random() * state.videoFiles.length);
    return idx;
  }

  // Associa um vídeo aleatório a um painel específico
  function assignRandomVideoToPanel(panelIndex) {
    const fileIndex = getRandomFileIndex();
    if (fileIndex === null) {
      console.warn("Nenhum arquivo de vídeo para atribuir.");
      return;
    }

    const file = state.videoFiles[fileIndex];
    const videoEl = panelVideos[panelIndex];
    if (!videoEl) return;

    // Limpa src anterior
    try {
      videoEl.pause();
    } catch (e) {}

    // Cria URL temporário para o arquivo
    const objectUrl = URL.createObjectURL(file);
    videoEl.src = objectUrl;
    videoEl.load();

    // Marca qual índice está tocando neste painel
    state.currentPlayIndexByPanel[panelIndex] = fileIndex;

    // Se experiência estiver em modo "Play", já inicia o vídeo
    if (state.isPlaying) {
      // Para mobile, garantir play depois de toque do usuário
      videoEl
        .play()
        .catch((err) => console.warn("Erro ao dar play no painel", panelIndex, err));
    }
  }

  // Carrega 6 vídeos aleatórios
  function assignInitialVideos() {
    if (!state.videoFiles.length) {
      setStatus("Nenhum vídeo válido encontrado na pasta.");
      return;
    }

    shuffleArray(state.videoFiles);

    for (let i = 0; i < PANEL_COUNT; i++) {
      assignRandomVideoToPanel(i);
    }

    setStatus(
      `Carregados ${Math.min(
        PANEL_COUNT,
        state.videoFiles.length
      )} painéis a partir de ${
        state.videoFiles.length
      } vídeos na pasta selecionada.`
    );
  }

  // Handler de término de vídeo: carrega outro aleatório no mesmo painel
  function setupEndedHandlers() {
    panelVideos.forEach((videoEl, index) => {
      videoEl.addEventListener("ended", () => {
        assignRandomVideoToPanel(index);
      });
    });
  }

  // Play/Pause global da experiência
  function setGlobalPlayState(shouldPlay) {
    state.isPlaying = shouldPlay;

    panelVideos.forEach((videoEl) => {
      if (!videoEl.src) return;

      if (shouldPlay) {
        videoEl
          .play()
          .catch((err) =>
            console.warn("Erro ao dar play global em um vídeo:", err)
          );
      } else {
        try {
          videoEl.pause();
        } catch (e) {}
      }
    });

    playPauseBtn.textContent = shouldPlay ? "Pause" : "Play";
  }

  // Tratamento da seleção de pasta (via <input webkitdirectory>)
  function handleFolderSelection(evt) {
    const files = Array.from(evt.target.files || []);
    const videoFiles = files.filter((f) =>
      f.type.startsWith("video/")
    );

    if (!videoFiles.length) {
      setStatus("Nenhum arquivo de vídeo encontrado na pasta.");
      state.videoFiles = [];
      return;
    }

    state.videoFiles = videoFiles;
    state.lastFolderLabel = extractFolderNameFromFiles(videoFiles);
    if (state.lastFolderLabel) {
      folderLabel.textContent = `Pasta: ${state.lastFolderLabel} (trocar)`;
    }

    assignInitialVideos();
  }

  // "Nome" aproximado da pasta, a partir do primeiro arquivo
  function extractFolderNameFromFiles(videoFiles) {
    if (!videoFiles.length) return null;

    const first = videoFiles[0];
    if (!first.webkitRelativePath) return null;

    const parts = first.webkitRelativePath.split("/");
    if (parts.length <= 1) return null;

    return parts[0] || null;
  }

  // Recarregar pasta: reusar mesma seleção (o navegador devolve os mesmos arquivos)
  // Na prática, o usuário pode precisar selecionar novamente se o navegador não mantiver a lista.
  function reloadCurrentFolder() {
    if (!state.videoFiles.length) {
      setStatus("Nenhuma pasta para recarregar. Selecione uma pasta primeiro.");
      return;
    }

    // Apenas refaz atribuição inicial (mantendo lista já carregada)
    assignInitialVideos();
  }

  // Eventos de UI
  if (folderLabel && folderInput) {
    folderLabel.addEventListener("click", () => {
      folderInput.click();
    });
  }

  if (folderInput) {
    folderInput.addEventListener("change", handleFolderSelection);
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      setGlobalPlayState(!state.isPlaying);
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      reloadCurrentFolder();
    });
  }

  // Expor função de play/pause global para outros scripts (por segurança)
  window.VR360.setGlobalPlayState = setGlobalPlayState;

  // Instala listeners de "ended" logo no carregamento
  setupEndedHandlers();

  // Status inicial
  setStatus("Selecione uma pasta com vídeos (até 6 serão exibidos ao mesmo tempo).");
})();

