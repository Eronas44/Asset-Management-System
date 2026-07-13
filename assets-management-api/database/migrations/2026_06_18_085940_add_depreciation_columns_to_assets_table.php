<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->integer('useful_life_years')->default(5)->after('purchase_price'); // Umur manfaat (tahun)
            $table->decimal('residual_value', 15, 2)->default(0)->after('useful_life_years'); // Nilai sisa/residu
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['useful_life_years', 'residual_value']);
        });
    }
};
