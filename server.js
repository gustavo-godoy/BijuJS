#!/usr/bin/env nodejs

/* Imports */
const express = require('express')
const { execFile } = require('child_process')
const morgan = require('morgan');

/* Init and Configure */
const BijuJS = express()
const port = '3000'
BijuJS.use(express.json());
BijuJS.use(morgan('tiny'));
BijuJS.use(express.static('public', {extensions:['html']}))

const viewEngine = false

/* Setup View Engine if enabled */
if (viewEngine) {
  BijuJS.set('view engine', viewEngine)
  BijuJS.get('/:anything', (request, response) => {
    file = request.params['anything']
    response.render(file)
  })
}

/* POST requests for services */
BijuJS.post('/run/:service', (request, response) => {
  service = request.params['service']
  args = request.body['args']

  execFile(`run/${service}`, args, (error, stdout, stderr) => {
    let status;
    if (error) {
      status =  `${error.code}`
      if(error.code == "ENOENT") {
        response.status(404)
      } else {
        response.status(500)
      }
    } else {
      status = '0'
    }

    response.send({
      'status': status,
      'stdout': stdout,
      'stderr': stderr,
      'service': service,
      'args': args
    })
  })
})

/* 404 */
BijuJS.use((request, response, next) => {
  response.status(404).sendFile('public/404.html', {root: __dirname})
})

/* Bind to socket & listen */
BijuJS.listen(port, () => {
  console.log(`BijuJS is running on localhost:${port}!`)
})
