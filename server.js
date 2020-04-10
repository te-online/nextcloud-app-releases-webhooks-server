const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const cors = require('cors')
const superagent = require('superagent')
const crypto = require('crypto')
const fs = require('fs')
const exec = require('child_process').exec
require('dotenv').config()

/**
 * Store raw body to use for github signature check.
 */
const rawBodyRecorder = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8')
  }
}

const server = express()
server.use(cors())
server.use(helmet())
server.use(bodyParser.json({ verify: rawBodyRecorder })) // support json encoded bodies

/**
 * Allows to detect that the server is up
 */
server.get('/', (req, res) => {
  res.sendStatus(200)
})

/**
 * Create a release and push it to the nextcloud app store
 */
server.post('/release', rawBodyRecorder, (req, res) => {
  // Verify webhook signature
  const verified = verifyWebhookSignature(
    req.headers['x-hub-signature'],
    process.env.GITHUB_WEBHOOKS_SECRET,
    req.rawBody,
  )
  if (!verified) {
    sendError(res, { public: true, msg: 'Signature not verified.' })
    return
  }

  if (req.body.action === 'published' && req.body.release) {
    const { app } = req.query
    const { tag_name } = req.body.release
    const { clone_url } = req.body.repository
    return Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          exec(
            `bash ./clone.sh "${clone_url}" "${app}" "${tag_name}" "${process.env.GITHUB_USERNAME}" "${process.env.GITHUB_TOKEN}"`,
            error => {
              if (error) {
                reject(error)
                return
              }
              resolve()
            },
          )
        })
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          exec(
            `bash ./make.sh "${app}" "${tag_name}" "${process.env.GITHUB_USERNAME}"`,
            error => {
              if (error) {
                reject(error)
                return
              }
              resolve()
            },
          )
        })
      })
      .then(() => {
        // Load saved file
        let releaseConfig = {}
        try {
          const releaseConfigData = fs.readFileSync('./releaseconfig.json')
          releaseConfig = JSON.parse(releaseConfigData)
        } catch (e) {
          return Promise.reject('Could not parse release config.')
        }
        // Send release URL and signature to nextcloud apps API
        return superagent
          .post('https://apps.nextcloud.com/api/v1/apps/releases')
          .set({
            Authorization: `Token ${process.env.APPS_DIRECTORY_TOKEN}`,
          })
          .send({
            download: releaseConfig.downloadUrl,
            signature: releaseConfig.signatureBase64,
          })
      })
      .then(() => {
        // Remove temp folders
        return clean()
      })
      .then(() => {
        res.sendStatus(200)
        return Promise.resolve()
      })
      .catch(e => {
        sendError(res, e)
        // Remove temp folders
        clean()
        return Promise.resolve()
      })
  } else {
    res.statusCode = 200
    res.send(
      'No action taken. Payload structure did not match expected structure.',
    )
  }
})

const sendError = (res, e) => {
  console.error(e)
  if (e && e.public) {
    res.statusCode = 400
    res.send(e.msg)
  } else {
    res.sendStatus(500)
  }
}

const verifyWebhookSignature = (signature, secret, payload) => {
  if (!signature || !secret) {
    return false
  }
  const computedSignature = `sha1=${crypto
    .createHmac('sha1', secret)
    .update(payload)
    .digest('hex')}`
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature),
  )
}

const clean = () => {
  return new Promise((resolve, reject) => {
    exec(`bash ./clean.sh`, error => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}.`) // eslint-disable-line no-console
})
