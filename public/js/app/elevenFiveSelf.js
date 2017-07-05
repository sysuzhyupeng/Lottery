var Ajax = require('../utils/ajax');
function ElevenFiveSelf(playMethodId, getResultUrl){
	this.playMethodId = playMethodId;
	//获取中奖记录接口
	this.getResultUrl = getResultUrl;
	//随机序列队列，从缓存数组中更新
	this.randomQueue = [];
	//最大随机次数
	this.maxRandomTimes = 10;
	//将随机序列保存在对象中
	this.randomMap = {};
	//目前展示随机数
	this.currentData = [];
	this.submitDom = document.getElementById('lottery-submit');
	this.tmplDom = document.getElementById('lottery-tmpl');
	this.init();
}
ElevenFiveSelf.prototype = {
	init: function(){
		this.initRandomData();
		this.render();
		this.bindEvent();
	},
	render: function(){
		var strArr = this.formatRandomData();
		var _html = this.getTmpl(strArr);
		this.tmplDom.innerHTML = _html;
		this.tmplDom.className = 'lottery-tmpl-self';
	},
	bindEvent: function(){
		var self = this,
			listDom = document.getElementById('lottery-tmpl-list');
		//事件委托
		listDom.addEventListener('click', function(e){
			var li = this.getElementsByTagName('li');
			for(var i = 0, len = li.length; i < len; i++ ){
				if(e.target === li[i]){
					//
				}
			}
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
	formatRandomData: function(){
		var str = this.randomQueue.shift(),
			strArr = [];
		strArr = str.split('_');
		for(var i = 0, len = strArr.length; i < len; i++){
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
	getRandomOne: function(){
		var num = 0,
			numMap = {},
			numArr = [],
			randomTimes = 0;
		//红球为0到11
		function random(){
			num = Math.floor(Math.random() * 12);
			if(!numMap[num]){
				randomTimes++;
				numArr.push(num);
			}
		}
		while(randomTimes < 11){
			random();
		}
		return numArr;
	},
	getRandomStr: function(){
		var num = 0,
			randomTimes = 0;
		var numMap = {};
			redArr = this.getRandomOne().slice().sort();
			redStr = redArr.join('_');
		while(this.randomMap[redStr]){
			randomTimes++;
			redArr = this.getRandomOne().slice().sort();
			redStr = redArr.join('_');
			//当random超过10次还找不到没有出现过的序列，就将hashMap置空
			if(randomTimes >= this.maxRandomTimes){
				this.randomMap = {};
			}
		}
		this.randomMap[redStr] = 1;
		return redStr;
	},
	getTmpl: function(numArr){
		var _html = '';
		_html += '<div class="lottery-tmpl-header"><i></i>复式投注幸运号码</div>';
		_html += '<div class="clearfix">';
		_html += '<ul class="lottery-tmpl-list clearfix" id="lottery-tmpl-list">';
		if(!numArr instanceof Array || !numArr.length) return false;
		for(var i = 0, len = numArr.length; i < len; i++){
			_html += '<li>' + numArr[i] + '</li>';
		}
		_html += '</ul>';
		_html += '</div>';
		return _html;
	},
	checkForm: function(){
		//具体逻辑不实现了
		this.currentData = [1, 2];
		//这里只判断是否在[0, 11]区间内
		for(var i = 0, len = this.currentData.length; i < len; i++){
			var currentNum = Number(this.currentData[i]);
			if(currentNum > 11 || currentNum < 0){
				return false;
			}
		}
		return true;
	},
	isObject: function(obj){
		return obj instanceof Object && obj;
	}
}
module.exports = ElevenFiveSelf;