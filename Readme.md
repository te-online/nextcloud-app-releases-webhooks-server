# Webhooks Server

This is a server to process and proxy webhook requests from Github.
It creates new app releases on the [Nextcloud app store](https://apps.nextcloud.com).

## Implemented methods
`/release?app=APPNAME` – Releases an app version to the app store.

## Setup

**Note:** There are a few hardcoded values right now, so make sure to fork this repository, if you want to use the server for your own apps.

- Clone the repository to public server that runs `node.js` (>= 10.x.x)
- Provide secrets by copying `.env.example` to `.env` and filling in all variables
- Set-up a reverse proxy to publish the app's port `3000` to port `443` on your server and make sure to set-up SSL certificates. (You could use a docker setup with containers [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and [nginx-proxy-letsencrypt-companion](https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion))
- Configure Github to send webhooks to the app (make sure the secret matches in your `.env` file)
- Put your app's signing key in `~/.nextcloud/certificates/$APPNAME.key`