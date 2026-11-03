<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use App\Http\Requests\StoreAssetCategoryRequest;
use App\Http\Requests\UpdateAssetCategoryRequest;
use App\Http\Resources\AssetCategoryResource;
use Illuminate\Http\JsonResponse;
use App\Services\ActivityLogger;

class AssetCategoryController extends Controller
{

        /**
     * @OA\Get(
     *      path="/api/asset-categories",
     *      operationId="getAssetCategoriesList",
     *      tags={"Asset Categories"},
     *      summary="Daftar Kategori Aset",
     *      description="Mengambil semua daftar kategori data master aset.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Sukses memuat list kategori",
     *          @OA\JsonContent(@OA\Property(property="data", type="array", @OA\Items(type="object")))
     *      ),
     *      @OA\Response(response=401, description="Unauthorized")
     * )
     */

    public function index()
    {
        $categories = AssetCategory::latest()->get();
        
        // Menggunakan Resource Collection untuk membungkus list data
        return AssetCategoryResource::collection($categories);
    }


        /**
     * @OA\Post(
     *      path="/api/asset-categories",
     *      operationId="storeAssetCategory",
     *      tags={"Asset Categories"},
     *      summary="Tambah Kategori Baru",
     *      description="Menyimpan kategori data master baru ke database.",
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name"},
     *              @OA\Property(property="name", type="string", example="Elektronik"),
     *              @OA\Property(property="description", type="string", example="Laptop, Monitor, AC")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Kategori Berhasil Ditambahkan"),
     *      @OA\Response(response=422, description="Validasi Gagal / Nama Duplikat")
     * )
     */
    public function store(StoreAssetCategoryRequest $request): JsonResponse
    {
        // Data otomatis tervalidasi dari StoreAssetCategoryRequest
        $category = AssetCategory::create($request->validated());
        ActivityLogger::log('create_category', "Menambahkan kategori master baru: {$category->name}", $category);

        return response()->json([
            'message' => 'Success',
            'data' => new AssetCategoryResource($category)
        ], 201);
    }

    /**
     * Memperbarui kategori master aset.
     */
    public function update(UpdateAssetCategoryRequest $request, int $id): JsonResponse
    {
        $category = AssetCategory::findOrFail($id);

        $category->update($request->validated());

        ActivityLogger::log('update_category', "Memperbarui kategori aset: {$category->name}", $category);

        return response()->json([
            'message' => 'Kategori berhasil diperbarui',
            'data' => new AssetCategoryResource($category)
        ], 200);
    }

    /**
     * Menghapus kategori master aset (Soft Delete).
     */
    public function destroy(int $id): JsonResponse
    {
        $category = AssetCategory::findOrFail($id);

        if ($category->assets()->exists()) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh aset yang terdaftar.'
            ], 422);
        }

        $categoryName = $category->name;
        $category->delete();

        ActivityLogger::log('delete_category', "Menghapus kategori aset: {$categoryName}", $category);

        return response()->json([
            'message' => 'Kategori berhasil dihapus'
        ], 200);
    }
}
