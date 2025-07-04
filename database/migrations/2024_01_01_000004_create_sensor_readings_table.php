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
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained()->onDelete('cascade');
            $table->decimal('value', 10, 2);
            $table->timestamp('reading_time')->useCurrent();
            $table->timestamps();
            
            // Index for faster queries
            $table->index(['sensor_id', 'reading_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_readings');
    }
}; 