/* ==========================================================================
   1. KONFIGURASI URL GOOGLE APPS SCRIPT
   ========================================================================== */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwO_Iw2FEYIQ-wfijUH7YKjHsApNHjXro6oU6IAZjdbkwJ7np2ZT2sy4XvHIsACOF00/exec";

let studentData = [];

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

  history.replaceState({ page: 'data_siswa' }, '');

  // Render Baris Tabel
  function renderTable(data) {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#888;">Tidak ada data siswa ditemukan</td></tr>';
      return;
    }

    data.forEach((item, index) => {
      const tr = document.createElement('tr');
      // Antisipasi field huruf kapital / kecil dari GAS
      const nisnVal = item.nisn || item.NISN || "-";
      const namaVal = item.nama || item.NAMA || "-";
      const kelasVal = item.kelas || item.KELAS || "-";

      tr.innerHTML = `
        <td style="text-align: center;">${index + 1}</td>
        <td>${nisnVal}</td>
        <td><span class="clickable-name" onclick="showDetail('${nisnVal}')">${namaVal}</span></td>
        <td>${kelasVal}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Tampilkan Modal Detail Siswa
  window.showDetail = function (nisn) {
    const s = studentData.find(x => (x.nisn || x.NISN) === nisn);
    if (!s) return;

    const content = document.getElementById('detailContent');
    content.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">NIS / NIPD</span>
        <span class="detail-value">${s.nipd || s.NIPD || "-"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">NISN</span>
        <span class="detail-value">${s.nisn || s.NISN || "-"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nama Siswa</span>
        <span class="detail-value">${s.nama || s.NAMA || "-"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Kelas</span>
        <span class="detail-value">${s.kelas || s.KELAS || "-"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Jenis Kelamin</span>
        <span class="detail-value">${s.jk || s.JK || "-"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tempat, Tanggal Lahir</span>
        <span class="detail-value">${s.ttl || s.TTL || "-"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nama Ibu Kandung</span>
        <span class="detail-value">${s.ibu || s.IBU || "-"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Alamat Tinggal</span>
        <span class="detail-value">${s.alamat || s.ALAMAT || "-"}</span>
      </div>
    `;

    document.getElementById('modalDetail').classList.add('active');
    isModalOpen = true;
    history.pushState({ modal: true }, '');
  };

  // Tutup Modal Detail
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

  // Event Tutup Modal
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
        const filtered = studentData.filter(s => (s.kelas || s.KELAS) === selected);
        renderTable(filtered);
      }
    });
  }

  // Download Excel
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const filterVal = filterKelas ? filterKelas.value : 'SEMUA';
      const dataToExport = (filterVal === 'SEMUA') 
        ? studentData 
        : studentData.filter(s => (s.kelas || s.KELAS) === filterVal);

      if (dataToExport.length === 0) {
        alert('Tidak ada data untuk diunduh.');
        return;
      }

      const formattedData = dataToExport.map((s, idx) => ({
        "NO": idx + 1,
        "NIS / NIPD": s.nipd || s.NIPD || "",
        "NISN": s.nisn || s.NISN || "",
        "NAMA": s.nama || s.NAMA || "",
        "KELAS": s.kelas || s.KELAS || "",
        "JENIS KELAMIN": s.jk || s.JK || "",
        "TEMPAT TANGGAL LAHIR": s.ttl || s.TTL || "",
        "IBU KANDUNG": s.ibu || s.IBU || "",
        "ALAMAT": s.alamat || s.ALAMAT || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
      XLSX.writeFile(workbook, `Data_Siswa_${filterVal.replace(/\s+/g, '_')}.xlsx`);
    });
  }

  // Tarik Data Otomatis dari Google Apps Script
  async function fetchGoogleSheetData(webAppUrl) {
    const tbody = document.getElementById('studentTableBody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--color-primary); font-weight: 600;">Memuat data dari Google Sheets...</td></tr>';
    }

    try {
      const res = await fetch(webAppUrl);
      const result = await res.json();

      if (result.status === "success") {
        studentData = result.students || [];

        // Isi dropdown kelas langsung dari tab sheet (X TKR, X TKJ, dsb.)
        if (filterKelas && Array.isArray(result.classes)) {
          filterKelas.innerHTML = '<option value="SEMUA">Semua Kelas</option>';
          result.classes.forEach(cls => {
            const opt = document.createElement('option');
            opt.value = cls;
            opt.textContent = cls;
            filterKelas.appendChild(opt);
          });
        }

        renderTable(studentData);
      } else {
        throw new Error(result.message || "Format respons tidak sesuai");
      }
    } catch (err) {
      console.error("Gagal menarik data dari Google Sheets:", err);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--color-danger);">Gagal memuat data. Periksa koneksi atau izin deploy script.</td></tr>';
      }
    }
  }

  // Eksekusi penarikan data saat halaman datasiswa.html dibuka
  fetchGoogleSheetData(SCRIPT_URL);
}
