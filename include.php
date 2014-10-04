<?php
error_reporting(E_ALL);
ini_set('display_errors', true);

define('ROOT', __DIR__);
//define('SLUG', '/Users/Dave/OneDrive/Scripts/genetic-cars/public/');
define('SLUG', '/Users/petah_000/SkyDrive/Scripts/genetic-cars/public/');

function css($name, $media = null) {
	$prefix = '';
	$suffix = '';
	$mtime = '';

	if (!preg_match('~.css$~', $name)) {
		$suffix = '.css';
	}

	if (!preg_match('~^//~', $name)) {
		$prefix = SLUG . '/css/';
	} else {
		$file = ROOT . '/public/css/' . $name . $suffix;
		$mtime = is_file($file) ? ('?' . filemtime($file)) : '';
	}

    // if ($media) {
    //     return "<link type='text/css' rel='stylesheet' href='$file$mtime' media='$media' />" . PHP_EOL;
    // }
    return "<link type='text/css' rel='stylesheet' href='" . $prefix . $name . $suffix . $mtime . "' />" . PHP_EOL;
}

function js($name) {
	$prefix = '';
	$suffix = '';
	$mtime = '';

	if (!preg_match('~.js$~', $name)) {
		$suffix = '.js';
	}

	if (!preg_match('~^//~', $name)) {
		$prefix = SLUG . '/js/';
	} else {
		$file = ROOT . '/public/js/' . $name . $suffix;
		$mtime = is_file($file) ? ('?' . filemtime($file)) : '';
	}

    return "<script type='text/javascript' src='" . $prefix . $name . $suffix . $mtime . "'></script>" . PHP_EOL;
}
