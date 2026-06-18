<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('/scanner');
    }

    public function test_authenticated_user_accessing_login_redirects_to_home(): void
    {
        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@sppg.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->actingAs($user)->get('/login');

        $response->assertRedirect('/dashboard');
    }
}
