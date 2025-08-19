<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specialists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('specialty');
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('experience_years')->default(0);
            $table->unsignedInteger('price_cents')->default(0);
            $table->string('availability')->nullable();
            $table->enum('consultation_type', ['video', 'inPerson', 'both'])->default('both');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('image_url')->nullable();
            $table->json('education')->nullable();
            $table->json('languages')->nullable();
            $table->unsignedInteger('review_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('specialists');
    }
};
