var Ajax = require('../utils/ajax');
function ElevenFive(playMethodId, getResultUrl){
	this.playMethodId = playMethodId;
	//获取中奖记录接口
	this.getResultUrl = getResultUrl;
	//往期中奖记录数组
	this.resultArr = [];
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
ElevenFive.prototype = {
	init: function(){
		this.getResultData();
		this.initRandomData();
		this.render();
		this.bindEvent();
	},
	render: function(){
		var strArr = this.formatRandomData();
		var _html = this.getTmpl(strArr);
		this.tmplDom.innerHTML = _html;
		this.tmplDom.className = 'lottery-tmpl-eleven';
	},
	bindEvent: function(){
		var self = this,
			updateDom = document.getElementById('lottery-update');
		//使用事件委托
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
	//更新序列
	changeNum: function(){
		var strArr = this.formatRandomData();
		console.log('缓存随机队列', this.randomQueue, '当缓存队列长度小于5时更新');
		this.updateTmpl(strArr);
		this.updateRandomData();
	},
	initRandomData: function(){
		this.updateRandomData();
	},
	//更新序列，当缓存数组长度小于5时，再填充5个随机序列
	updateRandomData: function(){
		if(this.randomQueue.length <= 5) {
			this.randomQueue = this.randomQueue.concat(this.getCacheData());
		}
	},
	//格式化成输出序列
	formatRandomData: function(){
		var str = this.randomQueue.shift(),
			strArr = str.split('_');
		this.currentData = [];
		for(var i = 0, len = 2; i < len; i++){
			this.currentData.push(strArr[i]);
			while(strArr[i].length < 2){
				strArr[i] = '0' + strArr[i];
			}
		}
		return strArr;
	},
	//输入字符'1_2'，返回是否已经在序列对象中出现过
	checkIsRandomed: function(str){
		var reverseStr = str.split('_')[1] + str.split('_')[0];
		return this.randomMap[str] || this.randomMap[reverseStr];
	},
	//获取缓存随机序列
	getCacheData: function(){
		var	str = '',
			cacheArr = [];
		//每4个序列中插入一个往期中奖序列增加营收
		for(var i = 0, len = 5; i < len; i++){
			if(i === 4){
				if(this.resultArr.length){
					str = this.resultArr.shift();
					if(!this.checkIsRandomed(str)){
						this.randomMap[str] = 1;
						cacheArr.push(str);
						continue;
					}
				}
			}
			str = this.getRandomStr();
			cacheArr.push(str);
		}
		return cacheArr;
	},
	//获取随机序列
	getRandomStr: function(){
		var arr = [],
			//记录随机次数
		    randomTimes = 0;
		var num1 = 0,
			num2 = 0;
		//11选5任二从0-11中选出两个不重复数字
		function random(){
			num1 = Math.floor(Math.random() * 12);
			num2 = Math.floor(Math.random() * 12);
			//这里可以不使用while循环，看下执行效率
			while(num1 === num2){
				num2 = Math.floor(Math.random() * 12);
			}
			return [num1, num2];
		}
		//两个数中增加一个空格
		var randomStr = random().join('_');
		while(this.checkIsRandomed(randomStr)){
			randomTimes++;
			randomStr = random().join('_');
			//当random超过10次还找不到没有出现过的序列，就将hashMap置空
			if(randomTimes >= this.maxRandomTimes){
				this.randomMap = {};
			}
		}
		this.randomMap[randomStr] = 1;
		return randomStr;
	},
	//获得以往开奖结果
	getResultData: function(){
		var self = this;
		var ajax = new Ajax({
		  	method:'get',
		  	url: this.getResultUrl,
		  	callback: function(res){
		  		res = JSON.parse(res);
		  		if(!self.isObject(res)) return false;
		  		var resultData = res.data;
		  		if(resultData instanceof Array){
		  			self.resultArr = resultData;
		  		}
		  	},
		  	data: {
		  		id: this.playMethodId
		  	}
		});
		ajax.send();
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
		_html += '<div class="lottery-tmpl-msg clearfix">';
		_html += '<div class="lottery-tmpl-desp fl">粤11选5任二序列号：</div>';
		_html += '<ul class="lottery-tmpl-list clearfix" id="lottery-tmpl-list">';
		if(!numArr instanceof Array || !numArr.length) return false;
		for(var i = 0, len = numArr.length; i < len; i++){
			_html += '<li>' + numArr[i] + '</li>';
		}
		_html += '</ul>';
		_html += '<div class="lottery-tmpl-update fl" id="lottery-update"><i></i></div>';
		_html += '</div>';
		return _html;
	},
	checkForm: function(){
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
module.exports = ElevenFive;