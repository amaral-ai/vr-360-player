// =========================
// vr.js
// =========================
/**
 * - Controle de áudio: apenas o painel mais central à visão reproduz som.
 * - Zoom vertical (ajuste de FOV da câmera).
 * - Integração com giroscópio: usa rotação da câmera A-Frame.
 * - Modo VR é fornecido pelo próprio A-Frame (WebXR).
 */

(function () {
  const VR360 = (window.VR360 = window.VR360 || {});
  const PANEL_COUNT = 6;

  // Guarda referência à câmera
  let cameraEl = null;
  function getCameraEl() {
    if (!cameraEl) {
      cameraEl = document.querySelector("#camera");
    }
    return cameraEl;
  }

  // =========================
  // Componente A-Frame: audio-focus-manager
  // =========================
  AFRAME.registerComponent("audio-focus-manager", {
    init: function () {
      this.cameraEl = getCameraEl();
      // Ângulos centrais correspondentes a cada painel (0,60,...,300 graus)
      this.panelAngles = [0, 60, 120, 180, 240, 300];
      this.currentPanelIndex = null;
      this.panelVideos = VR360.panelVideos || [];

      // Por padrão, todos mute (somente o mais central será desmutado)
      this.panelVideos.forEach((v) => {
        if (v) v.muted = true;
      });
    },

    tick: function () {
      if (!this.cameraEl || !this.panelVideos.length) return;

      const rot = this.cameraEl.getAttribute("rotation");
      if (!rot) return;

      let yaw = rot.y || 0; // graus
      // Normaliza 0–360
      yaw = ((yaw % 360) + 360) % 360;

      // Descobre o painel cujo ângulo central é o mais próximo
      let bestIndex = 0;
      let bestDiff = 999;

      for (let i = 0; i < this.panelAngles.length; i++) {
        const panelAngle = this.panelAngles[i];

        // Distância angular mínima (modo 360)
        let diff = ((yaw - panelAngle + 540) % 360) - 180;
        diff = Math.abs(diff);

        if (diff < bestDiff) {
          bestDiff = diff;
          bestIndex = i;
        }
      }

      if (bestIndex !== this.currentPanelIndex) {
        this.currentPanelIndex = bestIndex;
        this.updateAudioFocus();
      }
    },

    updateAudioFocus: function () {
      const state = VR360.state || { isPlaying: false };

      this.panelVideos = VR360.panelVideos || [];
      this.panelVideos.forEach((videoEl, idx) => {
        if (!videoEl) return;

        // Som apenas no painel mais central
        videoEl.muted = idx !== this.currentPanelIndex;

        // Garante que o vídeo central esteja tocando se o global estiver em "Play"
        if (idx === this.currentPanelIndex && state.isPlaying && videoEl.paused) {
          videoEl
            .play()
            .catch((err) =>
              console.warn("Erro ao tocar vídeo do painel central:", err)
            );
        }
      });
    },
  });

  // =========================
  // Componente A-Frame: vr-zoom-controls
  // =========================
  AFRAME.registerComponent("vr-zoom-controls", {
    init: function () {
      this.cameraEl = getCameraEl();
      this.minFov = 40; // mais "zoom in"
      this.maxFov = 100; // mais "zoom out"
      this.currentFov = 80;

      const zoomInBtn = document.getElementById("zoomInBtn");
      const zoomOutBtn = document.getElementById("zoomOutBtn");

      if (zoomInBtn) {
        zoomInBtn.addEventListener("click", () => {
          this.adjustFov(-5);
        });
      }

      if (zoomOutBtn) {
        zoomOutBtn.addEventListener("click", () => {
          this.adjustFov(5);
        });
      }
    },

    adjustFov: function (delta) {
      if (!this.cameraEl) return;

      this.currentFov = this.currentFov + delta;
      if (this.currentFov < this.minFov) this.currentFov = this.minFov;
      if (this.currentFov > this.maxFov) this.currentFov = this.maxFov;

      this.cameraEl.setAttribute("camera", "fov", this.currentFov);
    },
  });

  // =========================
  // Helper opcional: entrar no modo VR via código
  // =========================
  VR360.enterVR = function () {
    const scene = document.querySelector("a-scene");
    if (scene && scene.enterVR) {
      scene.enterVR();
    }
  };

  window.VR360 = VR360;
})();
