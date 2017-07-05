var Ajax = require('../utils/ajax');
function ThreeD(playMethodId, getResultUrl){
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
ThreeD.prototype = {
	init: function(){
		this.initRandomData();
		this.render();
		this.bindEvent();
	},
	render: function(){
		var strArr = this.formatRandomData();
		var _html = this.getTmpl(strArr);
		this.tmplDom.innerHTML = _html;
		this.tmplDom.className = 'lottery-tmpl-threed';
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
			strArr = [];
		this.currentData = [];
		this.currentData.push(str);
		//当小于3位时，在前面添加0
		while(str.length < 3){
			str = '0' + str;
		}
		strArr = str.split('');
		for(var i = 0, len = strArr.length; i < len; i++){
			strArr[i] = '0' + strArr[i];
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
	getRandomStr: function(){
		var num = 0,
			randomTimes = 0;
		//3D直选需要0-999之间的数
		function random(){
			num = Math.floor(Math.random() * 1000);
		}
		random();
		while(this.randomMap[num]){
			randomTimes++;
			random();
			//当random超过10次还找不到没有出现过的序列，就将hashMap置空
			if(randomTimes >= this.maxRandomTimes){
				this.randomMap = {};
			}
		}
		this.randomMap[num] = 1;
		return num + '';
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
		_html += '<div class="lottery-tmpl-desp fl">福彩3D直选幸运号：</div>';
		_html += '<div class="fl">';
		_html += '<ul class="lottery-digit clearfix"><li>百</li><li>十</li><li>个</li></ul>';
		_html += '<ul class="lottery-tmpl-list clearfix" id="lottery-tmpl-list">';
		if(!numArr instanceof Array || !numArr.length) return false;
		for(var i = 0, len = numArr.length; i < len; i++){
			_html += '<li>' + numArr[i] + '</li>';
		}
		_html += '</ul>';
		_html += '<div class="lottery-tmpl-update fl" id="lottery-update"><i></i></div>';
		_html += '</div></div>';
		return _html;
	},
	checkForm: function(){
		//这里只判断是否在[0, 999]区间内
		for(var i = 0, len = this.currentData.length; i < len; i++){
			var currentNum = Number(this.currentData[i]);
			if(currentNum > 999 || currentNum < 0){
				return false;
			}
		}
		return true;
	},
	isObject: function(obj){
		return obj instanceof Object && obj;
	}
}
module.exports = ThreeD;