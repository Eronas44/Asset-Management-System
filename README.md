# Enterprise Asset Management System

Sistem Manajemen Aset & Inventaris Terpadu berbasis arsitektur decoupled (*headless RESTful API* dan *modern Single Page Application*) yang dirancang untuk pengawasan siklus hidup aset fisik, otomasi sirkulasi peminjaman, pelacakan depresiasi nilai buku fiskal, audit forensik aktivitas pengguna, dan pencetakan stiker identifikasi label QR Code.

Dibangun dengan pendekatan desain **Warm Editorial & Tactile SaaS** yang elegan, ramah sentuhan, dan adaptif penuh across Desktop (macOS floating dock), Mobile Portrait (bottom pill bar + slide-up sheet), serta Mobile Landscape (compact icon rail).

---

## 🏛️ Arsitektur Sistem Terpisah (Decoupled Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                   APLIKASI CLIENT / FRONTEND                    │
│      React 19 • TypeScript • Vite • Tailwind v4 • Context       │
│               Port: http://localhost:2000 (atau 5173)           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                     RESTful JSON / Bearer Token
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                   GATEWAY / BACKEND REST API                    │
│     Laravel 11 • Laravel Sanctum • Spatie Permission • Cache    │
│                     Port: http://localhost:2020                 │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
        Pessimistic Lock / ORM            Cache Invalidation
                 │                               │
┌────────────────▼────────────────┐ ┌────────────▼────────────────┐
│        DATABASE UTAMA           │ │       CACHE / SESSIONS      │
│      MySQL 8.0 (Port 3307)      │ │            Redis            │
└─────────────────────────────────┘ └─────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend (`asset-management-web`)
* **Framework:** React 19 + TypeScript (Strict Type Safety)
* **Build Tool:** Vite 8 (dengan *chunk code-splitting* dinamis)
* **Styling & Design System:** Tailwind CSS v4, Lucide Icons, Custom Editorial Typography
* **State & Data Management:** React Context API (`AuthContext`, `ThemeContext`, `ToastContext`), Axios dengan interceptor token dan global error handler
* **Fitur Canggih:**
  - *On-Demand Lazy Loading*: Modul berat (`jspdf`, `html2canvas`, `html5-qrcode`) dimuat secara asinkron hanya saat fitur dijalankan.
  - *Digital Passport Aset*: Kartu identitas unit dengan visualisasi QR, progres depresiasi usia ekonomis, dan riwayat sirkulasi.
  - *Live QR Camera Scanner*: Pemindaian kamera real-time dengan parser URL fleksibel dan pembersihan track kamera otomatis.
  - *Vector PDF Stiker A4*: Kompilasi stiker label QR presisi siap cetak (pilihan tata letak 2 kolom / 3 kolom).

### Backend API (`assets-management-api`)
* **Framework:** Laravel 11.x (PHP 8.2+)
* **Otentikasi & Keamanan:** Laravel Sanctum (Personal Access Token), Rate Limiting (Throttle)
* **Manajemen Hak Akses (RBAC):** Spatie Laravel Permission (Otoritas peran: `superuser`, `admin`, `staff`)
* **Integritas Transaksi:** `DB::transaction()` dan Pessimistic Locking (`lockForUpdate()`) guna mencegah peminjaman ganda (*race condition*)
* **Depresiasi Fiskal:** Kalkulasi dinamis metode Garis Lurus (*Straight-Line Depreciation*) terintegrasi accessor Eloquent
* **Audit Trail Otomatis:** Pencatatan log polimorfik terpusat untuk setiap aksi mutasi data

---

## 🔐 Matriks Peran & Hak Akses (RBAC)

| Modul / Fitur | Super Administrator (`superuser`) | Administrator (`admin`) | Staff Operasional (`staff`) |
|---|:---:|:---:|:---:|
| **Pusat Kendali Eksekutif (Dashboard)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Inventaris Aset (Lihat & Filter)** | ✅ Akses Penuh | ✅ Akses Penuh | ✅ |
| **Inventaris Aset (Tambah, Edit, Hapus)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Kategori & Lokasi Aset (Master Data)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Sirkulasi Peminjaman & Pengembalian** | ✅ Akses Penuh | ✅ Akses Penuh | ✅ Akses Penuh |
| **Cetak Label QR & Stiker A4** | ✅ Akses Penuh | ✅ Akses Penuh | ✅ Akses Penuh |
| **Jejak Audit Aktivitas (Activity Logs)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Kelola Pengguna (Users & Roles)** | ✅ Akses Penuh | ❌ | ❌ |
| **Cadangan & Pemulihan (Backup/Restore)** | ✅ Akses Penuh | ❌ | ❌ |
| **Verifikasi QR Publik (Digital Passport)** | ✅ Bebas Akses | ✅ Bebas Akses | ✅ Bebas Akses |

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### Metode 1: Menggunakan Docker Compose (Direkomendasikan)

Pastikan Docker Desktop sudah aktif di komputer Anda.

1. **Jalankan seluruh kontainer:**
   ```bash
   docker compose up -d --build
   ```
2. **Jalankan migrasi database dan seeder di dalam kontainer backend:**
   ```bash
   docker compose exec app php artisan migrate:fresh --seed
   ```
3. **Akses aplikasi di browser:**
   - **Frontend Web:** [http://localhost:2000](http://localhost:2000)
   - **Backend API:** [http://localhost:2020/api](http://localhost:2020/api)

---

### Metode 2: Menjalankan Secara Manual (Tanpa Docker)

#### 1. Persiapan Backend API (`assets-management-api`)
```bash
cd assets-management-api

# Salin konfigurasi environment
cp .env.example .env

# Instal dependensi composer
composer install

# Buat application key
php artisan key:generate

# Konfigurasi database MySQL pada berkas .env Anda, kemudian jalankan migrasi & seed
php artisan migrate:fresh --seed

# Jalankan storage link (untuk arsip snapshot backup)
php artisan storage:link

# Jalankan server API backend (port 2020)
php artisan serve --port=2020
```

#### 2. Persiapan Frontend Web (`asset-management-web`)
Buka terminal baru:
```bash
cd asset-management-web

# Instal dependensi node
npm install

# Jalankan server frontend development (port 5173 atau 2000)
npm run dev
```

---

## 🔑 Kredensial Akun Bawaan (Default Seeded Users)

Semua akun menggunakan kata sandi bawaan: **`password123`**

| Peran Akun | Alamat Email | Hak Akses Utama |
|---|---|---|
| **Super Administrator** | `superuser@asset.com` | Akses mutlak ke seluruh fitur, kelola peran pengguna, backup & restore database |
| **Administrator Utama** | `admin@asset.com` | Manajemen inventaris, master data kategori/lokasi, audit aktivitas, ekspor laporan |
| **Staff Operasional** | `staff@asset.com` | Pemindaian barcode QR, input sirkulasi peminjaman, pemrosesan pengembalian unit |

---

## 🧪 Pengujian & Verifikasi Kualitas Kode

Frontend dilengkapi dengan unit test dan integration test menggunakan Vitest dan React Testing Library:

```bash
# Menjalankan seluruh pengujian unit & integrasi
cd asset-management-web
npx vitest run

# Menjalankan pengecekan tipe data TypeScript & kompilasi produksi
npm run build
```

---

## 📦 Struktur Folder Utama

```
├── asset-management-web/          # Aplikasi Frontend SPA (React + TypeScript + Vite)
│   ├── src/
│   │   ├── api/                   # Konfigurasi Axios & interseptor request/response
│   │   ├── components/            # Komponen UI modular, Scanner, Dialog, Label Cetak
│   │   ├── context/               # AuthContext, ThemeContext, ToastContext
│   │   ├── layouts/               # DashboardLayout adaptif (macOS dock & mobile pill)
│   │   ├── pages/                 # Halaman per rute sistem (Dashboard, Assets, Users, dll.)
│   │   ├── services/              # API Client Service calls terisolasi per entitas
│   │   ├── types/                 # Interface & Type definition TypeScript sinkron backend
│   │   └── routes/                # Router deklaratif dengan Suspense & ProtectedRoute
│   └── vite.config.ts             # Konfigurasi bundle chunking & code splitting
│
├── assets-management-api/         # Aplikasi Backend REST API (Laravel 11)
│   ├── app/
│   │   ├── Http/Controllers/      # Asset, Borrowing, User, Backup, Dashboard Controllers
│   │   ├── Http/Requests/         # Validasi Form Request berlapis
│   │   ├── Http/Resources/        # Transformasi format respons JSON
│   │   ├── Models/                # Eloquent Models (Asset, Borrowing, Category, User, dll.)
│   │   └── Services/              # ActivityLogger, DatabaseBackupService
│   ├── database/                  # Migrasi skema database & Seeder data awal
│   └── routes/api.php             # Registrasi endpoint RESTful & middleware Sanctum/RBAC
│
├── docker-compose.yml             # Orkestrasi kontainer multi-service terpadu
└── README.md                      # Dokumentasi teknis proyek
```

