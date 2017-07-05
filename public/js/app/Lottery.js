var DoubleBall = require('./doubleBall');
var ElevenFive = require('./elevenFive');
var ThreeD = require('./threeD');
var SortFive = require('./sortFive');
var ElevenFiveSelf = require('./elevenFiveSelf');
var Ajax = require('../utils/ajax');
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