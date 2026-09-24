const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 8080
const REMOTE_PORT = 9229

const server = http.createServer((req, res) => {
  if (req.url === '/json') {
    const proxy = http.request({
      hostname: '127.0.0.1',
      port: 9229,
      path: '/json',
      method: 'GET'
    }, response => {
      res.writeHead(response.statusCode || 200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })

      response.pipe(res)
    })

    proxy.on('error', error => {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      })

      res.end(JSON.stringify({
        error: error.message
      }))
    })

    proxy.end()
    return
  }

  const file = path.join(__dirname, 'index.html')

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(500)
      res.end(error.message)
      return
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    })

    res.end(data)
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Firefox Node Debugger: http://localhost:${PORT}`)
})

