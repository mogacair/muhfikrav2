/* ==========================================================================
   1. DATA CONTOH (Siap Diintegrasikan dengan Google Sheets)
   ========================================================================== */
let studentData = [
  {
    nipd: "21221001",
    nisn: "0061234567",
    nama: "Ahmad Fauzi",
    kelas: "X RPL 1",
    jk: "Laki-laki",
    ttl: "Surakarta, 12 Januari 2008",
    ibu: "Siti Rahmawati",
    alamat: "Jl. Lawu No. 15, Karanganyar"
  },
  {
    nipd: "21221002",
    nisn: "0067654321",
    nama: "Budi Santoso",
    kelas: "X RPL 2",
    jk: "Laki-laki",
    ttl: "Surakarta, 24 Mei 2008",
    ibu: "Sri Hartati",
    alamat: "Jl. Palur Raya No. 4, Karanganyar"
  },
  {
    nipd: "20211045",
    nisn: "0059876543",
    nama: "Dewi Anggraini",
    kelas: "XI RPL 1",
    jk: "Perempuan",
    ttl: "Wonogiri, 08 Agustus 2007",
    ibu: "Endang Mulyani",
    alamat: "Dusun Pokoh Kidul, Wonogiri"
  }
];

/* ==========================================================================
   2. DETEKSI HALAMAN AKTIF
   ========================================================================== */
const currentPath = window.location.pathname;
const isIndexPage = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
const isSiswaPage = currentPath.endsWith('datasiswa.html');

/* ==========================================================================
   3. LOGIKA HALAMAN DASHBOARD (index.html)
   ========================================================================== */
if (isIndexPage) {
  // Cegah browser langsung menutup saat tombol kembali/gesture ditekan
  history.replaceState({ page: 'dashboard_root' }, '');
  history.pushState({ page: 'dashboard_view' }, '');

  const modalExit = document.getElementById('modalExit');
  const btnCancelExit = document.getElementById('btnCancelExit');
  const btnConfirmExit = document.getElementById('btnConfirmExit');

  window.onpopstate = function () {
    if (modalExit) {
      modalExit.classList.add('active');
    }
  };

  if (btnCancelExit) {
    btnCancelExit.addEventListener('click', () => {
      modalExit.classList.remove('active');
      history.pushState({ page: 'dashboard_view' }, '');
    });
  }

  if (btnConfirmExit) {
    btnConfirmExit.addEventListener('click', () => {
      window.history.back();
    });
  }
}

/* ==========================================================================
   4. LOGIKA HALAMAN DATA SISWA (datasiswa.html)
   ========================================================================== */
if (isSiswaPage) {
  let isModalOpen = false;

  // Inisialisasi state halaman Data Siswa
  history.replaceState({ page: 'data_siswa' }, '');

  // Render Baris Tabel
  function renderTable(data) {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#888;">Tidak ada data siswa</td></tr>';
      return;
    }

    data.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;">${index + 1}</td>
        <td>${item.nisn}</td>
        <td><span class="clickable-name" onclick="showDetail('${item.nisn}')">${item.nama}</span></td>
        <td>${item.kelas}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Tampilkan Modal Detail Siswa
  window.showDetail = function (nisn) {
    const s = studentData.find(x => x.nisn === nisn);
    if (!s) return;

    const content = document.getElementById('detailContent');
    content.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">NIS / NIPD</span>
        <span class="detail-value">${s.nipd}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">NISN</span>
        <span class="detail-value">${s.nisn}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nama Siswa</span>
        <span class="detail-value">${s.nama}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Kelas</span>
        <span class="detail-value">${s.kelas}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Jenis Kelamin</span>
        <span class="detail-value">${s.jk}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tempat, Tanggal Lahir</span>
        <span class="detail-value">${s.ttl}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nama Ibu Kandung</span>
        <span class="detail-value">${s.ibu}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Alamat Tinggal</span>
        <span class="detail-value">${s.alamat}</span>
      </div>
    `;

    document.getElementById('modalDetail').classList.add('active');
    isModalOpen = true;
    history.pushState({ modal: true }, '');
  };

  // Tutup Modal Detail Siswa
  function closeModal(skipHistory = false) {
    if (!isModalOpen) return;
    document.getElementById('modalDetail').classList.remove('active');
    isModalOpen = false;

    if (!skipHistory) {
      history.back();
    }
  }

  // Tangani Tombol Kembali / Back Gesture Browser
  window.onpopstate = function () {
    if (isModalOpen) {
      closeModal(true);
    } else {
      window.location.href = 'index.html';
    }
  };

  // Tombol Kembali di Header
  const btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (isModalOpen) {
        closeModal();
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  // Tombol Silang dan Area Klik Luar Modal
  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => closeModal());
  }

  const modalDetail = document.getElementById('modalDetail');
  if (modalDetail) {
    modalDetail.addEventListener('click', (e) => {
      if (e.target.id === 'modalDetail') closeModal();
    });
  }

  // Filter Berdasarkan Kelas
  const filterKelas = document.getElementById('filterKelas');
  if (filterKelas) {
    filterKelas.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected === 'SEMUA') {
        renderTable(studentData);
      } else {
        const filtered = studentData.filter(s => s.kelas === selected);
        renderTable(filtered);
      }
    });
  }

  // Ekspor Excel dengan SheetJS
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const filterVal = filterKelas ? filterKelas.value : 'SEMUA';
      const dataToExport = (filterVal === 'SEMUA') 
        ? studentData 
        : studentData.filter(s => s.kelas === filterVal);

      const formattedData = dataToExport.map((s, idx) => ({
        "NO": idx + 1,
        "NIS / NIPD": s.nipd,
        "NISN": s.nisn,
        "NAMA": s.nama,
        "KELAS": s.kelas,
        "JENIS KELAMIN": s.jk,
        "TEMPAT TANGGAL LAHIR": s.ttl,
        "IBU KANDUNG": s.ibu,
        "ALAMAT": s.alamat
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
      XLSX.writeFile(workbook, `Data_Siswa_${filterVal.replace(/\s+/g, '_')}.xlsx`);
    });
  }

  // Inisialisasi awal tabel data siswa
  renderTable(studentData);
}

/* ==========================================================================
   5. TEMPLAT KONEKSI GOOGLE APPS SCRIPT (Google Sheets)
   ========================================================================== */
async function fetchGoogleSheetData(webAppUrl) {
  try {
    const res = await fetch(webAppUrl);
    const result = await res.json();
    if (Array.isArray(result)) {
      studentData = result;
      if (isSiswaPage && typeof renderTable === 'function') {
        renderTable(studentData);
      }
    }
  } catch (err) {
    console.error("Gagal menarik data dari Google Sheets:", err);
  }
}