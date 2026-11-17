<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/assets/{filename}', function ($filename) {
    $path = storage_path('app/public/assets/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
});

