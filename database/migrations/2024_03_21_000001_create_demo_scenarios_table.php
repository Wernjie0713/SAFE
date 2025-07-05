<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('demo_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('scenario_name')->unique();
            $table->string('description');
            $table->json('data_sequence');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('demo_scenarios');
    }
}; 