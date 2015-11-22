function initview()
{
	$('#chatdiv').height($(window).height() - 20);
	if (window.navigator.userAgent.indexOf("Firefox")>=1)
		{
			$('.chatmsg').css('height','58% !important');
		}
	$(window).resize(function() {
		var height = $(window).height() - 20;
		$('#chatdiv').height(height);
		$('.chatmsg').height(height*0.7-56);
		$('#chatinput').height(height*0.3);
		});
}
function initqqface($timeout)
{
	try{
			$('.emotion').qqFace({ 
		        assign:'chatinput', //给输入框赋值 
		        path:config.bacePrefix+'resources/img/face/'    //表情图片存放的路径 
		    });
		}
		catch(err)
		{
			console.error(err);
			$timeout(function(){
				initqqface($timeout);
			},20000);
		}
}
MetronicApp.controller('HallController', function($rootScope, $scope, $http, $timeout) {
	
	initview();
	initqqface($timeout);
  /*  ------------------------------------------------------------------*/
    $scope.User;
    $scope.pageModel={
    		sendMsg:"",
    		validationResult:false
    }
    //订阅队列
    $scope.subscribeList = [];
    //消息显示列表
    $scope.showMsgList = [];
    //当前显示的会话,当前订阅地址
    $scope.currentSubscribe = '/topic/hallcentar';
    //聊天模式
    $scope.navtext= '大厅';
    //是否是匿名对聊状态
    $scope.isAnonymousWait = false;
    //命令订阅对象，用于释放
    $scope.commandSubscribeObj;
    
    //当前的订阅的对象
    $scope.subscribeObj = {};
    
    //是否可以断开当前来连接
    $scope.enabledisconnect = false;
    //消息对象
    $scope.Msg =  {
    		recipient:$scope.currentSubscribe,
    		msg:"有人上线了",
    		msgType:msgType.Online,
    		coordinate:'',
    		createTime:new Date(),
    		sender:''
    }
    //订阅对象
    var subscribeObj = {
    		subscribeUrl:$scope.currentSubscribe,
    		MsgList:[],
    		subscribeObj:{}
    }
    
    //消息发送方法
    $scope.sendEvent=function(){
    	console.log($scope.pageModel);
    	if($scope.pageModel.validationResult)
    	{
    		var Msg =  {
    	    		recipient:$scope.currentSubscribe,
    	    		msg:$scope.pageModel.sendMsg,
    	    		msgType:msgType.Msg,
    	    		coordinate:$scope.User.coordinate,
    	    		createTime:new Date(),
        			sender: $scope.User.userName+'('+$scope.User.ipaddress+')'
    	    }
    		$scope.pageModel.sendMsg = "";
    		core.Send(angular.toJson(Msg),config.dispatcherAddress);
    		
    		//添加消息
//    		if($scope.subscribeList.length==0)
//        	{
//        			console.log('订阅队列错误！');
//        			return;
//        	}
//        	$scope.subscribeList.filter(function (item) {
//    			if(item.subscribeUrl==$scope.currentSubscribe)
//    			{
//    				$scope.Msg.isMe= true;
//    				item.MsgList.push($scope.Msg);
//    				delete $scope.Msg.isMe;
//    				$scope.showMsgList = item.MsgList.slice(item.MsgList.length>20?item.MsgList.length-20:0, item.MsgList.length)
//    			}
//        	    return item
//        	})
    	}
    }
    
    //命令处理
    $scope.handleAnonymousPair = function(reviceData)
    {
    	reviceData = angular.fromJson(reviceData.body);
    	if(reviceData.msg!='nopair'&&$scope.isAnonymousWait)
    	{
    		 $scope.commandSubscribeObj.unsubscribe();
    		 $scope.isAnonymousWait=false;
    		$scope.currentSubscribe = '/queue/AnonymousPair'+reviceData.msg; 
    	    var msg =  {
    	    		recipient:$scope.currentSubscribe,
    	    		msg:"您已经和一个陌生朋友连接上，问个好吧。",
    	    		msgType:'Online',
    	    		coordinate:'',
    	    		createTime:new Date(),
    	    		sender:''
    	    }
    	    $scope.showMsgList.push(msg);
    		enterNewSession(false,false);	
    		$scope.enabledisconnect = true;
    		$scope.$apply();
    	}
    }
    //将接收消息保存到队列的方法
    $scope.saveAndRenderMsg = function(reviceData)
    {
    	reviceData = angular.fromJson(reviceData.body);
    	if($scope.subscribeList==null||$scope.subscribeList.length==0)
    	{
    		$scope.subscribeList = [];
    	    var subscribeObj = {
    	    		subscribeUrl:$scope.currentSubscribe,
    	    		MsgList:[reviceData],
    	    		subscribeObj:{}
    	    }
    			console.error('订阅队列异常！');
    	}
    	$scope.subscribeList.filter(function (item) {
			if(item.subscribeUrl==reviceData.Recipient){
				
				reviceData.createTime = new Date(reviceData.createTime);
				item.MsgList.push(reviceData);
				if(item.subscribeUrl==$scope.currentSubscribe)
				{
					$scope.showMsgList = item.MsgList.slice(item.MsgList.length>config.maxMsgShowCount?item.MsgList.length-config.maxMsgShowCount:0, item.MsgList.length)
				}
		}
    	    return item
    	});
    	$scope.$apply();
    }
     
    //切换房间，切换订阅地址
    $scope.switchRoom = function($event){
    	var toAddress = $($event.target).attr('subscribeUrl');
    	var fromAddress = $scope.currentSubscribe;
    	var oldnavtext = $scope.navtext;
    	$scope.navtext = $($event.target).html();
    	//没有切换直接返回
    	if($scope.currentSubscribe ===toAddress)
		{
			return;
		}
    	//群聊切到其他
    	else if($scope.currentSubscribe.indexOf('/topic/') === 0)
    	{
    		handleSwitchRoom(toAddress,fromAddress,oldnavtext,false);
    	}
    	//匿名对聊切到其他
    	else if($scope.currentSubscribe.indexOf('/queue/AnonymousPair') === 0){
    		handleSwitchRoom(toAddress,fromAddress,oldnavtext,true);
    	} 
    }
    
    //匿名聊天配对请求
    $scope.requestAnonymousPair = function(extension)
    {
    	$scope.commandSubscribeObj = core.Subscribe('/command/'+$scope.User.coordinate,$scope.handleAnonymousPair);
    	var Msg =  {
	    		recipient:'/command/'+$scope.User.coordinate,
	    		msg:'',
	    		msgType:msgType.AnonymousPair,
	    		coordinate:$scope.User.coordinate,
	    		createTime:new Date(),
    			sender: '',
    			extension:extension
	    }
		core.Send(angular.toJson(Msg),config.dispatcherAddress);
    	$scope.nowait();
    }
    //获取聊天历史记录
    $scope.getHistory = function(subscribeUrl)
    {
    	 $http({method: 'GET', url: './chat/initMsg?key='+subscribeUrl}).
    	    success(function(data, status, headers, config) {
    	    	$scope.subscribeList.filter(function (item) {
    	    			if(item.subscribeUrl==$scope.currentSubscribe)
    	    			{
    	    				if(data!=null&&data!='')
    	    				{
	    	    				item.MsgList=data;
	    	    				$scope.showMsgList = item.MsgList.slice(item.MsgList.length>config.maxMsgShowCount?
	    	    						item.MsgList.length-config.maxMsgShowCount:0, item.MsgList.length);
    	    				}
    	    			}
    	        	});
    	    	
    	    }).
    	    error(function(data, status, headers, config){
    	    	console.error('获取聊天历史出错！');
    	    });
    }
    
    //重新建立匿名连接
    $scope.buildAnonymousPair = function()
    {
    	if( $scope.isAnonymousWait)return;
    	if($scope.enabledisconnect)return;
    	// 1、发送断开消息
    	// 2、取消当前订阅
    	// 3、进入断开列表
    	freedSubscribeList($scope.currentSubscribe,false)
		$scope.isAnonymousWait = true;
		$scope.requestAnonymousPair();
    	
    }
    //计时器长时间未找到聊天对象则关闭查找
    $scope.nowait = function()
    {
    	$timeout(function() {
		    if($scope.commandSubscribeObj!=null)
		    	$scope.commandSubscribeObj.unsubscribe();
		    	$scope.isAnonymousWait=false;
		    var tempMsg =  {
		    		msg:"暂时没有找到可以和你聊天的用户。",
		    		msgType:msgType.nowait,
		    		coordinate:$scope.User.coordinate,
		    		createTime:new Date(),
		    		sender:''
		    }
			var strmsg = angular.toJson(tempMsg);
			core.Send(strmsg,config.dispatcherAddress);
			tempMsg.msgType='Offline';
		    $scope.showMsgList.push(tempMsg); 
		    $scope.enabledisconnect = false;
    	}, 15000);
    	
    }
    //断开当前匿名聊天
    $scope.disconnectAnonymousPair = function()
    {
    	if( $scope.isAnonymousWait)return;
    	if(!$scope.enabledisconnect)return;
    	// 1、发送断开消息
    	// 2、取消当前订阅
    	// 3、进入断开列表
    	disconnectChat(false,true);
    }
    
    
    //ctrl+enter 发送消息
    $scope.shortcutSend= function($event)
    {
       if ($event.keyCode == 13 && $event.ctrlKey) {
    	   var content = $($event.target).text();
    	   if(content!=null&&content!='')
		   {
    		   $scope.pageModel.validationResult = true;
    		   $scope.pageModel.sendMsg = $($event.target).html();
        	   $scope.sendEvent();
        	   $($event.target).html('');
		   }
       }
    }
    
  //连接断开回调方法
	function lostConnextCalkback()
	{
		core.Connect(lostConnextCalkback);
		//释放订阅
/*    	for(var i=0;i<$scope.subscribeList.length;i++)
		{
    		var item = $scope.subscribeList[i];
    		 if( item.subscribeObj!=null)
    			 item.subscribeObj.unsubscribe();
		}*/
    	if(core.isConnected){
		$timeout(function(){
			core.Subscribe($scope.currentSubscribe,$scope.saveAndRenderMsg);
		},10000);
    	
		}
    /*	//再次订阅 
    	for(var i=0;i<$scope.subscribeList.length;i++)
		{
    		var item = $scope.subscribeList[i];
    		 if( item.subscribeUrl!=null)
			 {
    			 core.Subscribe(item.subscribeUrl,$scope.saveAndRenderMsg);
			 }
		}*/
	}

    
    //连接服务器
	var core = new chatCore('/MessageCenter'); 
	core.Connect(lostConnextCalkback);
	
	
    //获取用户信息，订阅大厅
    $http({method: 'GET', url: './Index/Hall'}).
    success(function(data, status, headers, config) {
    	$scope.User = data;
    	$timeout(function(){enterNewSession(true);}, 4000);
    }).
    error(function(data, status, headers, config){});
    
    //离开页面时的清理工作
	window.onbeforeunload=function(){
		//代码故意拖长防止浏览器关闭带来的变量重置
		disconnectChat(true,false);
		/*var recipient = $scope.currentSubscribe;
	    $scope.Msg =  {
	    		recipient:recipient,
	    		msg:"有人上线了",
	    		msgType:msgType.Offline,
	    		coordinate:'',
	    		createTime:new Date(),
	    		sender:''
	    }
		if($scope.currentSubscribe.indexOf('/queue/AnonymousPair') ===0)
		{
			$scope.Msg.msg ='对方断开了连接。';
    		$scope.Msg.coordinate = $scope.User.coordinate;
		}
		else
			$scope.Msg.msg =$scope.User.userName+'('+$scope.User.ipaddress+')离开了'+$scope.navtext+'。';
	    var strMsg = angular.toJson($scope.Msg);
		core.Send(strMsg,config.dispatcherAddress);
		$timeout(function() {freedSubscribeList($scope.currentSubscribe);}, 1000);*/
	};
	
	function disconnectChat(isSync,isAnonymousPair)
	{
		//设置默认参数
		if(isSync===null) isSync =false;
		if(isAnonymousPair===null)isAnonymousPair=false;
		var recipient = $scope.currentSubscribe;
	    var Msg =  {
	    		recipient:recipient,
	    		msg:"",
	    		msgType:msgType.Offline,
	    		coordinate:'',
	    		createTime:new Date(),
	    		sender:'',
	    		extension:''
	    }
		if($scope.currentSubscribe.indexOf('/queue/AnonymousPair') ===0)
		{
			Msg.msg ='对方断开了连接。';
    		Msg.coordinate = $scope.User.coordinate;
    		if(isAnonymousPair)
    		{
    		    var tempMsg =  {
    		    		recipient:recipient,
    		    		msg:"你已断开了当前连接。",
    		    		msgType:'Offline',
    		    		coordinate:'',
    		    		createTime:new Date(),
    		    		sender:'',
    		    		extension:''
    		    }
    			$scope.showMsgList.push(tempMsg);   
    			Msg.extension = 'disconnectAnonymousPair';
    		}
		}
		else
			Msg.msg =$scope.User.userName+'('+$scope.User.ipaddress+')离开了'+$scope.navtext+'。';
	    var strMsg = angular.toJson(Msg);
		core.Send(strMsg,config.dispatcherAddress);
		if(isSync)
			$timeout(function() {freedSubscribeList($scope.currentSubscribe);}, 1000);
		 if(!isSync&&isAnonymousPair)
				freedSubscribeList($scope.currentSubscribe,false);	
		 if(!isSync)
			 freedSubscribeList($scope.currentSubscribe,false);	
	}
	
    //进入新的会话
    function enterNewSession(isLoadHistory,isInform)
    {
    	try{
	    	var newsubscribeObj = {
	        		subscribeUrl:$scope.currentSubscribe,
	        		MsgList:[],
	        		subscribeObj:{}
	        }
	    	if(isLoadHistory==null)isLoadHistory=false;
	    	if(isInform==null)isInform = true;
	    	newsubscribeObj.subscribeObj = core.Subscribe($scope.currentSubscribe,$scope.saveAndRenderMsg);
	    	 $scope.subscribeObj = newsubscribeObj.subscribeObj;
	    	if(isLoadHistory)
	    	{
		    	//加载大厅历史聊天
		    	$scope.getHistory($scope.currentSubscribe);
	    	}
	    	$scope.subscribeList.push(newsubscribeObj);
	    	//上线通知，设置会话组
	    	if(isInform)
			{
				$scope.Msg.coordinate = $scope.User.coordinate;
				$scope.Msg.recipient = $scope.currentSubscribe;
				if($scope.User.userType == UserType.Anonymous)
				{
					$scope.Msg.msg = $scope.User.userName+'('+$scope.User.ipaddress+')进入了'+$scope.navtext+'。';
					$scope.Msg.sender = $scope.User.userName+'('+$scope.User.ipaddress+')';
				}
				else
				{} 
				core.Send(angular.toJson($scope.Msg),config.dispatcherAddress);
			}
    	}
    	catch(err)
    	{
    		console.info('enterNewSession fail,try agian.');
    		console.error(err);
    		$timeout(function(){enterNewSession(isLoadHistory,isInform);}, 4000);
    	}
    }
    //处理会话切换
    function handleSwitchRoom(toAddress,fromAddress,oldnavtext,isAnonymousPair)
    {
    	//1、发送离开通知
    	if(isAnonymousPair)
    	{
    		$scope.Msg.msg ='对方断开了连接。';
    		$scope.Msg.coordinate = $scope.User.coordinate;
    	}
    	else
    		$scope.Msg.msg =$scope.User.userName+'('+$scope.User.ipaddress+')离开了'+oldnavtext+'。';;
		$scope.Msg.msgType = msgType.Offline;
		$scope.Msg.recipient= fromAddress;
		core.Send(angular.toJson($scope.Msg),config.dispatcherAddress);
		
		//2、更新数据，退订当前订阅
		$scope.currentSubscribe =toAddress;
		freedSubscribeList(fromAddress);
		$scope.isAnonymousWait = false;
		if(toAddress.indexOf('/topic/')===0)
		{
			//切入新的群聊
			enterNewSession(true);
		}
		else if(toAddress.indexOf('/queue/AnonymousPair') === 0)
		{
			//切入匿名聊天
			$scope.isAnonymousWait = true;
			$scope.requestAnonymousPair();
		}
    }
    //释放订阅
    function freedSubscribeList(freedUrl,isClearMsg)
    {
    	if(isClearMsg==null) isClearMsg =true;
    	var freedSubscribe = null;
    	var freedItemindex = 0;
    	for(var i=0;i<$scope.subscribeList.length;i++)
		{
    		var item = $scope.subscribeList[i];
    		if(item.subscribeUrl===freedUrl)
			{
				freedSubscribe = item.subscribeObj;
				freedItemindex = i;
				break;
			}
		}
    	if(freedSubscribe!=null)
    	{
	    	freedSubscribe.unsubscribe();
	    	if(isClearMsg)
	    		$scope.subscribeList.splice(freedItemindex,1);
    	}
    	if(isClearMsg)
    		$scope.showMsgList = [];   
    }
    
});