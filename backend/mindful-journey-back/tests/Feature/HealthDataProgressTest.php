<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Diagnostic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthDataProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_progress_includes_challenges_field()
    {
        $user = User::factory()->create();
        // create diagnostics last 2 days
        Diagnostic::factory()->create([
            'user_id'=>$user->id,
            'stress_level'=>5,
            'energy_level'=>6,
            'completed_at'=>now()->subDay(),
            'answers'=>['mood_emoji'=>'😊','sleep_quality'=>'bonne']
        ]);
        Diagnostic::factory()->create([
            'user_id'=>$user->id,
            'stress_level'=>4,
            'energy_level'=>7,
            'completed_at'=>now(),
            'answers'=>['mood_emoji'=>'😐','sleep_quality'=>'moyenne']
        ]);

        $this->actingAs($user);

        $resp = $this->getJson('/api/health-data/progress');
        $resp->assertStatus(200);
        $data = $resp->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);
        $first = $data[array_key_last($data)]; // last day
        $this->assertArrayHasKey('challenges',$first);
        $this->assertArrayHasKey('mood',$first);
    }

    public function test_upsert_today_creates_and_updates()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $payload = [
            'stress_level'=>7,
            'energy_level'=>5,
            'answers'=>['mood_emoji'=>'🙂']
        ];
        $r1 = $this->putJson('/api/diagnostic/today',$payload)->assertStatus(200);
        $id = $r1->json('id');
        $this->assertNotNull($id);

        $r2 = $this->putJson('/api/diagnostic/today',[
            'energy_level'=>8,
            'answers'=>['sleep_quality'=>'bonne']
        ])->assertStatus(200);
        $this->assertEquals($id,$r2->json('id'));
        $this->assertEquals(8,$r2->json('energy_level'));
        $this->assertEquals('bonne',$r2->json('answers.sleep_quality'));
    }
}
