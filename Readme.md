# Webhooks Server

This is a server to process webhook requests from Github.
It creates new app releases on the [Nextcloud app store](https://apps.nextcloud.com).

## Implemented methods
`/release?app=APPNAME` – Releases an app version to the app store.

## Setup

**Note:**
- This server expects a repository with name `nextcloud-app-releases` under your `GITHUB_USERNAME` that holds the published versions of your apps. The server will push a new version of your app this repository automatically and will tell the appstore to pull the app package from there as well. Your `nextcloud-app-releases` is the single source of truth for your apps.
- Naming has to be consistent. The repository name of your app needs to equal to your app's name in the appstore and must be available under your `GITHUB_USERNAME` configured in `.env`.

**Usage:** Configure a webhook for each of your apps. Example: `https://webhooks.example.org/release?app={YOUR_APP_NAME}`. The server will only listen for `published` events of `releases`. Make sure to configure your webhook accordingly. If you did, whenever you publish a release in your app's repository in Github this webhook server will get a request and automatically run through the following steps:

1. Clone the app's repository at the tag of the release for which the webhook as called
2. Create a tarball of your app's code
3. Sign the tarball with your app's signing secret
4. Create a new commit in your `nextcloud-app-releases` repository for the specific app and push
5. Posts a new release to the Nextcloud app store


**Getting up and running:**
- Clone the repository to public server that runs `node.js` (>= 10.x.x)
- Provide secrets by copying `.env.example` to `.env` and filling in all variables
- Set-up a reverse proxy to publish the app's port `3000` to port `443` on your server and make sure to set-up SSL certificates. (You could use a docker setup with containers [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and [nginx-proxy-letsencrypt-companion](https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion))
- Configure Github to send webhooks to the app (make sure the secret matches in your `.env` file)
- Put your app's signing key in `~/.nextcloud/certificates/{YOUR_APP_NAME}.key`
- Create an SSH-keypair and add it to your Github account, so the release can be pushed to the releases repository
