<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(\App\Http\Middleware\SecureHeadersMiddleware::class);
        $middleware->redirectGuestsTo(fn () => null);
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        
        // Cencegat dan format ulang seluruh error yang terjadi pada request API
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                
                // 1. Generate Trace ID unik untuk mempermudah pelacakan log
                $traceId = (string) Str::uuid();
                
                // 2. Tentukan status code dan format pesan berdasarkan tipe Exception
                $statusCode = 500;
                $message = 'Internal Server Error';
                $errors = null;

                if ($e instanceof ValidationException) {
                    $statusCode = 422;
                    $message = 'Validation failed';
                    $errors = $e->errors();
                } elseif ($e instanceof AuthenticationException || ($e instanceof \Symfony\Component\Routing\Exception\RouteNotFoundException && str_contains($e->getMessage(), 'login'))) {
                    $statusCode = 401;
                    $message = 'Unauthorized';
                } elseif ($e instanceof AuthorizationException || $e instanceof \Spatie\Permission\Exceptions\UnauthorizedException) {
                    $statusCode = 403;
                    $message = 'Forbidden';
                } elseif ($e instanceof ModelNotFoundException || $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    $statusCode = 404;
                    $message = 'Resource Not Found';
                } elseif ($e instanceof HttpException) {
                    $statusCode = $e->getStatusCode();
                    $message = $e->getMessage();
                }

                if ($statusCode === 500) {
                    \Illuminate\Support\Facades\Log::error("Unhandled API exception [{$traceId}]: " . $e->getMessage(), [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }

                // 3. Bangun struktur respons gagal yang seragam sesuai instruksi kerja
                $response = [
                    'message' => $message,
                    'trace_id' => $traceId
                ];

                if ($errors) {
                    $response['errors'] = $errors;
                }

                // Jika di lingkungan lokal/development, tambahkan info detail untuk mempermudah perbaikan
                if (config('app.debug') && $statusCode === 500) {
                    $response['debug'] = [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => array_slice($e->getTrace(), 0, 5)
                    ];
                }

                return response()->json($response, $statusCode);
            }
        });
    })->create();
