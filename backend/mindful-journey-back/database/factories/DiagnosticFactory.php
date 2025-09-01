<?php

namespace Database\Factories;

use App\Models\Diagnostic;
use Illuminate\Database\Eloquent\Factories\Factory;

class DiagnosticFactory extends Factory
{
    protected $model = Diagnostic::class;

    public function definition(): array
    {
        return [
            'user_id'=>1, // override in test
            'stress_level'=> $this->faker->numberBetween(1,10),
            'energy_level'=> $this->faker->numberBetween(1,10),
            'work_pressure'=> $this->faker->randomElement(['faible','moyenne','élevée']),
            'answers'=> [
                'mood_emoji'=> $this->faker->randomElement(['😊','😐','😔']),
                'sleep_quality'=> $this->faker->randomElement(['bonne','moyenne','mauvaise'])
            ],
            'completed_at'=> now(),
        ];
    }
}
