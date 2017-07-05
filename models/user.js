var mongodb = require('./db');

function User(user){
	this.name = user.name;
    //玩法id
	this.mid = user.mid;
    //期数
    this.period = user.period;
    //投注字符串
    this.lottery_str = user.lottery_str;
    //投注金额
    this.money = user.money;
}
module.exports = User;

//存储中奖信息
User.prototype.save = function(callback){
   //要存入数据库的用户文档
    var user = {
       	name: this.name,
       	mid: this.mid,
        period: this.period,
        lottery_str: this.lottery_str,
        money: this.money
    };
   //打开数据库
   mongodb.open(function(err, db){
   	    if(err){
       	  	return callback(err);
       	}
   	    //读取users集合
   	    db.collection('users', function(err, collection){
            if(err){
              	mongodb.close();
              	return callback(err);
            }
            collection.insert(user, {
              	safe: true
            }, function(){
              	mongodb.close();
              	if(err){
              		return callback(err);
              	}
              	callback(null, user[0]);   //返回存储后的用户文档
            })
   	    })
    })
}

//读取用户信息
User.get = function(name, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name: name
			}, function(err, user){
				mongodb.close();
				if(err){
					return callback(err);
					mongodb.close();
				}
				callback(null, user);  //返回查询的用户信息
			})
		})
	})
}