const PORT = 3000

console.log('Starting server ...')

require('dotenv').config()
const express = require('express')
const favicon = require('serve-favicon')
const path = require('path')
const logger = require('morgan')
const helmet = require('helmet')
const fs = require('fs')

// ----- DB ------
var Mon = require('mongodb').MongoClient;
var url = process.env.URL
let connection
let db
async function dbConnect() {
  try {
    connection = await Mon.connect(url)
  } catch(err) {
    throw err
  }
}
dbConnect().then(() => {
  db = connection.db('uvu')
})

// ----- SERVER ------
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(`${__dirname}/public/favicon.ico`)))
app.use(logger('dev'))
app.use(helmet({
  contentSecurityPolicy: false
}))

// REST API

// List courses
app.get('/api/v1/courses', async (req, res) => {
  let courses = await db.collection('courses').find({}).toArray(function (err, res) {
    if (err) throw err
    return res
  })
  res.send(courses) // send the course list
})

// List logs
app.get('/api/v1/logs', async (req, res) => {
  let cid = req.query.courseId
  let stuid = req.query.uvuId
  let logs = await db.collection(`${cid}`).find({'uvuId':stuid}).toArray(function (err, res) {
    if (err) throw err
    return res
  })
  console.log(cid)
  console.log(stuid)
  console.log(logs)
  res.send(logs)
})

// Create log
app.post('/api/v1/logs', async (req, res) => {
  let newLog = req.body
  await db.collection(req.body.courseId).insertOne(newLog)
  res.status(201)
  res.send(newLog)
})

// static files
app.use(express.static('public')) 

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/public/404.html`)
})

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

const shutdown = () => {
  console.log('Shutting down server.')
  server.close()
  db.close()
}

process.on('SIGINT', shutdown)
process.on('SIGBREAK', shutdown)
process.on('SIGTERM', shutdown)