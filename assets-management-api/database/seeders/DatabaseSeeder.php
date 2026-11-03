<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetLocation;
use App\Models\AssetBorrowing;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. SETUP PERAN & HAK AKSES (SPATIE)
        // ==========================================
        $permissions = [
            'manage-assets',
            'manage-borrowings',
            'manage-master-data',
            'manage-users',
            'view-reports'
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $roleSuperuser = Role::findOrCreate('superuser');
        $roleSuperuser->syncPermissions(Permission::all());

        $roleAdmin = Role::findOrCreate('admin');
        $roleAdmin->syncPermissions([
            'manage-master-data',
            'manage-assets',
            'manage-borrowings',
            'view-reports',
        ]);

        $roleStaff = Role::findOrCreate('staff');
        $roleStaff->syncPermissions([
            'manage-borrowings',
            'manage-assets',
        ]);

        // ==========================================
        // 2. PEMBUATAN AKUN PENGGUNA INTI
        // ==========================================
        $superuser = User::updateOrCreate(
            ['email' => 'superuser@asset.com'],
            ['name' => 'Super Administrator', 'password' => Hash::make('password123')]
        );
        $superuser->syncRoles([$roleSuperuser]);

        $admin = User::updateOrCreate(
            ['email' => 'admin@asset.com'],
            ['name' => 'Admin Utama', 'password' => Hash::make('password123')]
        );
        $admin->syncRoles([$roleAdmin]);

        $staff = User::updateOrCreate(
            ['email' => 'staff@asset.com'],
            ['name' => 'Staff Operasional', 'password' => Hash::make('password123')]
        );
        $staff->syncRoles([$roleStaff]);

        // Tambahan akun staff lain untuk variasi data audit trail
        $staff2 = User::updateOrCreate(
            ['email' => 'rian@asset.com'],
            ['name' => 'Rian Wijaya', 'password' => Hash::make('password123')]
        );
        $staff2->syncRoles([$roleStaff]);

        // ==========================================
        // 3. PEMBUATAN DATA MASTER (BANYAK VARIASI)
        // ==========================================
        $categories = [
            'Elektronik & Gadget' => 'Laptop, Smartphone, Tablet, dan Kamera',
            'Infrastruktur Jaringan' => 'Router, Switch, Server, Access Point, dan UPS',
            'Fasilitas & Perkantoran' => 'Kursi Kerja, Meja Rapat, AC, dan Proyektor',
            'Kendaraan Operasional' => 'Mobil Inventaris, Sepeda Motor Dinas'
        ];

        $catModels = [];
        foreach ($categories as $name => $desc) {
            $catModels[] = AssetCategory::updateOrCreate(['name' => $name], ['description' => $desc]);
        }

        $locations = [
            ['name' => 'Ruang Kerja IT Support', 'code' => 'HQ-IT-01', 'desc' => 'Gedung A, Lantai 2'],
            ['name' => 'Ruang Rapat Utama', 'code' => 'HQ-BR-02', 'desc' => 'Gedung A, Lantai 1'],
            ['name' => 'Gedung Server & Data Center', 'code' => 'HQ-DC-03', 'desc' => 'Gedung B, Lantai Dasar'],
            ['name' => 'Area Parkir Dalam', 'code' => 'HQ-PK-01', 'desc' => 'Gedung B, Samping Logistik'],
            ['name' => 'Cabang Pembantu Surabaya', 'code' => 'BR-SUB-01', 'desc' => 'Jl. Raya Darmo No. 12']
        ];

        $locModels = [];
        foreach ($locations as $loc) {
            $locModels[] = AssetLocation::updateOrCreate(
                ['code' => $loc['code']],
                ['name' => $loc['name'], 'description' => $loc['desc']]
            );
        }

        // ==========================================
        // 4. PEMBUATAN ENTITAS ASET MASSAL
        // ==========================================
        $borrowers = ['Budi Santoso', 'Siti Aminah', 'Rian Wijaya', 'Dewi Lestari', 'Dedi Kurniawan', 'Andika Pratama'];
        $counter = 1;

        $singleAssets = [
            ['name' => 'MacBook Pro M3 Max 16"', 'code_prefix' => 'LAP-MBP', 'price' => 45000000, 'life' => 5, 'residu' => 5000000, 'cat' => 0, 'loc' => 0],
            ['name' => 'ThinkPad X1 Carbon Gen 12', 'code_prefix' => 'LAP-TPX', 'price' => 28000000, 'life' => 4, 'residu' => 3000000, 'cat' => 0, 'loc' => 0],
            ['name' => 'iPad Pro M4 13" 512GB', 'code_prefix' => 'TAB-IPD', 'price' => 24000000, 'life' => 3, 'residu' => 2000000, 'cat' => 0, 'loc' => 1],
            ['name' => 'Sony Alpha 7 IV (Kit)', 'code_prefix' => 'CAM-SNY', 'price' => 35000000, 'life' => 4, 'residu' => 5000000, 'cat' => 0, 'loc' => 1],
            ['name' => 'Cisco Catalyst Switch 48-Port', 'code_prefix' => 'NET-CSCO', 'price' => 65000000, 'life' => 7, 'residu' => 5000000, 'cat' => 1, 'loc' => 2],
            ['name' => 'Synology NAS Storage 24TB', 'code_prefix' => 'NET-NAS', 'price' => 18000000, 'life' => 5, 'residu' => 1000000, 'cat' => 1, 'loc' => 2],
            ['name' => 'MikroTik Cloud Core Router', 'code_prefix' => 'NET-MTK', 'price' => 12000000, 'life' => 5, 'residu' => 1000000, 'cat' => 1, 'loc' => 2],
            ['name' => 'Ergonomic Office Chair Herman Miller', 'code_prefix' => 'FNT-CHR', 'price' => 22000000, 'life' => 8, 'residu' => 2000000, 'cat' => 2, 'loc' => 0],
            ['name' => 'Epson Laser Projector 4K', 'code_prefix' => 'FNT-PRJ', 'price' => 15000000, 'life' => 4, 'residu' => 1000000, 'cat' => 2, 'loc' => 1],
            ['name' => 'Toyota Avanza Veloz Dinas', 'code_prefix' => 'VHC-AVZ', 'price' => 285000000, 'life' => 10, 'residu' => 50000000, 'cat' => 3, 'loc' => 3],
            ['name' => 'Honda Vario 160 CC CBS', 'code_prefix' => 'VHC-VR', 'price' => 27000000, 'life' => 8, 'residu' => 5000000, 'cat' => 3, 'loc' => 3],
            ['name' => 'Printer Laser A3 Brother', 'code_prefix' => 'OFF-PRT', 'price' => 8500000, 'life' => 5, 'residu' => 750000, 'cat' => 2, 'loc' => 4],
            ['name' => 'Fingerprint Access Device', 'code_prefix' => 'SEC-FP', 'price' => 4200000, 'life' => 4, 'residu' => 500000, 'cat' => 1, 'loc' => 4],
        ];

        $bulkAssets = [
            ['name' => 'Pulpen Gel Hitam', 'code_prefix' => 'BUL-PEN', 'price' => 45000, 'life' => 2, 'residu' => 0, 'cat' => 2, 'loc' => 1, 'quantity' => 120],
            ['name' => 'Notebook A5 Kantor', 'code_prefix' => 'BUL-NBK', 'price' => 18000, 'life' => 2, 'residu' => 0, 'cat' => 2, 'loc' => 1, 'quantity' => 200],
            ['name' => 'Mouse Wireless Logitech', 'code_prefix' => 'BUL-MSE', 'price' => 250000, 'life' => 3, 'residu' => 20000, 'cat' => 0, 'loc' => 0, 'quantity' => 45],
            ['name' => 'Kabel HDMI 3 Meter', 'code_prefix' => 'BUL-HDM', 'price' => 85000, 'life' => 3, 'residu' => 5000, 'cat' => 1, 'loc' => 2, 'quantity' => 60],
            ['name' => 'Flashdisk 32GB', 'code_prefix' => 'BUL-FLS', 'price' => 65000, 'life' => 2, 'residu' => 5000, 'cat' => 0, 'loc' => 0, 'quantity' => 80],
            ['name' => 'Baterai AA Pack', 'code_prefix' => 'BUL-BTR', 'price' => 30000, 'life' => 1, 'residu' => 0, 'cat' => 2, 'loc' => 4, 'quantity' => 150],
            ['name' => 'Kertas HVS A4 80gsm', 'code_prefix' => 'BUL-HVS', 'price' => 55000, 'life' => 1, 'residu' => 0, 'cat' => 2, 'loc' => 1, 'quantity' => 300],
            ['name' => 'Tinta Printer Hitam', 'code_prefix' => 'BUL-INK', 'price' => 125000, 'life' => 1, 'residu' => 0, 'cat' => 2, 'loc' => 1, 'quantity' => 40],
        ];

        $singleStatuses = ['tersedia', 'rusak', 'sedang diperbaiki', 'hilang', 'dibuang'];
        $bulkStatuses = ['tersedia', 'habis', 'hilang', 'kadaluarsa'];

        $seedAsset = function (array $template, string $type, string $status, int $sequence) use (&$counter, $catModels, $locModels) {
            $monthsAgo = $counter * 2;
            $purchaseDate = Carbon::now()->subMonths($monthsAgo)->format('Y-m-d');
            $assetCode = $template['code_prefix'] . '-' . str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);

            $asset = Asset::firstOrCreate(
                ['asset_code' => $assetCode],
                [
                    'uuid' => (string) Str::uuid(),
                    'name' => $template['name'] . ' #' . $sequence,
                    'type' => $type,
                    'quantity' => $type === 'bulk' ? $template['quantity'] : 1,
                    'asset_category_id' => $catModels[$template['cat']]->id,
                    'asset_location_id' => $locModels[$template['loc']]->id,
                    'purchase_date' => $purchaseDate,
                    'purchase_price' => $template['price'],
                    'useful_life_years' => $template['life'],
                    'residual_value' => $template['residu'],
                    'status' => $status,
                    'notes' => $type === 'bulk'
                        ? 'Stok bulk untuk operasional harian.'
                        : 'Aset tunggal untuk inventaris utama.',
                ]
            );

            $counter++;

            return $asset;
        };

        $seedBorrowingHistory = function (Asset $asset, string $status, int $sequence, bool $canBorrow = true) use ($borrowers) {
            if (!$canBorrow || $asset->borrowings()->exists()) {
                return;
            }

            if ($status === 'sedang diperbaiki' || $status === 'rusak' || $status === 'dibuang' || $status === 'kadaluarsa') {
                return;
            }

            if ($status === 'borrowed' || $sequence % 5 === 0) {
                $isOverdue = $sequence % 2 === 0;

                if ($isOverdue) {
                    $borrowedAt = Carbon::now()->subMonths(2);
                    $expectedReturn = Carbon::now()->subMonth();
                } else {
                    $borrowedAt = Carbon::now()->subDays(3);
                    $expectedReturn = Carbon::now()->addDays(4);
                }

                AssetBorrowing::create([
                    'asset_id' => $asset->id,
                    'borrower_name' => $borrowers[array_rand($borrowers)],
                    'borrowed_at' => $borrowedAt->format('Y-m-d H:i:s'),
                    'expected_return_at' => $expectedReturn->format('Y-m-d H:i:s'),
                    'returned_at' => null,
                    'notes' => $isOverdue ? 'Keperluan audit lapangan mendesak.' : 'Operasional divisi harian.',
                ]);
            }

            if ($status === 'available' || $status === 'tersedia' || $sequence % 3 === 0) {
                AssetBorrowing::create([
                    'asset_id' => $asset->id,
                    'borrower_name' => $borrowers[array_rand($borrowers)],
                    'borrowed_at' => Carbon::now()->subMonths(4)->format('Y-m-d H:i:s'),
                    'expected_return_at' => Carbon::now()->subMonths(4)->addDays(5)->format('Y-m-d H:i:s'),
                    'returned_at' => Carbon::now()->subMonths(4)->addDays(4)->format('Y-m-d H:i:s'),
                    'notes' => 'Dipinjam untuk pameran IT tahunan.',
                ]);
            }
        };

        $sequence = 1;

        foreach ($singleAssets as $index => $template) {
            $status = $singleStatuses[$index % count($singleStatuses)];
            $asset = $seedAsset($template, 'single', $status, $sequence);
            $seedBorrowingHistory($asset, $status, $sequence, true);
            $sequence++;
        }

        foreach ($bulkAssets as $index => $template) {
            $status = $bulkStatuses[$index % count($bulkStatuses)];
            $asset = $seedAsset($template, 'bulk', $status, $sequence);
            $seedBorrowingHistory($asset, $status, $sequence, false);
            $sequence++;
        }

        for ($batch = 1; $batch <= 2; $batch++) {
            foreach ($singleAssets as $index => $template) {
                $status = $singleStatuses[($index + $batch) % count($singleStatuses)];
                $asset = $seedAsset($template, 'single', $status, $sequence);
                $seedBorrowingHistory($asset, $status, $sequence, true);
                $sequence++;
            }

            foreach ($bulkAssets as $index => $template) {
                $status = $bulkStatuses[($index + $batch) % count($bulkStatuses)];
                $asset = $seedAsset($template, 'bulk', $status, $sequence);
                $seedBorrowingHistory($asset, $status, $sequence, false);
                $sequence++;
            }
        }
    }
}