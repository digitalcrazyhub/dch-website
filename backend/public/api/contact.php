<?php

declare(strict_types=1);

/**
 * Digital Crazy Hub - Public Contact Form API Endpoint
 * File: backend/public/api/contact.php
 */

// Error handling settings for production API
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Locate Composer autoloader
$autoloaderPath = dirname(__DIR__, 2) . '/vendor/autoload.php';
if (!file_exists($autoloaderPath)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Backend configuration error: Dependencies not installed. Run composer install.'
    ]);
    exit;
}

require_once $autoloaderPath;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Controllers\ContactController;
use DigitalCrazyHub\Backend\Security\Logger;

try {
    // Initialize environment variables
    Env::load(dirname(__DIR__, 2));

    // Execute Contact Controller
    $controller = new ContactController();
    $controller->handle();
} catch (\Throwable $e) {
    Logger::critical('Uncaught exception in contact.php endpoint', [
        'exception' => get_class($e),
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ]);

    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected internal error occurred. Please try again later.'
    ]);
}
