

// 首页加禁用返回
mui.init({swipeBack: false});


!function(u){
	// 如果是android，重写滚动
	if(u.indexOf('Android') > -1 || u.indexOf('Adr') > -1){
		IScroll = function (){this.refresh = function(){}}
	}
}(navigator.userAgent);



// 首页滚动
var scroll_home = new IScroll('#home .scroll',{mouseWheel: false,scrollbars: false});


// 分类滚动
var scroll_sort = new IScroll('#sort .scroll',{mouseWheel: false,scrollbars: false});	


// 目的地滚动
var scroll_goal_side = new IScroll('.destine_side',{mouseWheel: false,scrollbars: false});	
var scroll_goal_main = new IScroll('.destine_main',{mouseWheel: false,scrollbars: false});	


// 我的滚动
var scroll_user = new IScroll('#user',{mouseWheel: false,scrollbars: false});	



// 初始化数据
var init = 	function(){
	service({
		"type" : "getInit",
		"startingName" : localStorage.getItem('user_city'),
	    "bannerParam":{
	        "start":0,
	        "limit":10
	    },
	    "broadcastParam":{
	        "start":0,
	        "limit":10
	    },
	    "recommendedLineParam":{
	        "lineCategoryId":"",
	        "start":0,
	        "limit":10
	    },
	    "lineDestCategoryParam":{
	        "start":0,
	        "limit":10
	    }
	},function(json){


		if(json.ret){

			// 判断是否有头像
			if(json.data.mySimpeProfile && !json.data.mySimpeProfile.imageUrl){
				json.data.mySimpeProfile.imageUrl = '../images/user_pic.png';
			}

			if(json.data.myButler && !json.data.myButler.imageUrl){
				json.data.myButler.imageUrl = '../images/user_pic.png';
			}
			
		}else{

			// 如果有错，则再次刷新
			plus.ui.toast(json.msg);
			localStorage.setItem('token','');
			setTimeout(function(){location.reload();},100);
			return ;

		}




		// 通过判断token来判断是否登陆
		!function(token){

			if(token){ return;}
			document.body.classList.add('unlogin');

			var password = document.querySelector('.js-password');
			var quit = document.querySelector('.js-addlogin');
			var quit_link = quit.querySelector('a');

			// 找回密码
			password.querySelector('strong').innerHTML = '忘记密码';
			password.querySelector('a').setAttribute('href','password.html');

			quit.querySelector('strong').innerHTML = '登录账号';
			quit.classList.add('link');
			quit_link.setAttribute('href','login.html');
			quit_link.setAttribute('viewId','login');
			quit_link.setAttribute('class','');

		}(localStorage.getItem('token'));



		// 判断是否有管家
		!function(butler){

			butler = JSON.parse(butler || '{}');

			// 如果返回管家，则不赋值
			if(json.data.myButler){

				json.data.myButler.countryName = butler.countryName ||  '中国';
				json.data.myButler.cityName = butler.cityName || '深圳';
				butler = json.data.myButler;
				localStorage.setItem('user_keeper',JSON.stringify(butler));

			}else if(butler.cityName){
				json.data.myButler = butler;
			}else{

				// 触发选择管家
				document.getElementById('addkeeper').style.display = 'block';
				localStorage.setItem('user_keeper','');	
				json.data.myButler = {clientPeerName:'',sellUserName:''}		
			}
		}(localStorage.getItem('user_keeper'));




		// 替换出发城市
		window.tplExchange(document.getElementById('home_header'),{startCity:localStorage.getItem('user_city')|| '深圳'});


		// 替换幻灯片模板
		window.tplExchange(document.getElementById('banner'),json.data.bannerList,!json.ret);

		// 替换热点模板
		window.tplExchange(document.getElementById('sort_notice'),json.data.broadcastList,!json.ret);

		// 替换推荐线路模板
		window.tplExchange(document.getElementById('home_recom1'),json.data.recommendedLineList,!json.ret);

		// 替换分类目的地模板
		window.tplExchange(document.getElementById('destine_side'),json.data.lineDestCategoryList,!json.ret);
		window.tplExchange(document.getElementById('destine_main'),json.data.lineDestCategoryList,!json.ret);


		// 替换用户中心模板
		window.tplExchange(document.getElementById('user_tpl'),json.data.mySimpeProfile,!json.ret);	


		// 替换我的管家模板 未登陆须有默认值
		window.tplExchange(document.getElementById('keeper'),json.data.myButler,!json.ret);
		window.tplExchange(document.getElementById('user_keeper'),json.data.myButler,!json.ret);



		// 幻灯片
		!function(){

			var box = document.querySelector('.home_banner');
			if(!box){return;}

			// 元素
			var item = Array.prototype.slice.call(box.querySelectorAll('.swipe-wrap div'),0);

			// 根据item个数增加显示的点
			var cite = document.createElement('cite');
				cite.innerHTML = item.map(function(){return '<span></span>'}).join('');
				box.appendChild(cite);


			// 显示块
			var span = Array.prototype.slice.call(box.querySelectorAll('cite span'),0);

			// pure JS
			var elem = document.getElementById('mySwipe');
			window.mySwipe = Swipe(elem, {
				startSlide: 1,
				auto: 3000,
				continuous: true,
				callback: function(index, element) {
				 	span.map(function(item,idx){
						if(idx == index){
							item.classList.add('active');
						}else{
							item.classList.remove('active');
						}
					});
				},
			});
		}();


		// 热点滚动
		!function(){

			var parent = document.querySelector('.home_sort h6 span');
			var item = parent.querySelectorAll('a');
			var index = 0;

			parent.style.WebkitTransition = 'all .2s ease ';
			// 把第一个复制一份到末尾
			item[0] && parent.appendChild(item[0].cloneNode(true));

			// 循环
			setInterval(function(){

				parent.style.top = -index * 32 + 'px';
				index += 1;
				if(index > item.length){
					
					index = 1;					
					setTimeout(function(){	
						parent.style.WebkitTransition = 'initial';
						parent.style.top = '0px';
						setTimeout(function(){parent.style.WebkitTransition = 'all .2s ease ';},10);
					},5000);
				}
			},5000);
		}();


		// 目的地分类点击
		var destine_def = document.querySelector('.destine_side cite a')
		destine_def && mui.trigger(destine_def,'tap');

		// 刷新滚动条
		scroll_home.refresh();
		scroll_sort.refresh();
		scroll_goal_side.refresh();
		scroll_goal_main.refresh();
		scroll_user.refresh();
		

		// 关闭正在加载
		document.querySelector('.loading').classList.add('end');

		// 保存用户信息
		localStorage.setItem('line_user',JSON.stringify(json.data.mySimpeProfile));
	});
}



// 打开全屏页面
window.addEventListener('openFull',function(event){
	
	var detail = event.detail;
	var id = detail.viewId || ('id'+ (new Date()).getTime());
	var webview = plus.webview.create(encodeURI(detail.href), id, {top: 0,bottom: 0,bounce: 'none',popGesture:'close'});

	plus.webview.show(id,'pop-in',300);
	plus.nativeUI.closeWaiting();
});



// 更改绑定的管家
window.addEventListener('selectKeeper',function(event){

	var data = event.detail;

	// 替换我的管家模板 未登陆须有默认值
	window.tplExchange(document.getElementById('keeper'),data);
	window.tplExchange(document.getElementById('user_keeper'),data);
	document.getElementById('addkeeper').style.display = 'none';
});


// 更改出发城市
window.addEventListener('selectCity',function(event){init();});





// 首页轮播跳转
mui('body').on('tap','.home_banner a',function(){
	if(this.getAttribute('type') != 2){return false}
});




// 目的地左侧标签切换
mui('body').on('tap','.destine_side cite a',function(){

	var acti = this.parentNode.querySelector('a.active');
	if(acti == this){return false;}

	acti && acti.classList.remove('active');
	this.classList.add('active');

	var id = this.getAttribute('for');
	var item = document.getElementById(id);
	var acti2 = item.parentNode.querySelector('section.active');
	var tpl = '<dt><i class="icon icon-xingzhuang132"></i>{{name}}</dt><dd><a href="header.html?title={{name}}&url=destine_list&id={{id}}" subdata="{{destList}}">{{name}}</a></dd>';

	if(!item.querySelector('dd')){
		var req = {
			"type" : "getDestine",
			"lineDestCategoryId" : id
		}

		if(id == 2){
			req.type = 'getDestineNearby';
			// req.areaId = '2224';
			req.countryName = '中国';
			req.cityName = localStorage.getItem('user_city') || '深圳';
		}

		service(req,function(json){
			item.innerHTML = window.tplEngine(json.data,tpl);
			item.classList.add('active');
			acti2 && acti2.classList.remove('active');
			scroll_goal_main.refresh();
		});
	}else{
		acti2 && acti2.classList.remove('active');
		item.classList.add('active');
		scroll_goal_main.refresh();
	}

	return false;
});



// 底部导航点击事件
mui('footer').on('tap', 'a', function(e) {

	var acti = document.querySelector('footer .active');
	var keeper_class = document.getElementById('keeper').classList;

	if(acti == this){return false;}


	// 打开我的管家
	if(this.getAttribute('for') == 'call'){
		
		if(keeper_class.contains('active')){
			keeper_class.remove('active');
		}else{

			// 判断是否有管家
			if(localStorage.getItem('user_keeper')){
				keeper_class.add('active');
			}else{
				document.getElementById('addkeeper').style.display = 'block';
			}
		}

		return false;
	}
	
	keeper_class.remove('active');

	acti.classList.remove('active');
	this.classList.add('active');

	document.querySelector('.tab_box.active').classList.remove('active');
	document.getElementById(this.getAttribute('for')).classList.add('active');

	return false;
});



// 打电话
mui('body').on('tap','.call_link a.btn',function(){

	var number = this.getAttribute('href');

	plus.ui.confirm("确定拨打电话吗？", function(i) {
		i.index == 0 && plus.device.dial(number, false);
	}, "电话", ["确认", "取消"]);
	
	return false;
});



// 关闭绑定管家
mui('body').on('tap','#addkeeper a.close',function(){
	this.closest('#addkeeper').style.display = 'none';
	return false;
});





// 未登陆拉截
mui('body').on('tap','.needlogin a',function(){
	if(document.body.classList.contains('unlogin')){

		var event = document.createEvent('Event');
		event.initEvent('openFull', true, true);
		event.detail = {href:'login.html',viewId:'login'};   
		window.dispatchEvent(event);

		plus.ui.toast('请先登陆');

		return false;
	}
});




// 退出系统
mui('body').on('tap','a.js-quit',function(){

	plus.ui.confirm("确定退出登陆吗？", function(i) {
		if(i.index != 0){return}
		var event = document.createEvent('Event');
		event.initEvent('openFull', true, true);
		event.detail = {href:'login.html',viewId:'login'};   
		window.dispatchEvent(event);

		localStorage.setItem('token','');

		service('quit',function(){
			// 刷新
			plus.webview.getLaunchWebview().reload();	
		});

	}, "退出系统", ["确认", "取消"]);
	
	return false;
});


// 如果有导航，则按导航的展开相应页面
!function(nav){
	var acti = null;
	if(!nav){return}

	Array.prototype.slice.call(document.querySelectorAll('footer a')).map(function(i){
		if(i.getAttribute('for') == nav){acti = i;}
	});
	acti && mui.trigger(acti,'tap');
	localStorage.setItem('navigation','');

}(localStorage.getItem('navigation'));




mui.plusReady(function(){
	// 竖屏
	plus.screen.lockOrientation("portrait-primary");
	// 隐藏logo页
	plus.navigator.closeSplashscreen();



	// 出发城市
	// 若未绑定客户渠道，则所在城市为当用户前定位区域，所有客户渠道收缩。
	// 取定位
	if(localStorage.getItem('user_city')){
		init();
	}else{
		plus.geolocation.getCurrentPosition(function(p) {
			localStorage.setItem('user_city',p.address ? p.address.city : '深圳');
			init();
		});
	}

});







