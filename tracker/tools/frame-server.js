/* Saves the frames that tools/record-videos.js renders, so ffmpeg can join them.
 * Not part of the app. Run it only while recording:
 *
 *   node tracker/tools/frame-server.js <folder-for-frames>
 *
 * It accepts  POST /<video>/<00000>.jpg  from the local preview page only.
 */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || 'frames');
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8765');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const m = /^\/([a-z0-9-]+)\/(\d{5}\.jpg)$/.exec(req.url);   // no other paths, so nothing outside ROOT can be written
  if (req.method !== 'POST' || !m) { res.writeHead(400); return res.end('bad request'); }
  const dir = path.join(ROOT, m[1]);
  fs.mkdirSync(dir, { recursive: true });
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => { fs.writeFileSync(path.join(dir, m[2]), Buffer.concat(chunks)); res.writeHead(200); res.end('ok'); });
}).listen(8770, '127.0.0.1', () => console.log('frame server on 8770, writing to ' + ROOT));
