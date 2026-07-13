<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_borrowings', function (Blueprint $table) {
            $table->string('borrowed_by_user_name')->nullable()->after('borrower_name');
        });
    }

    public function down(): void
    {
        Schema::table('asset_borrowings', function (Blueprint $table) {
            $table->dropColumn('borrowed_by_user_name');
        });
    }
};