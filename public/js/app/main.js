// var arrow = require('../../img/arrow.png');


var htmlFontSize = require('../utils/htmlFontSize');
var indexCss = require('../../less/index.less');

//引入主类
var Lottery = require('./Lottery');

var lottery = new Lottery();
window.lottery = lottery;
lottery.init();