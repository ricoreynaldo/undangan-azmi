// INISIALISASI AOS
AOS.init({ duration: 1000, once: false, mirror: true });

// FUNGSI NANGKEP NAMA TAMU DARI URL
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get('to') || urlParams.get('nama');

if (namaTamu) {
    // 1. Ubah nama di cover depan
    document.getElementById('nama-tamu').innerText = namaTamu;
    
    // 2. OTOMATIS ISI FORM UCAPAN
    document.getElementById('inputNama').value = namaTamu;
}

// KONTROL COVER & AUDIO
const btnBuka = document.getElementById('btn-buka');
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');

btnBuka.addEventListener('click', () => {
    music.play();
    document.getElementById('cover-screen').classList.add('buka-transisi');
    document.getElementById('isi-undangan').style.display = 'block';
    musicToggle.style.display = 'flex';

    setTimeout(() => { 
        document.getElementById('cover-screen').style.display = 'none'; 
        AOS.refresh(); 
    }, 1200);
});

let isPlaying = true;
musicToggle.onclick = () => {
    if (isPlaying) { 
        music.pause(); 
        musicIcon.classList.remove('spin'); 
        musicToggle.style.opacity = "0.6"; 
    } else { 
        music.play(); 
        musicIcon.classList.add('spin'); 
        musicToggle.style.opacity = "1"; 
    }
    isPlaying = !isPlaying;
};

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        music.pause();
    } else {
        music.play().catch(error => {
            console.log("Autoplay dicegah browser, nunggu interaksi tamu.");
        });
    }
});

// COUNTDOWN WAKTU
const targetDate = new Date("May 20, 2026 07:00:00").getTime();
const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById("hari").innerText = "00"; 
        document.getElementById("jam").innerText = "00";
        document.getElementById("menit").innerText = "00"; 
        document.getElementById("detik").innerText = "00";
        return;
    }
    document.getElementById("hari").innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    document.getElementById("jam").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    document.getElementById("menit").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById("detik").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
}, 1000);

// GALERI FOTO
let currentImgIndex = 0;
const galleryImages = [
    'assets/img/priyo1.jpg', 'assets/img/priyo2.jpg', 'assets/img/priyo3.jpg', 
    'assets/img/priyo4.png', 'assets/img/priyo5.png', 'assets/img/priyo6.jpg', 'assets/img/priyo7.jpg'
];

function openFullView(src) {
    const fileName = src.split('/').pop();
    currentImgIndex = galleryImages.findIndex(img => img.includes(fileName));
    document.getElementById('fullViewImg').src = galleryImages[currentImgIndex];
    document.getElementById('fullViewOverlay').style.display = 'block';
}

function closeFullView() { document.getElementById('fullViewOverlay').style.display = 'none'; }

function changeImg(dir) {
    currentImgIndex += dir;
    if (currentImgIndex >= galleryImages.length) currentImgIndex = 0;
    if (currentImgIndex < 0) currentImgIndex = galleryImages.length - 1;
    document.getElementById('fullViewImg').src = galleryImages[currentImgIndex];
}

// WEDDING GIFT & SALIN DATA
function toggleGift() {
    const container = document.getElementById('giftContainer');
    const btn = document.getElementById('btnToggleGift');

    if (container.style.display === 'none') {
        container.style.display = 'block';
        container.classList.add('show-gift');
        btn.innerHTML = '<i class="bi bi-eye-slash-fill me-2"></i> Sembunyikan Hadiah';
        btn.classList.remove('btn-abu-tipis');
        btn.classList.add('btn-vintage');
        setTimeout(() => { AOS.refresh(); }, 500);
    } else {
        container.style.display = 'none';
        container.classList.remove('show-gift');
        btn.innerHTML = '<i class="bi bi-gift-fill me-2"></i> Kirim Hadiah';
        btn.classList.remove('btn-vintage');
        btn.classList.add('btn-abu-tipis');
        setTimeout(() => { AOS.refresh(); }, 100);
    }
}

function salinData(elementId, type) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert(type + " berhasil disalin!");
    }).catch(err => {
        console.error('Gagal menyalin: ', err);
    });
}

// API UCAPAN & DOA
const apiUrl = "/api/ucapan";
let semuaUcapan = [];
let halamanSaatIni = 1;
const itemPerHalaman = 3; 

async function fetchUcapan() {
    try {
        const response = await fetch(apiUrl);
        semuaUcapan = await response.json();
        halamanSaatIni = 1; 
        renderUcapan();     
    } catch (error) {
        console.error("Gagal load ucapan:", error);
    }
}

function formatTanggal(tglStr) {
    if (!tglStr) return 'Baru saja';
    const date = new Date(tglStr);
    if (isNaN(date)) return tglStr; 
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('id-ID', options).replace(/\./g, ':');
}

function renderUcapan() {
    const wadah = document.getElementById('daftarUcapan');
    const wadahPagination = document.getElementById('wadahPagination');
    wadah.innerHTML = '';

    if (!semuaUcapan || semuaUcapan.length === 0) {
        wadah.innerHTML = '<p class="text-muted small text-center mt-4">Belum ada ucapan. Jadilah yang pertama!</p>';
        wadahPagination.classList.add('d-none');
        return;
    }

    const totalHalaman = Math.ceil(semuaUcapan.length / itemPerHalaman);
    const indexMulai = (halamanSaatIni - 1) * itemPerHalaman;
    const indexAkhir = indexMulai + itemPerHalaman;
    const dataTampil = semuaUcapan.slice(indexMulai, indexAkhir);

    dataTampil.forEach(item => {
        const inisial = (item.nama ? item.nama.charAt(0) : 'A').toUpperCase();
        wadah.innerHTML += `
            <div class="d-flex mb-3 p-3 bg-white rounded-4 shadow-sm border" style="border-color: rgba(140, 154, 131, 0.2) !important;">
                <div class="flex-shrink-0">
                    <div class="rounded-circle d-flex align-items-center justify-content-center border shadow-sm" 
                         style="width: 45px; height: 45px; font-weight: bold; font-size: 1.3rem; color: #333; background-color: #f8f9fa; font-family: 'Playfair Display', Georgia, serif;">
                        ${inisial}
                    </div>
                </div>
                <div class="ms-3 flex-grow-1">
                    <h6 class="mb-0 fw-bold" style="color: var(--warna-teks);">${item.nama}</h6>
                    <small class="text-muted" style="font-size: 0.7rem; display: block; margin-bottom: 8px;">
                        <i class="bi bi-clock me-1"></i> ${formatTanggal(item.created_at)}
                    </small>
                    <p class="mb-0 text-muted small" style="line-height: 1.5;">${item.pesan}</p>
                </div>
            </div>
        `;
    });

    wadahPagination.classList.remove('d-none');
    document.getElementById('infoHalaman').innerText = `Hal ${halamanSaatIni} / ${totalHalaman}`;
    document.getElementById('btnPrev').disabled = (halamanSaatIni === 1);
    document.getElementById('btnNext').disabled = (halamanSaatIni === totalHalaman);
}

function gantiHalaman(arah) {
    halamanSaatIni += arah;
    renderUcapan(); 
}

document.getElementById('formUcapan').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btnKirim');
    btn.innerHTML = 'Mengirim... <span class="spinner-border spinner-border-sm" role="status"></span>';
    btn.disabled = true;

    const payload = {
        nama: document.getElementById('inputNama').value,
        pesan: document.getElementById('inputPesan').value
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('inputNama').value = '';
            document.getElementById('inputPesan').value = '';
            fetchUcapan();
        } else {
            alert("Gagal ngirim pesan, coba lagi bre!");
        }
    } catch (error) {
        alert("Koneksi bermasalah!");
    } finally {
        btn.innerHTML = 'Kirim Pesan';
        btn.disabled = false;
    }
});

// INITIAL LOAD
window.addEventListener('DOMContentLoaded', fetchUcapan);