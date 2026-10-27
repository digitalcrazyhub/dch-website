<?php

declare(strict_types=1);

/**
 * Digital Crazy Hub - Request Company Profile Download Token Endpoint
 * File: backend/public/api/request-company-profile.php
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

$autoloaderPath = dirname(__DIR__, 2) . '/vendor/autoload.php';
if (!file_exists($autoloaderPath)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['success' => false, 'message' => 'Backend autoloader not found.']);
    exit;
}

require_once $autoloaderPath;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Controllers\ProfileDownloadController;
use DigitalCrazyHub\Backend\Security\Logger;

try {
    Env::load(dirname(__DIR__, 2));
    $controller = new ProfileDownloadController();
    $controller->handleSubmission();
} catch (\Throwable $e) {
    Logger::critical('Uncaught exception in request-company-profile.php', [
        'exception' => get_class($e),
        'message' => $e->getMessage()
    ]);

    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected internal error occurred. Please try again later.'
    ]);
}
