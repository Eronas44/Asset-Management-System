<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Menandai apakah aset dikelola sebagai unit tunggal atau stok/batch
            $table->enum('type', ['single', 'bulk'])->default('single')->after('name');

            // Jumlah unit untuk aset bulk; single selalu 1
            $table->integer('quantity')->default(1)->after('type');
        });

        DB::table('assets')->update([
            'type' => 'single',
            'quantity' => 1,
        ]);
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['type', 'quantity']);
        });
    }
};