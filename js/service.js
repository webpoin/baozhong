

// url解析
window.href = (function(){
	var url = decodeURI(location.href);
	var res ={};
	url.replace(/([^?&=]+)=([^?&=]+)/ig,function(a,b,c){res[b]=c;});

	return res;
})();


// 模板引擎
window.tplEngine = (function(){

	// 根据模板来渲染
	var getTpl = function(obj,tpl){

		return tpl.replace(/data-(\S)*?/g,'$1').replace(/<(\w*)\s[^<]*?(subdata\=\"\{\{([\S]*)\}\}\")[\w\W]*?>[\w\W]*?<\/\1>/g,function(match,tag,str,key){
			
			var r = new RegExp('<\/?'+tag+'>?','gi');
			var k = '<--@-->';
			var i = 0;
			var tpl = match.replace(r,function(e){
				i = e.indexOf('/') < 0 ? i +1 : i -1;
				return i == 0 ? e+k : e ;
			});

			return obj && split(obj[key],tpl.substr(0,tpl.indexOf(k)).replace(str,''));

		}).replace(/\{\{([\w\W]*?)\}\}/g,function(a,key){

			// 数组都为数据,或字符
			if(typeof obj === 'string' || typeof obj === 'number'){obj = {0:obj};}

			if(obj === null){return ''}
			if(obj == undefined ){return a}
			if(obj[key] === null){return '';}
			if(obj[key] === undefined){return a}


			return obj[key];
		});
	}

	// 分支
	var split = function(data,tpl){


		if(Object.prototype.toString.call(data) === "[object Array]"){ // 数组则拆分为单个对象
			return data.map(function(i){return getTpl(i,tpl);}).join('');
		}else{
			return data ? getTpl(data,tpl) : '';
		}
	}

	return split;
})();


// 模板内容替换
window.tplExchange = function(elem,data,error,push){

	if(!elem){return;}

	// 如果异常，则返回
	if(error){
		elem.classList.add('template_error');
		return false;
	}
	if(!elem.tpl){
		elem.tpl = elem.innerHTML;
		elem.innerHTML = '';
	}

	// 未有值
	if(!data){
		elem.innerHTML = push ? elem.innerHTML : '';
		return;
	}

	elem.innerHTML = push ? elem.innerHTML + window.tplEngine(data,elem.tpl) : window.tplEngine(data,elem.tpl);
	elem.classList.remove('template');
	elem.classList.remove('template_error');
	elem.classList.add('template_ready');
}


// 表单序列化
window.serialize = function(form) {
	if (!form || form.nodeName !== "FORM") {
		return;
	}
	var i, j, q = {};
	for (i = form.elements.length - 1; i >= 0; i = i - 1) {
		if (form.elements[i].name === "") {
			continue;
		}
		switch (form.elements[i].nodeName) {
			case 'INPUT':
				switch (form.elements[i].type) {
					case 'text':
					case 'hidden':
					case 'password':
					case 'number':
					case 'tel':
						q[form.elements[i].name] = form.elements[i].value;
						break;
					case 'button':
					case 'reset':
					case 'submit':
						break;
					case 'checkbox':
					case 'radio':
						form.elements[i].checked && (q[form.elements[i].name] = form.elements[i].value);
						break;
					case 'file':
						break;
				}
				break;
			case 'TEXTAREA':
				q[form.elements[i].name] = form.elements[i].value;
				break;
			case 'SELECT':
				switch (form.elements[i].type) {
					case 'select-one':
						q[form.elements[i].name] = form.elements[i].value;
						break;
					case 'select-multiple':

						for (var s=[],j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
							if (form.elements[i].options[j].selected) {
								s.push(form.elements[i].options[j].value);
							}
						}
						q[form.elements[i].name] = s.join(',');
						break;
				}
				break;
			case 'BUTTON':
				switch (form.elements[i].type) {
					case 'reset':
					case 'submit':
					case 'button':
						break;
				}
				break;
		}
	}
	return q;
}


// 对象合并
window.extend = (function(global){
    var extend,
        _extend,
        _isObject;

    _isObject = function(o){
        return Object.prototype.toString.call(o) === '[object Object]';
    }

    _extend = function self(destination, source) {
        var property;
        for (property in destination) {
            if (destination.hasOwnProperty(property)) {

                // 若destination[property]和sourc[property]都是对象，则递归
                if (_isObject(destination[property]) && _isObject(source[property])) {
                    self(destination[property], source[property]);
                };

                // 若sourc[property]已存在，则跳过
                if (source.hasOwnProperty(property)) {
                    continue;
                } else {
                    source[property] = destination[property];
                }
            }
        }
    }

    return function(){
        var arr = arguments,
            result = {},
            i;

        if (!arr.length) return {};

        for (i = arr.length - 1; i >= 0; i--) {
            if (_isObject(arr[i])) {
                _extend(arr[i], result);
            };
        }

        arr[0] = result;
        return result;
    }

})();



// 所有的数据服务
var service = (function(){

	// var host = 'http://127.0.0.1:3000';
	// var host = 'http://tour.yytx.com:8080/yytxauth'; // 本地服务器
	// var host = 'https://www.yunyoutianxia.com.cn'; // 测试服务器
	var host = 'http://www.bcts.com.cn'; // 正式环境

	localStorage.setItem('host',host);

	var map =  {
		'getCity' : '/tourapp/area/linegatherarea', // 6.1 查找收客区域 
		'getHotCity' : '/tourapp/area/linedest', // 6.2 查找目的地 
		'----' : '/tourapp/member/butler/get', // 6.3 获取“我的管家” 
		'getKeeper' : '/tourapp/clientpeer/findbyarea', // 6.4 查找绑定客户渠道所在区域的客户渠道信息 
		'getKeeperArea' : '/tourapp/clientpeer/find', // 6.5 查找客户渠道列表 
		'getKeeperSell' : '/tourapp/clientpeer/selluser/find', // 6.6 查找销售员列表 
		'getKeeperCity' : '/tourapp/clientpeer/city/findall', // 6.7 查找所有客户渠道所属自然城市 
		'----' : '/tourapp/findallcyclepic', // 6.8 查找轮播图列表 
		'----' : '/tourapp/findbroadcast', // 6.9 查找广播列表 
		'----' : '/tourapp/findrecommendline', // 6.10 查找推荐的线路产品报价 
		'getLine' : '/tourapp/line/briefdetail', // 6.11 获取线路产品简略详情 
		'getLineCharacteristic' : '/tourapp/line/travelcharacteristic', // 6.12 获取产品特色/
		'getLineCost' : '/tourapp/line/fee', // 6.13 获取费用说明 
		'getLineShopping' : '/tourapp/line/ownexpenseitem', // 6.14 获取自费项目及购物店 
		'getLineDestine' : '/tourapp/line/bookingInfo', // 6.15 获取预定须知 
		'getLineCancellation' : '/tourapp/line/unsubscribeInfo', // 6.16 获取退订须知 
		'getLineVisa' : '/tourapp/line/visadesc', // 6.17 获取签证说明 
		'getLineNote' : '/tourapp/line/notes', // 6.18 获取注意事项 
		'----' : '/tourapp/lineDetail', // 6.19 获取线路产品详情 
		'getLineGroup' : '/tourapp/useableusedates', // 6.20 查找可用团期列表 
		'setCollect' : '/tourapp/member/favorites/add', // 6.21 收藏线路产品 
		'getLinePrice' : '/tourapp/line/prices', // 6.22 获取产品价格表 
		'getLinePriceByDay' : '/tourapp/line/price', // 6.23 查找某产品某天所有游客类型的价格表 
		'getInsurance' : '/tourapp/insurance/sellPrice/find', // 6.24 查找购买保险列表 
		'getPromotions' : '/tourapp/member/coupon/useable', // 6.25 查找可用优惠券 
		'getUserContacts' : '/tourapp/member/tourist/find', // 6.26 查找常用游客 
		'getTouristInfo' : '/tourapp/member/tourist/get', // 6.27 查看游客详细信息 
		'setTouristInfo' : '/tourapp/member/tourist/save', // 6.28 保存常用游客 
		'deleteTourist' : '/tourapp/member/tourist/delete', // 6.29 删除常用游客 
		'setBooking' : '/tourapp/member/line/reserve', // 6.30 预留空位 
		'addOrder' : '/tourapp/member/line/order', // 6.31 提交草稿 
		'----' : '--', // 6.32 提交支付信息 
		'getSort' : '/tourapp/line/list', // 6.33 查询线路产品报价 
		'getGoal' : '/tourapp/area/linedest/category', // 6.34 查找分类目的地 
		'getDestine' : '/tourapp/area/linedest/theme', // 6.35 查找目的地主题 
		'getDestineNearby' : '/tourapp/area/linedest/around', // 6.36 查找周边线路目的地 
		'----' : '/tourapp/member/brief', // 6.37 获取简单个人信息 
		'getUserInfo' : '/tourapp/member/detail', // 6.38 获取个人信息详情 
		'----' : '/tourapp/member/uploaduserimage', // 6.39 上传用户头像 
		'saveUserInfo' : '/tourapp/member/save', // 6.40 保存用户资料 
		'userOrder' : '/tourapp/member/order/list', // 6.41 查询“我的订单” 
		'getUserCoupon' : '/tourapp/member/coupon/list', // 6.42 查找“我的优惠券” 
		'getUserCollect' : '/tourapp/member/favorites/list', // 6.43 查找“我的收藏” 
		'changePassword' : '/tourapp/member/changepassword', // 6.44 修改密码 
		'quit' : '/tourapp/member/logout', // 6.45 退出登陆 
		'login' : '/tourapp/user/loginbypassword', // 6.46 登陆 
		'getPassword' : '/tourapp/user/getbackpassword', // 6.47 找回密码 
		'registandlogin' : '/tourapp/user/registandlogin', // 6.48 用户注册并登陆 
		'----' : '/tourapp/user/loginbyphoneverification', // 6.49 手机验证码动态登陆 
		'----' : '/tourapp/member/insurance/detail', // 6.50 获取保险详情 
		'getAdditional' : '/tourapp/member/serviceadditional/get', // 6.51 查找附加服务 
		'setKeeper' : '/tourapp/butler/set', // 6.52 绑定“我的管家” 
		'setOrderCancel' : '/tourapp/member/order/cancel', // 6.53 取消订单 
		'getOrderStroke' : '/tourapp/member/line/trip', // 6.54 查看行程 
		'getOrderNotice' : '/tourapp/member/line/groupnotice', // 6.55 查看出团通知 
		'getInit' : '/tourapp/init', // 6.56 查询初始化数据 
		'----' : '/tourapp/member/getcoupondiscount', // 6.57 获取优惠券的实际金额 
		'----' : '/tourapp/order/alipaycallback', // 6.58 支付宝回调接口(调用) 
		'getLineContract' : '/tourapp/member/contract', // 6.59 获取合同文本 
		'setPay' : '/tourapp/member/order/preparepay', // 6.60 设置订单待支付 
		'getOrderdetail' : '/tourapp/member/order/detail', // 6.61 获取订单详情 
		'getPhoneCode' : '/tourapp/user/getphoneverificationcode', // 6.62 获取手机验证码 
		'----' : '/tourapp/order/wechatcallback', // 6.63 微信回调接口
		'----' : '/tourapp/order/wechatcallback', //6.64 银联回调接口
		'getPayInfo' : '/tourapp/member/order/detail/pay', // 6.65 获取支付订单详情
	}



	var post = function(req,callback){
		// 检查网络
		if(window.plus && window.plus.networkinfo.getCurrentType() <= 1){
			plus.nativeUI.closeWaiting();
			mui && mui.toast('无网络，请查看网络链接');
			return;
		}


		// localStorage.setItem('token','');

		// 系统常量
		var token = localStorage.getItem('token') || '';
		var url = host + map[req.type] + '?SYSTEM_ORG_ID=100004&token=' + token;



		mui.ajax(url,{
			data:JSON.stringify(req),
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:20000,//超时时间设置为10秒；
			contentType : "application/json",
			success:function(data){

				console.log('ajax : '+req.type+' & url : '+ url);
				console.log('req : ' + JSON.stringify(req));
				console.log('res : ' + JSON.stringify(data));
				// console.log(data);
				
				// 如果有错误，则显示错误
				!data.ret && window.plus && window.plus.ui.toast(data.msg);
				
				// // 兼容android
				// !function(){
				// 	if(window.plus){
				// 		callback && callback(data);	
				// 		data = null;
				// 	}else{
				// 		setTimeout(arguments.callee,50);
				// 	}
				// }();

				callback && callback(data);	


			},
			error:function(xhr,type,errorThrown){
				//异常处理；
				console.log('error : '+req.type+' & url : '+ url);
				console.log('req : ' + JSON.stringify(req));
				console.log('res : '+ JSON.stringify(xhr),type,errorThrown);
				window.plus && window.plus.nativeUI.closeWaiting();
				window.plus && window.plus.ui.toast('请求超时，请重试');
			}
		});
	}


	return function(req,callback){

		if((typeof req == 'string') && req.constructor==String){
			req = {type:req}
		}

		callback = callback || function(){};
		post(req,callback);
	}

})();



