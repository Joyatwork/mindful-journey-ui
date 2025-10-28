<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Align users table to app expectations without dropping existing columns
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                // Core auth/profile fields
                if (!Schema::hasColumn('users', 'name')) {
                    $table->string('name')->nullable();
                }
                if (!Schema::hasColumn('users', 'email_verified_at')) {
                    $table->timestamp('email_verified_at')->nullable();
                }
                if (!Schema::hasColumn('users', 'password')) {
                    $table->string('password')->nullable();
                }
                if (!Schema::hasColumn('users', 'remember_token')) {
                    $table->string('remember_token', 100)->nullable();
                }

                // Profile enrichment
                if (!Schema::hasColumn('users', 'birth_date')) {
                    $table->date('birth_date')->nullable();
                }
                if (!Schema::hasColumn('users', 'gender')) {
                    $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
                }
                if (!Schema::hasColumn('users', 'bio')) {
                    $table->text('bio')->nullable();
                }
                if (!Schema::hasColumn('users', 'avatar')) {
                    $table->string('avatar')->nullable();
                }
                if (!Schema::hasColumn('users', 'preferences')) {
                    $table->json('preferences')->nullable();
                }
                if (!Schema::hasColumn('users', 'health_goals')) {
                    $table->json('health_goals')->nullable();
                }
                if (!Schema::hasColumn('users', 'status')) {
                    $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
                }
                if (!Schema::hasColumn('users', 'last_login_at')) {
                    $table->timestamp('last_login_at')->nullable();
                }

                // OAuth / roles
                if (!Schema::hasColumn('users', 'google_id')) {
                    $table->string('google_id')->nullable()->unique();
                }
                if (!Schema::hasColumn('users', 'provider')) {
                    $table->string('provider')->nullable();
                }
                if (!Schema::hasColumn('users', 'avatar_url')) {
                    $table->string('avatar_url')->nullable();
                }
                if (!Schema::hasColumn('users', 'role_id')) {
                    $table->unsignedBigInteger('role_id')->nullable();
                }
            });

            // Backfill values where possible
            try {
                // Populate name from first_name + last_name if available and name is NULL
                DB::statement("UPDATE `users` SET `name` = TRIM(CONCAT(COALESCE(first_name,''), ' ', COALESCE(last_name,''))) WHERE `name` IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL)");
            } catch (\Throwable $e) {}

            try {
                // If legacy password_hash exists and password is null, copy it
                if (Schema::hasColumn('users', 'password_hash')) {
                    // Relax legacy constraint to avoid 1364 errors on insert
                    try { DB::statement("ALTER TABLE `users` MODIFY `password_hash` varchar(255) NULL"); } catch (\Throwable $e) {}
                    DB::statement("UPDATE `users` SET `password` = `password_hash` WHERE `password` IS NULL AND `password_hash` IS NOT NULL");
                }
            } catch (\Throwable $e) {}

            // Attach FK for role_id if roles table exists and FK not present
            if (Schema::hasTable('roles') && Schema::hasColumn('users', 'role_id')) {
                try {
                    $existing = DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'users_role_id_foreign'");
                    if (empty($existing)) {
                        DB::statement('ALTER TABLE `users` ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)');
                    }
                } catch (\Throwable $e) {}
            }
        }

        // diagnostics: add scope + composite index if not present
        if (Schema::hasTable('diagnostics')) {
            Schema::table('diagnostics', function (Blueprint $table) {
                if (!Schema::hasColumn('diagnostics', 'scope')) {
                    $table->string('scope', 20)->default('quick')->after('user_id');
                }
            });
            try {
                if (Schema::hasColumn('diagnostics', 'completed_at')) {
                    DB::statement('CREATE INDEX IF NOT EXISTS diagnostics_user_scope_completed_idx ON diagnostics (user_id, scope, completed_at)');
                }
            } catch (\Throwable $e) {}
        }

        // mood_entries: add details
        if (Schema::hasTable('mood_entries')) {
            Schema::table('mood_entries', function (Blueprint $table) {
                if (!Schema::hasColumn('mood_entries', 'details')) {
                    $table->text('details')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        // Non destructive: we won't drop columns on down to avoid data loss
    }
};
