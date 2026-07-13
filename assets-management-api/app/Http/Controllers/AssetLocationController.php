<?php

namespace App\Http\Controllers;

use App\Models\AssetLocation;
use App\Http\Requests\StoreAssetLocationRequest;
use App\Http\Resources\AssetLocationResource;
use Illuminate\Http\JsonResponse;
use App\Services\ActivityLogger;

class AssetLocationController extends Controller
{

        /**
     * @OA\Get(
     *      path="/api/asset-locations",
     *      operationId="getAssetLocationsList",
     *      tags={"Asset Locations"},
     *      summary="Daftar Lokasi Aset",
     *      description="Mengambil semua daftar lokasi penempatan fisik aset.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Sukses memuat list lokasi"),
     *      @OA\Response(response=401, description="Unauthorized")
     * )
     */

    public function index()
    {
        $locations = AssetLocation::latest()->get();
        
        return AssetLocationResource::collection($locations);
    }

        /**
     * @OA\Post(
     *      path="/api/asset-locations",
     *      operationId="storeAssetLocation",
     *      tags={"Asset Locations"},
     *      summary="Tambah Lokasi Baru",
     *      description="Menyimpan data master lokasi fisik baru ke database.",
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name", "code"},
     *              @OA\Property(property="name", type="string", example="Ruang IT"),
     *              @OA\Property(property="code", type="string", example="IT-01"),
     *              @OA\Property(property="description", type="string", example="Gedung A Lantai 2")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Lokasi Berhasil Ditambahkan"),
     *      @OA\Response(response=422, description="Validasi Gagal / Kode Duplikat")
     * )
     */

    public function store(StoreAssetLocationRequest $request): JsonResponse
    {
        $location = AssetLocation::create($request->validated());
        ActivityLogger::log('create_location', "Menambahkan lokasi master baru: {$location->name} ({$location->code})", $location);

        return response()->json([
            'message' => 'Success',
            'data' => new AssetLocationResource($location)
        ], 201);

    }
}
