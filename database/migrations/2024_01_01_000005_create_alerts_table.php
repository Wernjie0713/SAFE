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
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained()->onDelete('cascade');
            $table->string('type'); // e.g., 'threshold_exceeded', 'sensor_offline'
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->text('description');
            $table->enum('status', ['new', 'acknowledged', 'resolved'])->default('new');
            $table->timestamps();
            
            // Indexes for faster querying
            $table->index('status');
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
}; 