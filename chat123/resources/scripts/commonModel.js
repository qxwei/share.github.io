/**
 * 公共基础数据类
 */

/**
 * 基础配置
 */
var config = {
		//要显示的最大聊天记录
		maxMsgShowCount : 20,
		//消息分发器地址
		dispatcherAddress:'/app/MsgDispatcher',
		//	资源加载前缀
		bacePrefix:'https://qxwei.github.io/chat123/'
}

/**
 * 聊天消息类型
 */
var msgType = {
		/**
         * 普通消息
         */
        Msg:0,
        
        /**
         * 命令
         */
        Command:1, 
        /**
         * 上线
         */
        Online:2,
        /**
         *离线
         */
        Offline:3,
        /**
         *匿名配对
         */
        AnonymousPair:4,
        /**
         *断开匿名聊天查询等待
         */
        nowait:5
}
var UserType = {
    /**
     * 管理员
     */
    Admin:0,
    
    /**
     * 普通用户
     */
    General:1, 
    /**
     * 匿名用户
     */
    Anonymous:2
}
