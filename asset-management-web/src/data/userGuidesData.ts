export type UserRoleType = 'superuser' | 'admin' | 'staff' | 'all';

export interface GuideStep {
  step: number;
  title: string;
  description: string;
  detail?: string;
  badge?: string;
}

export interface GuideCallout {
  type: 'info' | 'warning' | 'tip';
  title: string;
  message: string;
}

export interface GuideTopic {
  id: string;
  title: string;
  shortDesc: string;
  category: string;
  targetRole: UserRoleType;
  iconName: string;
  badge?: string;
  workflow?: {
    title: string;
    nodes: string[];
  };
  summary: string;
  steps: GuideStep[];
  callouts?: GuideCallout[];
  keywords: string[];
  relatedTopicIds?: string[];
}

export interface RoleGuideMeta {
  role: UserRoleType;
  title: string;
  badgeName: string;
  badgeColor: string;
  description: string;
  responsibilities: string[];
}

export const ROLE_METADATA: Record<'superuser' | 'admin' | 'staff', RoleGuideMeta> = {
  superuser: {
    role: 'superuser',
    title: 'Super Administrator',
    badgeName: 'SUPER USER',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    description: 'Pemegang wewenang tertinggi dengan akses penuh ke seluruh modul sistem, administrasi akun pengguna, pencadangan/pemulihan database, serta audit trail keamanan.',
    responsibilities: [
      'Manajemen akun pengguna dan penetapan wewenang (Roles: Superuser, Admin, Staff).',
      'Pencadangan (backup) dan pemulihan (restore) database sistem.',
      'Audit log aktivitas untuk investigasi keamanan dan kepatuhan sistem.',
      'Pengawasan integritas seluruh data master, aset, dan riwayat sirkulasi barang.',
    ],
  },
  admin: {
    role: 'admin',
    title: 'Administrator Aset',
    badgeName: 'ADMIN',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    description: 'Penanggung jawab operasional inventaris, pencatatan master data kategori dan lokasi, mutasi aset, persetujuan peminjaman, serta verifikasi fisik pengembalian barang.',
    responsibilities: [
      'Pengelolaan master data kategori dan titik lokasi/ruangan aset.',
      'Registrasi unit aset baru, pembaharuan spesifikasi, dan pencetakan label QR Code.',
      'Pengelolaan dan persetujuan transaksi peminjaman aset.',
      'Verifikasi kondisi fisik saat pengembalian barang dan pembaruan status aset.',
      'Pemantauan peringatan keterlambatan (overdue) dan pelaporan eksekutif.',
    ],
  },
  staff: {
    role: 'staff',
    title: 'Staff / Pengguna Umum',
    badgeName: 'USER / STAFF',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Pengguna operasional yang memerlukan aset untuk mendukung pekerjaan, melakukan pengajuan peminjaman barang, serta memantau status aset melalui kode QR.',
    responsibilities: [
      'Mencari dan memeriksa ketersediaan aset di dalam inventaris.',
      'Melakukan pengajuan peminjaman aset sesuai kebutuhan tugas kerja.',
      'Menjaga keutuhan dan kondisi fisik barang yang dipinjam.',
      'Mengembalikan aset tepat waktu sesuai durasi yang disepakati.',
      'Memindai kode QR fisik aset untuk melihat informasi detail dan riwayat status.',
    ],
  },
};

export const GUIDE_TOPICS: GuideTopic[] = [
  // ==========================================
  // KATEGORI: PENGENALAN & NAVIGASI UMUM
  // ==========================================
  {
    id: 'overview-system',
    title: 'Pengenalan Sistem & Struktur Hak Akses',
    shortDesc: 'Gambaran umum ekosistem Asset Management System dan tingkatan peran kerja.',
    category: 'Dasar & Navigasi',
    targetRole: 'all',
    iconName: 'LayoutDashboard',
    badge: 'Umum',
    summary: 'Asset Management System dirancang untuk mengelola siklus hidup aset korporat secara transparan, akuntabel, dan terstruktur berbasis peran (Role-Based Access Control / RBAC).',
    steps: [
      {
        step: 1,
        title: 'Masuk ke Sistem (Login)',
        description: 'Buka halaman login sistem, masukkan alamat email terdaftar dan kata sandi yang sah.',
        detail: 'Sistem menggunakan autentikasi JWT token yang tersimpan secara aman dengan masa aktif yang terkelola.',
      },
      {
        step: 2,
        title: 'Mengenali Tata Letak Dashboard Utama',
        description: 'Sidebar kiri memuat modul-modul yang disesuaikan dengan hak akses akun Anda. Bagian atas dilengkapi tombol Scan QR, toggle Tema Gelap/Terang, dan identitas pengguna aktif.',
      },
      {
        step: 3,
        title: 'Tingkatan Hak Akses (3 Pilar Peran)',
        description: 'Sistem membedakan tiga tingkatan otorisasi: Super User (kontrol sistem & data inti), Admin (operasional aset & transaksi), dan User/Staff (peminjaman & pengecekan barang).',
      },
    ],
    callouts: [
      {
        type: 'info',
        title: 'Privilege Inheritance',
        message: 'Pengguna dengan peran Super User memiliki seluruh hak akses Admin dan Staff secara inheren.',
      },
      {
        type: 'tip',
        title: 'Mode Tampilan',
        message: 'Anda dapat beralih antara Mode Gelap (Dark Mode) dan Mode Terang (Light Mode) menggunakan tombol ikon matahari/bulan di sudut kanan atas.',
      },
    ],
    keywords: ['login', 'peran', 'role', 'hak akses', 'navigasi', 'tampilan', 'dashboard'],
    relatedTopicIds: ['qr-scanner-guide', 'su-users', 'user-create-borrowing'],
  },
  {
    id: 'qr-scanner-guide',
    title: 'Panduan Fitur Pindai QR Code Aset',
    shortDesc: 'Cara cepat mengecek identitas dan status aset fisik menggunakan kamera atau berkas gambar.',
    category: 'Dasar & Navigasi',
    targetRole: 'all',
    iconName: 'QrCode',
    badge: 'Fitur Utama',
    workflow: {
      title: 'Alur Pindai QR Aset',
      nodes: ['Klik Tombol Pindai QR', 'Pilih Mode: Kamera Aktif / Unggah Gambar QR', 'Arahkan ke Kode QR Fisik', 'Sistem Membaca UUID Aset', 'Halaman Detail Aset Terbuka Otomatis'],
    },
    summary: 'Setiap aset memiliki kode QR unik yang dapat dipindai secara instan tanpa perlu mengetik nomor seri atau kode aset secara manual.',
    steps: [
      {
        step: 1,
        title: 'Buka Modal Scanner QR',
        description: 'Klik tombol "Pindai QR" pada bilah atas (header navigasi) di halaman mana pun.',
      },
      {
        step: 2,
        title: 'Pilih Metode Pemindaian',
        description: 'Gunakan tab "Kamera" untuk pemindaian langsung melalui webcam laptop/ponsel, atau gunakan tab "Unggah File" jika Anda memiliki foto kode QR.',
      },
      {
        step: 3,
        title: 'Arahkan Lensa ke Label Aset',
        description: 'Posisikan kode QR aset tepat di tengah bingkai pemindaian. Pastikan pencahayaan cukup dan label tidak kotor/rusak.',
      },
      {
        step: 4,
        title: 'Pengalihan Otomatis ke Detail Aset',
        description: 'Setelah kode terdeteksi, modal scanner akan otomatis menutup dan mengarahkan peramban Anda ke halaman detail aset terkait.',
      },
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Pemeriksaan Lapangan Tanpa Login (Public Info)',
        message: 'Label QR juga dapat dipindai oleh peramban ponsel biasa untuk melihat halaman ringkasan publik aset tanpa harus masuk ke sesi dashboard.',
      },
      {
        type: 'warning',
        title: 'Izin Kamera Peramban',
        message: 'Jika kamera tidak muncul, pastikan Anda telah memberikan izin (Allow Camera Access) pada jendela prompt peramban Anda.',
      },
    ],
    keywords: ['qr code', 'barcode', 'scan qr', 'kamera', 'pindai', 'identifikasi aset'],
    relatedTopicIds: ['admin-asset-reg', 'user-scan-check'],
  },

  // ==========================================
  // KATEGORI: PANDUAN SUPER USER
  // ==========================================
  {
    id: 'su-users',
    title: 'Kelola Pengguna & Penugasan Peran',
    shortDesc: 'Panduan membuat akun, memperbarui informasi pengguna, dan menetapkan peran otorisasi.',
    category: 'Super User: Manajemen Sistem',
    targetRole: 'superuser',
    iconName: 'Users',
    badge: 'Super User Khusus',
    workflow: {
      title: 'Alur Manajemen Pengguna',
      nodes: ['Buka Menu Kelola Pengguna', 'Klik Tambah Pengguna Baru', 'Input Nama, Email, Password', 'Pilih Peran: superuser / admin / staff', 'Simpan & Verifikasi Hak Akses'],
    },
    summary: 'Modul Kelola Pengguna (/users) hanya dapat diakses oleh Super User untuk mengendalikan siapa saja yang dapat mengakses sistem dan batasan fungsinya.',
    steps: [
      {
        step: 1,
        title: 'Akses Menu Kelola Pengguna',
        description: 'Pada sidebar utama, klik menu "Kelola Pengguna". Anda akan disajikan tabel seluruh pengguna aktif dan perannya.',
      },
      {
        step: 2,
        title: 'Mendaftarkan Akun Baru',
        description: 'Klik tombol "+ Tambah Pengguna". Isi nama lengkap, alamat email resmi, serta kata sandi sementara untuk pengguna tersebut.',
        detail: 'Pilih peran yang sesuai: "superuser" untuk administrator sistem, "admin" untuk pengelola aset harian, atau "staff" untuk peminjam reguler.',
      },
      {
        step: 3,
        title: 'Mengubah Peran atau Data Pengguna',
        description: 'Gunakan tombol aksi "Edit" di baris pengguna terkait untuk memperbarui nama, email, atau mengubah penugasan peran.',
      },
      {
        step: 4,
        title: 'Reset Kata Sandi Akun Pengguna',
        description: 'Jika ada anggota tim yang lupa kata sandi, Super User dapat memperbarui kata sandi akun melalui formulir edit pengguna.',
      },
      {
        step: 5,
        title: 'Menonaktifkan / Menghapus Akun',
        description: 'Klik tombol ikon tempat sampah untuk menghapus akun yang sudah tidak memiliki wewenang atau telah berhenti bekerja.',
      },
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Keamanan Akun Super Administrator',
        message: 'Pastikan minimal ada satu akun Super User aktif. Hindari menghapus atau mengubah peran akun Super Administrator Anda sendiri yang sedang aktif.',
      },
      {
        type: 'tip',
        title: 'Kebijakan Kata Sandi',
        message: 'Gunakan kombinasi minimal 8 karakter yang memuat huruf besar, huruf kecil, dan angka demi menjaga keamanan sistem.',
      },
    ],
    keywords: ['pengguna', 'user', 'kelola user', 'tambah akun', 'reset password', 'role', 'superuser', 'admin', 'staff'],
    relatedTopicIds: ['su-backups', 'su-activity-logs'],
  },
  {
    id: 'su-backups',
    title: 'Backup & Restore Database Sistem',
    shortDesc: 'Panduan membuat snapshot cadangan basis data, mengunduh file SQL/GZ, dan memulihkan data.',
    category: 'Super User: Manajemen Sistem',
    targetRole: 'superuser',
    iconName: 'Database',
    badge: 'Kritis / Penting',
    workflow: {
      title: 'Prosedur Backup & Restore Aman',
      nodes: ['Buat Snapshot Cadangan', 'Verifikasi Ukuran File Berkas', 'Unduh ke Penyimpanan Eksternal', 'Eksekusi Restore Jika Dibutuhkan', 'Verifikasi Integritas Data'],
    },
    summary: 'Modul Backup & Restore (/backups) menjamin ketahanan data terhadap risiko kerusakan server, insiden data, atau kebutuhan migrasi infrastruktur.',
    steps: [
      {
        step: 1,
        title: 'Membuat Cadangan Baru (Manual Backup)',
        description: 'Klik tombol "+ Buat Backup Sekarang" pada halaman Backup & Restore. Sistem akan menjalankan mysqldump dan mengompres file cadangan.',
        detail: 'Proses ini berjalan di latar belakang dan menghasilkan file berkas berekstensi .sql atau .sql.gz dengan cap waktu yang akurat.',
      },
      {
        step: 2,
        title: 'Memeriksa Riwayat Snapshot',
        description: 'Periksa tabel riwayat untuk melihat nama file, tanggal/jam pencadangan, serta ukuran berkas (size). Pastikan ukuran berkas wajar dan tidak 0 byte.',
      },
      {
        step: 3,
        title: 'Mengunduh Berkas Cadangan ke Komputer',
        description: 'Sangat disarankan mengunduh berkas cadangan secara berkala ke perangkat offline atau penyimpanan awan terenkripsi melalui tombol "Unduh".',
      },
      {
        step: 4,
        title: 'Menjalankan Pemulihan Basis Data (Restore)',
        description: 'Pilih baris snapshot yang ingin dipulihkan, lalu klik tombol "Restore". Konfirmasikan tindakan pada dialog peringatan keselamatan.',
      },
      {
        step: 5,
        title: 'Pembersihan Snapshot Kedaluwarsa',
        description: 'Hapus file snapshot lama yang sudah tidak dibutuhkan menggunakan tombol "Hapus" agar tidak memenuhi kapasitas penyimpanan server.',
      },
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Perhatian Tindakan Restore',
        message: 'Tindakan RESTORE akan menimpa seluruh kondisi database saat ini dengan data yang ada pada berkas snapshot yang dipilih. Buat backup terbaru terlebih dahulu sebelum menjalankan restore!',
      },
      {
        type: 'tip',
        title: 'Jadwal Pencadangan Terbaik',
        message: 'Lakukan pencadangan minimal satu kali dalam seminggu atau setiap kali sebelum melakukan mutasi data aset berskala besar.',
      },
    ],
    keywords: ['backup', 'restore', 'database', 'cadangan', 'pemulihan data', 'mysqldump', 'snapshot', 'sql'],
    relatedTopicIds: ['su-users', 'su-activity-logs'],
  },
  {
    id: 'su-activity-logs',
    title: 'Audit Trail & Log Aktivitas Sistem',
    shortDesc: 'Melacak jejak digital setiap aksi, perubahan data aset, dan transaksi pengguna.',
    category: 'Super User: Manajemen Sistem',
    targetRole: 'superuser',
    iconName: 'ScrollText',
    badge: 'Audit & Compliance',
    summary: 'Modul Riwayat Aktivitas (/activity-logs) mencatat setiap manipulasi data yang terjadi di dalam sistem, memastikan transparansi penuh dan pencegahan kecurangan.',
    steps: [
      {
        step: 1,
        title: 'Membuka Catatan Aktivitas',
        description: 'Klik menu "Riwayat Aktivitas" pada sidebar. Anda akan melihat kronologi peristiwa secara terbalik (kejadian terbaru berada di atas).',
      },
      {
        step: 2,
        title: 'Menyaring Berdasarkan Pengguna atau Modul',
        description: 'Gunakan kolom pencarian atau filter untuk melacak aksi spesifik, misalnya pembaruan status aset tertentu atau pembuatan peminjaman.',
      },
      {
        step: 3,
        title: 'Menelaah Detail Payload & Perubahan',
        description: 'Setiap entri mencatat identitas pelaku (user name & email), modul sasaran, jenis operasi (CREATE, UPDATE, DELETE), serta alamat IP dan stempel waktu.',
      },
    ],
    callouts: [
      {
        type: 'info',
        title: 'Integritas Log',
        message: 'Catatan aktivitas bersifat write-once (hanya dapat ditulis oleh sistem) dan tidak dapat dimanipulasi melalui antarmuka web reguler.',
      },
    ],
    keywords: ['activity log', 'audit trail', 'riwayat', 'log aktivitas', 'keamanan', 'pelacakan insiden'],
    relatedTopicIds: ['su-users', 'admin-asset-lifecycle'],
  },

  // ==========================================
  // KATEGORI: PANDUAN ADMIN
  // ==========================================
  {
    id: 'admin-master-data',
    title: 'Manajemen Kategori & Lokasi Aset',
    shortDesc: 'Pengaturan struktur fondasi data: Kategori barang dan titik lokasi penyimpanan fisik.',
    category: 'Admin: Master Data & Aset',
    targetRole: 'admin',
    iconName: 'FolderOpen',
    badge: 'Master Data',
    workflow: {
      title: 'Struktur Data Master',
      nodes: ['Definisikan Lokasi (Gedung/Ruangan)', 'Buat Kategori Aset & Kodefikasi', 'Hubungkan Saat Registrasi Aset'],
    },
    summary: 'Sebelum mendaftarkan unit aset, Admin wajib memastikan Kategori Aset dan Lokasi Aset telah terkonfigurasi dengan benar.',
    steps: [
      {
        step: 1,
        title: 'Mengelola Kategori Aset (/categories)',
        description: 'Buka menu "Kategori Aset". Tambahkan kelompok barang seperti "Elektronik & Komputer", "Kendaraan Operasional", atau "Furnitur Kantor".',
        detail: 'Sertakan kode kategori yang singkat dan deskriptif untuk mempermudah penomoran inventaris.',
      },
      {
        step: 2,
        title: 'Mengelola Titik Lokasi (/locations)',
        description: 'Buka menu "Lokasi Aset". Masukkan nama gedung, lantai, dan ruangan tempat barang disimpan, misalnya "Ruang IT Server Lt.2" atau "Gudang Logistik Utama".',
      },
      {
        step: 3,
        title: 'Memelihara & Merapikan Data',
        description: 'Lakukan peremajaan data jika terjadi perpindahan fungsi ruangan atau penggabungan kategori barang.',
      },
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Keterikatan Data (Data Dependency)',
        message: 'Kategori atau Lokasi yang sudah terikat pada unit aset aktif tidak dapat dihapus sebelum aset terkait dialihkan ke kategori/lokasi lain.',
      },
    ],
    keywords: ['kategori', 'lokasi', 'master data', 'ruangan', 'gedung', 'kategori aset'],
    relatedTopicIds: ['admin-asset-reg', 'admin-asset-lifecycle'],
  },
  {
    id: 'admin-asset-reg',
    title: 'Registrasi Aset Baru & Cetak Label QR',
    shortDesc: 'Cara mendaftarkan aset baru, mengisi atribut fisik, mengunggah foto, dan mencetak label QR.',
    category: 'Admin: Master Data & Aset',
    targetRole: 'admin',
    iconName: 'Monitor',
    badge: 'Inventaris',
    workflow: {
      title: 'Alur Pendaftaran Aset Baru',
      nodes: ['Buka Menu Inventaris Aset', 'Klik Tambah Aset', 'Input Data & Unggah Foto', 'Sistem Generate Kode & QR', 'Cetak & Tempelkan Label QR'],
    },
    summary: 'Pendaftaran aset yang akurat merupakan kunci akuntabilitas aset perusahaan. Sistem secara otomatis membuat kode QR unik untuk setiap unit baru.',
    steps: [
      {
        step: 1,
        title: 'Buka Menu Inventaris Aset (/assets)',
        description: 'Klik tombol "+ Tambah Aset Baru" pada sudut kanan atas tabel inventaris.',
      },
      {
        step: 2,
        title: 'Lengkapi Informasi Aset',
        description: 'Isi nama aset, nomor seri pabrik (serial number), pilih kategori, tentukan lokasi penyimpanan awal, tanggal perolehan, dan nilai perolehan (harga).',
      },
      {
        step: 3,
        title: 'Unggah Bukti Fisik / Foto Aset',
        description: 'Lampirkan foto fisik aset yang jelas sebagai bukti kondisi awal barang saat pertama kali masuk ke inventaris perusahaan.',
      },
      {
        step: 4,
        title: 'Mencetak Label QR Code',
        description: 'Setelah tersimpan, buka halaman detail aset tersebut. Klik tombol "Cetak QR Code" untuk mencetak stiker barcode/QR beresolusi tinggi.',
      },
      {
        step: 5,
        title: 'Penempelan Fisik Label',
        description: 'Tempelkan label stiker QR pada bagian aset yang mudah dijangkau namun aman dari gesekan (misal: bagian bawah laptop atau rangka belakang monitor).',
      },
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Nomor Seri Unik',
        message: 'Selalu masukkan nomor seri resmi dari pabrikan jika ada, karena akan sangat membantu saat klaim garansi atau audit barang.',
      },
    ],
    keywords: ['tambah aset', 'inventaris', 'cetak qr', 'nomor seri', 'registrasi barang', 'foto aset'],
    relatedTopicIds: ['admin-asset-lifecycle', 'admin-borrowing-manage', 'qr-scanner-guide'],
  },
  {
    id: 'admin-asset-lifecycle',
    title: 'Siklus Status Aset & Manajemen Pemeliharaan',
    shortDesc: 'Mengelola perubahan kondisi aset: Tersedia, Dipinjam, Rusak, Pemeliharaan, hingga Dihapus.',
    category: 'Admin: Master Data & Aset',
    targetRole: 'admin',
    iconName: 'Wrench',
    badge: 'Siklus Aset',
    summary: 'Status aset mencerminkan kesiapan unit untuk digunakan dan mencegah peminjaman barang yang sedang rusak atau dalam perbaikan.',
    steps: [
      {
        step: 1,
        title: 'Memahami Status Aset',
        description: 'Sistem mendukung status: "Tersedia" (siap dipinjam), "Dipinjam" (sedang dibawa staf), "Pemeliharaan/Maintenance" (sedang diservis), "Rusak" (tidak berfungsi), dan "Dihapus/Disposed" (dilelang/dibuang).',
      },
      {
        step: 2,
        title: 'Memperbarui Kondisi dari Detail Aset',
        description: 'Buka halaman detail aset, klik tombol "Ubah Status / Edit Aset", pilih status kondisi baru beserta catatan keterangannya.',
      },
      {
        step: 3,
        title: 'Pencatatan Servis & Pemeliharaan',
        description: 'Saat aset dikirim untuk reparasi, ubah status menjadi Pemeliharaan agar staf lain tidak dapat mengajukan peminjaman pada unit tersebut.',
      },
    ],
    callouts: [
      {
        type: 'info',
        title: 'Proteksi Peminjaman Otomatis',
        message: 'Sistem secara otomatis mencegah pembuatan peminjaman baru pada aset yang tidak berstatus "Tersedia".',
      },
    ],
    keywords: ['status aset', 'tersedia', 'rusak', 'pemeliharaan', 'maintenance', 'kondisi barang', 'disposed'],
    relatedTopicIds: ['admin-asset-reg', 'admin-borrowing-manage'],
  },
  {
    id: 'admin-borrowing-manage',
    title: 'Pengelolaan Peminjaman & Verifikasi Pengembalian',
    shortDesc: 'Meninjau transaksi peminjaman, memantau batas waktu, dan memvalidasi kondisi fisik saat pengembalian.',
    category: 'Admin: Transaksi Peminjaman',
    targetRole: 'admin',
    iconName: 'Handshake',
    badge: 'Operasional',
    workflow: {
      title: 'Alur Verifikasi Peminjaman',
      nodes: ['Staf Mengajukan Peminjaman', 'Admin Menyerahkan Barang', 'Pemantauan Durasi & Overdue', 'Staf Mengembalikan Fisik Barang', 'Admin Inspeksi Fisik & Check-In Selesai'],
    },
    summary: 'Admin bertanggung jawab mengawal seluruh proses sirkulasi aset dari saat barang diserahkan hingga barang kembali ke gudang.',
    steps: [
      {
        step: 1,
        title: 'Buka Menu Peminjaman (/borrowings)',
        description: 'Lihat daftar transaksi peminjaman aktif, riwayat selesai, dan status terlambat (Overdue) yang ditandai dengan lencana merah.',
      },
      {
        step: 2,
        title: 'Membuat atau Mencatat Peminjaman Langsung',
        description: 'Klik "+ Catat Peminjaman". Pilih aset yang tersedia, tentukan nama peminjam, tanggal pinjam, dan perkiraan tanggal kembali.',
      },
      {
        step: 3,
        title: 'Proses Verifikasi Pengembalian (Check-In)',
        description: 'Ketika staf membawa kembali barang: Periksa nomor seri dan fisik aset. Pastikan kelengkapan (kabel, adaptor, aksesoris) tidak tertinggal.',
      },
      {
        step: 4,
        title: 'Selesaikan Transaksi di Sistem',
        description: 'Klik tombol "Kembalikan Aset" pada baris transaksi terkait. Masukkan catatan kondisi pengembalian (misal: "Kembali dalam kondisi baik dan lengkap"), lalu konfirmasi.',
      },
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Peringatan Overdue',
        message: 'Aset yang melewati estimasi tanggal kembali akan masuk dalam daftar alert sistem. Segera hubungi peminjam terkait untuk konfirmasi perpanjangan atau penyerahan barang.',
      },
    ],
    keywords: ['peminjaman', 'pengembalian', 'check-in', 'overdue', 'terlambat', 'transaksi barang', 'inspeksi'],
    relatedTopicIds: ['user-create-borrowing', 'user-return-procedure', 'admin-reports'],
  },
  {
    id: 'admin-reports',
    title: 'Dashboard Eksekutif & Pemantauan Peringatan',
    shortDesc: 'Menganalisis indikator utama: Total nilai aset, sebaran status barang, dan daftar peminjaman terlambat.',
    category: 'Admin: Master Data & Aset',
    targetRole: 'admin',
    iconName: 'LayoutDashboard',
    badge: 'Monitoring',
    summary: 'Dashboard menyediakan tinjauan real-time bagi para manajer dan admin untuk mengambil keputusan strategis terkait inventaris.',
    steps: [
      {
        step: 1,
        title: 'Matriks Statistik Ringkasan',
        description: 'Perhatikan kartu statistik: Total Unit Aset, Total Nilai Valuasi Rupiah, Jumlah Aset Sedang Dipinjam, dan Unit dalam Perbaikan.',
      },
      {
        step: 2,
        title: 'Pusat Peringatan Keterlambatan (Alert Center)',
        description: 'Bagian peringatan menampilkan daftar aset yang telah melewati batas waktu pengembalian secara mendesak, lengkap dengan nama peminjam dan jumlah hari keterlambatan.',
      },
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Pembaruan Data Cepat',
        message: 'Data statistik diperbarui secara langsung saat transaksi baru disimpan di dalam sistem.',
      },
    ],
    keywords: ['dashboard', 'statistik', 'laporan', 'matriks aset', 'valuasi', 'peringatan', 'alert'],
    relatedTopicIds: ['admin-borrowing-manage'],
  },

  // ==========================================
  // KATEGORI: PANDUAN USER / STAFF
  // ==========================================
  {
    id: 'user-browse-assets',
    title: 'Mencari Aset & Mengecek Ketersediaan',
    shortDesc: 'Panduan menemukan peralatan yang dibutuhkan dan memeriksa status ketersediaannya.',
    category: 'User / Staff: Operasional',
    targetRole: 'staff',
    iconName: 'Search',
    badge: 'Langkah Awal',
    summary: 'Sebelum mengajukan peminjaman, staf dapat menelusuri katalog inventaris untuk menemukan alat atau perangkat yang siap dipakai.',
    steps: [
      {
        step: 1,
        title: 'Masuk ke Menu Inventaris Aset',
        description: 'Pilih menu "Inventaris Aset" pada sidebar aplikasi.',
      },
      {
        step: 2,
        title: 'Gunakan Filter dan Pencarian Cepat',
        description: 'Ketik nama barang (misal: "ThinkPad", "Proyektor", "Kamera") pada kotak pencarian, atau saring berdasarkan kategori.',
      },
      {
        step: 3,
        title: 'Periksa Lencana Ketersediaan',
        description: 'Hanya aset dengan lencana hijau bertuliskan "Tersedia" yang dapat dipinjam. Jika statusnya "Dipinjam" atau "Rusak", pilih unit alternatif lain.',
      },
    ],
    callouts: [
      {
        type: 'info',
        title: 'Lokasi Barang',
        message: 'Periksa kolom Lokasi untuk mengetahui di ruangan atau gedung mana unit tersebut disimpan sebelum Anda mengambilnya.',
      },
    ],
    keywords: ['cari aset', 'katalog barang', 'cek ketersediaan', 'status tersedia', 'lokasi aset'],
    relatedTopicIds: ['user-create-borrowing', 'user-scan-check'],
  },
  {
    id: 'user-create-borrowing',
    title: 'Cara Mengajukan Peminjaman Aset',
    shortDesc: 'Langkah-langkah pengisian formulir peminjaman aset untuk operasional atau dinas luar.',
    category: 'User / Staff: Operasional',
    targetRole: 'staff',
    iconName: 'Handshake',
    badge: 'Prosedur Utama',
    workflow: {
      title: 'Alur Pengajuan Staf',
      nodes: ['Pilih Barang Tersedia', 'Klik Ajukan Pinjam', 'Tentukan Tanggal Pinjam & Kembali', 'Isi Tujuan Penggunaan', 'Terima Fisik Barang dari Admin'],
    },
    summary: 'Peminjaman wajib dicatatkan ke dalam sistem demi keselamatan aset dan kejelasan penanggung jawab selama barang dibawa.',
    steps: [
      {
        step: 1,
        title: 'Buka Halaman Peminjaman (/borrowings)',
        description: 'Klik tombol "+ Pinjam Aset" pada bagian atas halaman peminjaman.',
      },
      {
        step: 2,
        title: 'Pilih Unit Aset',
        description: 'Pilih barang yang ingin Anda pinjam dari daftar drop-down aset yang berstatus tersedia.',
      },
      {
        step: 3,
        title: 'Tentukan Tanggal dan Waktu Pengembalian',
        description: 'Pilih tanggal mulai peminjaman dan estimasi tanggal barang akan dikembalikan ke kantor.',
      },
      {
        step: 4,
        title: 'Tuliskan Keperluan / Catatan',
        description: 'Tuliskan alasan peminjaman secara jelas (misal: "Presentasi di Gedung Klien Jakarta" atau "Audit Lapangan").',
      },
      {
        step: 5,
        title: 'Konfirmasi dan Pengambilan Fisik Barang',
        description: 'Setelah formulir berhasil disimpan, temui petugas Admin untuk mengambil fisik barang bersangkutan.',
      },
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Kewajiban Menjaga Aset',
        message: 'Selama masa peminjaman, staf penanggung jawab wajib menjaga aset dari benturan, cairan, atau kehilangan.',
      },
      {
        type: 'tip',
        title: 'Estimasi Realistis',
        message: 'Berikan estimasi tanggal pengembalian yang realistis agar tidak memicu notifikasi peringatan keterlambatan (overdue).',
      },
    ],
    keywords: ['pinjam aset', 'formulir peminjaman', 'ajukan pinjam', 'durasi peminjaman', 'peminjam'],
    relatedTopicIds: ['user-return-procedure', 'user-browse-assets'],
  },
  {
    id: 'user-return-procedure',
    title: 'Tata Cara Pengembalian Aset yang Benar',
    shortDesc: 'Prosedur penyerahan kembali aset pinjaman kepada petugas hingga transaksi selesai di sistem.',
    category: 'User / Staff: Operasional',
    targetRole: 'staff',
    iconName: 'CheckCircle2',
    badge: 'Penyelesaian',
    summary: 'Pengembalian barang yang tertib membebaskan staf dari tanggung jawab tanggungan aset perusahaan.',
    steps: [
      {
        step: 1,
        title: 'Persiapkan Unit dan Seluruh Kelengkapannya',
        description: 'Pastikan barang dalam keadaan bersih, seluruh kabel bawaan, adaptor, tas, dan aksesoris terpasang lengkap.',
      },
      {
        step: 2,
        title: 'Serahkan Langsung ke Petugas Admin / Gudang',
        description: 'Bawa unit fisik aset ke ruangan petugas pengelola aset untuk dilakukan pemeriksaan kondisi bersama.',
      },
      {
        step: 3,
        title: 'Verifikasi Kondisi Bersama',
        description: 'Petugas akan mengecek apakah unit berfungsi normal atau memiliki kendala teknis selama pemakaian.',
      },
      {
        step: 4,
        title: 'Pencatatan Status "Dikembalikan"',
        description: 'Pastikan petugas telah menandai status transaksi Anda sebagai "Selesai/Dikembalikan" di sistem sebelum Anda meninggalkan lokasi.',
      },
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Jangan Menitipkan Barang Tanpa Serah Terima',
        message: 'Hindari meninggalkan aset di atas meja tanpa konfirmasi resmi dari Admin untuk mencegah klaim barang hilang.',
      },
    ],
    keywords: ['kembalikan aset', 'pengembalian', 'prosedur selesai', 'serah terima barang'],
    relatedTopicIds: ['user-create-borrowing', 'admin-borrowing-manage'],
  },
  {
    id: 'user-scan-check',
    title: 'Pindai QR Aset untuk Pengecekan di Tempat',
    shortDesc: 'Cara cepat mengecek identitas barang fisik saat menemukan perangkat di kantor.',
    category: 'User / Staff: Operasional',
    targetRole: 'staff',
    iconName: 'QrCode',
    badge: 'Mobile / Praktis',
    summary: 'Temukan stiker QR pada badan aset untuk mengetahui riwayat barang dan siapa penanggung jawab resminya.',
    steps: [
      {
        step: 1,
        title: 'Tekan Tombol Pindai QR di Layar',
        description: 'Gunakan tombol Pindai QR di header aplikasi atau gunakan kamera ponsel jika Anda sedang berada di luar kantor.',
      },
      {
        step: 2,
        title: 'Arahkan ke Stiker QR Aset',
        description: 'Arahkan kamera ke stiker. Informasi spesifikasi, pemilik, dan status akan langsung ditampilkan.',
      },
    ],
    keywords: ['scan qr lapangan', 'cek aset', 'label qr', 'identifikasi cepat'],
    relatedTopicIds: ['qr-scanner-guide'],
  },

  // ==========================================
  // KATEGORI: PUSAT BANTUAN & FAQ
  // ==========================================
  {
    id: 'faq-troubleshooting',
    title: 'Pusat Pemecahan Masalah (FAQ & Troubleshooting)',
    shortDesc: 'Solusi untuk pertanyaan yang sering diajukan dan kendala teknis umum.',
    category: 'Pusat Bantuan & FAQ',
    targetRole: 'all',
    iconName: 'HelpCircle',
    badge: 'Bantuan',
    summary: 'Temukan solusi mandiri atas kendala teknis operasional harian yang kerap dihadapi oleh pengguna.',
    steps: [
      {
        step: 1,
        title: 'Kamera Scanner Tidak Mau Menyala',
        description: 'Pastikan peramban (Chrome, Edge, Firefox) memiliki izin akses webcam/kamera. Jika menggunakan koneksi HTTP non-localhost, browser memblokir kamera karena aturan keamanan SSL (Gunakan HTTPS).',
        badge: 'Izin Kamera',
      },
      {
        step: 2,
        title: 'Aset Tidak Bisa Dipilih Saat Mengajukan Pinjam',
        description: 'Periksa status aset tersebut di halaman Inventaris. Aset hanya dapat dipinjam jika berstatus "Tersedia". Jika statusnya sedang "Dipinjam" atau "Rusak", sistem otomatis menguncinya.',
        badge: 'Status Terkunci',
      },
      {
        step: 3,
        title: 'Lupa Kata Sandi Akun',
        description: 'Hubungi pengguna dengan peran Super Administrator di instansi Anda. Super User dapat mengatur ulang (reset) kata sandi Anda melalui menu Kelola Pengguna.',
        badge: 'Reset Akun',
      },
      {
        step: 4,
        title: 'Muncul Halaman Akses Ditolak (403 Forbidden)',
        description: 'Halaman 403 muncul jika Anda mencoba mengakses tautan URL yang berada di luar batas izin peran Anda (misal: akun Staff mencoba membuka halaman Kelola Pengguna atau Backup).',
        badge: 'Hak Akses',
      },
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Butuh Bantuan Lanjutan?',
        message: 'Jika kendala sistem belum terselesaikan, catat ID jejak kesalahan (Trace ID) yang muncul di layar dan laporkan kepada Tim Administrator IT.',
      },
    ],
    keywords: ['faq', 'troubleshooting', 'error', 'bantuan', 'kamera tidak bisa', 'lupa password', '403 forbidden'],
    relatedTopicIds: ['overview-system', 'su-users', 'qr-scanner-guide'],
  },
];
