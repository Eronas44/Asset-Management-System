<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Services\ActivityLogger;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{

// 2. Ubah anotasi di atas method login() menjadi seperti ini:
#[OA\Post(
    path: "/api/login",
    operationId: "userLogin",
    tags: ["Auth"],
    summary: "Autentikasi Pengguna",
    description: "Memvalidasi kredensial pengguna dan mengembalikan Personal Access Token."
)]
#[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
        required: ["email", "password"],
        properties: [
            new OA\Property(property: "email", type: "string", format: "email", example: "admin@asset.com"),
            new OA\Property(property: "password", type: "string", format: "password", example: "password123")
        ]
    )
)]
#[OA\Response(
    response: 200,
    description: "Login Berhasil",
    content: new OA\JsonContent(
        properties: [
            new OA\Property(property: "message", type: "string", example: "Success"),
            new OA\Property(property: "data", type: "object")
        ]
    )
)]
#[OA\Response(response: 422, description: "Validasi Input Gagal")]
public function login(Request $request): JsonResponse
    {
        // 1. Validasi input form
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // 2. Cari user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // 3. Verifikasi keberadaan user dan kecocokan password
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Kredensial yang Anda masukkan salah.'
            ], 421);
        }

        // 4. Hapus token lama (Opsional: Memastikan hanya ada 1 sesi aktif per akun)
        $user->tokens()->delete();

        // 5. Buat personal access token baru via Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLogger::log('login', "Pengguna {$user->name} berhasil masuk ke dalam sistem aplikasi.");

        // 6. Kembalikan respons JSON yang konsisten
        return response()->json([
                'message' => 'Success',
                'data' => [
                    'token' => $token,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                    ]
                ]
            ], 200);
    }

    /**
 * Mengambil profil data user beserta role dan permission aktif.
 */
public function me(Request $request): JsonResponse
{
    $user = $request->user();

    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ],
        // Mengambil hanya nama role dan nama permission ke dalam bentuk array string sederhana
        'roles' => $user->getRoleNames(), 
        'permissions' => $user->getAllPermissions()->pluck('name'),
    ], 200);
}
}
