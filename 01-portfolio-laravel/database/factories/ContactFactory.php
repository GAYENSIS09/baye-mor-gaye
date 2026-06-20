<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContactFactory extends Factory
{
    protected $model = Contact::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'email' => fake()->email(),
            'sujet' => fake()->sentence(3),
            'message' => fake()->paragraph(3),
            'est_lu' => fake()->boolean(30),
        ];
    }

    public function nonLu(): static
    {
        return $this->state(fn(array $a) => ['est_lu' => false]);
    }
}
