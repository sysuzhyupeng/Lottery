var Ajax = require('../utils/ajax');
function DoubleBall(playMethodId, getResultUrl){
	this.playMethodId = playMethodId;
	//获取中奖记录接口
	this.getResultUrl = getResultUrl;
	//随机序列队列，从缓存数组中更新
	this.randomQueue = [];
	//最大随机次数
	this.maxRandomTimes = 10;
	//将随机序列保存在对象中
	this.redMap = {};
	this.blueMap = {};
	//目前展示随机数
	this.currentData = [];
	this.submitDom = document.getElementById('lottery-submit');
	this.tmplDom = document.getElementById('lottery-tmpl');
	this.init();
}
DoubleBall.prototype = {
	init: function(){
		this.initRandomData();
		this.render();
		this.bindEvent();
	},
	render: function(){
		var strArr = this.formatRandomData();
		var _html = this.getTmpl(strArr);
		this.tmplDom.innerHTML = _html;
		this.tmplDom.className = 'lottery-tmpl-double';
	},
	bindEvent: function(){
		var self = this,
			updateDom = document.getElementById('lottery-update');
		updateDom.addEventListener('click', function(e){
			self.changeNum();
		}, false);
		this.submitDom.onclick = function(){
			if(self.checkForm()){
				if(self.isObject(lottery)){
					lottery.submitForm(self.currentData);
				}
			} else {
				alert('请提交合法数据');
			}
		}
	},
	changeNum: function(){
		var strArr = this.formatRandomData();
		console.log('缓存随机队列', this.randomQueue, '当缓存队列长度小于5时更新');
		this.updateTmpl(strArr);
		this.updateRandomData();
	},
	formatRandomData: function(){
		var str = this.randomQueue.shift(),
			strArr = str.split('_');
		this.currentData = [];
		for(var i = 0, len = strArr.length; i < len; i++){
			this.currentData.push(strArr[i]);
			while(strArr[i].length < 2){
				strArr[i] = '0' + strArr[i];
			}
		}
		return strArr;
	},
	initRandomData: function(){
		this.updateRandomData();
	},
	updateRandomData: function(){
		if(this.randomQueue.length <= 5) {
			this.randomQueue = this.randomQueue.concat(this.getCacheData());
		}
	},
	getCacheData: function(){
		var cacheArr = [];
		for(var i = 0, len = 5; i < len; i++){
			var str = this.getRandomStr() + '';
			cacheArr.push(str);
		}
		return cacheArr;
	},
	getBlueStr: function(){
		var num = 0,
			randomTimes = 0;
		//蓝色球为1到16
		function random(){
			num = Math.floor(Math.random() * 16) + 1;
		}
		random();
		while(this.blueMap[num]){
			randomTimes++;
			random();
			//当random超过10次还找不到没有出现过的序列，就将hashMap置空
			if(randomTimes >= this.maxRandomTimes){
				this.blueMap = {};
				randomTimes = 0;
			}
		}
		this.blueMap[num] = 1;
		return num + '';
	},
	getRedOne: function(){
		var num = 0,
			numMap = {},
			numArr = [],
			randomTimes = 0;
		//红球为1到33
		function random(){
			num = Math.floor(Math.random() * 33) + 1;
			if(!numMap[num]){
				randomTimes++;
				numArr.push(num);
			}
		}
		while(randomTimes <= 5){
			random();
		}
		return numArr;
	},
	//保证红色球序列未出现过
	getRedStr: function(){
		var num = 0,
			randomTimes = 0;
		var numMap = {};
			redArr = this.getRedOne().slice().sort();
			redStr = redArr.join('_');
		while(this.redMap[redStr]){
			randomTimes++;
			redArr = this.getRedOne().slice().sort();
			redStr = redArr.join('_');
			//当random超过10次还找不到没有出现过的序列，就将hashMap置空
			if(randomTimes >= this.maxRandomTimes){
				this.redMap = {};
			}
		}
		this.redMap[redStr] = 1;
		return redStr;
	},
	getRandomStr: function(){
		var str = this.getRedStr() + '_' + this.getBlueStr();
		return str;
	},
	updateTmpl: function(numArr){
		if(!this.dataTmplDom){
			this.dataTmplDom = document.getElementById('lottery-tmpl-list');
		}
		var li = this.dataTmplDom.getElementsByTagName('li'),
			_html = '';
		for(var i = 0, len = li.length; i < len; i++){
			li[i].innerHTML = numArr[i];
		}
	},
	getTmpl: function(numArr){
		var _html = '';
		_html += '<div class="lottery-tmpl-header"><i></i>复式投注幸运号码</div>';
		_html += '<div class="clearfix">';
		_html += '<ul class="lottery-tmpl-list clearfix" id="lottery-tmpl-list">';
		if(!numArr instanceof Array || !numArr.length) return false;
		for(var i = 0, len = numArr.length - 1; i < len; i++){
			_html += '<li>' + numArr[i] + '</li>';
		}
		_html += '<li class="blue">' + numArr[i] + '</li>';
		_html += '</ul>';
		_html += '<div class="lottery-tmpl-update" id="lottery-update"><i></i></div>';
		_html += '</div>';
		return _html;
	},
	checkForm: function(){
		//红球检测
		for(var i = 0, len = this.currentData.length; i < len - 1; i++){
			var redNum = Number(this.currentData[i]);
			if(redNum > 33 || redNum < 1){
				console.log(111)
				return false;
			}
		}
		//蓝球检测
		var blueNum = Number(this.currentData[len - 1]);
		if(blueNum > 16 || blueNum < 1) return false;
		return true;
	},
	isObject: function(obj){
		return obj instanceof Object && obj;
	}
}
module.exports = DoubleBall;