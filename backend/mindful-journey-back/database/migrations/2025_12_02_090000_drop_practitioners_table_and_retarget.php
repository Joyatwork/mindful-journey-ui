<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Drop any FKs in the schema that reference `practitioners`
        try {
            $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            if ($dbName) {
                $refs = DB::select(
                    'SELECT CONSTRAINT_NAME, TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?',
                    [$dbName, 'practitioners']
                );
                foreach ($refs as $ref) {
                    try {
                        DB::statement('ALTER TABLE `' . $ref->TABLE_NAME . '` DROP FOREIGN KEY `' . $ref->CONSTRAINT_NAME . '`');
                    } catch (\Throwable $e) {
                        // ignore individual failures
                    }
                }
            }
        } catch (\Throwable $e) { /* noop */
        }

        // Retarget foreign keys in appointments from `practitioners` to `specialists` if needed
        if (Schema::hasTable('appointments')) {
            // Drop FK on specialist_id referencing practitioners if it exists
            try {
                // Conventional name appointments_specialist_id_foreign
                DB::statement('ALTER TABLE appointments DROP FOREIGN KEY appointments_specialist_id_foreign');
            } catch (\Throwable $e) { /* ignore if not present */
            }
            // If column practitioner_id exists and also references practitioners via FK, drop that too
            if (Schema::hasColumn('appointments', 'practitioner_id')) {
                try {
                    DB::statement('ALTER TABLE appointments DROP FOREIGN KEY appointments_practitioner_id_foreign');
                } catch (\Throwable $e) {
                }
            }
            // Recreate FK towards specialists table if it exists
            if (Schema::hasTable('specialists')) {
                Schema::table('appointments', function (Blueprint $table) {
                    if (Schema::hasColumn('appointments', 'specialist_id')) {
                        $table->foreign('specialist_id')->references('id')->on('specialists')->onDelete('cascade');
                    }
                    if (Schema::hasColumn('appointments', 'practitioner_id') && !Schema::hasColumn('appointments', 'specialist_id')) {
                        // Fallback: if only practitioner_id column exists, target specialists
                        $table->foreign('practitioner_id')->references('id')->on('specialists')->onDelete('cascade');
                    }
                });
            }
        }

        // Drop practitioners table if present
        if (Schema::hasTable('practitioners')) {
            Schema::drop('practitioners');
        }
    }

    public function down(): void
    {
        // Recreate practitioners table minimal structure (loss of original data) for rollback safety
        if (!Schema::hasTable('practitioners')) {
            Schema::create('practitioners', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('entreprise_id')->nullable();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('specialty')->nullable();
                $table->string('license_number')->nullable();
                $table->text('bio')->nullable();
                $table->timestamps();
            });
        }

        // Attempt to retarget foreign keys back to practitioners if the column exists
        if (Schema::hasTable('appointments') && Schema::hasTable('practitioners')) {
            // Drop current FK(s) to specialists
            try {
                DB::statement('ALTER TABLE appointments DROP FOREIGN KEY appointments_specialist_id_foreign');
            } catch (\Throwable $e) {
            }
            try {
                DB::statement('ALTER TABLE appointments DROP FOREIGN KEY appointments_practitioner_id_foreign');
            } catch (\Throwable $e) {
            }
            Schema::table('appointments', function (Blueprint $table) {
                if (Schema::hasColumn('appointments', 'specialist_id')) {
                    $table->foreign('specialist_id')->references('id')->on('practitioners')->onDelete('cascade');
                }
                if (Schema::hasColumn('appointments', 'practitioner_id') && !Schema::hasColumn('appointments', 'specialist_id')) {
                    $table->foreign('practitioner_id')->references('id')->on('practitioners')->onDelete('cascade');
                }
            });
        }
    }
};
