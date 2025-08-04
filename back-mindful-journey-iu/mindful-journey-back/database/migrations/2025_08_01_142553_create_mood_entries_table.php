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
        Schema::create('mood_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('mood_level')->comment('1-10 niveau d\'humeur');
            $table->string('mood_emoji', 10)->nullable();
            $table->integer('energy_level')->nullable()->comment('1-10 niveau d\'énergie');
            $table->integer('stress_level')->nullable()->comment('1-10 niveau de stress');
            $table->integer('sleep_quality')->nullable()->comment('1-10 qualité du sommeil');
            $table->text('notes')->nullable();
            $table->json('activities')->nullable()->comment('Activités de la journée');
            $table->json('emotions')->nullable()->comment('Émotions ressenties');
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['user_id', 'date']);
            $table->unique(['user_id', 'date']); // Une seule entrée par jour par utilisateur
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mood_entries');
    }
};
