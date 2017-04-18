(function (root, factory) {
	if (typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if (typeof define === 'function' && define.amd)
		define("EventBus", [], factory);
	else if (typeof exports === 'object')
		exports["EventBus"] = factory();
	else
		root["EventBus"] = factory();
})(this, function () {

	var EventBusClass = {},__get=false;
	EventBusClass = function () {
		this.listeners = {};
	};
	EventBusClass.prototype = {
		addEventListener: function (type, callback, scope) {
			if(__get&&type=="__get")return;
			var args = [];
			var numOfArgs = arguments.length;
			for (var i = 0; i < numOfArgs; i++) {
				args.push(arguments[i]);
			}
			args = args.length > 3 ? args.splice(3, args.length - 1) : [];
			if (typeof this.listeners[type] != "undefined") {
				this.listeners[type].push({ scope: scope, callback: callback, args: args });
			} else {
				this.listeners[type] = [{ scope: scope, callback: callback, args: args }];
			}
		},
		removeEventListener: function (type, callback, scope) {
			if (typeof this.listeners[type] != "undefined") {
				var numOfCallbacks = this.listeners[type].length;
				var newArray = [];
				for (var i = 0; i < numOfCallbacks; i++) {
					var listener = this.listeners[type][i];
					if (listener.scope == scope && listener.callback == callback) {

					} else {
						newArray.push(listener);
					}
				}
				this.listeners[type] = newArray;
			}
		},
		hasEventListener: function (type, callback, scope) {
			if (typeof this.listeners[type] != "undefined") {
				var numOfCallbacks = this.listeners[type].length;
				if (callback === undefined && scope === undefined) {
					return numOfCallbacks > 0;
				}
				for (var i = 0; i < numOfCallbacks; i++) {
					var listener = this.listeners[type][i];
					if ((scope ? listener.scope == scope : true) && listener.callback == callback) {
						return true;
					}
				}
			}
			return false;
		},
		dispatch: function (type, target,data) {
			//var event = {
			//	type: type,
			//	target: target
			//};
			var args = [];
			var numOfArgs = arguments.length;
			for (var i = 0; i < numOfArgs; i++) {
				args.push(arguments[i]);
			};
			args = args.length > 3 ? args.splice(3, args.length - 1) : [];
			//args = [event].concat(args);
			if(type!="__get")data=data.data;
			args = [data].concat(args);
			if (typeof this.listeners[type] != "undefined") {
				var numOfCallbacks = this.listeners[type].length;
				for (var i = 0; i < numOfCallbacks; i++) {
					var listener = this.listeners[type][i];
					if (listener && listener.callback) {
						var concatArgs = args.concat(listener.args);
						listener.callback.apply(listener.scope, concatArgs);
					}
				}
			}
		},
		getEvents: function () {
			var str = "";
			for (var type in this.listeners) {
				var numOfCallbacks = this.listeners[type].length;
				for (var i = 0; i < numOfCallbacks; i++) {
					var listener = this.listeners[type][i];
					str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
					str += " listen for '" + type + "'\n";
				}
			}
			return str;
		}
	};

	var ws = {}
	ws.showModal = function (config, fun) {
		var def = {
			title: '提示',
			content: '这是一个模态弹窗',
			showCancel: false,
			cancelText: "取消",
			confirmText: "确定",
			success: function (res) { },//	否	接口调用成功的回调函数
			fail: function (res) { },//	接口调用失败的回调函数
			complete: fun || function (res) { },//接口调用结束的回调（调用成功、失败都会执行）
		}
		typeof config == "string" ? def.content = config : Object.assign(def, config)
		wx.showModal(def)
	}
	ws.showToast = function (config, fun) {
		var def = {
			title: "成功",//	提示的内容
			icon: "success",//	图标，只支持"success"、"loading"
			duration: 1500,//	否	提示的延迟时间，单位毫秒，默认：1500
			mask: false,//	否	是否显示透明蒙层，防止触摸穿透，默认：false
			success: function (res) { },//	否	接口调用成功的回调函数
			fail: function (res) { },//	接口调用失败的回调函数
			complete: fun || function (res) { },//接口调用结束的回调（调用成功、失败都会执行）
		}
		typeof config == "string" ? def.title = config : Object.assign(def, config)
		wx.showToast(def)
	}
	ws.showLoading = function (config, fun) {
		var def = {
			title: '加载中...',//	提示的内容
			mask: true,//	Boolean	否	是否显示透明蒙层，防止触摸穿透，默认：false
			success: function (res) { },//	否	接口调用成功的回调函数
			fail: function (res) { },//	接口调用失败的回调函数
			complete: fun || function (res) { },//接口调用结束的回调（调用成功、失败都会执行）
		}
		typeof config == "string" ? def.title = config : Object.assign(def, config)
		wx.showLoading(def)
	}
	ws.hideLoading = wx.hideLoading;

	var eventbus = new EventBusClass();
	var wsSend = function (data) {
		if (!data.type) return;
		if (wsStatus) {
			wx.sendSocketMessage({
				data: '|' + data.type + '|' + JSON.stringify(data)
			})
		}
		else {
			if (wsReCount > 2) {
				wsReCount = 0;
				ws.showModal("请重新连接服务", function () {
					initSocket(function () { wsSend(data) })
				});
			} else {
				wsReCount++;
				initSocket(function () { wsSend(data) })
			}
		}
	}
	var wsStatus = false, getDataID = 0, msgQueue = {}, wsReCount = 0;
	ws.listen =function(){eventbus.addEventListener.apply(eventbus,arguments)}
	ws.send = function (type, data, fun, that) {
		if (typeof type != "string") return;
		if (typeof fun != "function") fun = function () { };
		getDataID++;
		msgQueue[getDataID] = { id: getDataID, callback: fun, that: that };
		var init = {
			type: type, data: data, id: getDataID
		};
		wsTimeOut(getDataID);
		wsSend(init);
	}
	var wsTimeOut = function (id) {
		var timeid = setTimeout(function () {
			if (id && msgQueue[id]) {
				var c = msgQueue[id];
				delete msgQueue[id];
				c.callback.apply(c.that, [{ status: false, msg: '连接超时' }]);
			}
		}, 5000)
		msgQueue[id].timeid = timeid
	}
	eventbus.addEventListener("__get", function (data) {
		var id = data.id;
		if (id && msgQueue[id]) {
			var c = msgQueue[id];
			delete msgQueue[id];
			clearTimeout(c.timeid);
			c.callback.apply(c.that, [data.data]);
		}
	})
	__get=true;
	var initSocket = function (fn) {
		ws.showLoading('连接中...');
		if (typeof fn != "function") fn = function () { };
		var fun = function () { ws.hideLoading(); wsReCount = 0; fn(); };
		wx.connectSocket({
			url: "wss://lrs.peernat.com/websocket/"
		});
		wx.onSocketOpen(function (res) {
			wsStatus = true;
			ws.send('login', userInfo, function (e, d) {
				fun(); wsload();
			})
		});
		wx.onSocketMessage(function (res) {
			var data = JSON.parse(res.data);
			var type = data.type;
			if (data.id && msgQueue[data.id]) {
				eventbus.dispatch('__get', this, data);
			}
			eventbus.dispatch(type, this, data);
		});
		wx.onSocketError(function (res) {
			ws.hideLoading();
			if (res.message == 'websocket is connected') {
				wsStatus = true;
				fun();
			}
			else {
				wsStatus = false;
				ws.showModal("服务器无法连接", function () { initSocket(fun) });
			}
		});
		wx.onSocketClose(function (res) { wsStatus = false; ws.hideLoading() });
	}

	var userInfo = null;
	ws.getUserInfo = function (fun) {
		if (userInfo) {
			typeof fun == "function" && fun(userInfo)
		} else {
			//调用登录接口
			ws.showLoading()
			wx.login({
				success: function (a, b) {
					wx.getUserInfo({
						success: function (res,z,b) {console.log(res,z,b);
							userInfo = res.userInfo
							ws.hideLoading();
							typeof fun == "function" && fun(userInfo)
						},
						fail: function () {
							ws.hideLoading();
							ws.showModal("请重新确认授权", ws.getUserInfo);
						}
					})
				}
			})
		}
	}

	ws.getUserInfo(initSocket);
	var _onload = [], _loadstatus = false;
	var wsload = function () {
		_loadstatus=true;
		while (_onload.length > 0) {
			var d = _onload.shift();
			d.fun.apply(d.that, d.args)
		}
	}
	ws.onload = function (fun, that) {
		if (typeof fun != "function") return;
		var args = [];
		var numOfArgs = arguments.length;
		for (var i = 0; i < numOfArgs; i++) {
			args.push(arguments[i]);
		};
		args = args.length > 2 ? args.splice(2, args.length - 1) : [];
		if (_loadstatus) {
			fun.apply(that, args);
		}
		else {
			_onload.push({ that: that, fun: fun, args: args });
		}
	}
	return ws;
});