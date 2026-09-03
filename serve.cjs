const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png'};

http.createServer((request,response)=>{
  const requested = request.url.split('?')[0] || '/';
  const relative = requested === '/' ? 'index.html' : requested.slice(1);
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { response.writeHead(400); response.end('bad path'); return; }
  fs.readFile(file,(error,data)=>{
    if (error) { response.writeHead(404); response.end('not found'); return; }
    response.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
    response.end(data);
  });
}).listen(8789,'127.0.0.1',()=>console.log('Open Door Classroom server: http://127.0.0.1:8789/'));
