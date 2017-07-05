/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var Lottery = __webpack_require__(1);

	var lottery = new Lottery();
	window.lottery = lottery;
	lottery.init();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var DoubleBall = __webpack_require__(2);
	var ElevenFive = __webpack_require__(4);
	var ThreeD = __webpack_require__(5);
	var SortFive = __webpack_require__(6);
	var ElevenFiveSelf = __webpack_require__(7);
	var Ajax = __webpack_require__(3);
	var Lottery = function(options){
		this.defaultOption = {
			//开奖时间请求
			getDateUrl: '/getTime',
			//奖池金额请求
			getSumUrl: '/getSum',
			submitUrl: '/submit'
		}
		//请求域名
		this.baseUrl = 'http://localhost:3000';
		this.options = options ? options: {};
		this.getDateUrl = this.options.getDateUrl ? this.options.getDateUrl: this.defaultOption.getDateUrl;
		this.getSumUrl = this.options.getSumUrl ? this.options.getSumUrl: this.defaultOption.getSumUrl;
		this.submitUrl = this.options.submitUrl ? this.options.submitUrl: this.defaultOption.submitUrl;
		//玩法hashMap，记录玩法的id和构造函数
		this.playMethodMap = {
			//增加新玩法，只需要在这里配置新的构造函数和id
			'doubleball' : {
				//双色球
				Fn: DoubleBall,
				id: '0',
				getResultUrl: 'getMultipleList'
			},
			'elevenfive': {
				//粤式11选5任二
				Fn: ElevenFive,
				id: '1',
				getResultUrl: 'getEleventFiveList'
			},
			'threed': {
				//3D直选
				Fn: ThreeD,
				id: '2',
				getResultUrl: 'getThreeDList'
			},
			'sortfive': {
				//排5直选
				Fn: SortFive,
				id: '3',
				getResultUrl: 'getSortFiveList'
			},
			'elevenfiveself': {
				//11选5复式投注(自选)
				Fn: ElevenFiveSelf,
				id: '4',
				getResultUrl: 'getElevenFiveSelfList'
			},
		};
		//玩法id
		this.playMethodId = '';
		//玩法组件对象
		this.playMethodObj = {};
		//奖池金额
		this.moneyRange = {
			billion: '',
			tenThousand: ''
		};
		//开奖时间
		this.date = {
			period: '',
			weekDay: '',
			time: '',
		};
		//第几期
		this.preriodId = '';
	}
	Lottery.prototype = {
		init: function(){
			//开奖时间
			this.timeDom = document.getElementById('lottery-time') || {};
			//开奖期数
			this.periodDom = document.getElementById('lottery-period') || {};
			//开奖周几
			this.weekDayDom = document.getElementById('lottery-weekday') || {};
			//奖池几亿
			this.billionDom = document.getElementById('lotter-billion') || {};
			//奖池几万
			this.tenThousandDom = document.getElementById('lotter-tenthousand') || {};
			this.changeContanerHeight();
			this.bindEvent();
			//初始化以双色球
			this.choosePlayMethod('doubleball');
			location.href = '/#doubleball';
		},
		bindEvent: function(){
			var self = this;
			//绑定hashchange事件切换玩法
			window.addEventListener('hashchange', function(e){
				var url = location.hash.replace('#', '');
				self.choosePlayMethod(url);
			}, false);
		},
		//改变container高度，布满整个屏幕
		changeContanerHeight: function(){
			var winHeight = window.innerHeight,
	      	    container = document.getElementById('container');
	      	container.style.height = winHeight + 'px';
		},
		//选择玩法
		choosePlayMethod: function(method){
			//相同玩法不进行re-render
			if(method === this.playMethod) return false;
			method = typeof method === 'string' ? method.toLowerCase(): '';
			if(this.playMethodMap[method]){
				var data = this.playMethodMap[method];
				this.playMethodId = typeof data['id'] === 'string'? data['id']: '';
				this.getDate();
				this.getLotteySum();
				//调用相应组件对象的构造函数
				this.playMethodObj = typeof data['Fn'] === 'function'? new data['Fn'](data['id'], data['getResultUrl']): {};
			} else {
				alert('暂不存在这种玩法');
			}
		},
		//ajax请求开奖日期
		getDate: function(){
			var methodId = this.methodId,
				self = this,
				isDifferent = false;
			var ajax = new Ajax({
			  	method:'get',
			  	url: this.getDateUrl,
			  	callback:function(res){
			  		res = JSON.parse(res);
			  		if(!self.isObject(res)) return false;
			  		var dateData = res.data;
			  		if(!self.isObject(dateData)) return false;
		  			for(var key in dateData){
		  				//如果新的时间和旧的不一致，则重新渲染
						if(dateData[key] !== self.date[key]){
							isDifferent = true;
							self[key + 'Dom'].innerHTML = dateData[key];
							if(key === 'period'){
								self.preriodId = dateData[key];
							}
						}
					}
					if(isDifferent) self.date = dateData;
			  	},
			  	data: {
			  		id: this.playMethodId
			  	}
			})
			ajax.send();
		},
		//ajax请求奖池金额
		getLotteySum: function(){
			var methodId = this.methodId,
				self = this,
				isDifferent = false;
			var ajax = new Ajax({
			  	method:'get',
			  	url: this.getSumUrl,
			  	callback:function(res){
			  		res = JSON.parse(res);
			  		if(!self.isObject(res)) return false;
			  		var sumData = res.data;
			  		if(!self.isObject(sumData)) return false;
		  			for(var key in sumData){
		  				//如果新的奖池金额和旧的不一致，则重新渲染
						if(sumData[key] !== self.moneyRange[key]){
							isDifferent = true;
							var _html = ''; 
							   sumString = sumData[key];
							for(var i = 0, len = sumString.length; i < len; i++){
								_html += '<li>' + sumString[i] + '</li>';
							}
							self[key + 'Dom'].innerHTML = _html;
						}
					}
					if(isDifferent) self.moneyRange = sumData;
			  	},
			  	data: {
			  		id: this.playMethodId
			  	}
			})
			ajax.send();
		},
		isObject: function(obj){
			return obj instanceof Object && obj;
		},
		getMoney: function(){
			//投注金额
			var moneyDom = document.getElementById('lottery-money');
			return moneyDom.innerHTML;
		},
		submitForm: function(data, money){
			var str = '',
				self = this;
			if(data instanceof Array && data.length){
				for(var i = 0, len = data.length; i < len; i++){
					str += i !== len - 1 ? data[i] + ', ': data[i];
				}
			}
			// var ajaxConfirm = confirm('确认投注' + str + '吗');
			var money = self.getMoney();
			// if(!ajaxConfirm) return false;
			var ajax = new Ajax({
			  	method:'post',
			  	url: this.submitUrl,
			  	callback:function(res){
			  		res = JSON.parse(res);
			  		if(!self.isObject(res)) return false;
			  		var info = res.info;
			  		alert(info.text);
			  	},
			  	data: {
			  		mid: this.playMethodId,
			  		money: money,
			  		period: this.preriodId,
			  		lottery_str: str
			  	}
			})
			ajax.send();
		}
	}
	module.exports = Lottery;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var Ajax = __webpack_require__(3);
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

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	function Ajax(obj){
	    this.method = obj.method || '';
	    this.url = obj.url || '';
	    this.callback = obj.callback || '';
	    this.data = obj.data || '';
	};
	Ajax.prototype.send = function(method, url, callback, data){
	    var method = method || this.method;
	    var data = data || this.data;
	    var url = url || this.url;
	    var callback = callback || this.callback;
	    var xhr = new XMLHttpRequest();//不兼容IE7以下
	    xhr.onreadystatechange = function(){//注册回调函数
	        if(xhr.readyState === 4){
	            if(xhr.status === 200){
	                callback(xhr.responseText);
	            }
	            else {

	            }
	        }
	    }
	    if(method === 'get'){//如果是get方法，需要把data中的数据转化作为url传递给服务器
	        if(typeof data === 'object'){
	            var data_send = '?';
	            for(var key in data){
	                data_send += key+'='+data[key];
	                data_send += '&';
	            }
	            data_send = data_send.slice(0,-1);
	            console.log(data_send);
	        }
	        xhr.open(method, url+data_send, true);
	        xhr.send(null);
	    } else if(method === 'post'){   //如果是post，需要在头中添加content-type说明
	        xhr.open(method, url, true);
	        xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	        xhr.send(JSON.stringify(data));   //发送的数据转化成JSON格式
	    } else {
	        console.log('请求方法错误:'+ method);
	        return fasle;
	    }
	}
	module.exports = Ajax;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	var Ajax = __webpack_require__(3);
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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var Ajax = __webpack_require__(3);
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

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var Ajax = __webpack_require__(3);
	function SortFive(playMethodId, getResultUrl){
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
	SortFive.prototype = {
		init: function(){
			this.initRandomData();
			this.render();
			this.bindEvent();
		},
		render: function(){
			var strArr = this.formatRandomData();
			var _html = this.getTmpl(strArr);
			this.tmplDom.innerHTML = _html;
			this.tmplDom.className = 'lottery-tmpl-sortfive';
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
			//当小于5位时，在前面添加0
			while(str.length < 5){
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
			//排5直选需要0-99999之间的数
			function random(){
				num = Math.floor(Math.random() * 100000);
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
			_html += '<div class="lottery-tmpl-desp fl">排5直选：</div>';
			_html += '<div class="fl">';
			_html += '<ul class="lottery-digit clearfix"><li>万</li><li>千</li><li>百</li><li>十</li><li>个</li></ul>';
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
			//这里只判断是否在[0, 99999]区间内
			for(var i = 0, len = this.currentData.length; i < len; i++){
				var currentNum = Number(this.currentData[i]);
				if(currentNum > 99999 || currentNum < 0){
					return false;
				}
			}
			return true;
		},
		isObject: function(obj){
			return obj instanceof Object && obj;
		}
	}
	module.exports = SortFive;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var Ajax = __webpack_require__(3);
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

/***/ })
/******/ ]);