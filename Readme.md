# Webhooks Server

This is a server to process and proxy webhook requests from Github.
It creates new app releases on the nextcloud app store.

## Implemented methods
`/release?app=APPNAME` – Releases an app version to the app store.

## Deployment
- Deployment is run through travis, once code is pushed to `master`.