const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('node:fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();
const FileFolder = path.normalize( path.join(__dirname, 'files' ));
fs.mkdir(FileFolder, {recursive : false}, (err) => {
  // Игнорирую ошибку уже ceotcndetn
  //console.log( err );
});

server.on('request', (req, res) => {

  switch (req.method) {
    case 'POST':
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
      //console.log( filepath );
      if ( fs.existsSync( filepath )) {
        res.statusCode = 409;
        res.end( "File Exists");
        return;
      }

      // Файла не существуент можно сохранаять
      var ws = fs.WriteStream( filepath );
      ws.on( "error", () => {
        res.statusCode = 500;
        res.end( "Internal Error");
        return;
      });
      req.on( 'end', () => {
        res.statusCode = 201;
        res.end( "Sucsess");
      });
      const limitedStream = new LimitSizeStream({limit: 1024 * 1024, encoding: 'utf-8'}); // 1 мБ
      limitedStream.on( 'error', () => {
        res.statusCode = 413;
        res.end( "Data greater 1Мб");
        ws.destroy();
        fs.unlinkSync( filepath );

/* С асинхронным удалением ломаются ряд тестов там алгоритм пытается очистить папку, но в ней еще есть открытые на запись файлы.
          fs.unlink( filepath, (err) => {
          if ( err )
            console.log( err );
          //else   
          //  console.log( 'Удален временный файл ' + filepath );
        });
*/            
      });
      req.on( "error", (err) => {
        ws.destroy();
        fs.unlinkSync( filepath );
/* С асинхронным удалением ломаются ряд тестов там алгоритм пытается очистить папку, но в ней еще есть открытые на запись файлы.
        fs.unlink( filepath, (err) => {
          if ( err )
            console.log( err );
          //else   
          //  console.log( 'Удален временный файл ' + filepath );
        });
*/            
      });
      req.pipe( limitedStream ).pipe( ws );
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
