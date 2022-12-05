const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.Line = "";
  }

  _transform(chunk, encoding, callback) {
    var s = chunk.toString();
    while( s != "" ) {
      var p = s.indexOf( os.EOL );
      if ( p < 0 ) {
        this.Line += s;
        break;
      } else {
        this.emit( 'data', this.Line + s.substring(0,p));
        this.Line = "";
        s = s.substring(p + os.EOL.length);
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.Line) this.emit( 'data', this.Line);
    callback();
  }
}

module.exports = LineSplitStream;
