# Core Frontend

# Dev Setup

```
cp .env.example .env

# CRA webpack dev server (disabled clearing console)
npm start
```

Add `127.0.0.1 thirtyfive.dev.localhost` to your `/etc/hosts` (This prevents some issues with cookies from different apps sharing the `localhost` domain).

## Seed backend

```
cd repos/gd-scratch/packages/apps/api
bin/cli.js db:seed:replant --database=primary --env=development
```

A user is created with:

```
Login: `vaughan@thirtyfive.com`
Password: `thirtyfive2020`
```

## Admin panel

NOTE: In production `/` redirects to `/users/myscouts`. Just never got around to changing it to `/admin`.

```
open http://thirtyfive.dev.localhost:3000/
```

## Scouting app

```
open http://thirtyfive.dev.localhost:3000/users/myscouts
```

