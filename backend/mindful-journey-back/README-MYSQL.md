# Using MySQL instead of SQLite

This backend defaults to SQLite for quick local runs. To switch to MySQL:

## Prerequisites
- A running MySQL or MariaDB server (local Docker Desktop or system install)
- PHP with `pdo_mysql` extension enabled

## Update .env
Edit `backend/mindful-journey-back/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mindful_journey
DB_USERNAME=root
DB_PASSWORD=
```

Tip: if `.env` is missing, copy it from `.env.example` and generate the app key:

```
copy .env.example .env
php artisan key:generate
```

## Create the database (optional)
If your MySQL user has privileges and you have the `mysql` CLI installed, you can create the DB:

```
mysql -h 127.0.0.1 -P 3306 -u root -p -e "CREATE DATABASE IF NOT EXISTS `mindful_journey` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Run migrations
```
php artisan migrate --force
```

## Start the backend
```
php artisan serve --host=127.0.0.1 --port=8081
```

## Helper script for Windows
Alternatively, use the helper script to update `.env`, optionally create the DB, and run migrations:

```
./switch-to-mysql.ps1 -DbName mindful_journey -DbUser root -DbPassword "" -DbHost 127.0.0.1 -DbPort 3306 -CreateDb
```

Notes:
- Frontend configuration does not change; it continues to call the backend API.
- Data from SQLite will not be migrated automatically. Use seeders or export/import if needed.
