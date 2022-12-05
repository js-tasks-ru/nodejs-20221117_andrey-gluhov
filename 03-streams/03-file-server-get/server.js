const url = require('node:url');
const http = require('node:http');
const path = require('node:path');
const { rest } = require('lodash');
const fs = require('node:fs');
const mime = require('mime');

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'GET':
      const url = new URL(req.url, `http://${req.headers.host}`);
      var pathname = url.pathname.slice(1);
      //console.log(pathname);
      if ( pathname === "" ) {
        res.statusCode = 404;
        res.end( "File Not Found");
        return;
      }
      if ( pathname.indexOf("\\") >= 0  ) {
        res.statusCode = 400;
        res.end( "Bad Request ");
        return;
      }
      if ( pathname.indexOf("/") >= 0  ) {
        res.statusCode = 400;
        res.end( "Bad Request ");
        return;
      }

      try {
        pathname = decodeURI( pathname );
      } catch(e) {
        res.statusCode = 400;
        res.end( "Bad Request ");
        return;
      }
    
      const filepath = path.normalize( path.join(__dirname, 'files', pathname ));
      
      //console.log(req.method);
      //console.log(filepath);
      //console.log('----');
    
      // Путь за пределами папки
      if ( filepath.indexOf(__dirname) != 0  ) {
        res.statusCode = 404;
        res.end( "File Not Found");
        return;
      }
    
      // Проверка на 0 байт в строке
      if ( ~filepath.indexOf('\0')) {
        res.statusCode = 404;
        res.end( "File Not Found");
        return;
      }
    
      fs.stat( filepath, (err, stats ) => {
        if ( err ) {
          res.statusCode = 404;
          res.end( "File Not Found");
          return;
        }
        fs.readFile( filepath, (err, data ) => {
          if ( err ) {
            res.statusCode = 500;
            res.end( "Internal Error");
            return;
          }
          res.setHeader( "Content-Type", mime.getType(filepath) + "; charset=utf-8" );
          const rFile = fs.ReadStream(filepath);
          rFile.on( "error", () => { 
            res.statusCode = 500;
            res.end( "Internal Error");
            return;
          });
          rFile.pipe( res );
        })
      })
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
