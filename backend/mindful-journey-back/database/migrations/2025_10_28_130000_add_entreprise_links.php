<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // users.entreprise_id
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'entreprise_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('entreprise_id')->nullable()->after('status');
                $table->index('entreprise_id', 'users_entreprise_id_index');
            });
            // tentative d'ajout de FK si la table entreprises existe
            if (Schema::hasTable('entreprises')) {
                try {
                    Schema::table('users', function (Blueprint $table) {
                        $table->foreign('entreprise_id', 'users_entreprise_id_foreign')
                            ->references('id')->on('entreprises')->nullOnDelete();
                    });
                } catch (\Throwable $e) {
                    // ignorer en cas de contrainte déjà existante
                }
            }
        }

        // employees.entreprise_id
        if (Schema::hasTable('employees') && !Schema::hasColumn('employees', 'entreprise_id')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->unsignedBigInteger('entreprise_id')->nullable()->after('user_id');
                $table->index('entreprise_id', 'employees_entreprise_id_index');
            });
            if (Schema::hasTable('entreprises')) {
                try {
                    Schema::table('employees', function (Blueprint $table) {
                        $table->foreign('entreprise_id', 'employees_entreprise_id_foreign')
                            ->references('id')->on('entreprises')->nullOnDelete();
                    });
                } catch (\Throwable $e) {
                    // ignorer si déjà présent
                }
            }
        }
    }

    public function down(): void
    {
        // Retirer FKs et colonnes proprement si présentes
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'entreprise_id')) {
            try {
                Schema::table('users', function (Blueprint $table) {
                    $table->dropForeign('users_entreprise_id_foreign');
                });
            } catch (\Throwable $e) {
            }
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_entreprise_id_index');
                $table->dropColumn('entreprise_id');
            });
        }

        if (Schema::hasTable('employees') && Schema::hasColumn('employees', 'entreprise_id')) {
            try {
                Schema::table('employees', function (Blueprint $table) {
                    $table->dropForeign('employees_entreprise_id_foreign');
                });
            } catch (\Throwable $e) {
            }
            Schema::table('employees', function (Blueprint $table) {
                $table->dropIndex('employees_entreprise_id_index');
                $table->dropColumn('entreprise_id');
            });
        }
    }
};
