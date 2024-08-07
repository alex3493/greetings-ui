# greetings-ui

This is front-end Vue 3 application for testing Symfony API [project](https://github.com/alex3493/greetings-api)

This application uses web-sockets to listen to **Pusher** events set from API. You have to
provide your own Pusher account data in configuration (see step 4 in installation).

This application requires user login. You can log in using pre-seeded admin user credentials:

- email: admin@greetings.com
- password: password

You can also register a new user in UI following "register" link in login form. Note, that UI registration
always creates regular users (ROLE_USER). If you need more admin users you can create them in API console (
See [API project documentation](https://github.com/alex3493/greetings-api/blob/main/Readme.md))

## Menu structure

### Greetings (home page)

This view lists 10 latest greetings registered in API database.

User can create a new greeting, edit and delete his own greetings. If you are logged in as admin
you can edit and delete any greeting.

### Dashboard

This view shows current user profile, allows update user first / last names and password.

If current user has logged in from a mobile app before, this list of his registered mobile devices
is also displayed. See [API project documentation](https://github.com/alex3493/greetings-api/blob/main/Readme.md) on how to create user
mobile app logins in Swagger API Docs.

Then user can log out from single device or log out from all devices (sign out). **Note: this action doesn't affect
current user WEB account.**

### User name

Dropdown menu with single "Log Out" item.

### Admin Greeting (only available to admin users)

Send a greeting to all users currently viewing the application. This is a volatile message that
is not persisted anywhere. This is a pure demo of Pusher connectivity feature.

## How to install

1. Clone this repo
2. cd to project root folder
3. cp .env .env.local
4. Edit .env.local file: set `VUE_APP_PUSHER_CLUSTER` and `VUE_APP_PUSHER_APP_KEY` env variables using your account data.

### *** IMPORTANT *** API is configured to accept https requests and uses self-signed SSL certificate.
**Do not forget** to visit https://symfony.test and accept browser security warning, otherwise all requests to API with fail.

### Docker (prod mode)

5. Run `docker compose build`
6. Run `docker compose up -d`

### Local hot-reload (dev mode)

5. Run `npm install`
6. Run `npm run serve`



