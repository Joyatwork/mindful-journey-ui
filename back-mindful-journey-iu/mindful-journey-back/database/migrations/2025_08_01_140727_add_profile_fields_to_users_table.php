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
        Schema::table('users', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('email_verified_at');
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable()->after('birth_date');
            $table->string('phone', 20)->nullable()->after('gender');
            $table->text('bio')->nullable()->after('phone');
            $table->string('avatar')->nullable()->after('bio');
            $table->json('preferences')->nullable()->after('avatar'); // Préférences wellness
            $table->json('health_goals')->nullable()->after('preferences'); // Objectifs de santé
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('health_goals');
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date',
                'gender',
                'phone',
                'bio',
                'avatar',
                'preferences',
                'health_goals',
                'status',
                'last_login_at'
            ]);
        });
    }
};
