<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Asset;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Backfill setiap baris aset yang belum memiliki UUID unik
        Asset::withTrashed()
            ->whereNull('uuid')
            ->orWhere('uuid', '')
            ->chunkById(100, function ($assets) {
                foreach ($assets as $asset) {
                    $asset->uuid = (string) Str::uuid();
                    $asset->saveQuietly();
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Tidak perlu membatalkan UUID yang sudah di-generate
    }
};
