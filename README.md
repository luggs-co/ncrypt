# NCrypt

Home of ncrypt.

This readme will get updated when a more polished version of the code is completed.


TODO: https://gist.github.com/luggs-co/1a0dc5f161f18e5861e3 (Comments welcome)

## Dependencies

* Webserver
* PHP
* Database: MySQL (or compatible) or PostgreSQL

## Dev Dependencies

* cssmin
* uglifyjs
* make

## Deploy

www is the "public" base directory for your webserver.

All requests that don't target a static file should be handled through index.php; the path after
the base url should be given as PATH_INFO (append as path to index.php), see resources/rewriterules.txt

Configure database access and other customizations in www/inc/config-local.inc.php (you have to create it)

    <?php
      $__config['database']['username'] = 'ncrypt';
      $__config['database']['password'] = '...';
      $__config['database']['type'] = 'mysql'; // default if unset. for PostgreSQL use 'pgsql'
      
Make sure you run "make" as it will generated all the required css/javascript files (and update templates accordingly) used on the website.

## Directory structure

* Makefile:  
  run "make" after modifying/updating scripts to make sure generated files
  are up to date before committing.
* develop/:  
  scripts to maintain generated files
* resources/:
  documentation of cipher modes, sql definitions, web server config examples
* source/:  
  javascript sources and 3rd party repositories (`git submodule update --init --recursive`)
* www/:  
  doc root (the public visible part)  
  you should make sure clients can NOT read www/inc/config-local.inc.php in plain text, as
  this file usually contains your database credentials.
* www/inc/config.php:  
  config default values; don't modify them, instead create www/inc/config-local.inc.php like:
