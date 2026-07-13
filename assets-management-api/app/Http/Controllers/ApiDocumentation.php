<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Asset Management System API Documentation",
    description: "Dokumentasi RESTful API otomatis untuk sistem manajemen inventaris dan sirkulasi aset kantor."
)]
#[OA\Server(
    url: "http://127.0.0.1:8000",
    description: "Lokal API Server"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Masukkan token hasil login (Personal Access Token Sanctum) dengan format: Bearer <token>"
)]
class ApiDocumentation
{
    // Menggunakan PHP Native Attributes (Lebih direkomendasikan untuk Laravel modern)
}
