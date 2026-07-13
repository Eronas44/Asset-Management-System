<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase; // Mengosongkan database testing setiap kali sebuah skenario test selesai dijalankan

    public function test_login_berhasil_dengan_kredensial_valid()
    {
        $user = User::factory()->create([
            'email' => 'test@asset.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@asset.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => ['token', 'user']
                 ]);
    }

    public function test_login_gagal_jika_password_salah()
    {
        $user = User::factory()->create([
            'email' => 'test@asset.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@asset.com',
            'password' => 'salahpassword',
        ]);

        $response->assertStatus(421)
                 ->assertJson([
                     'message' => 'Kredensial yang Anda masukkan salah.'
                 ]);
    }

    public function test_akses_endpoint_terproteksi_ditolak_jika_tanpa_token()
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401); // Unauthorized
    }
}
