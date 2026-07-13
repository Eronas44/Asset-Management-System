<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    // Rate Limiter untuk Login: Maksimal 5 request per menit per IP
    RateLimiter::for('login', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip())->response(function () {
            return response()->json(['message' => 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'], 429);
        });
    });

    // Rate Limiter untuk Backup: Maksimal 10 request per menit per IP
    RateLimiter::for('backups', function (Request $request) {
        return Limit::perMinute(10)->by($request->ip());
    });

    // Rate Limiter untuk User Admin: Maksimal 60 request per menit per IP
    RateLimiter::for('user-admin', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
}
