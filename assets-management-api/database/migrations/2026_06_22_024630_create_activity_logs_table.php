<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            // user_id dibuat nullable untuk mengantisipasi log sistem otomatis atau jika di luar sesi login
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // misal: login, create_asset, return_asset
            $table->string('subject_type')->nullable(); // Nama model target, misal: App\Models\Asset
            $table->unsignedBigInteger('subject_id')->nullable(); // ID target data
            $table->text('description'); // Penjelasan aktivitas human-readable
            $table->json('properties')->nullable(); // Detail data tambahan berbentuk JSON
            $table->timestamp('created_at')->useCurrent(); // Hanya mencatat waktu buat tanpa updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
