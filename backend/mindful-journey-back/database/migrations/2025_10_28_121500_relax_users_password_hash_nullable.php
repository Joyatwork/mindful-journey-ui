<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'password_hash')) {
            try {
                DB::statement("ALTER TABLE `users` MODIFY `password_hash` varchar(255) NULL");
            } catch (\Throwable $e) {
                // ignore if already nullable or alter not needed
            }
        }
    }

    public function down(): void
    {
        // no-op, we don't want to force NOT NULL back
    }
};
