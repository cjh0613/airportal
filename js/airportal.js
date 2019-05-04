"use strict";
var appName="AirPortal";
var version="19w17b7";
var consoleGeneralStyle="font-family:Helvetica,sans-serif;";
var consoleInfoStyle=consoleGeneralStyle+"color:rgb(65,145,245);";
console.info("%c%s 由 毛若昕 和 杨尚臻 联合开发。",consoleInfoStyle,appName);
console.info("%c版本：%s",consoleInfoStyle,version);

var currentExpTime,fileBackend;
var $_GET=(function(){
	var json={};
	if(location.search){
		var parameters=location.search.replace("?","").split("&");
		for(var i=0;i<parameters.length;i++){
			var split=parameters[i].split("=");
			json[split[0]]=split[1];
		}
	}
	return json;
})();
var backend="https://api.rthe.cn/backend/";
var firstRun=JSON.parse(localStorage.getItem("firstRun"));
var invalidAttempt=0;
var isiOS=/iPhone|iPad/i.test(navigator.userAgent);
var login={
	"email":localStorage.getItem("Email"),
	"token":localStorage.getItem("Token"),
	"username":localStorage.getItem("Username")
};
var orderSubmitted=localStorage.getItem("orderSubmitted");
var title=document.title;
var settings={};
if(!firstRun||firstRun[version]==undefined){
	firstRun={};
}
if(firstRun[version]!=false){
	firstRun[version]=false;
	localStorage.setItem("firstRun",JSON.stringify(firstRun));
	firstRun=true;
}
function btnPay0State(){
	if(document.getElementsByClassName("selected").length==2){
		btnPay0.style.pointerEvents="auto";
		btnPay0.style.opacity="1";
	}else{
		btnPay0.style.pointerEvents="none";
		btnPay0.style.opacity="0.5";
	}
}
function encodeData(data){
	var array=[];
	for(var key in data){
		if(data[key]){
			array.push(key+"="+encodeURIComponent(data[key]));
		}
	}
	return array.join("&");
}
function error(e){
	notify(multilang({
		"en-US":"Unable to connect to the server: ",
		"zh-CN":"无法连接至服务器：",
		"zh-TW":"無法連接至伺服器："
	})+e.status);
}
function getPostData(data){
	var formData=new FormData();
	for(var key in data){
		if(data[key]){
			formData.append(key,data[key]);
		}
	}
	return{
		"method":"POST",
		"body":formData
	};
}
function getQRCode(content){
	return backend+"get?"+encodeData({
		"url":"http://qr.topscan.com/api.php?text="+content,
		"username":"admin"
	});
}
function getRandomCharacter(length){
	var str="";
	for(var i=0;i<length;i++){
		str+=unescape("%u"+(Math.round(Math.random()*20901)+19968).toString(16));
	}
	return str;
}
function id(elementId){
	return document.getElementById(elementId);
}
function loadExpTime(){
	if(orderSubmitted&&new Date().getTime()-orderSubmitted>86400000){
		orderSubmitted=null;
		localStorage.removeItem("orderSubmitted");
	}
	if(document.getElementById("privilegeStatus")){
		fetch(backend+"get?"+encodeData({
			"name":appName,
			"token":login.token,
			"url":"privilege",
			"username":login.username
		})).then(function(response){
			if(response.ok){
				return response.text();
			}
		}).then(function(data){
			var expTime=Math.round((data-new Date().getTime()/1000)/86400);
			if(data&&expTime>0){
				if(orderSubmitted){
					orderSubmitted=null;
					localStorage.removeItem("orderSubmitted");
				}
				currentExpTime=data*1;
				privilegeStatus.innerText=multilang({
					"en-US":"Premium Plan "+expTime+" Days Remaining",
					"zh-CN":"高级账号 剩余"+expTime+"天",
					"zh-TW":"高級賬號 剩餘"+expTime+"天"
				});
			}else{
				if(orderSubmitted){
					privilegeStatus.innerText=multilang({
						"en-US":"Waiting for order confirmation",
						"zh-CN":"等待订单确认 最长需要24个小时",
						"zh-TW":"等待訂單確認 最長需要24個小時"
					});
				}else{
					privilegeStatus.innerText=multilang({
						"en-US":"Premium Plan Not Activated",
						"zh-CN":"高级账号 未激活",
						"zh-TW":"高級賬號 未激活"
					});
				}
			}
		});
	}
}
function loadServerList(auto){
	fileBackend=window.servers[auto].host;
	Object.keys(window.servers).forEach(function(key){
		var newA=document.createElement("a");
		var newTick=document.createElement("span");
		var newName=document.createElement("span");
		newA.classList.add("menuItem");
		newA.id=key;
		newA.onclick=function(){
			if(!currentExpTime&&window.servers[this.id].premium){
				notify(multilang({
					"en-US":"This server is for premium account users only.",
					"zh-CN":"此服务器仅限高级账号用户使用。",
					"zh-TW":"此伺服器僅限高級賬號用戶使用。"
				}));
				if(!login.username){
					menuItemLogin.click();
				}
			}else{
				fileBackend=window.servers[this.id].host;
				var tick=document.getElementsByClassName("tick");
				for(var i=0;i<tick.length;i++){
					if(tick[i].parentElement==this){
						tick[i].style.opacity="1";
					}else{
						tick[i].style.opacity="0";
					}
				}
			}
			hideMenu();
		};
		newTick.classList.add("tick");
		if(key==auto){
			newTick.style.opacity="1";
		}
		newName.innerText=window.servers[key].name;
		newA.appendChild(newTick);
		newA.appendChild(newName);
		menuServers.appendChild(newA);
	});
}
function loggedIn(newLogin){
	if(newLogin){
		localStorage.setItem("Email",login.email);
		localStorage.setItem("Token",login.token);
		localStorage.setItem("Username",login.username);
		closePopup("popLogin");
		if(id("filesTip")){
			id("filesTip").innerText=login.email;
		}
	}
	menuItemLogin.innerText=multilang({
		"en-US":"Log Out",
		"zh-CN":"退出登录",
		"zh-TW":"登出"
	});
	var newItem=document.createElement("a");
	newItem.classList.add("menuItem");
	newItem.onclick=function(){
		showPopup([
			'<span class="btnClose" id="btnClose0"></span>',
			'<p class="p1" id="lblUsername"></p>',
				'<span class="line"></span>',
			'<p class="p3" id="lblExpTime"></p>',
			'<div class="payPlans">',
				'<p class="p2">',
					'<span id="activatePremium"></span>',
					'<a class="link1" id="showPrivilege"></a>',
				'</p>',
				'<p class="p4">',
					'<span id="plans"></span>',
					'<span id="promotionText"></span>',
				'</p>',
				'<span class="payItem plan" id="payItem1M">',
					'<span id="price-one"></span>',
					'<p id="month1" class="p4"></p>',
				'</span>',
				'<span class="payItem plan" id="payItem3M">',
					'<span id="price-three"></span>',
					'<p id="month3" class="p4"></p>',
				'</span>',
				'<span class="payItem plan" id="payItem1Y">',
					'<span id="price-twelve"></span>',
					'<p id="month12" class="p4"></p>',
				'</span>',
				'<p id="paymentMethod" class="p4" style="margin-top: 0px;"></p>',
				'<span class="payItem method" id="payItemAli">',
					'<p id="alipay" class="p5"></p>',
				'</span>',
				'<span class="payItem method" id="payItemWechat">',
					'<p id="wechatPay" class="p5"></p>',
				'</span>',
				'<span class="payItem method" id="payItemPaypal">',
					'<p id="paypal" class="p5">PayPal</p>',
				'</span>',
			'</div>',
			'<button class="btn1" id="btnPay0"></button>'
		],"accBox0","popAccount");
		id("btnClose0").onclick=function(){
			closePopup("popAccount");
		};
		id("lblUsername").innerText=login.email;
		id("lblExpTime").innerText=privilegeStatus.innerText;
		id("activatePremium").innerText=multilang({
			"en-US":"Activate/Renew Premium Plan",
			"zh-CN":"激活 / 续期高级账号",
			"zh-TW":"啟用 / 續期高級賬號"
		});
		id("showPrivilege").innerText=multilang({
			"en-US":"Why?",
			"zh-CN":"高级账号有哪些特权？",
			"zh-TW":"高級賬號有哪些特權？"
		});
		id("showPrivilege").onclick=function(){
			showPopup([
				'<span class="btnBack" id="btnBack3"></span>',
				'<p id="titlePrivileges" class="p1"></p>',
				'<span class="line"></span>',
				'<p id="txtPrivileges" class="p3" style="margin-top: 100px;"></p>'
			],"accBox_1","popAccount","slideInFromLeft");
			id("btnBack3").onclick=function(){
				closePopup("accBox_1","slideOut");
			}
			id("titlePrivileges").innerText=multilang({
				"en-US":"Privileges of Premium Plan",
				"zh-CN":"高级账号特权",
				"zh-TW":"高級賬號特權"
			});
			id("txtPrivileges").innerText=window.info.privileges;
		};
		id("promotionText").innerText=window.info.promotion;
		id("plans").innerHTML=multilang({
			"en-US":"Plans",
			"zh-CN":"支付方案",
			"zh-TW":"支付方案"
		});
		id("month1").innerText=multilang({
			"en-US":"1 Month",
			"zh-CN":"一个月",
			"zh-TW":"一個月"
		});
		id("month3").innerText=multilang({
			"en-US":"3 Months",
			"zh-CN":"三个月",
			"zh-TW":"三個月"
		});
		id("month12").innerText=multilang({
			"en-US":"1 Year",
			"zh-CN":"一年",
			"zh-TW":"一年"
		});
		id("payItem1M").onclick=
		id("payItem3M").onclick=
		id("payItem1Y").onclick=function(){
			payItemClick(this,"plan");
		};
		id("paymentMethod").innerText=multilang({
			"en-US":"Payment Method",
			"zh-CN":"支付方式",
			"zh-TW":"支付方式"
		});
		id("alipay").innerText=multilang({
			"en-US":"AliPay",
			"zh-CN":"支付宝",
			"zh-TW":"支付寶"
		});
		id("wechatPay").innerText=multilang({
			"en-US":"WeChat",
			"zh-CN":"微信支付",
			"zh-TW":"微信支付"
		});
		id("btnPay0").innerText=multilang({
			"en-US":"Pay",
			"zh-CN":"确认支付",
			"zh-TW":"確認支付"
		});
		id("payItemAli").onclick=
		id("payItemWechat").onclick=
		id("payItemPaypal").onclick=function(){
			payItemClick(this,"method");
		};
		Object.keys(window.info.price).forEach(function(key){
			id("price-"+key).innerHTML="";
			var newP=document.createElement("p");
			newP.classList.add("p2");
			window.info.price[key]["actualPrice"]=window.info.currency+window.info.price[key]["specialPrice"];
			if(window.info.price[key]["specialPrice"]!=window.info.price[key]["price"]){
				var newSpan=document.createElement("span");
				newSpan.classList.add("pDel");
				newP.innerText=window.info.currency+window.info.price[key]["specialPrice"];
				newSpan.innerText=window.info.currency+window.info.price[key]["price"];
				newP.appendChild(newSpan);
			}else{
				newP.innerText=window.info.currency+window.info.price[key]["price"];
			}
			id("price-"+key).appendChild(newP);
		});
		var pubPayPlan="N/A";
		var pubPayMethod="N/A";
		id("btnPay0").onclick=function(){
			showPopup([
				'<p class="p3" id="lblPayTip">您正在为此用户激活 / 续期高级账号</p>',
				'<div id="payQRC"></div>',
				'<span class="btnBack" id="btnBack2"></span>',
				'<button class="btn1" id="btnPay1"></button>'
			],"accBox1","popAccount","slideInFromRight");
			id("btnBack2").onclick=function(){
				closePopup("accBox1","slideOut");
			}
			id("btnPay1").innerText=multilang({
				"en-US":"I Have Paid",
				"zh-CN":"我已支付",
				"zh-TW":"我已支付"
			});
			var payPlan=document.getElementsByClassName("payItem plan selected").item(0).lastElementChild;
			var payMethod=document.getElementsByClassName("payItem method selected").item(0).lastElementChild;
			var actualPrice;
			var idPayPlan=payPlan.id;
			var idPayMethod=payMethod.id;
			pubPayPlan=payPlan.innerText;
			pubPayMethod=payMethod.innerText;
			id("payQRC").innerHTML="";
			var qrcode=new Image(200,200);
			switch(idPayMethod){
				case "alipay":
				switch(idPayPlan){
					case "month1":
					qrcode.src=getQRCode(window.info.price.one.alipay);
					actualPrice=window.info.price.one.actualPrice;
					break;
					case "month3":
					qrcode.src=getQRCode(window.info.price.three.alipay);
					actualPrice=window.info.price.three.actualPrice;
					break;
					case "month12":
					qrcode.src=getQRCode(window.info.price.twelve.alipay);
					actualPrice=window.info.price.twelve.actualPrice;
					break;
				}
				break;
				case "wechatPay":
				switch(idPayPlan){
					case "month1":
					qrcode.src=getQRCode(window.info.price.one.wechatpay);
					actualPrice=window.info.price.one.actualPrice;
					break;
					case "month3":
					qrcode.src=getQRCode(window.info.price.three.wechatpay);
					actualPrice=window.info.price.three.actualPrice;
					break;
					case "month12":
					qrcode.src=getQRCode(window.info.price.twelve.wechatpay);
					actualPrice=window.info.price.twelve.actualPrice;
					break;
				}
				break;
				case "paypal":
				switch(idPayPlan){
					case "month1":
					qrcode.src=getQRCode(window.info.price.one.paypal);
					actualPrice=window.info.price.one.actualPrice;
					break;
					case "month3":
					qrcode.src=getQRCode(window.info.price.three.paypal);
					actualPrice=window.info.price.three.actualPrice;
					break;
					case "month12":
					qrcode.src=getQRCode(window.info.price.twelve.paypal);
					actualPrice=window.info.price.twelve.actualPrice;
					break;
				}
				break;
			}
			id("payQRC").appendChild(qrcode);
			lblPayTip.innerText=multilang({
				"en-US":"Activate/Renew "+pubPayPlan+" of Premium Plan ("+actualPrice+")\nfor "+login.email+" with "+pubPayMethod,
				"zh-CN":"使用 "+pubPayMethod+" 为 "+login.email+"\n激活 / 续期"+pubPayPlan+"的高级账号（"+actualPrice+"）",
				"zh-TW":"使用 "+pubPayMethod+" 為 "+login.email+"\n啟用 / 續期"+pubPayPlan+"的高級賬號（"+actualPrice+"）"
			});
			accBox0.style.left="-500px";
			accBox1.style.left="0px";
			var payState="success";
			id("btnPay1").onclick=function(){
				showPopup([
					'<p class="p1" id="lblPayState0" style="margin-top: 50px;"></p>',
					'<p class="p3" id="lblPayState1" style="margin-top: 50px;"></p>',
					'<button class="btn1" id="btnDone3"></button>'
				],"accBox2","popAccount","slideInFromRight");
				id("lblPayState0").innerText=multilang({
					"en-US":"Submitting",
					"zh-CN":"提交中",
					"zh-TW":"提交中"
				});
				id("lblPayState1").innerText=multilang({
					"en-US":"We are processing your payment order\nPlease wait\nIf you need help, please contact us.",
					"zh-CN":"我们正在处理您的支付订单\n请稍候\n如需帮助，请与我们联系。",
					"zh-TW":"我們正在處理您的支付訂單\n請稍候\n如需幫助，請與我們聯繫。"
				});
				id("btnDone3").innerText=multilang({
					"en-US":"Close",
					"zh-CN":"关闭",
					"zh-TW":"關閉"
				});
				id("btnDone3").onclick=function(){
					if(payState=="success"){
						closePopup("popAccount");
					}else{
						id("btnPay1").onclick();
					}
				}
				var action="续期";
				if(!currentExpTime){
					action="激活";
				}
				fetch(backend+"feedback",getPostData({
					"appname":appName,
					"email":login.email,
					"lang":navigator.language,
					"name":login.username,
					"text":"通过 "+pubPayMethod+" "+action+" "+pubPayPlan+" 的高级账号",
					"ver":version
				})).then(function(response){
					if(response.ok){
						payState="success";
						id("btnDone3").innerText=multilang({
							"en-US":"Close",
							"zh-CN":"关闭",
							"zh-TW":"關閉"
						});
						id("lblPayState0").innerText=multilang({
							"en-US":"Submitted Successfully",
							"zh-CN":"提交成功",
							"zh-TW":"提交成功"
						});
						id("lblPayState1").innerText=multilang({
							"en-US":"We are processing your order.\nThe number of days remaining will be automatically updated within 24 hours;\nif not, please contact us after making sure you have paid.",
							"zh-CN":"我们正在处理您的支付订单。\n您的高级账号剩余天数会在24小时内自动更新；\n如果24小时后仍没有更新，请在确保您已支付后与我们联系。",
							"zh-TW":"我們正在處理您的支付訂單。\n您的高級賬號剩餘天數會在24小時內自動更新；\n如果24小時后仍沒有更新，請在確保您已支付后與我們聯繫。"
						});
						id("btnDone3").style.pointerEvents="auto";
						id("btnDone3").style.opacity="1";
						orderSubmitted=new Date().getTime();
						localStorage.setItem("orderSubmitted",orderSubmitted);
						loadExpTime();
					}else{
						payState="error";
						id("btnDone3").innerText=multilang({
							"en-US":"Try Again",
							"zh-CN":"重试",
							"zh-TW":"重試"
						});
						id("lblPayState0").innerText=multilang({
							"en-US":"Oops... something went wrong",
							"zh-CN":"Oops... 出错了",
							"zh-TW":"Oops... 出錯了"
						});
						if(response.status==504){
							id("lblPayState1").innerText=multilang({
								"en-US":"The server was unable to respond in time.",
								"zh-CN":"服务器无法及时响应。",
								"zh-TW":"伺服器無法及時響應。"
							});
						}else{
							id("lblPayState1").innerText=multilang({
								"en-US":"Unable to connect to the server.",
								"zh-CN":"无法连接至服务器。",
								"zh-TW":"無法連接至伺服器。"
							});
						}
						id("lblPayState1").innerText+=multilang({
							"en-US":"\nPlease try again (no need to pay again)\nIf you need more help, please contact us.",
							"zh-CN":"\n请重试（无需再次扫码付款）\n如需更多帮助，请与我们联系。",
							"zh-TW":"\n請重試（無需再次掃碼付款）\n如需更多幫助，請與我們聯繫。"
						});
						id("btnDone3").style.pointerEvents="auto";
						id("btnDone3").style.opacity="1";
					}
				});
			};
		};
		hideMenu();
	};
	newItem.style.fontSize="small";
	newItem.innerText=login.email;
	menu.insertBefore(newItem,menu.firstChild);
	var newP=document.createElement("p");
	newP.id="privilegeStatus";
	newItem.appendChild(newP);
	if(!newLogin){
		fetch(backend+"userdata/verify?"+encodeData({
			"token":login.token,
			"username":login.username
		})).then(function(response){
			if(response.ok){
				return response.json();
			}
		}).then(function(data){
			if(data&&!data.token){
				rmAccountInfo();
			}
		});
	}
	loadExpTime();
	fetch(backend+"userdata/set?"+encodeData({
		"appname":appName,
		"key":"loginRequired",
		"token":login.token,
		"username":login.username
	})).then(function(response){
		if(response.ok){
			return response.text();
		}
	}).then(function(data){
		if(data=="1"){
			settings["loginRequired"]=true;
		}
	});
}
function multilang(json){
	if(chs){
		return json["zh-CN"];
	}else if(zh){
		return json["zh-TW"];
	}else{
		return json["en-US"];
	}
}
function payItemClick(element,className){
	if(element.classList.contains("selected")){
		element.classList.remove("selected");
	}else{
		var elements=document.getElementsByClassName(className);
		for(var i=0;i<elements.length;i++){
			if(elements[i]==element){
				element.classList.add("selected");
			}else{
				elements[i].classList.remove("selected");
			}
		}
	}
	btnPay0State();
}
function rmAccountInfo(){
	localStorage.clear();
	location.reload();
}
menuIcon.onclick=function(){
	menu.style.display="block";
	setTimeout(function(){
		menu.style.opacity="1";
	},10);
	mask.style.display="block";
	menuItemSelectServer.style.position="";
	menuItemSelectServer.style.marginLeft="0";
	menuServers.style.display="none";
	menuServers.style.marginLeft="200%";
};
function hideMenu(){
	mask.style.display="none";
	menu.style.opacity="0";
	setTimeout(function(){
		menu.style.display="none";
	},250);
}
mask.onclick=hideMenu;
menuItemSelectServer.onclick=function(){
	this.style.position="absolute";
	this.style.marginLeft="-100%";
	menuServers.style.display="";
	menuServers.style.marginLeft="0px";
};
addEventListener("message",function(e){
	try{
		login=JSON.parse(atob(e.data));
		if(login.username===null){
			rmAccountInfo();
		}else{
			loggedIn(true);
		}
	}catch(e){}
});
if(login.username){
	loggedIn();
}
