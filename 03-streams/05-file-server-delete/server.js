const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('node:fs');

const server = new http.Server();

const FileFolder = path.normalize( path.join(__dirname, 'files' ));
fs.mkdir(FileFolder, {recursive : false}, (err) => {
  // Игнорирую ошибку уже ceotcndetn
  //console.log( err );
});

server.on('request', (req, res) => {

  switch (req.method) {
    case 'DELETE':
      const url = new URL(req.url, `http://${req.headers.host}`);
      var pathname = url.pathname.slice(1);
      try {
        pathname = decodeURI( pathname.toString() );
      } catch(e) {
        console.log(e);
        res.statusCode = 400;
        res.end( "Bad Request 4");
        return;
      }
      //console.log( pathname );
      if ( pathname === "" ) {
        res.statusCode = 400;
        res.end( "Bad Request 1");
        return;
      }
    
      if ( pathname.indexOf("\\") >= 0  ) {
        res.statusCode = 400;
        res.end( "Bad Request 2");
        return;
      }
    
      if ( pathname.indexOf("/") >= 0  ) {
        res.statusCode = 400;
        res.end( "Bad Request 3");
        return;
      }
      const filepath = path.normalize( path.join( FileFolder, pathname ));
      if ( fs.existsSync( filepath )) {
        try {
          fs.unlinkSync( filepath );
          res.statusCode = 200;
          res.end( "File deleted");
          return;
        } catch(e) {
          res.statusCode = 500;
          res.end('Internal error');
        }
      } else {
        res.statusCode = 404;
        res.end( "File not found");
      }
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
