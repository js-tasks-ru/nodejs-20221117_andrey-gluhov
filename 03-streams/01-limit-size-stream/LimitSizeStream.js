const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.curSize = 0;
  }

  _transform(chunk, encoding, callback) {
    if ( this.curSize + chunk.length > this.limit )
      callback( new LimitExceededError() );  
    else  
      callback( null, chunk );
    this.curSize += chunk.length;
  }
}

module.exports = LimitSizeStream;
