var express = require('express');
var router = express.Router();
User = require('../models/user.js');

/* GET home page. */
module.exports = function(app){
	app.get('/', function(req, res){
		res.render('index', { 
			title: ''
		});
	})
	//获取奖池金额
	app.get('/getSum', function(req, res){
		var param = req.query.id;
		var data = {
			billion: '10',
			tenThousand: '999'
		}
    	res.writeHead(200, {'Content-Type': 'application/json'});
    	res.write(JSON.stringify({data: data}));
    	res.end();
    });
	//获取开奖时间
    app.get('/getTime', function(req, res){
		var param = req.query.id;
		var data = {
			period: '14134',
			weekDay: '周二',
			time: '21:20'
		}
    	res.writeHead(200, {'Content-Type': 'application/json'});
    	res.write(JSON.stringify({data: data}));
    	res.end();
    });
    //获取以往开奖记录
    app.get('/getEleventFiveList', function(req, res){
		var id = req.query.id;
		var data = [];
		if(id === '1'){
			data = ['9_5', '4_3', '5_0', '2_1'];
		}
    	res.writeHead(200, {'Content-Type': 'application/json'});
    	res.write(JSON.stringify({data: data}));
    	res.end();
    });
    //提交投注金额、玩法id和投注序列
    app.post('/submit', function(req, res){
    	var form = req.body;
    	var name = 'zhyupeng', 
    	   	money = form.money,
    	    period = form.period,
    	    mid = form.mid,
    	   	lottery_str = form.lottery_str;
    	//忽略参数检查
    	var newUser = new User({
    		name: 'zhyupeng',
    		money: money,
    		period: period,
    		mid: mid,
    		lottery_str: lottery_str
    	});
    	//存入数据库
   //  	newUser.save(function(err, user){
			// if(err){
			// 	console.log('err', err);
			// 	return res.redirect('/');
			// }
			var info = {
				text: '投注成功！'
			}
			res.writeHead(200, {'Content-Type': 'application/json'});
	    	res.write(JSON.stringify({info: info}));
	    	res.end();
		// })
    })
}

