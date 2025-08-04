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
        Schema::create('meditation_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('duration_minutes');
            $table->string('category'); // 'breathing', 'mindfulness', 'sleep', 'stress', 'focus'
            $table->integer('difficulty_level')->default(1); // 1=Débutant, 2=Intermédiaire, 3=Avancé
            $table->string('audio_url')->nullable();
            $table->string('image_url')->nullable();
            $table->json('instructions')->nullable(); // Instructions étape par étape
            $table->json('benefits')->nullable(); // Bénéfices de cette méditation
            $table->boolean('is_favorite')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->json('session_data')->nullable(); // Données spécifiques à la session
            $table->timestamps();
            
            // Index pour les requêtes fréquentes
            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'completed_at']);
            $table->index(['category', 'difficulty_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meditation_sessions');
    }
};
