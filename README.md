# FoxNode Inspector

## Node.js Remote Debugger for Firefox

FoxNode Inspector is a lightweight, browser-based debugging interface for interacting with a remote Node.js process through the Node.js Inspector Protocol.

It is designed for environments where Chromium or Chrome cannot be installed or is intentionally unavailable. The interface runs locally and can be accessed entirely through Firefox.

The project uses an SSH tunnel to securely expose the remote Node.js Inspector port to the local machine.

---

## Features

* Firefox-compatible debugging interface
* Remote Node.js debugging
* SSH port forwarding
* Node.js Inspector Protocol support
* WebSocket communication with Node.js
* Runtime JavaScript evaluation
* Script discovery
* Debugger pause and resume
* Runtime event monitoring
* No Chromium or Chrome dependency
* No external npm dependencies for the basic implementation

---

## Why FoxNode Inspector?

Node.js exposes a debugging interface through the Node.js Inspector Protocol, normally available on port `9229`.

Chromium-based browsers provide a built-in DevTools frontend for this protocol. Firefox does not provide a native frontend for connecting directly to a remote Node.js Inspector endpoint.

FoxNode Inspector provides a lightweight alternative by communicating directly with the Node.js Inspector WebSocket endpoint from a Firefox-compatible web application.

No Chromium installation is required.

---

## Requirements

### Local Machine

* Firefox
* Node.js
* SSH client

### Remote Server

* Node.js
* Node.js Inspector enabled
* SSH access

---

## Installation

### Global installation

Once published to npm:

```bash
npm install -g foxnode-inspector
```

Then run:

```bash
foxnode-inspector
```

The debugger will be available at:

http://localhost:8080

---

### Development Installation

Clone the repository:

```bash
git clone git@github.com:ferpalma21/FoxNode-Inspector.git
cd foxnode-inspector
```

Run directly:

```bash
node bin/foxnode-inspector.js
```

Or create a global development link:

```bash
npm link
```

Then:

```bash
foxnode-inspector
```

---

### `index.html`

The Firefox-compatible debugging interface.

It communicates with the Node.js Inspector through WebSockets.

### `server.js`

Runs the local HTTP server and exposes the Node.js Inspector target information.

### `README.md`

Project documentation.

---

## Configuration

### FoxNode Inspector supports configuration through:

FoxNode Inspector supports configuration through:

1. `.env`
2. Command-line arguments
3. Default values

The precedence is:

```text
.env
 ↓
CLI arguments
 ↓
defaults
```

This means that if a value exists in .env, it takes precedence over the command-line argument.

---

## Environment Variables

Create a `.env` file in the directory where FoxNode Inspector is executed:

```env
PORT=8080
INSPECTOR_PORT=9229
```

### `PORT`

Port used by the local FoxNode Inspector web interface.

Default:

```text
8080
```

Example:

```env
PORT=9090
```

The interface will then be available at:

```text
http://localhost:9090
```

---

### `INSPECTOR_PORT`

Local port where the Node.js Inspector is available.

Default:

```text
9229
```

Example:

```env
INSPECTOR_PORT=9230
```

FoxNode Inspector will connect to:

```text
127.0.0.1:9230
```

---

## Command-Line Arguments

If `.env` does not define a value, command-line arguments can be used.

### Inspector port

```bash
foxnode-inspector --inspector-port 9230
```

This connects to:

```text
127.0.0.1:9230
```

---

### Web interface port

```bash
foxnode-inspector --port 9090
```

The debugger will be available at:

```text
http://localhost:9090
```

---

### Both ports

```bash
foxnode-inspector --port 9090 --inspector-port 9230
```

Result:

```text
Debugger:  http://localhost:9090
Inspector: 127.0.0.1:9230
```

---

### Using defaults

If neither `.env` nor CLI arguments are provided:

```bash
foxnode-inspector
```

FoxNode Inspector uses:

```text
Web interface:  8080
Node Inspector: 9229
```

---

# Setup

## 1. Start the Node.js Inspector

The remote Node.js process must be started with the Inspector enabled.

For example:

```bash
node --inspect=127.0.0.1:9229 /opt/uptime-monitor/worker.js
```

You should see something similar to:

```text
Debugger listening on ws://127.0.0.1:9229/...
```

### Important

If Node.js is already running with the Inspector enabled, do not start another process using port `9229`.

You can check whether the port is already in use:

```bash
netstat -ltnp | grep 9229
```

---

# SSH Port Forwarding

From your local machine, create an SSH tunnel.

Example:

```bash
ssh -L 9229:127.0.0.1:9229 root@10.129.117.171
```
---

# Start the Local Debugger

Start the local server:

```bash
foxnode-inspector
```

You should see:

```text
Firefox Node Debugger: http://localhost:8080
```

Open Firefox and navigate to:

```text
http://localhost:8080
```

The FoxNode Inspector interface should automatically discover the Node.js Inspector target.

---

# Runtime Evaluation

FoxNode Inspector uses the Node.js Inspector Protocol to evaluate JavaScript inside the remote Node.js process.

For example:

```javascript
process.version
```

You can also inspect:

```javascript
process.cwd()
```

```javascript
process.platform
```

```javascript
process.arch
```

```javascript
Object.keys(process.env)
```

---

# Executing System Commands

Depending on the Node.js version and execution context, CommonJS globals such as `require` may not be available.

For example, this may fail:

```javascript
require('child_process')
```

with:

```text
ReferenceError: require is not defined
```

On recent Node.js versions, built-in modules can be accessed using:

```javascript
process.getBuiltinModule('child_process')
```

For example:

```javascript
process
  .getBuiltinModule('child_process')
  .execSync('whoami')
  .toString()
```

This can return:

```text
ubuntu
```

Other commands can be executed in the same way:

```javascript
process
  .getBuiltinModule('child_process')
  .execSync('pwd')
  .toString()
```

Example:

```text
/opt/uptime-monitor
```

Or:

```javascript
process
  .getBuiltinModule('child_process')
  .execSync('ls -la')
  .toString()
```

> Only use runtime command execution on systems and Node.js processes you are authorized to debug.

---

# Example Workflow

## 1. Start Node.js remotely

On the remote server:

```bash
node --inspect=127.0.0.1:9229 /opt/uptime-monitor/worker.js
```

---

## 2. Create the SSH tunnel

On your local machine:

```bash
ssh -L 9229:127.0.0.1:9229 engineer@10.129.117.171
```

Keep this SSH session open.

---

## 3. Verify the Inspector

Open Firefox:

```text
http://localhost:9229/json
```

You should see the Node.js target.

---

## 4. Start FoxNode Inspector

In another local terminal:

```bash
cd foxnode-inspector
node server.js
```

---

## 5. Open Firefox

Navigate to:

```text
http://localhost:8080
```

---

## 6. Connect

FoxNode Inspector discovers the Node.js target and establishes a WebSocket connection to:

```text
localhost:9229
```

The SSH tunnel forwards the connection to:

```text
10.129.117.171:9229
```

---

# Security

The Node.js Inspector provides powerful access to the running process.

Anyone with access to the Inspector may potentially:

* Execute JavaScript inside the Node.js process
* Read environment variables
* Access application data
* Inspect objects
* Inspect files accessible to the process
* Control application execution
* Execute operating-system commands when permitted by the Node.js process

For this reason, the Node.js Inspector should not be exposed publicly.

Prefer:

```bash
node --inspect=127.0.0.1:9229 worker.js
```

combined with:

```bash
ssh -L 9229:127.0.0.1:9229 user@remote-server
```

Avoid exposing the Inspector on:

```text
0.0.0.0:9229
```

unless you fully understand the security implications and have appropriate access controls.

---

# Current Capabilities

The implementation provides:

* [x] Firefox-compatible UI
* [x] SSH port forwarding
* [x] Node.js Inspector discovery
* [x] WebSocket connection
* [x] Runtime JavaScript evaluation
* [x] Script discovery
* [x] Debugger pause
* [x] Debugger resume
* [x] Runtime event monitoring

---

# Disclaimer

FoxNode Inspector is intended for authorized development, debugging, security testing, and administration of Node.js applications.

Only connect to systems and Node.js processes for which you have explicit authorization.
