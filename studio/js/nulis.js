// ==========================================
// Magernulis — Mode Nulis (Kertas Garis)
// Mode terpisah dari Cornell Notes.
// Form ala JNCK Nulis (tanggal, nama, kelas, fakultas, teks) +
// kertas garis CSS + font aman + humanizer + ekspor Magernulis.
// ==========================================

// ---------- State ----------
const NULIS = {
    date: '',
    name: '',
    classId: '',
    faculty: '',
    text: '',
    paper: 'kertas1',          // kertas1 | kertas2 | kertas3 | hvs
    ink: 'blue',               // blue | black | navy | red
    scan: 'none',              // none | clean | shadow | warm | photocopy
    desk: 'grid',              // grid | wood | studio
    font: "'Gloria Hallelujah', cursive",
    fontSizePx: 21,
    lineHeight: 1.33,
    humanizerLevel: 3,         // 0: Clean, 1: Subtle, 2: Natural, 3: Wild Random
    humanizerSeed: 42,
    docTitle: 'Tugas Nulis',
};

// Kertas: 650x920 (sama seperti kertas Cornell), padding tetap.
const PAPER_W = 650;
const PAPER_H = 920;
const PAD_X = 34;
const PAD_TOP = 28;
const PAD_BOTTOM = 28;
const HEADER_LINES = 4; // tanggal, nama, kelas, fakultas (halaman 1 saja)

let nulisPages = []; // [{ header: bool, lines: string[][] }] — lines = array kata per baris
let activePageIndex = 0;
let currentZoom = 1.0;
let renderToken = 0; // batalkan render usang saat ketikan cepat

// ---------- DOM ----------
const pagesWrap = document.getElementById('nulis-pages');
const canvasWrapper = document.getElementById('canvas-wrapper');
const toastElement = document.getElementById('toast');
const dateInput = document.getElementById('nulis-date-input');
const nameInput = document.getElementById('nulis-name-input');
const classInput = document.getElementById('nulis-class-input');
const facultyInput = document.getElementById('nulis-faculty-input');
const textInput = document.getElementById('nulis-text-input');
const docTitleInput = document.getElementById('doc-title-input');

// ---------- Helpers ----------
const ruleH = () => Math.max(20, Math.round(NULIS.fontSizePx * NULIS.lineHeight));
const contentWidth = () => PAPER_W - PAD_X * 2;
const bodyLinesPage1 = () => Math.max(1, Math.floor((PAPER_H - PAD_TOP - PAD_BOTTOM - HEADER_LINES * ruleH()) / ruleH()));
const bodyLinesNext = () => Math.max(1, Math.floor((PAPER_H - PAD_TOP - PAD_BOTTOM) / ruleH()));

function pseudoRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const escapeHTML = (str) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// ---------- Organic Humanizer (sama seperti mode Cornell) ----------
const renderHumanizedText = (element, text) => {
    if (!element) return;
    if (!text) {
        element.innerHTML = '';
        return;
    }

    if (NULIS.humanizerLevel === 0) {
        element.textContent = text;
        element.style.fontFamily = NULIS.font;
        return;
    }

    const lines = text.split('\n');
    let globalWordIdx = 0;

    const htmlOutput = lines.map((line) => {
        if (line.trim() === '') return '<br/>';
        const words = line.split(' ');
        const wordsHTML = words.map(word => {
            globalWordIdx++;
            if (word.trim() === '') return '';

            let maxRot = 3.2;
            let maxShift = 1.8;
            if (NULIS.humanizerLevel === 1) {
                maxRot = 1.5;
                maxShift = 0.8;
            } else if (NULIS.humanizerLevel === 3) {
                maxRot = 6.0;
                maxShift = 3.5;
            }

            const rand1 = pseudoRandom(NULIS.humanizerSeed + globalWordIdx * 17);
            const rand2 = pseudoRandom(NULIS.humanizerSeed + globalWordIdx * 31 + 5);
            const rot = ((rand1 - 0.5) * 2 * maxRot).toFixed(1);
            const transY = ((rand2 - 0.5) * 2 * maxShift).toFixed(1);

            return `<span class="hw-word" style="font-family: ${NULIS.font}; transform: rotate(${rot}deg) translateY(${transY}px);">${escapeHTML(word)}</span>`;
        }).join(' ');

        return wordsHTML;
    }).join('<br/>');

    element.innerHTML = htmlOutput;
    element.style.fontFamily = NULIS.font;
};

const randomizeHumanizer = () => {
    NULIS.humanizerSeed = Math.floor(Math.random() * 100000);
    renderAll();
    showToast('Gacha Berhasil! Kemiringan & posisi kata diacak seperti tulisan tangan manusia.');
    scheduleUndoCommit();
};

const setHumanizerLevel = (level) => {
    NULIS.humanizerLevel = parseInt(level);
    const label = document.getElementById('humanizer-level-val');
    const levelNames = ['Rapi (Mati)', 'Halus (Ringan)', 'Natural (Sedang)', 'Acak / Becek (Wild)'];
    if (label) label.textContent = levelNames[NULIS.humanizerLevel] || 'Natural';
    renderAll();
    scheduleUndoCommit();
};

// ---------- Toast & Modal ----------
let toastTimeout;
const showToast = (message) => {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastElement.classList.add('hidden');
    }, 3200);
};

const showCustomConfirm = (title, message) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        if (!modal) { resolve(false); return; }
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
        const close = (val) => {
            modal.classList.add('hidden');
            cancelBtn.onclick = null;
            confirmBtn.onclick = null;
            resolve(val);
        };
        cancelBtn.onclick = () => close(false);
        confirmBtn.onclick = () => close(true);
    });
};

// ---------- Shell: rail, drawer, tema, zoom ----------
const switchRailTab = (tabName) => {
    document.querySelectorAll('.canva-icon-rail .rail-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.rail === tabName);
    });
    const titles = {
        content: 'Isi Tulisan (Tanggal, Nama, Teks)',
        style: 'Gaya Kertas & Pulpen',
        humanizer: 'Imperfeksi Tulisan Tangan',
        typography: 'Font & Tipografi Kertas',
        pages: 'Halaman (Otomatis)',
    };
    const drawerTitle = document.getElementById('drawer-title');
    if (drawerTitle && titles[tabName]) drawerTitle.textContent = titles[tabName];
    document.querySelectorAll('.drawer-content .drawer-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `pane-${tabName}`);
    });
    const drawer = document.getElementById('canva-drawer');
    if (drawer) drawer.classList.remove('collapsed');
};

const toggleDrawerCollapse = () => {
    const drawer = document.getElementById('canva-drawer');
    if (drawer) drawer.classList.toggle('collapsed');
};

const updateDocumentTitle = (title) => {
    NULIS.docTitle = title || 'Tugas Nulis';
    saveLocal();
};

const toggleTheme = () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.querySelector('.theme-text').textContent = newTheme === 'light' ? 'Light' : 'Dark';
    }
    localStorage.setItem('magernulis_theme', newTheme);
    showToast(`Mode Studio diubah ke ${newTheme.toUpperCase()}`);
};

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
            showToast('Gagal masuk ke mode Fullscreen.');
        });
    } else {
        document.exitFullscreen();
    }
};

// ---------- Zoom (dengan capture aman — lihat captureWithZoomReset) ----------
const applyZoom = () => {
    if (canvasWrapper) {
        canvasWrapper.style.transform = `scale(${currentZoom.toFixed(2)})`;
    }
    const zoomDisplay = document.getElementById('zoom-value');
    if (zoomDisplay) zoomDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
    const zoomSlider = document.getElementById('zoom-range');
    if (zoomSlider) zoomSlider.value = String(Math.round(currentZoom * 100));
};

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

// html2canvas membaca posisi dari dokumen hidup: kalau kertas sedang di-zoom
// (wrapper scale != 1), kata di hasil PNG/ZIP/PDF menumpuk. Capture harus jalan
// dalam keadaan zoom 100%, lalu zoom dikembalikan. (Bug yang sama diperbaiki di
// mode Cornell, 20 Nov 2026.)
const captureWithZoomReset = async (captureFn) => {
    const prevZoom = currentZoom;
    if (prevZoom !== 1) {
        currentZoom = 1;
        applyZoom();
        await new Promise(r => setTimeout(r, 250));
    }
    try {
        return await captureFn();
    } finally {
        if (prevZoom !== 1) {
            currentZoom = prevZoom;
            applyZoom();
        }
    }
};

// ---------- Kertas, tinta, efek, backdrop ----------
const setPaperType = (type) => {
    NULIS.paper = type;
    document.querySelectorAll('.nulis-paper').forEach(node => {
        node.classList.remove('paper-kertas1', 'paper-kertas2', 'paper-kertas3', 'paper-hvs');
        node.classList.add(`paper-${type}`);
    });
    document.querySelectorAll('.paper-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.paper === type);
    });
    saveLocal();
    scheduleUndoCommit();
};

const setInkColor = (color) => {
    NULIS.ink = color;
    document.querySelectorAll('.nulis-paper').forEach(node => {
        node.classList.remove('ink-blue', 'ink-black', 'ink-navy', 'ink-red');
        node.classList.add(`ink-${color}`);
    });
    document.querySelectorAll('.ink-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ink === color);
    });
    saveLocal();
    scheduleUndoCommit();
};

const setScanEffect = (effect) => {
    NULIS.scan = effect;
    document.querySelectorAll('.nulis-paper').forEach(node => {
        node.classList.remove('scan-none', 'scan-clean', 'scan-shadow', 'scan-warm', 'scan-photocopy');
        node.classList.add(`scan-${effect}`);
    });
    saveLocal();
    scheduleUndoCommit();
};

const setDeskBackdrop = (deskType) => {
    NULIS.desk = deskType;
    const viewport = document.getElementById('viewport');
    if (viewport) {
        viewport.classList.remove('backdrop-wood', 'backdrop-studio');
        if (deskType !== 'grid') viewport.classList.add(`backdrop-${deskType}`);
    }
    document.querySelectorAll('.desk-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.desk === deskType);
    });
    saveLocal();
    scheduleUndoCommit();
};

// ---------- Tipografi ----------
const fontOption = (value) => {
    NULIS.font = value;
    renderAll();
    saveLocal();
};

const fontSizeOption = (value) => {
    // value: "21px" atau "1.25rem" — normalisasi ke px
    let px = 21;
    if (typeof value === 'string' && value.endsWith('px')) px = parseFloat(value);
    else if (typeof value === 'string' && value.endsWith('rem')) px = parseFloat(value) * 16;
    else px = parseFloat(value);
    NULIS.fontSizePx = Math.min(Math.max(14, px), 30);
    const displayVal = document.getElementById('font-size-val');
    if (displayVal) displayVal.textContent = `${NULIS.fontSizePx}px`;
    renderAll();
    saveLocal();
};

const lineHeightOption = (value) => {
    NULIS.lineHeight = parseFloat(value);
    const displayVal = document.getElementById('line-height-val');
    if (displayVal) displayVal.textContent = String(NULIS.lineHeight);
    renderAll();
    saveLocal();
};

// ---------- Form: baca input -> state ----------
const readFormToState = () => {
    NULIS.date = dateInput ? dateInput.value : '';
    NULIS.name = nameInput ? nameInput.value : '';
    NULIS.classId = classInput ? classInput.value : '';
    NULIS.faculty = facultyInput ? facultyInput.value : '';
    NULIS.text = textInput ? textInput.value : '';
};

const setAutoDate = () => {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const str = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    if (dateInput) {
        dateInput.value = str;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    showToast('Tanggal hari ini berhasil diisi!');
};

// ---------- Pagination: bungkus kata -> baris -> halaman ----------
const measureCtx = document.createElement('canvas').getContext('2d');

const wrapLines = (text) => {
    // kembalikan array baris; tiap baris = array kata (baris kosong = [])
    measureCtx.font = `${NULIS.fontSizePx}px ${NULIS.font}`;
    const width = contentWidth();
    const spaceW = measureCtx.measureText(' ').width;
    const lines = [];
    const paragraphs = String(text || '').split('\n');
    for (const para of paragraphs) {
        if (para.trim() === '') { lines.push([]); continue; }
        const words = para.split(/\s+/).filter(Boolean);
        let cur = [];
        let curW = 0;
        for (const w of words) {
            const ww = measureCtx.measureText(w).width;
            const add = cur.length === 0 ? ww : curW + spaceW + ww;
            if (add <= width || cur.length === 0) {
                cur.push(w);
                curW = add;
            } else {
                lines.push(cur);
                cur = [w];
                curW = ww;
            }
        }
        if (cur.length) lines.push(cur);
    }
    if (lines.length === 0) lines.push([]);
    return lines;
};

const chunkPages = (lines) => {
    const pages = [];
    let idx = 0;
    let first = true;
    while (idx < lines.length) {
        const cap = first ? bodyLinesPage1() : bodyLinesNext();
        pages.push({ header: first, lines: lines.slice(idx, idx + cap) });
        idx += cap;
        first = false;
    }
    return pages.length ? pages : [{ header: true, lines: [[]] }];
};

// ---------- Render ----------
const paperClasses = () => `paper-${NULIS.paper} ink-${NULIS.ink} scan-${NULIS.scan}`;

const buildPageNode = (page, pageNum) => {
    const node = document.createElement('div');
    node.className = `nulis-paper ${paperClasses()}`;
    node.dataset.page = String(pageNum);
    const rh = ruleH();
    node.style.setProperty('--rule-h', `${rh}px`);
    node.style.setProperty('--pad-top', `${PAD_TOP}px`);
    node.style.setProperty('--pad-bottom', `${PAD_BOTTOM}px`);
    node.style.setProperty('--font-px', `${NULIS.fontSizePx}px`);
    node.style.setProperty('--canvas-font-family', NULIS.font);
    node.style.setProperty('--canvas-font-size', `${NULIS.fontSizePx}px`);
    node.style.setProperty('--canvas-line-height', `${rh}px`);

    if (page.header) {
        const header = document.createElement('div');
        header.className = 'nulis-header';
        const rows = [
            NULIS.date,
            NULIS.name ? `Nama : ${NULIS.name}` : '',
            NULIS.classId ? `Kelas : ${NULIS.classId}` : '',
            NULIS.faculty ? `Fakultas : ${NULIS.faculty}` : '',
        ];
        for (const rowText of rows) {
            const p = document.createElement('p');
            p.className = 'nulis-line handwritten';
            renderHumanizedText(p, rowText);
            header.appendChild(p);
        }
        node.appendChild(header);
    }

    const body = document.createElement('div');
    body.className = 'nulis-body';
    for (const words of page.lines) {
        const p = document.createElement('p');
        p.className = 'nulis-line handwritten';
        if (words.length === 0) {
            p.innerHTML = '&nbsp;';
        } else {
            renderHumanizedText(p, words.join(' '));
        }
        body.appendChild(p);
    }
    node.appendChild(body);

    const overlay = document.createElement('div');
    overlay.className = 'scan-overlay';
    node.appendChild(overlay);
    return node;
};

const renderPillsAndList = () => {
    const pills = document.getElementById('preview-page-pills');
    if (pills) {
        pills.innerHTML = nulisPages.map((_, i) =>
            `<button type="button" class="page-pill${i === activePageIndex ? ' active' : ''}" onclick="showPage(${i})">${i + 1}</button>`
        ).join('');
    }
    const list = document.getElementById('pages-list-container');
    if (list) {
        list.innerHTML = nulisPages.map((_, i) =>
            `<button type="button" class="page-row${i === activePageIndex ? ' active' : ''}" onclick="showPage(${i})">
                <span>Halaman ${i + 1}</span>
                ${i === activePageIndex ? '<span style="font-size: 0.75rem; font-weight:700; color: var(--pulpen)">Aktif</span>' : ''}
            </button>`
        ).join('');
    }
    const badge = document.getElementById('page-count-badge');
    if (badge) badge.textContent = String(nulisPages.length);
    const cur = document.getElementById('current-page-num');
    if (cur) cur.textContent = String(activePageIndex + 1);
    const tot = document.getElementById('total-page-num');
    if (tot) tot.textContent = String(nulisPages.length);
    const titleEl = document.getElementById('current-page-title');
    if (titleEl) titleEl.textContent = `Halaman ${activePageIndex + 1}`;
};

const showPage = (i) => {
    if (!nulisPages.length) return;
    activePageIndex = Math.min(Math.max(0, i), nulisPages.length - 1);
    document.querySelectorAll('.nulis-paper').forEach(node => {
        node.classList.toggle('active', parseInt(node.dataset.page, 10) === activePageIndex + 1);
    });
    renderPillsAndList();
};

const renderAll = async () => {
    const token = ++renderToken;
    readFormToState();
    try {
        await document.fonts.load(`${NULIS.fontSizePx}px ${NULIS.font}`);
    } catch (e) { /* font fallback tetap jalan */ }
    if (token !== renderToken) return; // render lebih baru sudah antre
    const lines = wrapLines(NULIS.text);
    nulisPages = chunkPages(lines);
    if (activePageIndex >= nulisPages.length) activePageIndex = nulisPages.length - 1;
    if (pagesWrap) {
        pagesWrap.innerHTML = '';
        nulisPages.forEach((page, i) => {
            pagesWrap.appendChild(buildPageNode(page, i + 1));
        });
    }
    showPage(activePageIndex);
    saveLocal();
    scheduleUndoCommit();
};

let renderTimer = null;
const scheduleRender = () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderAll, 250);
};

// ---------- Contoh & reset ----------
const SAMPLE_TEXT = `Gotong royong adalah budaya asli masyarakat Indonesia yang sudah hidup sejak lama. Dalam gotong royong, setiap orang ikut membantu tanpa mengharapkan imbalan, karena yang dikerjakan adalah kepentingan bersama. Nilai ini terlihat di banyak tempat, mulai dari membersihkan lingkungan, membangun rumah tetangga, sampai menyiapkan acara desa.

Manfaat gotong royong tidak hanya soal pekerjaan yang jadi lebih cepat selesai. Lebih dari itu, gotong royong membuat hubungan antar warga menjadi dekat. Orang yang jarang bertemu jadi saling menyapa, yang muda belajar dari yang tua, dan masalah yang berat terasa lebih ringan karena dipikul bersama-sama.

Sayangnya, di kota besar budaya ini mulai jarang terlihat. Banyak orang lebih sibuk dengan urusannya sendiri dan menganggap urusan lingkungan sebagai tugas orang lain. Padahal, tanpa kepedulian bersama, lingkungan akan cepat rusak dan rasa aman pun berkurang.

Menjaga gotong royong sebenarnya tidak sulit. Mulailah dari hal kecil seperti ikut kerja bakti, membantu tetangga yang sedang kesulitan, dan menjaga kebersihan gang tempat tinggal. Kalau setiap orang mau meluangkan sedikit waktu, budaya ini akan tetap hidup dan diwariskan ke generasi berikutnya.`;

const loadSampleData = () => {
    if (dateInput && !dateInput.value) setAutoDateSilent();
    if (nameInput) nameInput.value = 'Andi Pratama';
    if (classInput) classInput.value = 'XII IPA 1';
    if (facultyInput) facultyInput.value = 'Sistem Informasi';
    if (textInput) textInput.value = SAMPLE_TEXT;
    renderAll();
    showToast('Contoh tulisan berhasil dimuat!');
};

const setAutoDateSilent = () => {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (dateInput) dateInput.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

const clearForm = async () => {
    const confirmed = await showCustomConfirm(
        'Bersihkan Tulisan?',
        'Semua isian tanggal, nama, kelas, fakultas, dan teks akan dihapus. Lanjutkan?'
    );
    if (!confirmed) return;
    if (dateInput) dateInput.value = '';
    if (nameInput) nameInput.value = '';
    if (classInput) classInput.value = '';
    if (facultyInput) facultyInput.value = '';
    if (textInput) textInput.value = '';
    renderAll();
    showToast('Form berhasil dibersihkan.');
};

// ---------- Simpan lokal ----------
const LOCAL_KEY = 'magernulis-nulis-v1';
let saveTimer = null;
const saveLocal = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try {
            readFormToState();
            localStorage.setItem(LOCAL_KEY, JSON.stringify({
                ...NULIS,
                fontSizePx: NULIS.fontSizePx,
            }));
        } catch (e) { /* abaikan */ }
    }, 400);
};

const restoreLocal = () => {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        Object.assign(NULIS, data);
        if (dateInput) dateInput.value = NULIS.date || '';
        if (nameInput) nameInput.value = NULIS.name || '';
        if (classInput) classInput.value = NULIS.classId || '';
        if (facultyInput) facultyInput.value = NULIS.faculty || '';
        if (textInput) textInput.value = NULIS.text || '';
        if (docTitleInput) docTitleInput.value = NULIS.docTitle || 'Tugas Nulis';
        syncControlsFromState();
        return true;
    } catch (e) {
        return false;
    }
};

const syncControlsFromState = () => {
    const fontSelect = document.getElementById('font-select');
    if (fontSelect) fontSelect.value = NULIS.font;
    const fsRange = document.getElementById('font-size-range');
    if (fsRange) fsRange.value = String(NULIS.fontSizePx);
    const fsVal = document.getElementById('font-size-val');
    if (fsVal) fsVal.textContent = `${NULIS.fontSizePx}px`;
    const lhRange = document.getElementById('line-height-range');
    if (lhRange) lhRange.value = String(NULIS.lineHeight);
    const lhVal = document.getElementById('line-height-val');
    if (lhVal) lhVal.textContent = String(NULIS.lineHeight);
    const humRange = document.getElementById('humanizer-level');
    if (humRange) humRange.value = String(NULIS.humanizerLevel);
    const humVal = document.getElementById('humanizer-level-val');
    if (humVal) {
        const levelNames = ['Rapi (Mati)', 'Halus (Ringan)', 'Natural (Sedang)', 'Acak / Becek (Wild)'];
        humVal.textContent = levelNames[NULIS.humanizerLevel] || 'Natural';
    }
    setPaperType(NULIS.paper);
    setInkColor(NULIS.ink);
    setScanEffect(NULIS.scan);
    setDeskBackdrop(NULIS.desk);
};

// ---------- Ekspor ----------
// ------------------------------------------
// Panel Bagikan ala Canva (kanan) + preset skala ekspor
// ------------------------------------------
let shareFileType = 'pdf';
let shareScale = 2; // Digital = 2, Cetak = 3

const toggleSharePanel = () => {
    const panel = document.getElementById('share-panel');
    if (panel) panel.classList.toggle('hidden');
};

const closeSharePanel = () => {
    const panel = document.getElementById('share-panel');
    if (panel) panel.classList.add('hidden');
};

const updateShareDownloadLabel = () => {
    const label = document.getElementById('share-download-label');
    if (!label) return;
    const typeName = shareFileType === 'pdf' ? 'PDF' : shareFileType.toUpperCase();
    const scope = shareFileType === 'pdf' ? 'Semua Halaman' : 'Halaman Ini';
    label.textContent = `Unduh ${typeName} (${scope})`;
};

const setShareFileType = (type) => {
    shareFileType = type;
    updateShareDownloadLabel();
};

const setSharePreset = (preset) => {
    shareScale = preset === 'print' ? 3 : 2;
    document.querySelectorAll('.share-preset button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === preset);
    });
};

const shareDownload = () => {
    if (shareFileType === 'pdf') {
        exportPDF(true);
    } else if (shareFileType === 'jpg') {
        downloadJPG();
    } else {
        downloadPNG();
    }
};

// Klik di luar panel Bagikan menutupnya (tombol Bagikan dikecualikan).
document.addEventListener('click', (e) => {
    const panel = document.getElementById('share-panel');
    if (panel && !panel.classList.contains('hidden') && !panel.contains(e.target) && !e.target.closest('.btn-canva-share')) {
        panel.classList.add('hidden');
    }
});

// ------------------------------------------
// Undo / Redo ala Canva (snapshot state penuh,
// commit di-debounce 600 mdtk setelah perubahan)
// ------------------------------------------
const UNDO_LIMIT = 50;
let undoStack = [];
let redoStack = [];
let lastCommittedState = null;
let undoCommitTimer = null;
let restoringUndo = false;

const snapshotState = () => JSON.stringify({ ...NULIS, activePageIndex });

const updateUndoButtons = () => {
    const u = document.getElementById('btn-undo');
    const r = document.getElementById('btn-redo');
    if (u) u.disabled = undoStack.length === 0;
    if (r) r.disabled = redoStack.length === 0;
};

const commitUndoSnapshot = () => {
    if (restoringUndo) return;
    const current = snapshotState();
    if (lastCommittedState === null) {
        lastCommittedState = current;
        return;
    }
    if (current !== lastCommittedState) {
        undoStack.push(lastCommittedState);
        if (undoStack.length > UNDO_LIMIT) undoStack.shift();
        redoStack.length = 0;
        lastCommittedState = current;
        updateUndoButtons();
    }
};

const scheduleUndoCommit = () => {
    if (restoringUndo) return;
    clearTimeout(undoCommitTimer);
    undoCommitTimer = setTimeout(commitUndoSnapshot, 600);
};

const applySnapshot = (json) => {
    const snap = JSON.parse(json);
    restoringUndo = true;
    try {
        const { activePageIndex: api, ...rest } = snap;
        Object.assign(NULIS, rest);
        activePageIndex = typeof api === 'number' ? api : 0;
        if (dateInput) dateInput.value = NULIS.date || '';
        if (nameInput) nameInput.value = NULIS.name || '';
        if (classInput) classInput.value = NULIS.classId || '';
        if (facultyInput) facultyInput.value = NULIS.faculty || '';
        if (textInput) textInput.value = NULIS.text || '';
        if (docTitleInput) docTitleInput.value = NULIS.docTitle || 'Tugas Nulis';
        syncControlsFromState();
        renderAll();
    } finally {
        restoringUndo = false;
    }
};

const undoAction = () => {
    if (!undoStack.length) return;
    clearTimeout(undoCommitTimer);
    commitUndoSnapshot();
    const current = lastCommittedState;
    const prev = undoStack.pop();
    redoStack.push(current);
    lastCommittedState = prev;
    applySnapshot(prev);
    updateUndoButtons();
    showToast('Urungkan (Undo) diterapkan.');
};

const redoAction = () => {
    if (!redoStack.length) return;
    clearTimeout(undoCommitTimer);
    commitUndoSnapshot();
    const current = lastCommittedState;
    const next = redoStack.pop();
    undoStack.push(current);
    lastCommittedState = next;
    applySnapshot(next);
    updateUndoButtons();
    showToast('Ulangi (Redo) diterapkan.');
};

const activePaperNode = () => {
    const nodes = document.querySelectorAll('.nulis-paper');
    return nodes[activePageIndex] || nodes[0] || null;
};

const sanitizeDoc = () => (NULIS.docTitle || 'Tugas Nulis').replace(/[^a-z0-9]/gi, '_');

const downloadPNG = () => {
    closeSharePanel();
    showToast('Memproses PNG HD...');
    const fileName = `Magernulis-Nulis-${sanitizeDoc()}-Hal${activePageIndex + 1}.png`;
    const executeExport = async () => {
        if (typeof html2canvas === 'undefined') return;
        try {
            const node = activePaperNode();
            if (!node) return;
            const canvas = await html2canvas(node, {
                scale: shareScale, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
            });
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast(`Halaman ${activePageIndex + 1} berhasil diunduh!`);
        } catch (err) {
            console.warn('html2canvas fallback:', err);
        }
    };
    if (document.fonts) {
        document.fonts.ready.then(() => captureWithZoomReset(executeExport));
    } else {
        captureWithZoomReset(executeExport);
    }
};

const downloadJPG = () => {
    closeSharePanel();
    showToast('Memproses JPG HD...');
    const fileName = `Magernulis-Nulis-${sanitizeDoc()}-Hal${activePageIndex + 1}.jpg`;
    const executeExport = async () => {
        if (typeof html2canvas === 'undefined') return;
        try {
            const node = activePaperNode();
            if (!node) return;
            const canvas = await html2canvas(node, {
                scale: shareScale, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
            });
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/jpeg', 0.92);
            link.click();
            showToast(`Halaman ${activePageIndex + 1} berhasil diunduh!`);
        } catch (err) {
            console.warn('html2canvas fallback:', err);
        }
    };
    if (document.fonts) {
        document.fonts.ready.then(() => captureWithZoomReset(executeExport));
    } else {
        captureWithZoomReset(executeExport);
    }
};

const downloadAllPNGZip = async () => {
    closeSharePanel();
    showToast('Memproses paket ZIP seluruh halaman...');
    if (typeof html2canvas === 'undefined' || typeof JSZip === 'undefined') {
        showToast('Modul ekspor belum selesai dimuat. Coba lagi sebentar.');
        return;
    }
    const zip = new JSZip();
    const prevActive = activePageIndex;
    try {
        await captureWithZoomReset(async () => {
            const nodes = [...document.querySelectorAll('.nulis-paper')];
            for (let i = 0; i < nodes.length; i++) {
                showPage(i);
                await new Promise(r => setTimeout(r, 250));
                const canvas = await html2canvas(nodes[i], {
                    scale: shareScale, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
                });
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) zip.file(`Magernulis-Nulis-${sanitizeDoc()}-Hal${i + 1}.png`, blob);
            }
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Magernulis-Nulis-${sanitizeDoc()}-semua-halaman.zip`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        showToast(`Paket ZIP ${nulisPages.length} halaman berhasil diunduh!`);
    } catch (err) {
        console.error('ZIP export failed:', err);
        showToast('Gagal membuat paket ZIP.');
    } finally {
        showPage(prevActive);
    }
};

const printDocument = () => {
    closeSharePanel();
    window.print();
};

const exportPDF = async (allPages = false) => {
    closeSharePanel();
    showToast('Membuat dokumen PDF Magernulis...');
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('Modul PDF belum selesai dimuat.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    const prevActive = activePageIndex;

    const renderPageCanvasToPDF = async (pageIdx) => {
        showPage(pageIdx);
        await new Promise(r => setTimeout(r, 250));
        const node = activePaperNode();
        const canvas = await html2canvas(node, {
            scale: shareScale, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        return { imgData, imgHeight };
    };

    try {
        await captureWithZoomReset(async () => {
            if (allPages && nulisPages.length > 1) {
                for (let i = 0; i < nulisPages.length; i++) {
                    if (i > 0) doc.addPage();
                    const { imgData, imgHeight } = await renderPageCanvasToPDF(i);
                    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, imgHeight));
                }
            } else {
                const { imgData, imgHeight } = await renderPageCanvasToPDF(activePageIndex);
                doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, imgHeight));
            }
        });
        const fileName = `Magernulis-Nulis-${sanitizeDoc().toLowerCase()}.pdf`;
        doc.save(fileName);
        showToast('Berkas PDF Magernulis berhasil diunduh!');
    } catch (err) {
        console.error('PDF generation failed:', err);
        showToast('Gagal membuat dokumen PDF.');
    } finally {
        showPage(prevActive);
    }
};

const copyImageToClipboard = () => {
    closeSharePanel();
    showToast('Menyalin gambar...');
    const executeCopy = async () => {
        if (typeof html2canvas === 'undefined') return;
        const node = activePaperNode();
        if (!node) return;
        const canvas = await html2canvas(node, {
            scale: shareScale, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
        });
        canvas.toBlob(blob => {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    showToast(`Gambar Halaman ${activePageIndex + 1} berhasil disalin! (Ctrl+V)`);
                }).catch(err => {
                    console.error('Clipboard write error:', err);
                    showToast('Browser tidak mendukung salin langsung. Gunakan Unduh PNG.');
                });
            }
        });
    };
    if (document.fonts) {
        document.fonts.ready.then(() => captureWithZoomReset(executeCopy));
    } else {
        captureWithZoomReset(executeCopy);
    }
};

// ---------- Init ----------
const bindInputs = () => {
    [dateInput, nameInput, classInput, facultyInput, textInput].forEach(el => {
        if (el) el.addEventListener('input', scheduleRender);
    });
    if (docTitleInput) {
        docTitleInput.addEventListener('input', () => {
            NULIS.docTitle = docTitleInput.value || 'Tugas Nulis';
            saveLocal();
            scheduleUndoCommit();
        });
    }
};

const initTheme = () => {
    try {
        const saved = localStorage.getItem('magernulis_theme');
        if (saved) {
            document.body.setAttribute('data-theme', saved);
            const btn = document.getElementById('theme-toggle');
            if (btn) btn.querySelector('.theme-text').textContent = saved === 'light' ? 'Light' : 'Dark';
        }
    } catch (e) { /* abaikan */ }
};

initTheme();
bindInputs();
const restored = restoreLocal();
if (!restored) syncControlsFromState();
applyZoom();
renderAll();
lastCommittedState = snapshotState();
updateUndoButtons();
