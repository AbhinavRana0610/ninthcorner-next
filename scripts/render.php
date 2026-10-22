<?php
// Renders one page of the legacy PHP site exactly as Apache would serve it.
// Usage: php render.php <docroot> <relative/file.php> <request-uri>
[, $root, $rel, $uri] = $argv;

$file = $root . '/' . $rel;
$_SERVER['REQUEST_URI']     = $uri;
$_SERVER['SCRIPT_NAME']     = '/' . $rel;
$_SERVER['SCRIPT_FILENAME'] = $file;
$_SERVER['REQUEST_METHOD']  = 'GET';
$_SERVER['HTTP_HOST']       = 'www.ninthcorner.in';
$_SERVER['HTTPS']           = 'on';

error_reporting(0);
chdir(dirname($file));
include $file;
