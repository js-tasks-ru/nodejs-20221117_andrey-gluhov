function sum(a, b) {
  if ( typeof( a ) != "number"  ||  typeof( b ) != "number" )
    throw new TypeError( "Параметры фцнкции sum дожны быть числами", "sum.js" );
  return a + b;
}

module.exports = sum;
