<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('diagnostics', function (Blueprint $table) {
            // scope: quick (diagnostic court / hebdo) ou annual (diagnostic annuel approfondi)
            $table->string('scope', 20)->default('quick')->after('user_id');
            $table->index(['user_id', 'scope', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::table('diagnostics', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'scope', 'completed_at']);
            $table->dropColumn('scope');
        });
    }
};
