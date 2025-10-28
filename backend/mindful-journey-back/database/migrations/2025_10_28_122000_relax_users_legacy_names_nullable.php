<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            try {
                if (Schema::hasColumn('users', 'first_name')) {
                    DB::statement("ALTER TABLE `users` MODIFY `first_name` varchar(255) NULL");
                }
                if (Schema::hasColumn('users', 'last_name')) {
                    DB::statement("ALTER TABLE `users` MODIFY `last_name` varchar(255) NULL");
                }
            } catch (\Throwable $e) {
                // ignore
            }
        }
    }

    public function down(): void
    {
        // do not force NOT NULL back
    }
};
