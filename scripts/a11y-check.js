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
    await run('npm', ['run', 'preview', '--', '--port', String(port)], { detached: true })
  } catch {}
  await waitFor(4173).catch(() => {})
  console.log('Run Lighthouse via npx (optional) or integrate axe in e2e tests.')
  console.log('Manual check items: headings order, labels, contrast, focus states, modals focus trap.')
})()

