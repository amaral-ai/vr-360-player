// ======================================================
// VR COMPONENTS
// ======================================================
(function () {

  const VR360 = window.VR360 || {};
  window.VR360 = VR360;

  // ------------------------------------------
  // ZOOM CONTROL
  // ------------------------------------------
  AFRAME.registerComponent("vr-zoom-controls", {
    init: function () {
      this.camera = document.querySelector("#camera");
      this.fov = 80;
      this.min = 40;
      this.max = 110;

      document.querySelector("#zoomInBtn").onclick = () => this.adjust(-5);
      document.querySelector("#zoomOutBtn").onclick = () => this.adjust(5);
    },

    adjust: function (delta) {
      this.fov = Math.min(this.max, Math.max(this.min, this.fov + delta));
      this.camera.setAttribute("camera", "fov", this.fov);
    }
  });

  // ------------------------------------------
  // AUDIO MANAGER (som só do painel central)
  // ------------------------------------------
  AFRAME.registerComponent("audio-focus-manager", {

    init: function () {
      this.camera = document.querySelector("#camera");
      this.angles = [0, 60, 120, 180, 240, 300];
      this.current = -1;
    },

    tick: function () {
      if (!VR360.panelVideos) return;

      let yaw = this.camera.getAttribute("rotation").y;
      yaw = (yaw % 360 + 360) % 360;

      let best = 0, bestDiff = 999;

      for (let i = 0; i < 6; i++) {
        let diff = Math.abs((((yaw - this.angles[i]) % 360) + 540) % 360 - 180);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = i;
        }
      }

      if (best !== this.current) {
        this.current = best;
        this.updateAudio();
      }
    },

    updateAudio: function () {
      VR360.panelVideos.forEach((v, i) => {
        if (!v) return;
        v.muted = i !== this.current;
      });
    }
  });

})();
