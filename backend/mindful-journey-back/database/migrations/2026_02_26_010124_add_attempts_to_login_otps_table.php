<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('login_otps', function (Blueprint $table) {
            if (!Schema::hasColumn('login_otps', 'attempts')) {
                $table->unsignedTinyInteger('attempts')->default(0)->after('consumed_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('login_otps', function (Blueprint $table) {
            if (Schema::hasColumn('login_otps', 'attempts')) {
                $table->dropColumn('attempts');
            }
        });
    }
};
