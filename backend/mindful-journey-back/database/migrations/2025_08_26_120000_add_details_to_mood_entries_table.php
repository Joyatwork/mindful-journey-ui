<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('mood_entries', 'details')) {
            Schema::table('mood_entries', function (Blueprint $table) {
                $table->text('details')->nullable()->after('notes');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('mood_entries', 'details')) {
            Schema::table('mood_entries', function (Blueprint $table) {
                $table->dropColumn('details');
            });
        }
    }
};
