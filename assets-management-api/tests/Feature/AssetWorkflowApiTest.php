<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetLocation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AssetWorkflowApiTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $staff;
    private $category;
    private $location;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup Master Peran dan Izin Keamanan
        $manageAssets = Permission::create(['name' => 'manage-assets']);
        $manageBorrowings = Permission::create(['name' => 'manage-borrowings']);
        
        $adminRole = Role::create(['name' => 'admin'])->givePermissionTo([$manageAssets, $manageBorrowings]);
        $staffRole = Role::create(['name' => 'staff'])->givePermissionTo([$manageBorrowings]);

        // 2. Buat Akun Pengujian Menggunakan Peran Masing-masing
        $this->admin = User::factory()->create();
        $this->admin->assignRole($adminRole);

        $this->staff = User::factory()->create();
        $this->staff->assignRole($staffRole);

        // 3. Buat Data Master Contoh
        $this->category = AssetCategory::create(['name' => 'Laptop']);
        $this->location = AssetLocation::create(['name' => 'Gedung Utama', 'code' => 'GD-01']);
    }

    public function test_tambah_aset_berhasil_oleh_pengaruh_role_admin()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/assets', [
                'asset_code' => 'AST-001',
                'name' => 'ThinkPad X1 Carbon',
                'asset_category_id' => $this->category->id,
                'asset_location_id' => $this->location->id,
                'purchase_date' => '2026-01-01',
                'purchase_price' => 20000000,
                'useful_life_years' => 5,
                'residual_value' => 2000000,
                'status' => 'available'
            ]);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'ThinkPad X1 Carbon']);
    }

    public function test_tambah_aset_ditolak_403_jika_diakses_oleh_role_staff_tanpa_permission_manage_assets()
    {
        $response = $this->actingAs($this->staff, 'sanctum')
            ->postJson('/api/assets', [
                'asset_code' => 'AST-002',
                'name' => 'iPad Pro M4',
            ]);

        $response->assertStatus(403); // Forbidden terpusat dari exception handler Tugas 37
    }

    public function test_staff_dapat_membaca_daftar_aset_kategori_dan_lokasi()
    {
        $this->actingAs($this->staff, 'sanctum')
            ->getJson('/api/assets')
            ->assertOk();

        $this->actingAs($this->staff, 'sanctum')
            ->getJson('/api/asset-categories')
            ->assertOk();

        $this->actingAs($this->staff, 'sanctum')
            ->getJson('/api/asset-locations')
            ->assertOk();
    }

    public function test_proses_transaksi_peminjaman_dan_perubahan_status_otomatis()
    {
        // Buat aset awal berstatus available
        $asset = Asset::create([
            'asset_code' => 'AST-PC-10',
            'name' => 'Dell Workstation',
            'asset_category_id' => $this->category->id,
            'asset_location_id' => $this->location->id,
            'purchase_date' => '2026-01-01',
            'purchase_price' => 15000000,
            'useful_life_years' => 5,
            'residual_value' => 1000000,
            'status' => 'available'
        ]);

        // Kirim request peminjaman oleh Staff
        $response = $this->actingAs($this->staff, 'sanctum')
            ->postJson('/api/asset-borrowings', [
                'asset_id' => $asset->id,
                'borrower_name' => 'Eronas Developer',
                'borrowed_at' => '2026-06-23 09:00:00',
                'expected_return_at' => '2026-06-25 17:00:00',
            ]);

        $response->assertStatus(201);
        
        // Verifikasi Mutasi Data di SQLite: Pastikan status aset saat ini berubah menjadi 'borrowed'
        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'status' => 'borrowed'
        ]);
    }
}
