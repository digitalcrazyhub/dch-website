<?php

declare(strict_types=1);

/**
 * Digital Crazy Hub - Stream Protected Company Profile PDF Endpoint
 * File: backend/public/api/download-company-profile.php
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

$autoloaderPath = dirname(__DIR__, 2) . '/vendor/autoload.php';
if (!file_exists($autoloaderPath)) {
    http_response_code(500);
    echo "Backend configuration error: dependencies missing.";
    exit;
}

require_once $autoloaderPath;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Controllers\ProfileDownloadController;
use DigitalCrazyHub\Backend\Security\Logger;

try {
    Env::load(dirname(__DIR__, 2));
    $controller = new ProfileDownloadController();
    $controller->handleDownload();
} catch (\Throwable $e) {
    Logger::critical('Uncaught exception in download-company-profile.php', [
        'exception' => get_class($e),
        'message' => $e->getMessage()
    ]);

    http_response_code(500);
    echo "An unexpected error occurred while preparing your download. Please try again later.";
}
