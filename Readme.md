# Webhooks Server

This is a server to process and proxy webhook requests from Github.
It creates new app releases on the [Nextcloud app store](https://apps.nextcloud.com).

## Implemented methods
`/release?app=APPNAME` – Releases an app version to the app store.
