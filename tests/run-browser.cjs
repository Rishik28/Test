const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'../dist');
 const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png'}[path.extname(file)]||'application/octet-stream';const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{for(const test of process.argv.slice(2)){const code=await new Promise(resolve=>{const child=spawn(process.execPath,[path.resolve(__dirname,test)],{stdio:'inherit',env:{...process.env,BASE_URL:base}});child.on('exit',resolve);});if(code!==0){process.exitCode=code||1;break;}}}finally{server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
