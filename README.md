# Sistem Informasi Absensi SPPG MBG

Aplikasi web untuk mengelola data karyawan, presensi berbasis QR Code, shift kerja, rekap kehadiran, dan penggajian operasional SPPG MBG.

Project ini dibangun dengan Laravel, Inertia React, Tailwind CSS, dan Vite. Aplikasi dirancang untuk kebutuhan admin SPPG agar proses absensi masuk/pulang, pemantauan keterlambatan, serta perhitungan potongan gaji dapat dilakukan dari satu dashboard.

## Fitur Utama

- Dashboard ringkasan kehadiran harian, status dapur, dan riwayat scan terbaru.
- Scan QR Code karyawan untuk presensi masuk dan pulang.
- Validasi shift kerja, termasuk shift malam yang melewati tengah malam.
- Validasi scan pulang agar tidak bisa dilakukan sebelum jam pulang shift.
- Pengelolaan data karyawan, foto karyawan, status aktif/nonaktif, dan shift kerja.
- Cetak ID Card karyawan dengan QR Code presensi.
- Rekap presensi bulanan dengan koreksi manual.
- Pengelolaan payroll, potongan keterlambatan, bonus, dan slip gaji.
- Pengaturan profil SPPG, logo aplikasi, alamat, kontak, aturan jam kerja, dan shift.
- Profil admin dengan avatar, nama, email, dan password.
- Halaman update otomatis dari repository GitHub untuk lingkungan yang memakai Git.

## Teknologi

- Backend: Laravel 13
- Frontend: React 19, Inertia.js, Tailwind CSS 4
- Build tool: Vite
- QR scanner: html5-qrcode
- QR generator: qrcode.react
- Icon: lucide-react
- Testing: PHPUnit

## Kebutuhan Sistem

- PHP 8.3 atau lebih baru
- Composer
- Node.js dan npm
- Database MySQL/MariaDB atau SQLite
- Git, opsional untuk fitur update otomatis
- Web server lokal seperti Laragon, Laravel Herd, Valet, atau `php artisan serve`

## Instalasi

Clone repository:

```bash
git clone https://github.com/rakabitornetwork/absensppg.git
cd absensppg
```

Install dependency backend:

```bash
composer install
```

Install dependency frontend:

```bash
npm install
```

Buat file environment:

```bash
cp .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

Atur koneksi database di file `.env`, lalu jalankan migrasi:

```bash
php artisan migrate
```

Opsional, isi data awal:

```bash
php artisan db:seed
```

Jalankan aplikasi untuk development:

```bash
composer run dev
```

Atau jalankan backend dan frontend secara terpisah:

```bash
php artisan serve
npm run dev
```

Build asset production:

```bash
npm run build
```

## Akun Default

Jika menggunakan seeder bawaan, akun admin default adalah:

- Email: `admin@sppg.com`
- Password: `12345678`

Segera ubah email dan password melalui menu Profil Admin setelah aplikasi digunakan.

## Modul Aplikasi

### Dashboard

Menampilkan ringkasan kehadiran hari ini, jumlah karyawan tepat waktu, terlambat, alpa, status kesiapan dapur, total payroll, dan riwayat scan terbaru.

### Scan Absensi

Digunakan untuk scan kartu QR karyawan. Tersedia mode:

- Scan Masuk
- Scan Pulang

Sistem akan menolak scan pulang jika karyawan belum scan masuk atau belum mencapai jam pulang shift.

### Data Karyawan

Admin dapat menambah, mengubah, menghapus, dan mencetak ID Card karyawan. Setiap karyawan memiliki QR token unik untuk proses scan presensi.

### Rekap Presensi

Menampilkan rekap bulanan dalam bentuk matriks tanggal. Admin dapat melakukan koreksi manual untuk status hadir, terlambat, alpa, izin, jam masuk, dan jam pulang.

### Penggajian

Menghitung gaji berdasarkan data kehadiran, tunjangan harian, bonus, dan potongan keterlambatan. Slip gaji dapat dibuka dan dicetak.

### Pengaturan

Mengatur identitas SPPG, logo aplikasi, kontak, alamat, jam kerja default, batas toleransi, denda keterlambatan, target makan, serta daftar shift kerja.

### Profil Admin

Admin dapat mengubah nama, email, password, dan avatar. Avatar akan tampil di sidebar aplikasi.

### Update Aplikasi

Halaman update otomatis dapat memeriksa commit terbaru dan menjalankan proses update dari repository GitHub, jika aplikasi dipasang sebagai Git repository dan server memiliki Git.

## Aturan Shift

Sistem mendukung shift normal dan shift lintas hari.

Contoh shift normal:

- Jam masuk: `08:00`
- Grace time: `08:05`
- Jam pulang: `13:00`

Contoh shift malam:

- Jam masuk: `20:00`
- Grace time: `20:05`
- Jam pulang: `07:30`

Untuk shift malam, scan setelah tengah malam tetap dihitung ke tanggal shift yang benar. Scan pulang sebelum jam pulang shift akan ditolak.

## Testing

Jalankan test:

```bash
php artisan test
```

Test mencakup alur shift, scan masuk/pulang, validasi double scan, validasi shift malam, dan validasi scan pulang lebih awal.

## Struktur Folder Penting

- `app/Http/Controllers`: controller aplikasi
- `app/Models`: model Eloquent
- `database/migrations`: struktur database
- `database/seeders`: data awal aplikasi
- `resources/js/Pages`: halaman React Inertia
- `resources/js/Layout`: layout utama aplikasi
- `resources/css`: stylesheet Tailwind
- `routes/web.php`: definisi route web
- `tests/Feature`: test fitur aplikasi

## Catatan Deployment

Untuk deployment production:

```bash
composer install --optimize-autoloader --no-dev
npm install
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Pastikan folder berikut dapat ditulis oleh web server:

- `storage`
- `bootstrap/cache`
- `public/images`

## Lisensi

Project ini mengikuti lisensi MIT sebagaimana konfigurasi Laravel pada `composer.json`.
