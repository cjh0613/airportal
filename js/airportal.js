"use strict";
var appName="AirPortal";
var version="19w15c1";
var consoleGeneralStyle="font-family:Helvetica,sans-serif;";
var consoleInfoStyle=consoleGeneralStyle+"color:rgb(65,145,245);";
console.info("%c%s 由 毛若昕 和 杨尚臻 联合开发。",consoleInfoStyle,appName);
console.info("%c版本：%s",consoleInfoStyle,version);

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
var backend,currentExpTime,fileBackend;
var firstRun=JSON.parse(localStorage.getItem("firstRun"));
var invalidAttempt=0;
var login={
	"email":localStorage.getItem("Email"),
	"token":localStorage.getItem("Token"),
	"username":localStorage.getItem("Username")
};
var orderSubmitted=localStorage.getItem("orderSubmitted");
var title=document.title;
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
	return "https://server-auto.rthe.cn/backend/get?"+encodeData({
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
				privilegeStatus.innerText=lblExpTime.innerText=multilang({
					"en-US":"Premium Plan "+expTime+" Days Remaining",
					"zh-CN":"高级账号 剩余"+expTime+"天",
					"zh-TW":"高級賬號 剩餘"+expTime+"天"
				});
			}else{
				if(orderSubmitted){
					privilegeStatus.innerText=lblExpTime.innerText=multilang({
						"en-US":"Waiting for order confirmation",
						"zh-CN":"等待订单确认 最长需要24个小时",
						"zh-TW":"等待訂單確認 最長需要24個小時"
					});
				}else{
					privilegeStatus.innerText=lblExpTime.innerText=multilang({
						"en-US":"Premium Plan Not Activated",
						"zh-CN":"高级账号 未激活",
						"zh-TW":"高級賬號 未激活"
					});
				}
			}
		});
	}
}
function loadHistory(){
	historyList.innerHTML="";
	fetch(backend+"airportal/get?"+encodeData({
		"token":login.token,
		"username":login.username
	})).then(function(response){
		if(response.ok){
			return response.json();
		}
	}).then(function(data){
		if(data){
			if(data.length>0){
				lblEmpty.style.display="none";
				historyList.style.marginTop="-10px";
				for(var i=data.length-1;i>=0;i--){
					var newHistory=document.createElement("span");
					var newSpan=document.createElement("span");
					var newP=document.createElement("p");
					var newDelBtn=document.createElement("span");
					newHistory.classList.add("historyItem");
					newHistory.setAttribute("code",data[i].code);
					newSpan.innerText=data[i].code;
					newSpan.title=multilang({
						"en-US":"Download",
						"zh-CN":"下载",
						"zh-TW":"下載"
					});
					newSpan.onclick=function(){
						open("https://rthe.cn/"+this.parentElement.getAttribute("code"));
					}
					newP.innerText=decodeURIComponent(data[i].name);
					newDelBtn.classList.add("btnDel");
					newDelBtn.title=multilang({
						"en-US":"Delete",
						"zh-CN":"删除",
						"zh-TW":"刪除"
					});
					newDelBtn.onclick=function(){
						var code=this.parentElement.getAttribute("code");
						var filename=this.parentElement.getElementsByTagName("p")[0].innerText;
						if(confirm(multilang({
							"en-US":"Are you sure that you want to delete "+filename+" from the server?",
							"zh-CN":"确定要删除存储在服务器上的 "+filename+" 吗？",
							"zh-TW":"確定要刪除存儲在伺服器上的 "+filename+" 嗎？"
						}))){
							fetch(backend+"airportal/del",getPostData({
								"code":code,
								"username":login.username
							})).then(function(response){
								if(response.ok){
									notify(multilang({
										"en-US":"Deleted successfully.",
										"zh-CN":"删除成功。",
										"zh-TW":"刪除成功。"
									}));
									loadHistory();
								}else{
									error(response);
								}
							});
						}
					}
					newHistory.appendChild(newSpan);
					newHistory.appendChild(newP);
					newHistory.appendChild(newDelBtn);
					historyList.appendChild(newHistory);
				}
			}else{
				lblEmpty.style.display=historyList.style.marginTop="";
			}
		}
	});
}
function loadPrice(priceInfo){
	window.priceInfo=priceInfo;
	Object.keys(priceInfo).forEach(function(key){
		var newP=document.createElement("p");
		var priceSymbol="¥";
		newP.classList.add("p2");
		if(navigator.language.toLowerCase()=="en-us"){
			priceSymbol="$";
			priceInfo[key]["specialPrice"]=Math.round(priceInfo[key]["specialPrice"]*.15);
			priceInfo[key]["price"]=Math.round(priceInfo[key]["price"]*.15);
		}else if(navigator.language.toLowerCase()=="zh-tw"){
			priceSymbol="NT$";
			priceInfo[key]["specialPrice"]=Math.round(priceInfo[key]["specialPrice"]*4.6/10)*10;
			priceInfo[key]["price"]=Math.round(priceInfo[key]["price"]*4.6/10)*10;
		}
		priceInfo[key]["actualPrice"]=priceSymbol+priceInfo[key]["specialPrice"];
		if(priceInfo[key]["discount"]===true||priceInfo[key]["discount"]<1){
			var newSpan=document.createElement("span");
			newSpan.classList.add("pDel");
			newP.innerText=priceSymbol+priceInfo[key]["specialPrice"];
			newSpan.innerText=priceSymbol+priceInfo[key]["price"];
			newP.appendChild(newSpan);
		}else{
			newP.innerText=priceSymbol+priceInfo[key]["price"];
		}
		document.getElementById("price-"+key).appendChild(newP);
	})
}
function loggedIn(newLogin){
	if(newLogin){
		localStorage.setItem("Backend",backend);
		localStorage.setItem("Email",login.email);
		localStorage.setItem("Token",login.token);
		localStorage.setItem("Username",login.username);
		mainBox.style.opacity="1";
		popLogin.style.display="none";
	}
	menuItemLogin.innerText=multilang({
		"en-US":"Log Out",
		"zh-CN":"退出登录",
		"zh-TW":"登出"
	});
	var newItem=document.createElement("a");
	newItem.classList.add("menuItem");
	newItem.onclick=function(){
		mainBox.style.opacity="0";
		popAccount.style.display="block";
		setTimeout(function(){
			popAccount.style.opacity="1";
		},250);
		hideMenu();
	}
	newItem.style.fontSize="small";
	lblUsername.innerText=login.email;
	newItem.innerText=login.email;
	menu.insertBefore(newItem,menu.firstChild);
	var newP=document.createElement("p");
	newP.id="privilegeStatus";
	newItem.appendChild(newP);
	if(!newLogin){
		fetch("https://server-auto.rthe.cn/backend/userdata/verify?"+encodeData({
			"token":login.token,
			"username":login.username
		})).then(function(response){
			if(response.ok){
				return response.json();
			}
		}).then(function(data){
			if(data){
				if(data.token){
					localStorage.setItem("Backend",backend);
				}else{
					rmAccountInfo();
				}
			}
		});
	}
	loadExpTime();
	loadHistory();
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
			settingsNeedLogin.checked=true;
		}
	})
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
function notify(content,duration){
	if(duration==undefined){
		duration=3000;
	}
	notificationBar.innerText=content;
	notificationBar.style.bottom="0px";
	setTimeout(function(){
		notificationBar.style.bottom="-50px";
	},duration);
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
function sendText(){
	mainBox.style.opacity="0";
	popSendText.style.display="block";
	setTimeout(function(){
		popSendText.style.opacity="1";
	},250)
}
function showChangelog(text,firstRunOnly){
	if(firstRun===true||!firstRunOnly){
		mainBox.style.opacity="0";
		popUpdate.style.display="block";
		txtUpdate.innerHTML=text;
		setTimeout(function(){
			popUpdate.style.opacity="1";
		},250);
	}
}
function showUploading(){
	document.title="["+multilang({
		"en-US":"Uploading",
		"zh-CN":"正在上传",
		"zh-TW":"正在上傳"
	})+"] "+title;
	sendBox0.style.left="0px";
	sendBox1.style.left="500px";
	sendBox2.style.left="1000px";
	mainBox.style.opacity="0";
	popSend.style.display="block";
	setTimeout(function(){
		popSend.style.opacity="1";
	},250);
}
btnLogin.onclick=function(){
	if(inputEmail.value&&inputPsw.value){
		var email=inputEmail.value.toLowerCase();
		var password=MD5(inputPsw.value);
		fetch("https://server-auto.rthe.cn/backend/userdata/verify?"+encodeData({
			"email":email,
			"password":password,
			"token":true
		})).then(function(response){
			if(response.ok){
				return response.json();
			}else{
				error(response);
			}
		}).then(function(data){
			if(data){
				if(data.alert){
					alert(data.alert)
				}else if(data.index){
					if(data.token){
						login.email=data.email;
						login.token=data.token;
						login.username=data.username;
						loggedIn(true);
					}else if(confirm(multilang({
						"en-US":"Incorrect password. Do you want to reset the password?",
						"zh-CN":"密码错误。您想重置密码吗？",
						"zh-TW":"密碼錯誤。您想重設密碼嗎？"
					}))){
						location.href="https://rthsoftware.cn/login?"+encodeData({
							"email":email,
							"page":"resetpassword"
						});
					}
				}else{
					notify(multilang({
						"en-US":"This user does not exist.",
						"zh-CN":"此用户不存在。",
						"zh-TW":"此用戶不存在。"
					}));
				}
			}
		});
	}
}
inputPsw.onkeydown=function(event){
	if(event.keyCode==13){
		btnLogin.click();
	}
}
send.oncontextmenu=function(){
	sendText();
	return false
}
receive.onclick=function(){
	if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
		alert("请在浏览器中打开此页面。");
	}else{
		recvBox1.style.left="500px";
		recvBox0.style.left="0px";
		fileList.innerHTML="";
		inputCode.value="";
		mainBox.style.opacity="0";
		popRecv.style.display="block";
		setTimeout(function(){
			popRecv.style.opacity="1";
		},250);
		inputCode.focus();
	}
}
btnSub.onclick=function(){
	if(invalidAttempt>2){
		var code=getRandomCharacter(3);
		var enteredCode=prompt(multilang({
			"en-US":"You have entered invalid codes many times. Please enter the verification code to continue: ",
			"zh-CN":"您已经多次输入了无效取件码。请输入验证码以继续：",
			"zh-TW":"您已經多次輸入了無效取件碼。請輸入驗證碼以繼續："
		})+code);
		if(enteredCode==code){
			getInfo(inputCode.value);
		}else if(enteredCode!==null){
			alert(multilang({
				"en-US":"Incorrect verification code.",
				"zh-CN":"验证码错误。",
				"zh-TW":"驗證碼錯誤。"
			}));
		}
	}else{
		getInfo(inputCode.value);
	}
}
inputCode.onkeydown=function(event){
	if(event.keyCode==13){
		btnSub.click();
	}
}
menuIcon.onclick=function(){
	menu.style.display="block";
	setTimeout(function(){
		menu.style.opacity="1";
	},10);
	mask.style.display="block";
}
function hideMenu(){
	mask.style.display="none";
	menu.style.opacity="0";
	setTimeout(function(){
		menu.style.display="none";
	},250);
}
mask.onclick=hideMenu;
menuItemLogin.onclick=function(){
	if(login.username){
		var ssoIFrame=document.createElement("iframe");
		ssoIFrame.style.display="none";
		ssoIFrame.src="https://rthsoftware.cn/sso?"+encodeData({
			"action":"logout"
		});
		document.body.appendChild(ssoIFrame);
	}else{
		mainBox.style.opacity="0";
		popLogin.style.display="block";
		setTimeout(function(){
			popLogin.style.opacity="1";
		},250);
	}
	hideMenu();
}
menuItemHistory.onclick=function(){
	mainBox.style.opacity="0";
	popHistory.style.display="block";
	setTimeout(function(){
		popHistory.style.opacity="1";
	},250);
	hideMenu();
}
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
menuItemSettings.onclick=function(){
	mainBox.style.opacity="0";
	popSettings.style.display="block";
	setTimeout(function(){
		popSettings.style.opacity="1";
	},250);
	hideMenu();
}
menuItemFeedback.onclick=function(){
	mainBox.style.opacity="0";
	popFeedback.style.display="block";
	setTimeout(function(){
		popFeedback.style.opacity="1";
	},250);
	hideMenu();
}
btnSendFeed.onclick=function(){
	if(txtFeedback.value){
		var emailPattern=/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
		var email=login.email||emailPattern.exec(txtFeedback.value)&&emailPattern.exec(txtFeedback.value)[0]||prompt(multilang({
			"en-US":"Please enter your email address.",
			"zh-CN":"请输入您的电子邮箱地址。",
			"zh-TW":"請輸入您的電子郵箱地址。"
		}));
		if(emailPattern.test(email)){
			fetch("https://server-auto.rthe.cn/backend/feedback",getPostData({
				"appname":appName,
				"email":email,
				"lang":navigator.language,
				"name":login.username,
				"recipient":"405801769@qq.com",
				"text":txtFeedback.value,
				"ver":version
			})).then(function(response){
				if(response.ok){
					alert(multilang({
						"en-US":"Send successfully! We will process your feedback as soon as possible. Have a nice day :D",
						"zh-CN":"发送成功！我们会尽快处理您的反馈。祝您有开心的一天 :D",
						"zh-TW":"發送成功！我們會盡快處理您的回饋。祝您有開心的一天 :D"
					}));
					popFeedback.style.opacity="0";
					mainBox.style.opacity="1";
					setTimeout(function(){
						popFeedback.style.display="none";
					},250);
				}else{
					alert(multilang({
						"en-US":"Failed to send. . . Please try again or send an email to admin@yangshangzhen.com or fx_highway@qq.com",
						"zh-CN":"发送失败……请您再试一次，或通过微博私信反馈（@是毛布斯呀 @YSZ-RTH）",
						"zh-TW":"發送失敗……請您再試一次，或發送電郵到 admin@yangshangzhen.com 或 fx_highway@qq.com"
					}));
				}
			});
		}else{
			alert(multilang({
				"en-US":"Please provide the correct email address, or we will not be able to reply to you.",
				"zh-CN":"请提供正确的电子邮箱地址，否则我们将无法回复您。",
				"zh-TW":"請提供正確的電子郵箱地址，否則我們將無法回復您。"
			}));
		}
	}
}
viewQRC.onclick=function(){
	sendBox1.style.left="-500px";
	sendBox2.style.left="0px";
}
copyLink.onclick=function(){
	var url="https://rthe.cn/"+recvCode.innerText;
	if("clipboard" in navigator){
		navigator.clipboard.writeText(url).then(function(){
			notify(multilang({
				"en-US":"The download link is copied to the clipboard.",
				"zh-CN":"下载链接已复制到剪贴板。",
				"zh-TW":"下載連結已複製到剪貼簿。"
			}));
		});
	}else{
		prompt(multilang({
			"en-US":"Your browser does not support the clipboard API. Please copy it manually.",
			"zh-CN":"您的浏览器不支持剪贴板功能。请手动复制。",
			"zh-TW":"您的瀏覽器不支援剪貼簿功能。請手動複製。"
		}),url);
	}
}
btnDone0.onclick=function(){
	document.title=title;
	popSend.style.opacity="0";
	mainBox.style.opacity="1";
	popRecvCode.style.display="block";
	setTimeout(function(){
		popSend.style.display="none";
		popRecvCode.style.opacity="1";
	},250);
	setTimeout(function(){
		popRecvCode.style.MozTransform="scale(0.5,0.5)";
		popRecvCode.style.WebkitTransform="scale(0.5,0.5)";
	},500);
	setTimeout(function(){
		popRecvCode.style.top="0px";
		popRecvCode.style.left="100%";
		popRecvCode.style.marginTop="0px";
		popRecvCode.style.marginLeft="-135px";
	},750);
	setTimeout(function(){
		popRecvCode.style.MozTransformOrigin="65% 50%";
		popRecvCode.style.WebkitTransformOrigin="65% 50%";
		popRecvCode.style.MozTransform="scale(0,0)";
		popRecvCode.style.WebkitTransform="scale(0,0)";
	},1750);
	setTimeout(function(){
		popRecvCode.style.opacity="0";
		popRecvCode.style.display="none";
		popRecvCode.style.MozTransformOrigin="50% 50%";
		popRecvCode.style.WebkitTransformOrigin="50% 50%";
		popRecvCode.style.MozTransform="scale(1,1)";
		popRecvCode.style.WebkitTransform="scale(1,1)";
		popRecvCode.style.top="50%";
		popRecvCode.style.left="50%";
		popRecvCode.style.marginTop="-66px";
		popRecvCode.style.marginLeft="-78px";
	},2250);
}
btnDone1.onclick=function(){
	popRecv.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popRecv.style.display="none";
	},250);
	recvBox1.style.left="500px";
	recvBox0.style.left="0px";
}
btnDone2.onclick=function(){
	popHistory.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popHistory.style.display="none";
	},250);
}
btnDone4.onclick=function(){
	popUpdate.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popUpdate.style.display="none";
	},250);
}
btnDone5.onclick=function(){
	popSettings.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popSettings.style.display="none";
	},250);
}
btnBack0.onclick=function(){
	sendBox1.style.left="0px";
	sendBox2.style.left="500px";
}
btnBack1.onclick=function(){
	popRecv.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popRecv.style.display="none";
	},250);
}
btnBack2.onclick=function(){
	accBox0.style.left="0px";
	accBox1.style.left="500px";
}
btnBack3.onclick=function(){
	accBox0.style.left="0px";
	accBox_1.style.left="-500px";
}
btnClose0.onclick=function(){
	popAccount.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popAccount.style.display="none";
	},250);
}
btnClose1.onclick=function(){
	popLogin.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popLogin.style.display="none";
	},250);
}
btnClose3.onclick=function(){
	popFeedback.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popFeedback.style.display="none";
	},250);
}
showPrivilege.onclick=function(){
	accBox0.style.left="500px";
	accBox_1.style.left="0px";
}
payItem1M.onclick=payItem3M.onclick=payItem1Y.onclick=function() {
	payItemClick(this,"plan");
}
payItemAli.onclick=payItemWechat.onclick=payItemPaypal.onclick=function() {
	payItemClick(this,"method");
}
var pubPayPlan="N/A";
var pubPayMethod="N/A";
btnPay0.onclick=function(){
	var payPlan=document.getElementsByClassName("payItem plan selected").item(0).lastElementChild;
	var payMethod=document.getElementsByClassName("payItem method selected").item(0).lastElementChild;
	var actualPrice;
	var idPayPlan=payPlan.id;
	var idPayMethod=payMethod.id;
	pubPayPlan=payPlan.innerText;
	pubPayMethod=payMethod.innerText;
	payQRC.innerHTML="";
	var qrcode=new Image(200,200);
	switch(idPayMethod){
		case "alipay":
		switch(idPayPlan){
			case "month1":
			qrcode.src=getQRCode(priceInfo.one.alipay);
			actualPrice=priceInfo.one.actualPrice;
			break;
			case "month3":
			qrcode.src=getQRCode(priceInfo.three.alipay);
			actualPrice=priceInfo.three.actualPrice;
			break;
			case "month12":
			qrcode.src=getQRCode(priceInfo.twelve.alipay);
			actualPrice=priceInfo.twelve.actualPrice;
			break;
		}
		break;
		case "wechatPay":
		switch(idPayPlan){
			case "month1":
			qrcode.src=getQRCode(priceInfo.one.wechatpay);
			actualPrice=priceInfo.one.actualPrice;
			break;
			case "month3":
			qrcode.src=getQRCode(priceInfo.three.wechatpay);
			actualPrice=priceInfo.three.actualPrice;
			break;
			case "month12":
			qrcode.src=getQRCode(priceInfo.twelve.wechatpay);
			actualPrice=priceInfo.twelve.actualPrice;
			break;
		}
		break;
		case "paypal":
		switch(idPayPlan){
			case "month1":
			qrcode.src=getQRCode(priceInfo.one.paypal);
			actualPrice=priceInfo.one.actualPrice;
			break;
			case "month3":
			qrcode.src=getQRCode(priceInfo.three.paypal);
			actualPrice=priceInfo.three.actualPrice;
			break;
			case "month12":
			qrcode.src=getQRCode(priceInfo.twelve.paypal);
			actualPrice=priceInfo.twelve.actualPrice;
			break;
		}
		break;
	}
	payQRC.appendChild(qrcode);
	lblPayTip.innerText=multilang({
		"en-US":"Activate/Renew "+pubPayPlan+" of Premium Plan ("+actualPrice+")\nfor "+login.email+" with "+pubPayMethod,
		"zh-CN":"使用 "+pubPayMethod+" 为 "+login.email+"\n激活 / 续期"+pubPayPlan+"的高级账号（"+actualPrice+"）",
		"zh-TW":"使用 "+pubPayMethod+" 為 "+login.email+"\n啟用 / 續期"+pubPayPlan+"的高級賬號（"+actualPrice+"）"
	});
	accBox0.style.left="-500px";
	accBox1.style.left="0px";
}
var payState="success";
btnPay1.onclick=function(){
	var action="续期";
	if(!currentExpTime){
		action="激活";
	}
	fetch("https://server-auto.rthe.cn/backend/feedback",getPostData({
		"appname":appName,
		"email":login.email,
		"lang":navigator.language,
		"name":login.username,
		"recipient":"405801769@qq.com",
		"text":"通过 "+pubPayMethod+" "+action+" "+pubPayPlan+" 的高级账号",
		"ver":version
	})).then(function(response){
		if(response.ok){
			payState="success";
			btnDone3.innerText=multilang({
				"en-US":"Close",
				"zh-CN":"关闭",
				"zh-TW":"關閉"
			});
			lblPayState0.innerText=multilang({
				"en-US":"Submitted Successfully",
				"zh-CN":"提交成功",
				"zh-TW":"提交成功"
			});
			lblPayState1.innerText=multilang({
				"en-US":"We are processing your order.\nThe number of days remaining will be automatically updated within 24 hours;\nif not, please contact us after making sure you have paid.",
				"zh-CN":"我们正在处理您的支付订单。\n您的高级账号剩余天数会在24小时内自动更新；\n如果24小时后仍没有更新，请在确保您已支付后与我们联系。",
				"zh-TW":"我們正在處理您的支付訂單。\n您的高級賬號剩餘天數會在24小時內自動更新；\n如果24小時后仍沒有更新，請在確保您已支付后與我們聯繫。"
			});
			btnDone3.style.pointerEvents="auto";
			btnDone3.style.opacity="1";
			orderSubmitted=new Date().getTime();
			localStorage.setItem("orderSubmitted",orderSubmitted);
			loadExpTime();
		}else{
			payState="error";
			btnDone3.innerText=multilang({
				"en-US":"Try Again",
				"zh-CN":"重试",
				"zh-TW":"重試"
			});
			lblPayState0.innerText=multilang({
				"en-US":"Oops... something went wrong",
				"zh-CN":"Oops... 出错了",
				"zh-TW":"Oops... 出錯了"
			});
			if(response.status==504){
				lblPayState1.innerText=multilang({
					"en-US":"The server was unable to respond in time.",
					"zh-CN":"服务器无法及时响应。",
					"zh-TW":"伺服器無法及時響應。"
				});
			}else{
				lblPayState1.innerText=multilang({
					"en-US":"Unable to connect to the server.",
					"zh-CN":"无法连接至服务器。",
					"zh-TW":"無法連接至伺服器。"
				});
			}
			lblPayState1.innerText+=multilang({
				"en-US":"\nPlease try again (no need to pay again)\nIf you need more help, please contact us.",
				"zh-CN":"\n请重试（无需再次扫码付款）\n如需更多帮助，请与我们联系。",
				"zh-TW":"\n請重試（無需再次掃碼付款）\n如需更多幫助，請與我們聯繫。"
			});
			btnDone3.style.pointerEvents="auto";
			btnDone3.style.opacity="1";
		}
	})
	accBox1.style.left="-500px";
	accBox2.style.left="0px";
}
btnDone3.onclick=function(){
	if(payState=="success"){
		popAccount.style.opacity="0";
		mainBox.style.opacity="1";
		setTimeout(function(){
			popAccount.style.display="none";
			accBox0.style.left="0px";
			accBox1.style.left="500px";
			accBox2.style.left="1000px";
			btnDone3.style.pointerEvents="none";
			btnDone3.style.opacity="0.5";
			lblPayState0.innerText=multilang({
				"en-US":"Submitting",
				"zh-CN":"提交中",
				"zh-TW":"提交中"
			});
			lblPayState1.innerText=multilang({
				"en-US":"We are processing your order\nPlease wait\nIf you need help, please contact us.",
				"zh-CN":"我们正在处理您的支付订单\n请稍候\n如需帮助，请与我们联系。",
				"zh-TW":"我們正在處理您的支付訂單\n請稍候\n如需幫助，請與我們聯繫。"
			});
		},250);
	}else{
		btnPay1.onclick();
	}
}
settingsNeedLogin.onchange=function(){
	if(login.username){
		fetch(backend+"userdata/set",getPostData({
			"appname":appName,
			"key":"loginRequired",
			"token":login.token,
			"username":login.username,
			"value":this.checked.toString()
		})).then(function(response){
			if(response.ok){
				notify(multilang({
					"en-US":"Settings are saved.",
					"zh-CN":"设置已保存。",
					"zh-TW":"設定已保存。"
				}),1500);
			}else{
				error(response);
			}
		})
	}else{
		this.checked=false;
		menuItemLogin.click();
	}
}
if(location.hostname){
	backend="https://server-cn.rthe.cn/backend/";
	if("serviceWorker" in navigator){
		navigator.serviceWorker.getRegistrations().then(function(registrations){
			for(var i=0;i<registrations.length;i++){
				registrations[i].unregister();
			}
		});
	}
}else{
	backend="http://server-test.rthe.cn/backend/";
}
if(login.username){
	loggedIn();
}else{
	loadHistory();
	var ssoIFrame=document.createElement("iframe");
	ssoIFrame.style.display="none";
	ssoIFrame.src="https://rthsoftware.cn/sso";
	document.body.appendChild(ssoIFrame);
}
if(chs){
	txtVer.innerText="闽ICP备18016273号";
	txtVer.onclick=function(){
		open("http://www.miitbeian.gov.cn/");
	}
	txtVer.oncontextmenu=function(){
		txtVer.innerText=version;
		return false;
	}
}else{
	txtVer.innerText=version;
}
var newScript=document.createElement("script");
newScript.async=true;
newScript.src="https://server-auto.rthe.cn/backend/code?"+encodeData({
	"appname":appName,
	"lang":navigator.language,
	"username":login.username,
	"ver":version
});
document.body.appendChild(newScript);
