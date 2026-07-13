<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code')->unique();
            $table->string('name');
            
            // Foreign Key relasi ke tabel kategori dan lokasi dengan cascade on delete
            $table->foreignId('asset_category_id')->constrained('asset_categories')->onDelete('cascade');
            $table->foreignId('asset_location_id')->constrained('asset_locations')->onDelete('cascade');
            
            $table->date('purchase_date');
            $table->decimal('purchase_price', 15, 2)->default(0);
            
            // Status diatur menggunakan string dengan nilai awal bawaan (enum alternatif)
            $table->string('status')->default('available'); 
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
