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
        // Add column if missing
        if (!Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('role_id')->nullable()->after('id');
            });
        }

        // Attach FK only if roles table already exists (MySQL order-safe)
        if (Schema::hasTable('roles')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('role_id')->references('id')->on('roles');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role_id')) {
                // Drop FK if exists then column
                try { $table->dropForeign(['role_id']); } catch (\Throwable $e) {}
                $table->dropColumn('role_id');
            }
        });
    }
};
