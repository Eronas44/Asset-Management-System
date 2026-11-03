<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
        /**
     * @OA\Get(
     *      path="/api/users",
     *      operationId="getUsersList",
     *      tags={"User Management"},
     *      summary="Daftar Akun Pengguna",
     *      description="Mengambil list seluruh pengguna aplikasi beserta perannya untuk keperluan otorisasi administrasi.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Sukses memuat list pengguna")
     * )
     */

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        
        // Eager loading model roles bawaan Spatie untuk efisiensi kueri
        $users = User::with('roles')->latest()->paginate($perPage);

        return UserResource::collection($users);
    }

        /**
     * @OA\Post(
     *      path="/api/users",
     *      operationId="storeUser",
     *      tags={"User Management"},
     *      summary="Daftarkan Pengguna Baru",
     *      description="Membuat kredensial akun pengguna baru internal organisasi.",
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name", "email", "password", "role"},
     *              @OA\Property(property="name", type="string", example="Riko Darmawan"),
     *              @OA\Property(property="email", type="string", format="email", example="riko@asset.com"),
     *              @OA\Property(property="password", type="string", minLength=8, example="securepassword123"),
     *              @OA\Property(property="role", type="string", example="staff")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Pengguna Berhasil Terdaftar"),
     *      @OA\Response(response=422, description="Email Duplikat / Sandi Kurang Panjang")
     * )
     */

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            // 1. Simpan data pengguna ke database
            $newUser = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // 2. Tetapkan role awal via paket Spatie
            $newUser->assignRole($request->role);

            return $newUser;
        });

        // 3. Catat ke Audit Trail Aktivitas
        ActivityLogger::log('create_user', "Mendaftarkan pengguna baru bernama: {$user->name} dengan peran: {$request->role}", $user);

        return response()->json([
            'message' => 'Success',
            'data' => new UserResource($user)
        ], 201);
    }

        /**
     * @OA\Patch(
     *      path="/api/users/{id}/role",
     *      operationId="updateUserRole",
     *      tags={"User Management"},
     *      summary="Ubah Peran Hak Akses Pengguna",
     *      description="Memutasi atau mengganti kepemilikan peran (role) pengguna secara dinamis.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="ID User", required=true, @OA\Schema(type="integer")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"role"},
     *              @OA\Property(property="role", type="string", example="admin")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Peran Sukses Diperbarui")
     * )
     */

    public function updateRole(UpdateUserRoleRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // 1. Proteksi Self-Lockout: Cegah user mengubah rolenya sendiri
        if ($request->user() && $request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat mengubah peran akun Anda sendiri demi mencegah penguncian akses.'
            ], 400);
        }

        // 2. Proteksi Superuser Terakhir: Cegah penghapusan satu-satunya superuser di sistem
        if ($user->hasRole('superuser') && $request->role !== 'superuser') {
            $superuserCount = User::role('superuser')->count();
            if ($superuserCount <= 1) {
                return response()->json([
                    'message' => 'Tidak dapat mengubah peran. Sistem harus memiliki minimal satu akun Superuser aktif.'
                ], 400);
            }
        }

        $oldRoles = $user->getRoleNames()->implode(', ');

        DB::transaction(function () use ($request, $user) {
            // Sesuai perintah langkah kerja: Hapus role lama dan tetapkan role baru
            $user->syncRoles([$request->role]);
        });

        // Catat ke Audit Trail Aktivitas
        ActivityLogger::log('update_user_role', "Mengubah peran pengguna {$user->name} dari ({$oldRoles}) menjadi ({$request->role})", $user);

        return response()->json([
            'message' => 'Success',
            'data' => new UserResource($user)
        ], 200);
    }
}
