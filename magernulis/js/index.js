// ==========================================
// WriteOnAir Studio Pro - Engine Core
// ==========================================

// State Management: Multi-Page, Organic Humanizer, & Typography State
let pagesData = [
    {
        id: 1,
        title: "Halaman 1",
        topic: "Pengantar Algoritma & Pemrograman",
        name: "Ahmad Nur Fadhil",
        nim: "22041110015",
        date: "Rabu, 16 Sep 2026",
        question: "1. Apa itu Algoritma?\n2. Karakteristik utama Knuth\n3. Contoh kompleksitas O(N)",
        note: "Algoritma adalah urutan langkah logis yang terstruktur untuk memecahkan masalah.\n\nKarakteristik (Donald Knuth):\n- Input & Output jelas\n- Finiteness (ada batas selesai)\n- Definiteness (langkah pasti terdefinisi)\n- Effectiveness (langkah efektif)",
        summary: "Algoritma merupakan dasar pemrograman. Kunci utama adalah efisiensi waktu pemrosesan dan penggunaan memori."
    }
];

let activePageIndex = 0;
let currentZoom = 1.0;
let humanizerLevel = 2; // 0: Clean, 1: Subtle, 2: Natural, 3: Wild Random
let humanizerSeed = 42;
let currentFontFamily = "'Just Me Again Down Here', cursive";
let documentTitle = "Catatan Algoritma & Pemrograman";
let currentPaperType = "plain";
let currentInkColor = "black";
let currentScanEffect = "none";
let currentDeskBackdrop = "grid";

// DOM Elements - Paper Container & Canvas
const cnNode = document.getElementById("cn");
const canvasWrapper = document.getElementById("canvas-wrapper");
const toastElement = document.getElementById("toast");

// DOM Elements - Text Inputs
const topicInput = document.getElementById("topic-input");
const nameInput = document.getElementById("name-input");
const nimInput = document.getElementById("nim-input");
const dateInput = document.getElementById("date-input");
const questionInput = document.getElementById("question-input");
const noteInput = document.getElementById("note-input");
const summaryInput = document.getElementById("summary-input");
const pageTitleInput = document.getElementById("page-title-input");
const docTitleInput = document.getElementById("doc-title-input");

// DOM Elements - Handwritten Targets on Canvas
const topicElement = document.getElementById("topic");
const nameElement = document.getElementById("name");
const nimElement = document.getElementById("nim");
const dateElement = document.getElementById("date");
const questionElement = document.getElementById("question");
const noteElement = document.getElementById("note");
const summaryElement = document.getElementById("summary");

// ------------------------------------------
// Canva Layout Rail & Drawer Tab Switcher
// ------------------------------------------
const switchRailTab = (tabName) => {
    // 1. Update active state on rail buttons
    document.querySelectorAll(".canva-icon-rail .rail-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.rail === tabName);
    });

    // 2. Update Drawer Title
    const titles = {
        content: "Pengisian Teks Catatan",
        style: "Gaya Kertas & Pulpen",
        humanizer: "Imperfeksi Tulisan Tangan",
        typography: "Font & Tipografi Canvas",
        pages: "Kelola Lembar Kertas"
    };
    const drawerTitle = document.getElementById("drawer-title");
    if (drawerTitle && titles[tabName]) {
        drawerTitle.textContent = titles[tabName];
    }

    // 3. Update Drawer Panes
    document.querySelectorAll(".drawer-content .drawer-pane").forEach(pane => {
        pane.classList.toggle("active", pane.id === `pane-${tabName}`);
    });

    // 4. Expand drawer if it was collapsed
    const drawer = document.getElementById("canva-drawer");
    if (drawer) {
        drawer.classList.remove("collapsed");
    }
};

const toggleDrawerCollapse = () => {
    const drawer = document.getElementById("canva-drawer");
    if (drawer) {
        drawer.classList.toggle("collapsed");
    }
};

const updateDocumentTitle = (title) => {
    documentTitle = title || "Catatan WriteOnAir";
};

// ------------------------------------------
// Typography & Font Selector Handler
// ------------------------------------------
const fontOption = (value) => {
    currentFontFamily = value;
    if (cnNode) {
        cnNode.style.setProperty("--canvas-font-family", value);
    }
    const handwrittenElements = document.querySelectorAll(".handwritten, .hw-word");
    handwrittenElements.forEach(el => {
        el.style.fontFamily = value;
    });
};

const fontSizeOption = (value) => {
    if (cnNode) cnNode.style.setProperty("--canvas-font-size", value);
    const displayVal = document.getElementById("font-size-val");
    if (displayVal) displayVal.textContent = value;
};

const lineHeightOption = (value) => {
    if (cnNode) cnNode.style.setProperty("--canvas-line-height", value);
    const displayVal = document.getElementById("line-height-val");
    if (displayVal) displayVal.textContent = value;
};

// ------------------------------------------
// Organic Humanizer Text Renderer Engine
// ------------------------------------------
function pseudoRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const renderHumanizedText = (element, text) => {
    if (!element) return;
    if (!text) {
        element.innerHTML = "";
        return;
    }

    if (humanizerLevel === 0) {
        element.textContent = text;
        element.style.fontFamily = currentFontFamily;
        return;
    }

    const lines = text.split("\n");
    let globalWordIdx = 0;
    
    let htmlOutput = lines.map((line) => {
        if (line.trim() === "") return "<br/>";
        
        const words = line.split(" ");
        const wordsHTML = words.map(word => {
            globalWordIdx++;
            if (word.trim() === "") return "";

            let maxRot = 3.2;
            let maxShift = 1.8;

            if (humanizerLevel === 1) {
                maxRot = 1.5;
                maxShift = 0.8;
            } else if (humanizerLevel === 3) {
                maxRot = 6.0;
                maxShift = 3.5;
            }

            const rand1 = pseudoRandom(humanizerSeed + globalWordIdx * 17);
            const rand2 = pseudoRandom(humanizerSeed + globalWordIdx * 31 + 5);

            const rot = ((rand1 - 0.5) * 2 * maxRot).toFixed(1);
            const transY = ((rand2 - 0.5) * 2 * maxShift).toFixed(1);

            return `<span class="hw-word" style="font-family: ${currentFontFamily}; transform: rotate(${rot}deg) translateY(${transY}px);">${escapeHTML(word)}</span>`;
        }).join(" ");

        return wordsHTML;
    }).join("<br/>");

    element.innerHTML = htmlOutput;
    element.style.fontFamily = currentFontFamily;
};

const escapeHTML = (str) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ------------------------------------------
// Real-time Input Sync & Canvas Refresh
// ------------------------------------------
const bindInputSync = (inputEl, targetEl, dataKey) => {
    if (!inputEl || !targetEl) return;
    inputEl.addEventListener("input", function () {
        const val = this.value;
        renderHumanizedText(targetEl, val);
        if (pagesData[activePageIndex]) {
            pagesData[activePageIndex][dataKey] = val;
        }
    });
};

const refreshCanvasRendering = () => {
    const page = pagesData[activePageIndex] || {};
    renderHumanizedText(topicElement, page.topic || "");
    renderHumanizedText(nameElement, page.name || "");
    renderHumanizedText(nimElement, page.nim || "");
    renderHumanizedText(dateElement, page.date || "");
    renderHumanizedText(questionElement, page.question || "");
    renderHumanizedText(noteElement, page.note || "");
    renderHumanizedText(summaryElement, page.summary || "");

    fontOption(currentFontFamily);
};

// ------------------------------------------
// Gacha Humanizer Randomizer Actions
// ------------------------------------------
const randomizeHumanizer = () => {
    humanizerSeed = Math.floor(Math.random() * 100000);
    refreshCanvasRendering();
    showToast("Gacha Berhasil! Kemiringan & posisi kata diacak seperti tulisan tangan manusia.");
};

const setHumanizerLevel = (level) => {
    humanizerLevel = parseInt(level);
    const label = document.getElementById("humanizer-level-val");
    if (label) {
        const levelNames = [
            "0 - Rapi (Komputer)",
            "1 - Halus (Subtle)",
            "2 - Natural (Default)",
            "3 - Acak / Becek (Wild)"
        ];
        label.textContent = levelNames[humanizerLevel] || "Natural";
    }
    refreshCanvasRendering();
};

// ------------------------------------------
// Multi-Page Management & Custom Page Title
// ------------------------------------------
const toggleHeaderVisibility = (visible) => {
    if (pagesData[activePageIndex]) {
        pagesData[activePageIndex].showHeader = visible;
    }
    if (cnNode) {
        cnNode.classList.toggle("no-header", !visible);
    }
};

const updateCurrentPageTitle = (title) => {
    if (pagesData[activePageIndex]) {
        pagesData[activePageIndex].title = title || `Halaman ${activePageIndex + 1}`;
        document.getElementById("current-page-title").textContent = pagesData[activePageIndex].title;
        renderPagePillsAndList();
    }
};

const loadPageDataIntoForm = (index) => {
    if (index < 0 || index >= pagesData.length) return;
    const page = pagesData[index];
    
    topicInput.value = page.topic || "";
    nameInput.value = page.name || "";
    nimInput.value = page.nim || "";
    dateInput.value = page.date || "";
    questionInput.value = page.question || "";
    noteInput.value = page.note || "";
    summaryInput.value = page.summary || "";
    
    const showHeaderInput = document.getElementById("show-header-input");
    const isHeaderVisible = page.showHeader !== undefined ? page.showHeader : (index === 0);
    if (showHeaderInput) {
        showHeaderInput.checked = isHeaderVisible;
    }
    if (cnNode) {
        cnNode.classList.toggle("no-header", !isHeaderVisible);
    }

    if (pageTitleInput) {
        pageTitleInput.value = page.title || `Halaman ${index + 1}`;
    }

    refreshCanvasRendering();

    // Update UI Page Indicators
    const titleText = page.title || `Halaman ${index + 1}`;
    document.getElementById("current-page-title").textContent = titleText;
    document.getElementById("current-page-num").textContent = index + 1;
    document.getElementById("total-page-num").textContent = pagesData.length;

    const pageCountBadge = document.getElementById("page-count-badge");
    if (pageCountBadge) pageCountBadge.textContent = pagesData.length;

    renderPagePillsAndList();
};

const switchPage = (index) => {
    saveCurrentFormToState();
    activePageIndex = index;
    loadPageDataIntoForm(activePageIndex);
};

const saveCurrentFormToState = () => {
    if (pagesData[activePageIndex]) {
        pagesData[activePageIndex].topic = topicInput.value;
        pagesData[activePageIndex].name = nameInput.value;
        pagesData[activePageIndex].nim = nimInput.value;
        pagesData[activePageIndex].date = dateInput.value;
        pagesData[activePageIndex].question = questionInput.value;
        pagesData[activePageIndex].note = noteInput.value;
        pagesData[activePageIndex].summary = summaryInput.value;
        const showHeaderInput = document.getElementById("show-header-input");
        if (showHeaderInput) {
            pagesData[activePageIndex].showHeader = showHeaderInput.checked;
        }
        if (pageTitleInput) {
            pagesData[activePageIndex].title = pageTitleInput.value || `Halaman ${activePageIndex + 1}`;
        }
    }
};

const addNewPage = () => {
    saveCurrentFormToState();
    const lastPage = pagesData[pagesData.length - 1] || {};
    const newPageObj = {
        id: pagesData.length + 1,
        title: `Halaman ${pagesData.length + 1}`,
        topic: lastPage.topic || "",
        name: lastPage.name || "",
        nim: lastPage.nim || "",
        date: lastPage.date || "",
        question: "",
        note: "",
        summary: "",
        showHeader: false // Page 2+ defaults to no header (matching Page 2 CornellNote.pdf template)
    };

    pagesData.push(newPageObj);
    activePageIndex = pagesData.length - 1;
    loadPageDataIntoForm(activePageIndex);
    showToast(`Lembar Kertas #${pagesData.length} (Halaman Lanjutan) ditambahkan!`);
};

const deleteCurrentPage = async () => {
    if (pagesData.length <= 1) {
        showToast("Minimal harus ada 1 lembar kertas.");
        return;
    }

    const confirmed = await showCustomConfirm(
        "Hapus Lembar Kertas",
        `Apakah Anda yakin ingin menghapus ${pagesData[activePageIndex].title || 'halaman ini'}?`
    );

    if (confirmed) {
        pagesData.splice(activePageIndex, 1);
        activePageIndex = Math.max(0, activePageIndex - 1);
        loadPageDataIntoForm(activePageIndex);
        showToast("Lembar kertas berhasil dihapus.");
    }
};

const renderPagePillsAndList = () => {
    const pillsContainer = document.getElementById("preview-page-pills");
    if (pillsContainer) {
        pillsContainer.innerHTML = pagesData.map((page, idx) => `
            <button type="button" class="page-pill ${idx === activePageIndex ? 'active' : ''}" onclick="switchPage(${idx})">
                ${escapeHTML(page.title || `Hal ${idx + 1}`)}
            </button>
        `).join("");
    }

    const listContainer = document.getElementById("pages-list-container");
    if (listContainer) {
        listContainer.innerHTML = pagesData.map((page, idx) => `
            <div class="page-item ${idx === activePageIndex ? 'active' : ''}" onclick="switchPage(${idx})">
                <div class="page-item-info">
                    <span>📄</span> ${escapeHTML(page.title || `Halaman ${idx + 1}`)} ${page.topic ? `- ${escapeHTML(page.topic.substring(0, 14))}...` : ''}
                </div>
                ${idx === activePageIndex ? '<span style="font-size: 0.75rem; font-weight:700; color: var(--canva-purple)">Aktif</span>' : ''}
            </div>
        `).join("");
    }

    const btnDelete = document.getElementById("btn-delete-page");
    if (btnDelete) {
        btnDelete.style.display = pagesData.length > 1 ? "flex" : "none";
    }
};

// ------------------------------------------
// Export Dropdown Toggle & Outside Click
// ------------------------------------------
const toggleExportMenu = () => {
    const menu = document.getElementById("export-menu");
    const dropdown = document.getElementById("export-dropdown");
    if (menu && dropdown) {
        menu.classList.toggle("hidden");
        dropdown.classList.toggle("open");
    }
};

document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("export-dropdown");
    const menu = document.getElementById("export-menu");
    if (dropdown && menu && !dropdown.contains(e.target)) {
        menu.classList.add("hidden");
        dropdown.classList.remove("open");
    }
});

// ------------------------------------------
// Theme Switcher (Dark / Light Mode)
// ------------------------------------------
const toggleTheme = () => {
    const currentTheme = document.body.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);

    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
        if (newTheme === "light") {
            themeToggleBtn.innerHTML = `
                <svg class="icon-svg-sm theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                <span class="theme-text">Light</span>`;
        } else {
            themeToggleBtn.innerHTML = `
                <svg class="icon-svg-sm theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                <span class="theme-text">Dark</span>`;
        }
    }

    localStorage.setItem("writeonair_theme", newTheme);
    showToast(`Mode Studio diubah ke ${newTheme.toUpperCase()}`);
};

// ------------------------------------------
// Paper, Ink, Desk Backdrop & Scanner Handlers
// ------------------------------------------
const setPaperType = (type) => {
    currentPaperType = type;
    if (cnNode) {
        cnNode.classList.remove("paper-folio", "paper-grid", "paper-vintage", "paper-plain");
        cnNode.classList.add(`paper-${type}`);
    }
    document.querySelectorAll(".paper-opt").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.paper === type);
    });
};

const setInkColor = (color) => {
    currentInkColor = color;
    if (cnNode) {
        cnNode.classList.remove("ink-blue", "ink-black", "ink-navy", "ink-red");
        cnNode.classList.add(`ink-${color}`);
    }
    document.querySelectorAll(".ink-opt").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.ink === color);
    });
};

const setScanEffect = (effect) => {
    currentScanEffect = effect;
    if (cnNode) {
        cnNode.classList.remove("scan-none", "scan-clean", "scan-shadow", "scan-warm", "scan-photocopy");
        cnNode.classList.add(`scan-${effect}`);
    }
};

const setDeskBackdrop = (deskType) => {
    currentDeskBackdrop = deskType;
    const viewport = document.getElementById("viewport");
    if (viewport) {
        viewport.classList.remove("backdrop-wood", "backdrop-studio");
        if (deskType !== "grid") {
            viewport.classList.add(`backdrop-${deskType}`);
        }
    }
    document.querySelectorAll(".desk-opt").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.desk === deskType);
    });
};

// ------------------------------------------
// Preset Templates Siap Pakai
// ------------------------------------------
const loadPresetTemplate = (presetKey) => {
    saveCurrentFormToState();
    const presets = {
        it: {
            title: "Catatan Algoritma & Pemrograman",
            topic: "Algoritma & Struktur Data",
            name: "Ahmad Nur Fadhil",
            nim: "22041110015",
            date: "Rabu, 16 Sep 2026",
            question: "1. Apa itu Algoritma?\n2. Ciri utama Knuth\n3. Kompleksitas Big-O",
            note: "Algoritma adalah langkah logis terstruktur untuk menyelesaikan masalah secara sistematis.\n\nKarakteristik Knuth:\n- Finiteness & Definiteness\n- Input & Output jelas\n- Effectiveness\n\nBig-O Notation:\nO(1) Constant, O(N) Linear, O(N log N) Quicksort/Mergesort.",
            summary: "Algoritma efisien menghemat waktu eksekusi dan ruang memori. Pilih struktur data array/linked-list sesuai kebutuhan akses data."
        },
        math: {
            title: "Catatan Kalkulus & Turunan",
            topic: "Kalkulus Lanjut: Turunan & Integrasi",
            name: "Ahmad Nur Fadhil",
            nim: "22041110015",
            date: "Kamis, 17 Sep 2026",
            question: "1. Aturan Rantai (Chain Rule)\n2. Turunan Fungsi Trigo\n3. Aplikasi Maksimum/Minimum",
            note: "Jika y = f(u) dan u = g(x), maka dy/dx = (dy/du) * (du/dx).\n\nTurunan Dasar:\n- d/dx (sin x) = cos x\n- d/dx (cos x) = -sin x\n- d/dx (x^n) = n * x^(n-1)\n\nTitik Stasioner terjadi saat f'(x) = 0.",
            summary: "Turunan mengukur laju perubahan instan. Aplikasi utama meliputi optimasi luas/volume maksimum dan analisis titik balik grafik fungsi."
        },
        history: {
            title: "Catatan Sejarah Indonesia",
            topic: "Sejarah Pergerakan Nasional",
            name: "Ahmad Nur Fadhil",
            nim: "22041110015",
            date: "Jumat, 18 Sep 2026",
            question: "1. Latar Belakang Budi Utomo (1908)\n2. Sumpah Pemuda 1928\n3. Tokoh Empat Serangkai",
            note: "Organisasi Modern Pertama:\nBudi Utomo didirikan 20 Mei 1908 oleh Dr. Soetomo & mahasiswa STOVIA.\n\nSumpah Pemuda (28 Okt 1928):\n1. Bertumpah darah satu: Indonesia\n2. Berbangsa satu: Indonesia\n3. Menjunjung bahasa persatuan: Bahasa Indonesia",
            summary: "Pergerakan nasional mengubah perjuangan kedaerahan menjadi perjuangan bersatu berbasis diplomasi, pendidikan, dan organisasi politik."
        },
        book: {
            title: "Resume Buku Atomic Habits",
            topic: "Ringkasan Buku: Atomic Habits (James Clear)",
            name: "Ahmad Nur Fadhil",
            nim: "22041110015",
            date: "Sabtu, 19 Sep 2026",
            question: "1. 4 Hukum Perubahan Perilaku\n2. 1% Better Every Day\n3. Identity-based Habits",
            note: "4 Law of Behavior Change:\n1. Make it Obvious (Petunjuk)\n2. Make it Attractive (Gairah)\n3. Make it Easy (Kemudahan)\n4. Make it Satisfying (Ganjaran)\n\nFokus pada Sistem, Bukan Hanya Hasil:\nPerubahan 1% setiap hari menghasilkan peningkatan 37x lipat dalam satu tahun.",
            summary: "Kunci membangun kebiasaan baik adalah membentuk identitas baru, menyederhanakan langkah awal (2-Minute Rule), dan konsistensi sistem."
        }
    };

    if (presets[presetKey]) {
        const p = presets[presetKey];
        pagesData[activePageIndex] = { ...pagesData[activePageIndex], ...p };
        loadPageDataIntoForm(activePageIndex);
        documentTitle = p.title;
        if (docTitleInput) docTitleInput.value = documentTitle;
        showToast(`Template "${p.topic}" berhasil diterapkan!`);
    }
};

// ------------------------------------------
// Project JSON Import & Export Engine
// ------------------------------------------
const exportProjectJSON = () => {
    saveCurrentFormToState();
    const menu = document.getElementById("export-menu");
    if (menu && !menu.classList.contains("hidden")) {
        toggleExportMenu();
    }

    const projectData = {
        app: "WriteOnAir",
        version: "2.0",
        createdAt: new Date().toISOString(),
        documentTitle: documentTitle || "Catatan WriteOnAir",
        fontFamily: currentFontFamily,
        humanizerLevel: humanizerLevel,
        humanizerSeed: humanizerSeed,
        paperType: currentPaperType,
        inkColor: currentInkColor,
        scanEffect: currentScanEffect,
        deskBackdrop: currentDeskBackdrop,
        activePageIndex: activePageIndex,
        pagesData: pagesData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchor = document.createElement("a");
    const sanitizeTitle = (documentTitle || "WriteOnAir").replace(/[^a-z0-9]/gi, '_');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `WriteOnAir-Project-${sanitizeTitle}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Draft Project (.json) berhasil diunduh!");
};

const triggerImportJSON = () => {
    const input = document.getElementById("import-json-input");
    if (input) {
        input.click();
    }
};

const importProjectJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.pagesData || !Array.isArray(data.pagesData)) {
                throw new Error("Format JSON tidak valid.");
            }

            pagesData = data.pagesData;
            documentTitle = data.documentTitle || "Catatan Import";
            if (docTitleInput) docTitleInput.value = documentTitle;

            if (data.fontFamily) {
                fontOption(data.fontFamily);
                const fontSelect = document.getElementById("font-select");
                if (fontSelect) fontSelect.value = data.fontFamily;
            }

            if (data.paperType) setPaperType(data.paperType);
            if (data.inkColor) setInkColor(data.inkColor);
            if (data.scanEffect) {
                setScanEffect(data.scanEffect);
                const scanSelect = document.getElementById("scan-effect");
                if (scanSelect) scanSelect.value = data.scanEffect;
            }
            if (data.deskBackdrop) setDeskBackdrop(data.deskBackdrop);
            if (data.humanizerLevel !== undefined) setHumanizerLevel(data.humanizerLevel);

            activePageIndex = Math.min(data.activePageIndex || 0, pagesData.length - 1);
            loadPageDataIntoForm(activePageIndex);

            showToast(`Project "${documentTitle}" berhasil dibuka! (${pagesData.length} Halaman)`);
        } catch (err) {
            console.error("Gagal membaca file JSON:", err);
            showToast("Gagal membaca berkas JSON. Format file tidak sesuai.");
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file);
};

// ------------------------------------------
// Canvas Zoom Scale & Slider Controls
// ------------------------------------------
const adjustZoom = (delta) => {
    currentZoom = Math.min(Math.max(0.3, currentZoom + delta), 1.5);
    applyZoom();
};

const setZoomFromSlider = (value) => {
    currentZoom = parseFloat(value) / 100;
    applyZoom();
};

const resetZoom = () => {
    currentZoom = 1.0;
    applyZoom();
};

const applyZoom = () => {
    if (canvasWrapper) {
        canvasWrapper.style.transform = `scale(${currentZoom.toFixed(2)})`;
    }
    const zoomDisplay = document.getElementById("zoom-value");
    if (zoomDisplay) {
        zoomDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
    }
    const zoomSlider = document.getElementById("zoom-range");
    if (zoomSlider) {
        zoomSlider.value = Math.round(currentZoom * 100);
    }
};

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            showToast("Gagal masuk ke mode Fullscreen.");
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};

// ------------------------------------------
// Helper Sample Data & Clear Form
// ------------------------------------------
const setAutoDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('id-ID', options);
    dateInput.value = formattedDate;
    dateInput.dispatchEvent(new Event("input"));
    showToast("Tanggal hari ini berhasil diisi!");
};

const loadSampleData = () => {
    pagesData = [
        {
            id: 1,
            title: "Halaman 1",
            topic: "Pengantar Algoritma & Pemrograman",
            name: "Ahmad Nur Fadhil",
            nim: "22041110015",
            date: "Rabu, 16 September 2026",
            question: "1. Apa definisi Algoritma?\n2. 5 Ciri Algoritma Knuth\n3. Pseudocode vs Flowchart\n4. Kompleksitas O(N)",
            note: "Algoritma adalah deretan instruksi yang jelas dan logis untuk menyelesaikan masalah tertentu.\n\n5 Ciri Algoritma (Donald Knuth):\n1. Input: Memiliki 0/lebih masukan.\n2. Output: Minimal 1 luaran hasil.\n3. Finiteness: Berhenti setelah n langkah.\n4. Definiteness: Langkah terdefinisi pasti.\n5. Effectiveness: Langkah efektif.",
            summary: "Algoritma yang baik harus efisien, terstruktur, dan memiliki kriteria keterbatasan (finiteness). Pemilihan algoritma menentukan performa aplikasi saat di-scale."
        }
    ];

    activePageIndex = 0;
    loadPageDataIntoForm(0);
    showToast("Contoh Catatan berhasil dimuat!");
};

const clearForm = async () => {
    const confirmed = await showCustomConfirm(
        "Bersihkan Catatan",
        "Apakah Anda yakin ingin mengosongkan isi catatan ini?"
    );

    if (confirmed) {
        [topicInput, nameInput, nimInput, dateInput, questionInput, noteInput, summaryInput].forEach(el => {
            if (el) {
                el.value = "";
                el.dispatchEvent(new Event('input'));
            }
        });
        showToast("Form berhasil dibersihkan.");
    }
};

// ------------------------------------------
// High-Precision Export Features (PNG & Direct PDF)
// ------------------------------------------

// 1. Download Current Page PNG
const downloadPNG = () => {
    saveCurrentFormToState();
    toggleExportMenu();
    showToast("Memproses PNG HD...");

    const sanitizeDocTitle = (documentTitle || "WriteOnAir").replace(/[^a-z0-9]/gi, '_');
    const sanitizePageTitle = (pagesData[activePageIndex].title || `Hal${activePageIndex + 1}`).replace(/[^a-z0-9]/gi, '_');
    const fileName = `WriteOnAir-${sanitizeDocTitle}-${sanitizePageTitle}.png`;

    const executeExport = () => {
        if (typeof html2canvas !== "undefined") {
            html2canvas(cnNode, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false
            }).then(canvas => {
                const dataUrl = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = fileName;
                link.href = dataUrl;
                link.click();
                showToast(`Halaman "${pagesData[activePageIndex].title}" berhasil diunduh!`);
            }).catch(err => {
                console.warn("html2canvas fallback:", err);
            });
        }
    };

    if (document.fonts) {
        document.fonts.ready.then(executeExport);
    } else {
        executeExport();
    }
};

// 2. Download All Pages PNG
const downloadAllPNG = async () => {
    saveCurrentFormToState();
    toggleExportMenu();
    showToast("Memproses unduhan seluruh halaman...");

    const prevActive = activePageIndex;
    const sanitizeDocTitle = (documentTitle || "WriteOnAir").replace(/[^a-z0-9]/gi, '_');

    for (let i = 0; i < pagesData.length; i++) {
        activePageIndex = i;
        loadPageDataIntoForm(i);
        await new Promise(r => setTimeout(r, 200));

        const sanitizePageTitle = (pagesData[i].title || `Hal${i + 1}`).replace(/[^a-z0-9]/gi, '_');
        const fileName = `WriteOnAir-${sanitizeDocTitle}-Hal${i + 1}-${sanitizePageTitle}.png`;

        if (typeof html2canvas !== "undefined") {
            const canvas = await html2canvas(cnNode, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false
            });
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = fileName;
            link.href = dataUrl;
            link.click();
        }
    }

    activePageIndex = prevActive;
    loadPageDataIntoForm(prevActive);
    showToast("Seluruh halaman berhasil diunduh!");
};

// 3. Direct PDF Document Export (Single & Multi-Page)
const exportPDF = async (allPages = false) => {
    saveCurrentFormToState();
    toggleExportMenu();
    showToast("Membuat dokumen PDF WriteOnAir...");

    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast("Modul PDF belum selesai dimuat.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const pdfWidth = doc.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = doc.internal.pageSize.getHeight(); // 297 mm
    const prevActive = activePageIndex;

    const renderPageCanvasToPDF = async (pageIdx) => {
        activePageIndex = pageIdx;
        loadPageDataIntoForm(pageIdx);
        await new Promise(r => setTimeout(r, 250));

        const canvas = await html2canvas(cnNode, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        const imgProps = doc.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        return { imgData, imgHeight };
    };

    try {
        if (allPages && pagesData.length > 1) {
            for (let i = 0; i < pagesData.length; i++) {
                if (i > 0) doc.addPage();
                const { imgData, imgHeight } = await renderPageCanvasToPDF(i);
                doc.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, imgHeight));
            }
        } else {
            const { imgData, imgHeight } = await renderPageCanvasToPDF(activePageIndex);
            doc.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, imgHeight));
        }

        const sanitizeDocTitle = (documentTitle || "WriteOnAir").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `WriteOnAir-${sanitizeDocTitle}.pdf`;
        doc.save(fileName);
        showToast("Berkas PDF WriteOnAir berhasil diunduh!");
    } catch (err) {
        console.error("PDF generation failed:", err);
        showToast("Gagal membuat dokumen PDF.");
    } finally {
        activePageIndex = prevActive;
        loadPageDataIntoForm(prevActive);
    }
};

// 4. Copy to Clipboard
const copyImageToClipboard = () => {
    saveCurrentFormToState();
    toggleExportMenu();
    showToast("Menyalin gambar...");

    const executeCopy = () => {
        if (typeof html2canvas !== "undefined") {
            html2canvas(cnNode, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false
            }).then(canvas => {
                canvas.toBlob(blob => {
                    if (navigator.clipboard && window.ClipboardItem) {
                        const item = new ClipboardItem({ "image/png": blob });
                        navigator.clipboard.write([item]).then(() => {
                            showToast(`Gambar Halaman "${pagesData[activePageIndex].title}" berhasil disalin! (Ctrl+V)`);
                        }).catch(err => {
                            console.error("Clipboard write error:", err);
                            showToast("Browser tidak mendukung salin langsung. Gunakan Unduh PNG.");
                        });
                    }
                });
            });
        }
    };

    if (document.fonts) {
        document.fonts.ready.then(executeCopy);
    } else {
        executeCopy();
    }
};

// ------------------------------------------
// Toast Notification Engine
// ------------------------------------------
let toastTimeout;
const showToast = (message) => {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.remove("hidden");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastElement.classList.add("hidden");
    }, 3200);
};

// Bind inputs
// Custom Canva Modal Confirm Dialog Engine
const showCustomConfirm = (title, message) => {
    return new Promise((resolve) => {
        const modal = document.getElementById("custom-modal");
        const modalTitle = document.getElementById("modal-title");
        const modalMessage = document.getElementById("modal-message");
        const confirmBtn = document.getElementById("modal-confirm-btn");
        const cancelBtn = document.getElementById("modal-cancel-btn");

        if (!modal || !confirmBtn || !cancelBtn) {
            resolve(confirm(message));
            return;
        }

        if (modalTitle) modalTitle.textContent = title || "Konfirmasi Tindakan";
        if (modalMessage) modalMessage.textContent = message;

        modal.classList.remove("hidden");

        const cleanup = () => {
            modal.classList.add("hidden");
            confirmBtn.removeEventListener("click", onConfirm);
            cancelBtn.removeEventListener("click", onCancel);
        };

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    bindInputSync(topicInput, topicElement, "topic");
    bindInputSync(nameInput, nameElement, "name");
    bindInputSync(nimInput, nimElement, "nim");
    bindInputSync(dateInput, dateElement, "date");
    bindInputSync(questionInput, questionElement, "question");
    bindInputSync(noteInput, noteElement, "note");
    bindInputSync(summaryInput, summaryElement, "summary");

    const savedTheme = localStorage.getItem("writeonair_theme");
    if (savedTheme) {
        document.body.setAttribute("data-theme", savedTheme);
        const themeToggleBtn = document.getElementById("theme-toggle");
        if (themeToggleBtn && savedTheme === "light") {
            themeToggleBtn.innerHTML = `
                <svg class="icon-svg-sm theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                <span class="theme-text">Light</span>`;
        }
    }

    const fontSelect = document.getElementById("font-select");
    if (fontSelect) {
        currentFontFamily = fontSelect.value;
    }

    if (docTitleInput) {
        documentTitle = docTitleInput.value;
    }

    // Default Settings: HVS Putih Polos & Gel Hitam
    setPaperType('plain');
    setInkColor('black');
    loadPageDataIntoForm(0);
});
