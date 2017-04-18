# 使用说明


ws.listen("login",function(result){console.log(result)})

ws.send('login',{userid:3},function(result){console.log(result)})

ws.onload(function(){console.log('ws初始化好了')})


ws.getUserInfo(function(result){console.log(JSON.stringify(result))})
result:
{"nickName":"Yance","gender":1,"language":"zh_CN","city":"Fuzhou","province":"Fujian","country":"CN","avatarUrl":"http://wx.qlogo.cn/mmopen/vi_32/EMeMBdIib5zGszOcez3KXXlmQoWfoRwxxeXxic3TcxQpMFLyA3uliab3WJl3vnAoiauiax7sZs2Lsw1FNFm2E0at4hw/0"}