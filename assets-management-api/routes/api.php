<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\AssetLocationController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetBorrowingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BackupController;

// =========================================================================
// ENDPOINT PUBLIK (Tanpa Login / Bebas Akses)
// =========================================================================
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Penerapan pembatasan laju login untuk mencegah brute force
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::get('/public/assets/{uuid}', [AssetController::class, 'showPublic']);


// =========================================================================
// ENDPOINT TERPROTEKSI (Wajib Login & Cek Permission)
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Profil user bisa diakses oleh siapa saja yang sudah login
    Route::get('/me', [AuthController::class, 'me']);

    // Grup Hak Akses: manage-master-data
    Route::middleware('permission:manage-master-data')->group(function () {
        Route::get('/asset-categories', [AssetCategoryController::class, 'index']);
        Route::post('/asset-categories', [AssetCategoryController::class, 'store']);
        
        Route::get('/asset-locations', [AssetLocationController::class, 'index']);
        Route::post('/asset-locations', [AssetLocationController::class, 'store']);
    });

    // Grup Hak Akses: manage-assets
    Route::middleware('permission:manage-assets')->group(function () {
        Route::get('/assets', [AssetController::class, 'index']);
        Route::post('/assets', [AssetController::class, 'store']);
        Route::get('/assets/{id}', [AssetController::class, 'show']);
    });

    // Grup Hak Akses Manajemen Pengguna: manage-users
    Route::middleware('permission:manage-users')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{id}/role', [UserController::class, 'updateRole']);
        
        // Penerapan pembatasan laju cadangan data (backup) untuk menghemat resource server
        Route::middleware('throttle:backups')->group(function () {
            Route::get('/backups', [BackupController::class, 'index']);
            Route::post('/backups', [BackupController::class, 'store']);
            Route::get('/backups/{file}/download', [BackupController::class, 'download']);
            Route::post('/backups/{file}/restore', [BackupController::class, 'restore']);
        });
    });

    // Grup Hak Akses: manage-borrowings
    Route::middleware('permission:manage-borrowings')->group(function () {
        Route::get('/asset-borrowings', [AssetBorrowingController::class, 'index']);
        Route::post('/asset-borrowings', [AssetBorrowingController::class, 'store']);
        Route::patch('/asset-borrowings/{id}/return', [AssetBorrowingController::class, 'markAsReturned']);
    });

    // Grup Hak Akses: view-reports (Dipisah agar independen dari rute peminjaman)
    Route::middleware('permission:view-reports')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
        Route::get('/dashboard/alerts', [DashboardController::class, 'getAlerts']); 
        Route::get('/reports/assets/export/csv', [ReportController::class, 'exportCsv']);
        Route::get('/reports/assets/export/pdf', [ReportController::class, 'exportPdf']);
        
        // Endpoint Audit Trail Baru
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });

});
