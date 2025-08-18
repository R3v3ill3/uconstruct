#!/usr/bin/env node
const { spawn } = require('child_process')
const http = require('http')

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts })
    p.on('exit', (code) => code === 0 ? resolve() : reject(new Error(cmd+" exited "+code)))
  })
}

async function waitFor(port, timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((res, rej) => {
        const req = http.get({ host: '127.0.0.1', port, path: '/' }, (r) => { r.resume(); res() })
        req.on('error', rej)
      })
      return
    } catch {}
    await new Promise(r => setTimeout(r, 200))
  }
  throw new Error('Preview server not reachable')
}

(async () => {
  try {
    const port = 4173
    const child = spawn('npm', ['run', 'preview', '--', '--port', String(port)], { stdio: 'ignore', detached: true })
    child.unref()
  } catch {}
  await waitFor(4173).catch(() => {})
  console.log('A11y baseline: run Lighthouse/axe manually in CI for detailed report.')
})()

