<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Constrain to the canonical practitioners table (specialists table removed)
            $table->foreignId('specialist_id')->constrained('practitioners')->onDelete('cascade');
            $table->dateTime('scheduled_at');
            $table->enum('type', ['video', 'inPerson', 'phone'])->default('video');
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('confirmed');
            $table->unsignedInteger('price_cents')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Empêcher deux RDV à la même date/heure pour le même utilisateur (peu importe le médecin)
            $table->unique(['user_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
