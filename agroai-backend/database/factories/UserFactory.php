<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class UserFactory extends Factory
{
    protected $model = User::class;

    // Cache photos across multiple factory calls in one process
    protected static $pexelsPhotos = null;

    public function definition(): array
    {
        return [
            'name'           => $this->faker->name(),
            'email'          => $this->faker->unique()->safeEmail(),
            'password'       => bcrypt('password'),
            'image_url'      => $this->pexelsImageUrl() ?? $this->faker->imageUrl(200, 200, 'people'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Try to fetch a Pexels image URL (medium/large) for "corporate man".
     * Returns null on any failure so we can gracefully fall back.
     */
    protected function pexelsImageUrl(): ?string
    {
        // You can also use config('services.pexels.key') if you prefer
        $key = env('PEXELS_API_KEY');
        if (!$key) {
            return null;
        }

        try {
            if (static::$pexelsPhotos === null) {
                $res = Http::timeout(8)
                    ->withHeaders(['Authorization' => $key])
                    ->get('https://api.pexels.com/v1/search', [
                        'query'       => 'corporate man',
                        'per_page'    => 80,
                        'orientation' => 'square', // portrait/landscape/square — optional
                    ]);

                if (!$res->ok()) {
                    return null;
                }

                $photos = $res->json('photos') ?? [];

                // Prefer 'medium' or 'large' thumbnail urls
                static::$pexelsPhotos = array_values(array_filter(array_map(function ($p) {
                    $src = $p['src'] ?? null;
                    return $src['medium'] ?? ($src['large'] ?? ($src['small'] ?? null));
                }, $photos)));
            }

            if (!empty(static::$pexelsPhotos)) {
                return static::$pexelsPhotos[array_rand(static::$pexelsPhotos)];
            }
        } catch (\Throwable $e) {
            // swallow error and fallback to faker image
        }

        return null;
    }
}
