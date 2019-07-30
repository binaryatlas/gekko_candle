// Candlesticks
// 
// This strategy will send out a message
// if the previous candle matches a spinning 
// top, a high wave, a doji, a long day candle,
// a hangman, a shooting star or a hammer.

// You need to set the support and resistance
// level so this strat knows where these candles
// are in relation to these levels.

var log = require('../core/log');
var config = require('../core/util.js').getConfig();

// Let's create our own strat
var strat = {};

var largestCandle = {
  open: 0.0,
  close: 0.0,
  length: 0.0
}

var candleLength = 0;
var upperShadow = 0;
var lowerShadow = 0;
var lastThreeTrend = '';
var message = '';

var candles = [];

// Prepare everything our method needs
strat.init = function() {
  this.input = 'candle';
  this.requiredHistory = 100;
  this.resistance = config.candlesticks.resistance;
  this.support = config.candlesticks.support;
}

// What happens on every new candle?
strat.update = function(candle) {
  // check if candle is open or close
  if (candle.close > candle.open) { // open candle
    candleLength = candle.close - candle.open;
    upperShadow = candle.high - candle.close;
    lowerShadow = candle.open - candle.low;

  } else {                          // close candle
    candleLength = candle.open - candle.close; 
    upperShadow = candle.high - candle.open;
    lowerShadow = candle.close - candle.low;
  }

  // Store current candle as largest if candle length greater than largest candle
  if (candleLength > largestCandle.length) {
    largestCandle.open = candle.open;
    largestCandle.close = candle.close;
    largestCandle.length = candleLength;
  }

  candles.push(candle);

  if (candles.length > 10) {
    candles.shift();
  }

}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function (candle) {

//code to check for bear or bull market

//end bull bear check

  message = candle.close + ' ';

  // Spinning Top - 1/4 the size of the largest candle
  if (candleLength < largestCandle.length * 0.25) {

      if (candles[6].close <= candles[7].close && candles[7].close <= candles[8]) {
        lastThreeTrend = 'up';
      }
      if (candles[8].close <= candles[7].close && candles[7].close <= candles[6]) {
        lastThreeTrend = 'down';
      }

      if (candleLength < upperShadow * 1.5 && candleLength < lowerShadow * 1.5){
          message = message + 'High Wave Candle spotted';
          //trade code here (sell)
          his.advice('short');
          //end trade code
      }  else if (candleLength < largestCandle.length * 0.02) { 
        if (lowerShadow > candleLength * 5 && upperShadow < candleLength) {
            message = message + 'Dragonfly Doji spotted';
            //trade code here (buy)
            this.advice('long');
          //end trade code
        } else if (upperShadow > candleLength * 5 && lowerShadow < candleLength) {
            message = message + 'Tombstone Doji spotted';
            //trade code here (sell)
            this.advice('short');
          //end trade code
        } else {
            message = message + 'Doji spotted';
            //trade code here (buy)
            this.advice('long');
          //end trade code
        }
      } else if (candleLength < lowerShadow * 0.5) { // lower shadow 2x or larger than body
          if (lastThreeTrend == 'up') {
              message = message + 'Hangman spotted';
              //trade code here (sell)
              this.advice('short');
          //end trade code
          }
          if (lastThreeTrend == 'down') {
              message = message + 'Hammer spotted';
              //trade code here (buy)
              this.advice('long');
          //end trade code
          }
      } else if (candleLength < upperShadow * 0.5 && lastThreeTrend == 'up') {
          message = message + 'Shooting Star spotted';
          //trade code here (sell)
          this.advice('short');
          //end trade code
      } else { 
          message = message + 'Spinning Top spotted';
          //trade code here (sell)
          this.advice('short');
          //end trade code
      }
  }

  // Long Day Candle - 90% of the largest candle or greater
  if (candleLength >= largestCandle.length * 0.9) {
    if (upperShadow < candleLength * 0.01 && lowerShadow < candleLength * 0.01) {
        message = message + 'Marubozu Candle spotted';
        //trade code here
        /*Depending on where a Marubozu is located and what color it is, you can make predictions:

If a White Marubozu occurs at the end of an uptrend, a continuation is likely.
If a White Marubozu occurs at the end of a downtrend, a reversal is likely.
If a Black Marubozu occurs at the end of a downtrend, a continuation is likely.
If a Black Marubozu occurs at the end of an uptrend, a reversal is likely.*/

          //end trade code
    } else {
        message = message + 'Long Day Candle spotted';
        //trade code here ( not musch to do here unless larger pattern established)

          //end trade code
    } 
  }
  
  // Report if candles are within 10% range of resistance or support,
  // indicating a strong signal
  if (candle.close * 0.9 < this.support) {
      message = message + '\nCandle within 10% range of support';
      //trade code here (buy)
      this.advice('long');
          //end trade code
  }
  if (candle.close * 1.1 > this.resistance) {
      message = message + '\nCandle within 10% range of resistance';
      //trade code here (sell)
      this.advice('short');
          //end trade code
  }

  log.info(message);
  message = '';

}

module.exports = strat;