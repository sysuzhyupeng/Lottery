// var mongodb = require('./db');

function Order(order) {
	this.orderId = order.orderId;
	//玩法id
	this.money = order.money;
	this.name = order.name;
	this.period = order.period;
}
module.exports = User;

//存储中奖信息
Order.prototype.save = function(callback) {
	//要存入数据库的用户文档
	var user = {
		name: this.name,
		orderId: this.orderId,
		period: this.period,
		money: this.money
	};
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//读取users集合
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.insert(user, {
				safe: true
			}, function() {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user[0]); //返回存储后的用户文档
			})
		})
	})
}

//读取用户信息
Order.get = function(name, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name: name
			}, function(err, user) {
				mongodb.close();
				if (err) {
					return callback(err);
					mongodb.close();
				}
				callback(null, user); //返回查询的用户信息
			})
		})
	})
}