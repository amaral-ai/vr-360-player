// ==============================================
// videos.js — versão ORIGINAL preservada + highlight
// ==============================================

// Lista de vídeos e paineis
let videos = [
    document.getElementById("video0"),
    document.getElementById("video1"),
    document.getElementById("video2"),
    document.getElementById("video3"),
    document.getElementById("video4"),
    document.getElementById("video5")
];

let panels = [
    document.getElementById("panel-0"),
    document.getElementById("panel-1"),
    document.getElementById("panel-2"),
    document.getElementById("panel-3"),
    document.getElementById("panel-4"),
    document.getElementById("panel-5")
];

let folderHandle = null;
let videoFiles = [];

// ==============================================
// Seleção da pasta (ORIGINAL PRESERVADO)
// ==============================================
document.getElementById("selectFolderBtn").onclick = async () => {
    folderHandle = await window.showDirectoryPicker();
    videoFiles = [];

    for await (const entry of folderHandle.values()) {
        if (entry.kind === "file" && entry.name.match(/\.(mp4|webm|mov)$/i)) {
            videoFiles.push(entry);
        }
    }

    if (videoFiles.length === 0) {
        document.getElementById("info").innerText = "Nenhum vídeo encontrado.";
        return;
    }

    document.getElementById("info").innerText = "Vídeos carregados.";
    initializeVideos();
};

// ==============================================
// Inicialização dos vídeos (ORIGINAL PRESERVADO)
// ==============================================
async function initializeVideos() {
    for (let i = 0; i < videos.length; i++) {
        await loadRandomVideo(i);
    }

    updateAudioFocus();
}

// ==============================================
// Carregar vídeo aleatório (ORIGINAL PRESERVADO)
// ==============================================
async function loadRandomVideo(index) {
    if (!videoFiles.length) return;

    const entry = videoFiles[Math.floor(Math.random() * videoFiles.length)];
    const file = await entry.getFile();
    const url = URL.createObjectURL(file);

    const videoEl = videos[index];
    const panel = panels[index];

    videoEl.src = url;
    videoEl.loop = false;

    videoEl.onloadeddata = () => {
        panel.setAttribute("material", {
            shader: "flat",
            src: `#video${index}`,
            transparent: false,
            opacity: 1
        });
    };

    videoEl.onended = () => loadRandomVideo(index);

    try {
        await videoEl.play();
    } catch (_) {
        console.log("Autoplay bloqueado até interação");
    }
}

// ==============================================
// Botões Play / Pause (ORIGINAL PRESERVADO)
// ==============================================
document.getElementById("playBtn").onclick = () => {
    videos.forEach(v => v.play().catch(()=>{}));
};

document.getElementById("pauseBtn").onclick = () => {
    videos.forEach(v => v.pause());
};

// ==============================================
// Áudio inteligente baseado no ângulo (ORIGINAL)
// ==============================================
function updateAudioFocus() {
    const cam = document.querySelector("#camera").object3D;

    const camDir = new THREE.Vector3();
    cam.getWorldDirection(camDir);

    // Correção para desktop
    if (!AFRAME.utils.device.isMobile()) camDir.multiplyScalar(-1);

    let bestIndex = 0;
    let bestDot = -999;

    panels.forEach((panel, i) => {
        const pDir = new THREE.Vector3();
        panel.object3D.getWorldDirection(pDir);
        pDir.multiplyScalar(-1);

        const dot = camDir.dot(pDir);

        if (dot > bestDot) {
            bestDot = dot;
            bestIndex = i;
        }
    });

    videos.forEach((v, i) => v.muted = i !== bestIndex);

    highlightPanel(bestIndex);

    requestAnimationFrame(updateAudioFocus);
}

// ==============================================
// COMPONENTE highlight-border (NOVO — único acréscimo)
// ==============================================
AFRAME.registerComponent("highlight-border", {
    schema: { active: { default: false } },

    init: function () {
        const w = parseFloat(this.el.getAttribute("width"));
        const h = parseFloat(this.el.getAttribute("height"));

        // cria borda como a-plane (SEM THREE.js)
        this.border = document.createElement("a-plane");
        this.border.setAttribute("width", w + 0.10);
        this.border.setAttribute("height", h + 0.10);
        this.border.setAttribute("color", "red");
        this.border.setAttribute("position", "0 0 -0.02");
        this.border.setAttribute("visible", "false");

        this.el.appendChild(this.border);
    },

    update: function () {
        this.border.setAttribute("visible", this.data.active);
    }
});

// ==============================================
// Destacar painel ativo (MODIFICADO com highlight seguro)
// ==============================================
function highlightPanel(activeIndex) {
    panels.forEach((panel, i) => {
        panel.setAttribute("highlight-border", "active: " + (i === activeIndex));
    });
}
