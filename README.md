# 使用说明
功能：
集成了微信授权登陆和连接服务器的功能。
ws初始化完成就表示用户已经授权登陆并且成功连接服务器
同时还简化了一些wx内置函数的调用，如：ws.showToast('提示信息')

把ws.js文件放在js目录下
在app.js里引入ws
var ws = require("js/ws.js");

配置全局使用ws
Page({
    ws:ws,
}）

在其他页面通过app获取ws
var app = getApp(),ws=app.ws;

方法：
fun为回掉函数callback，that为可选参数，用于传入this
getUserInfo(fun, that)    //见下方示例 ws.getUserInfo(function(result){console.log(JSON.stringify(result))})
listen(type, fun, that)    //见下方示例 ws.listen("login",function(result){console.log(result)})
onload(fun, that)    //见下方示例 ws.onload(function(){console.log('ws初始化好了')})
send(type, data, fun, that)    //见下方示例 ws.send('login',{userid:3},function(result){console.log(result)})
run()    //微信兼容性写法 ws.run("hideLoading");相当于wx.hideLoading;执行时会事先判断是否支持这个方法。
//----以下同wx api 除支持原参数外，还提供快捷调用参数
showLoading(config, fun)    //showLoading("加载提示的文字","点击确定的回调函数")
hideLoading()    //隐藏load框
showModal(config)    //showLoading("加载中提示的文字")
showToast(config)    //showLoading("提示的文字")


所有方法最后都有一个可选参数用于传入this
则再函数内部可以使用this
如：ws.getUserInfo(function(result){
    this.setData({
        data:data
    })
},this)
不填this参数则无法使用this，可用一个变量来代替this,如var that=this;

通讯参数
type:消息类型，如 login登陆 voting 进行投票 avira查杀 poison毒死 antidotes解药
data:发送到服务器的数据，内容格式由消息类型约定
callback:回调函数function(result){})//result为服务器发送过来的数据
            result数据格式统一为
            {
                status:true,//处理状态
                msg:null,//提示信息，成功时一般为空，失败时为失败原因
                data:null//返回的数据，具体格式由消息类型确定，详见 服务器消息接口
            }

通讯方法：
监听：ws.listen(type,callback)
        用于监听来自服务器的消息（不知道什么时候会发来消息的情况下使用）
        监听函数应当写在Page之外或者Page的onLoad之中，避免多次执行监听叠加
        例如：
            ws.listen("login",function(result){console.log(result)})

发送获取消息：ws.send(type,data,callback)
        用于即时请求服务器，默认超时时间为5秒钟（如登陆时）
        例如：
            ws.send('login',{userid:3},function(result){console.log(result)})

获取微信用户信息
ws.getUserInfo(function(result){console.log(JSON.stringify(result))})
result:
    {
        "nickName":"Yance",
        "gender":1,
        "language":"zh_CN",
        "city":"Fuzhou",
        "province":"Fujian",
        "country":"CN","avatarUrl":"http://wx.qlogo.cn/mmopen/vi_32/EMeMBdIib5zGszOcez3KXXlmQoWfoRwxxeXxic3TcxQpMFLyA3uliab3WJl3vnAoiauiax7sZs2Lsw1FNFm2E0at4hw/0"
    }

在初始化完后执行操作（一般用于首页，需要等待微信登陆，服务器websocket连接之后执行的操作）  
由于登陆和连接需要时间，当首页加载完时可能还没完成。
需要初始化完才能进行的操作：如获取用户个人信息，和服务器通信等
当已经初始化完成之后调用此方法则立即执行  
ws.onload(function(){console.log('ws初始化好了')})


