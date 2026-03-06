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
        Schema::table('challenges', function (Blueprint $table) {
            $table->unsignedInteger('duration_minutes')->default(10)->after('description');
            $table->string('difficulty', 20)->default('easy')->after('duration_minutes');
            $table->string('category', 50)->nullable()->after('difficulty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->dropColumn(['duration_minutes', 'difficulty', 'category']);
        });
    }
};
