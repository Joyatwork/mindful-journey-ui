<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create services table if it doesn't exist
        if (!Schema::hasTable('services')) {
            Schema::create('services', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedInteger('price_cents')->default(0);
                $table->unsignedInteger('duration_minutes')->nullable();
                $table->timestamps();
            });
        }

        // Create practitioner_services link table if neither practitioner_services nor specialist_services exist
        if (!Schema::hasTable('practitioner_services') && !Schema::hasTable('specialist_services')) {
            Schema::create('practitioner_services', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('practitioner_id');
                $table->unsignedBigInteger('service_id');
                $table->timestamps();

                // Add indexes and FKs where possible
                $table->index('practitioner_id');
                $table->index('service_id');
                try {
                    if (Schema::hasTable('practitioners')) {
                        $table->foreign('practitioner_id')->references('id')->on('practitioners')->onDelete('cascade');
                    }
                    if (Schema::hasTable('services')) {
                        $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
                    }
                } catch (\Throwable $e) {
                    // On some MySQL flavors, adding FKs during creation might fail if referenced table engine/collation differs.
                    // It's safe to proceed without FKs in dev.
                }
            });
        }

        // Best-effort: if appointments table has service_id and it's NOT NULL but there is no services table, we cannot fix here.
        // This migration focuses on creating services + link table safely without altering existing appointments schema.
    }

    public function down(): void
    {
        // Non destructive down: don't drop tables to avoid data loss in shared DB
        // If you want to drop in local dev, uncomment below.
        // Schema::dropIfExists('practitioner_services');
        // Schema::dropIfExists('services');
    }
};
