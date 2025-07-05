<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained()->onDelete('cascade');
            $table->float('value');
            $table->timestamps();

            // Index for quick lookups of recent readings
            $table->index(['sensor_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('sensor_readings');
    }
}; 