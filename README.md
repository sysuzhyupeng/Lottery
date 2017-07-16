## Lottery

![image](https://github.com/sysuzhyupeng/Lottery/raw/master/public/img/lottery.png)

需求如下：</br>
  * 结合彩票玩法设计交互
  * 关注HTML5、css3、js的合理运用
  * 关注组件的复用性
  * 关注可能存在的页面性能问题
  * 能在微信中能正常浏览, 适配大部分iphone、Android手机屏幕</br>
  
  
实现说明：</br>

1.`npm install`之后`npm start`，在`localhost:3000`中查看

2.项目主类在`app/Lottery.js`中,包括ajax请求开奖日期、请求奖池金额(请求数据在node.js后端中写死)，通过对比前后数据决定是否`re-render`

3.项目主类还包括数据提交和业务组件的实例化，可以传入api参数

4.点击页面下方链接可以通过hashchange切换组件

5.双色球、11选5等业务组件都使用一个缓存队列存放待刷新数组，每当缓存队列长度小于5时，更新随机序列

6.在11选5通过ajax请求往期数据，插入当前队列中，保证往期数据的出现频率变高(`彩票套路`)

7.随机序列生成借助`对象去重`，while循环的效率可能偏低，如果效率低可以使用对象+数组保证每次random效率

8.设置最大随机次数保证效率，如果超过最大随机数就将hashmap置空

