const path = require('path')
const fs = require('fs')
const http = require('http')

const DEFAULT_PORT = 8080
const DEFAULT_INSPECTOR_PORT = 9229

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env')

  if (!fs.existsSync(envPath)) {
    return {}
  }

  const env = {}

  const content = fs.readFileSync(envPath, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const index = trimmed.indexOf('=')

    if (index === -1) {
      continue
    }

    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

function getArgument(name) {
  const index = process.argv.indexOf(name)

  if (index === -1) {
    return undefined
  }

  return process.argv[index + 1]
}

const env = loadEnvFile()

const PORT =
  env.PORT ||
  getArgument('--port') ||
  DEFAULT_PORT

const INSPECTOR_PORT =
  env.INSPECTOR_PORT ||
  getArgument('--inspector-port') ||
  DEFAULT_INSPECTOR_PORT

const publicDir = path.join(__dirname, '..', 'public')

const server = http.createServer((req, res) => {
  if (req.url === '/json') {
    const proxy = http.request({
      hostname: '127.0.0.1',
      port: Number(INSPECTOR_PORT),
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
        error: error.message,
        inspector: `127.0.0.1:${INSPECTOR_PORT}`
      }))
    })

    proxy.end()

    return
  }

  const file = path.join(publicDir, 'index.html')

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

server.listen(Number(PORT), '127.0.0.1', () => {
  console.log('')
  console.log('FoxNode Inspector')
  console.log('────────────────────────────')
  console.log(`Debugger:  http://localhost:${PORT}`)
  console.log(`Inspector: 127.0.0.1:${INSPECTOR_PORT}`)
  console.log('')
})
