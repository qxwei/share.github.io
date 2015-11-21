// 聊天的核心方法
var chatCore = function(connectUrl, subscribeUrl,isDebug) {
	this.isConnected = false;
	this.connectUrl = connectUrl;
	this.subscribeUrl = subscribeUrl;
	this.isDebug = isDebug==null?false:isDebug;
	this.stompClient=null;
};
//连接
chatCore.prototype.Connect = function(lostConnextCalkback) {
	if (this.isConnected)
		return;
	var socket = new SockJS(this.connectUrl);
	this.stompClient = Stomp.over(socket);
//	if(commandRenderFun==null) commandRenderFun = this.defultRenderFun;
	var isConnected = this.isConnected;
	var stompClient = this.stompClient;
	var that = this;
	this.stompClient.connect("", "", function(frame) {
		isConnected = true;
//		stompClient.subscribe(commandUrl, commandRenderFun);
	},function(){
		console.log( "Lost server connect,try again！");
		typeof lostConnextCalkback === "function" ? lostConnextCalkback() : void 0;
	});
};
//订阅
chatCore.prototype.Subscribe = function(subscribeUrl,renderFun) {
	if(this.isConnected) 
	{
			console.log( "God，not connect server！");
			this.Connect();
	}
	if(renderFun==null) renderFun = this.defultRenderFun;
	if(subscribeUrl==null) subscribeUrl = this.subscribeUrl;
	var subscribeobj = this.stompClient.subscribe(subscribeUrl, renderFun);
	return subscribeobj;
};
//发送
chatCore.prototype.Send = function(msgobj,sendUrl)
{
		if(this.isConnected) 
		{
				console.log( "God，not connect server！");
				this.Connect();
		}
	this.stompClient.send(sendUrl, {priority: 9}, msgobj); 
};
//默认接受消息渲染函数
chatCore.prototype.defultRenderFun = function(reviceData)
{
	console.log("Message received");
	console.log(reviceData);
};


var chatManager=function()
{
	
};
