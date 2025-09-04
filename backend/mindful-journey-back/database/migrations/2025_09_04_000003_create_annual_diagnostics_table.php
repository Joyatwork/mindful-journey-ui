<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('annual_diagnostics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('gender', 30)->nullable();
            $table->string('age_group', 30)->nullable();
            $table->string('department', 120)->nullable();
            $table->unsignedTinyInteger('stress_level');
            $table->unsignedTinyInteger('energy_level');
            $table->string('work_pressure');
            $table->json('answers');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_diagnostics');
    }
};
