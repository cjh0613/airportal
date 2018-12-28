"use strict";
var appName="AirPortal";
var version="18w52b6";
var consoleGeneralStyle="font-family:'Microsoft Yahei';";
var consoleInfoStyle=consoleGeneralStyle+"color:rgb(65,145,245);";
console.info("%c%s 由 毛若昕 和 杨尚臻 联合开发。",consoleInfoStyle,appName);
console.info("%c版本：%s",consoleInfoStyle,version);
txtVer.innerText=version;

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
var backend=localStorage.getItem("Backend");
if(!backend){
	backend="https://rthsoftware.cn/backend/";
}
var fileBackend=backend+"userdata/file/";
var login={
	"email":localStorage.getItem("Email"),
	"password":localStorage.getItem("Password"),
	"username":localStorage.getItem("Username")
};
var title=document.title;
var firstRun=JSON.parse(localStorage.getItem("firstRun"));
if(!firstRun||firstRun[version]==undefined){
	firstRun={};
}
if(firstRun[version]!=false){
	/*mainBox.style.opacity="0";
	popUpdate.style.display="block";
	setTimeout(function(){
		popUpdate.style.opacity="1";
	},250);*/
	firstRun[version]=false;
	localStorage.setItem("firstRun",JSON.stringify(firstRun));
}
function addHistory(filename,code){
	var newHistory=document.createElement("span");
	var newP=document.createElement("p");
	newHistory.className="historyItem";
	newHistory.innerText=code;
	newP.innerText=filename;
	newHistory.appendChild(newP);
	historyList.insertBefore(newHistory,historyList.firstChild);
	lblEmpty.style.display="none";
	historyList.style.marginTop="-10px";
}
function downloadFile(fileInfo,code,index,path){
	if(fileInfo.slice){
		mainBox.style.opacity="0";
		popDownl.style.display="block";
		setTimeout(function(){
			popDownl.style.opacity="1";
		},250);
		var intervalId=setInterval(function(){
			if(dlTip0.style.marginTop=="0px"){
				dlTip0.style.marginTop="-20px";
				dlTip1.style.marginTop="-10px";
			}else{
				dlTip0.style.marginTop="0px";
				dlTip1.style.marginTop="0px";
			}
		},5000);
		var slice=[];
		var downloadSlice=function(progress){
			var xhr=new XMLHttpRequest();
			xhr.responseType="arraybuffer";
			xhr.onload=function(){
				if(xhr.status==200){
					slice.push(xhr.response);
					if(progress>=fileInfo.slice){
						clearInterval(intervalId);
						document.title=title;
						var newA=document.createElement("a");
						var url=URL.createObjectURL(new Blob(slice,{
							"type":fileInfo.type
						}));
						newA.href=url;
						newA.download=fileInfo.name;
						newA.style.display="none";
						document.body.appendChild(newA);
						newA.click();
						popDownl.style.opacity="0";
						mainBox.style.opacity="1";
						setTimeout(function(){
							popDownl.style.display="none";
						},250);
					}else{
						progress++;
						downloadSlice(progress);
					}
				}else{
					alert("无法连接至服务器。");
				}
			}
			xhr.onprogress=function(e){
				if(e.lengthComputable){
					var percentage=Math.round(e.loaded/e.total*100);
					document.title="["+progress+"/"+fileInfo.slice+": "+percentage+"%] "+title;
					progressBar1.style.width=percentage+"px";
					lblDownloadP1.innerText="下载文件碎片中 "+percentage+"%";
					progressBar2.style.width=Math.round(progress/fileInfo.slice*100)+"px";
					lblDownloadP2.innerText="总下载进度 "+progress+"/"+fileInfo.slice;
				}
			}
			xhr.open("GET",path+code+"-"+index+"-"+progress,true);
			xhr.send();
		}
		downloadSlice(1);
	}else{
		location.href=fileInfo.download;
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
function getInfo(code){
	if(code){
		fetch(fileBackend+"getinfo?"+encodeData({
			"code":code
		})).then(function(response){
			if(response.ok){
				return response.text();
			}else{
				alert("无法连接至服务器。");
				return false;
			}
		}).then(function(data){
			if(data==null){
				alert("文件不存在。");
			}else if(data){
				data=JSON.parse(data);
				if(data.multifile.length==1){
					downloadFile(data.multifile[0],code,1,data.path);
					popRecv.style.opacity="0";
					mainBox.style.opacity="1";
					setTimeout(function(){
						inputCode.value="";
						popRecv.style.display="none";
					},250);
				}else{
					for(var file=0;file<data.multifile.length;file++){
						var newLi=document.createElement("li");
						newLi.classList.add("menu");
						newLi.innerText=data.multifile[file].name;
						newLi.setAttribute("code",data.code);
						if(data.multifile.length>1){
							newLi.setAttribute("index",file+1);
						}
						newLi.onclick=function(){
							var index=this.getAttribute("index")-1;
							downloadFile(data.multifile[index],code,index+1,data.path);
						}
						fileList.appendChild(newLi);
					}
					mainBox.style.opacity="0";
					popRecv.style.display="block";
					popRecv.style.opacity="1";
					recvBox0.style.left="-500px";
					recvBox1.style.left="0px";
				}
			}
		})
	}
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
	return "https://rthsoftware.cn/backend/get?"+encodeData({
		"url":"http://qr.topscan.com/api.php?text="+content,
		"username":"admin"
	});
}
function loadPrice(priceInfo){
	window.priceInfo=priceInfo;
	Object.keys(priceInfo).forEach(function(key){
		var newP=document.createElement("p");
		newP.classList.add("p2");
		newP.innerText="¥"+priceInfo[key]["price"];
		document.getElementById("price-"+key).appendChild(newP);
		if(priceInfo[key]["discount"]<1){
			var newSpan=document.createElement("span");
			newSpan.classList.add("pDel");
			newSpan.innerText="¥"+priceInfo[key]["price"]*priceInfo[key]["discount"];
			newP.appendChild(newSpan);
		}
	})
}
function loggedIn(newLogin){
	if(newLogin){
		fileBackend=backend+"userdata/file/";
		localStorage.setItem("Backend",backend);
		localStorage.setItem("Email",login.email);
		localStorage.setItem("Username",login.username);
		if(login.password){
			localStorage.setItem("Password",login.password);
		}
		mainBox.style.opacity="1";
		popLogin.style.display="none";
	}
	menuItemLogin.innerText="退出登录";
	var newItem=document.createElement("a");
	newItem.className="menuItem";
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
	fetch(backend+"get?"+encodeData({
		"url":"userdata/privilege",
		"username":"admin"
	})).then(function(response){
		if(response.ok){
			return response.json();
		}
	}).then(function(data){
		if(data){
			var expTime=Math.round((data.airportal[login.username]-new Date().getTime()/1000)/86400);
			newItem.innerText=login.email;
			var newP=document.createElement("p");
			if(expTime>0){
				newP.innerText=lblExpTime.innerText="高级账号 剩余"+expTime+"天";
			}else{
				newP.innerText=lblExpTime.innerText="高级账号 未激活";
			}
			newItem.appendChild(newP);
			menu.insertBefore(newItem,menu.firstChild);
		}
	});
	fetch(fileBackend+"get?"+encodeData({
		"username":login.username
	})).then(function(response){
		if(response.ok){
			return response.json();
		}
	}).then(function(data){
		if(data){
			for(var i=0;i<data.length;i++){
				addHistory(data[i].multifile[0].name,data[i].code);
			}
		}
	});
	if(login.username=="admin"){
		var newItem0=document.createElement("a");
		newItem0.className="menuItem";
		newItem0.innerText="设置高级账号";
		newItem0.onclick=function(){
			mainBox.style.opacity="0";
			popSetPri.style.display="block";
			setTimeout(function(){
				popSetPri.style.opacity="1";
			},250);
			hideMenu();
		}
		menu.insertBefore(newItem0,menuLine0);
	}
	if(!newLogin&&login.password){
		fetch("https://rthsoftware.cn/backend/userdata/verify?"+encodeData({
			"email":login.email,
			"password":login.password
		})).then(function(response){
			if(response.ok){
				return response.json();
			}
		}).then(function(data){
			if(data){
				if(data.pass){
					backend=data.backend;
					localStorage.setItem("Backend",backend);
					fileBackend=backend+"userdata/file/";
				}else{
					alert("密码错误。");
					logOut();
				}
			}
		});
	}
}
function logOut(){
	localStorage.removeItem("Backend");
	localStorage.removeItem("Email");
	localStorage.removeItem("Password");
	localStorage.removeItem("Username");
	if(location.hostname=="rthsoftware.cn"){
		location.reload();
	}else{
		var ssoIFrame=document.createElement("iframe");
		ssoIFrame.style.display="none";
		ssoIFrame.src="https://rthsoftware.cn/sso?action=logout";
		document.body.appendChild(ssoIFrame);
	}
}
btnSetPri.onclick=function(){
	fetch(backend+"userdata/renew",getPostData({
		"appname":appName,
		"email":inputPriEmail.value,
		"password":login.password,
		"recipient":"405801769@qq.com",
		"time":new Date(inputPriExpDate.value).getTime()/1000,
		"username":login.username
	})).then(function(response){
		if(response.ok){
			alert("设置成功。");
			inputPriEmail.value="";
		}else if(response.status==504){
			alert("请再试一次。");
		}else{
			alert("无法连接至服务器。");
		}
	});
}
btnLogin.onclick=function(){
	if(inputEmail.value&&inputPsw.value){
		var email=inputEmail.value.toLowerCase();
		var password=MD5(inputPsw.value);
		fetch("https://rthsoftware.cn/backend/userdata/verify?"+encodeData({
			"email":email,
			"password":password
		})).then(function(response){
			if(response.ok){
				return response.json();
			}else{
				alert("无法连接至服务器。");
			}
		}).then(function(data){
			if(data){
				if(data.index){
					if(data.pass){
						backend=data.backend;
						login.email=email;
						login.password=password;
						login.username=data.username;
						loggedIn(true);
					}else if(confirm("密码错误。您想重置密码吗？")){
						location.href="https://rthsoftware.cn/login?"+encodeData({
							"email":email,
							"page":"resetpassword"
						});
					}
				}else{
					alert("此用户不存在。");
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
send.onclick=function(){
	file.value="";
	file.click();
	progressBarBg0.style.background="rgba(0,0,0,0)";
	progressBar0.style.width="0px";
}
receive.onclick=function(){
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
btnSub.onclick=function(){
	getInfo(inputCode.value);
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
	if(!login.username){
		mainBox.style.opacity="0";
		popLogin.style.display="block";
		setTimeout(function(){
			popLogin.style.opacity="1";
		},250);
	}else{
		logOut();
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
			location.reload();
		}else{
			backend=login.backend;
			loggedIn(true);
		}
	}catch(e){}
});
menuItemFeedback.onclick=function(){
	mainBox.style.opacity="0";
	popFeedback.style.display="block";
	setTimeout(function(){
		popFeedback.style.opacity="1";
	},250);
	hideMenu();
}
btnSendFeed.onclick=function(){
	fetch("https://rthsoftware.cn/backend/feedback",getPostData({
		"appname":appName,
		"email":login.email,
		"lang":navigator.language,
		"name":login.username,
		"recipient":"405801769@qq.com",
		"text":txtFeedback.value,
		"ver":version
	})).then(function(response){
		if(response.ok){
			alert("发送成功！我们会尽快处理您的反馈，祝您有开心的一天 :D");
			popFeedback.style.opacity="0";
			mainBox.style.opacity="1";
			setTimeout(function(){
				popFeedback.style.display="none";
			},250);
		}else{
			alert("发送失败...请您再试一次，或通过微博私信反馈（@是毛布斯呀 @YSZ-RTH）");
		}
	})
}
menuItemAutoServer.onclick=
menuItemCnServer.onclick=
menuItemUsServer1.onclick=
menuItemUsServer2.onclick=function(){
	backend=this.getAttribute("value");
	fileBackend=backend+"userdata/file/";
	var tick=document.getElementsByClassName("tick");
	for(var i=0;i<tick.length;i++){
		if(tick[i].parentElement==this){
			tick[i].style.opacity="1";
		}else{
			tick[i].style.opacity="0";
		}
	}
	hideMenu();
}
viewQRC.onclick=function(){
	sendBox1.style.left="-500px";
	sendBox2.style.left="0px";
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
btnClose2.onclick=function(){
	popSetPri.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popSetPri.style.display="none";
	},250);
}
btnClose3.onclick=function(){
	popFeedback.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popFeedback.style.display="none";
	},250);
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
payItem1M.onclick=payItem3M.onclick=payItem1Y.onclick=function() {
	payItemClick(this,"plan");
}
payItemAli.onclick=payItemWechat.onclick=function() {
	payItemClick(this,"method");
}
var pubPayPlan="N/A";
var pubPayMethod="N/A";
btnPay0.onclick=function(){
	var payPlan=document.getElementsByClassName("payItem plan selected").item(0).lastElementChild;
	var payMethod=document.getElementsByClassName("payItem method selected").item(0).lastElementChild;
	pubPayPlan=payPlan.innerText;
	pubPayMethod=payMethod.innerText;
	payQRC.innerHTML="";
	var qrcode=new Image(200,200);
	if(pubPayMethod=="支付宝"){
		switch(pubPayPlan){
			case "一个月":
			qrcode.src=getQRCode(priceInfo.one.alipay);
			break;
			case "三个月":
			qrcode.src=getQRCode(priceInfo.three.alipay);
			break;
			case "一年":
			qrcode.src=getQRCode(priceInfo.twelve.alipay);
			break;
		}
	}else{
		switch(pubPayPlan){
			case "一个月":
			qrcode.src=getQRCode(priceInfo.one.wechatpay);
			break;
			case "三个月":
			qrcode.src=getQRCode(priceInfo.three.wechatpay);
			break;
			case "一年":
			qrcode.src=getQRCode(priceInfo.twelve.wechatpay);
			break;
		}
	}
	payQRC.appendChild(qrcode);
	lblPayTip.innerText="使用 "+pubPayMethod+" 为 "+login.email+"\n激活 / 续期"+pubPayPlan+"的高级账号";
	accBox0.style.left="-500px";
	accBox1.style.left="0px";
}
var payState="success";
btnPay1.onclick=function(){
	fetch("https://rthsoftware.cn/backend/feedback",getPostData({
		"appname":appName,
		"email":login.email,
		"lang":navigator.language,
		"name":login.username,
		"recipient":"405801769@qq.com",
		"text":"用户通过 "+pubPayMethod+" 激活 / 续期了 "+pubPayPlan+" 的高级账号。",
		"ver":version
	})).then(function(response){
		if(response.ok){
			payState="success";
			btnDone3.innerText="关闭";
			lblPayState0.innerText="提交成功";
			lblPayState1.innerText="我们正在处理您的支付订单。\n您的高级账号剩余天数会在24小时内自动更新;\n否则请在确保您已支付后与我们联系。";
			btnDone3.style.pointerEvents="auto";
			btnDone3.style.opacity="1";
		}else{
			payState="error";
			btnDone3.innerText="重试";
			lblPayState0.innerText="Oops...出错了";
			if(response.status==504){
				lblPayState1.innerText="服务器无法及时响应。";
			}else{
				lblPayState1.innerText="无法连接至服务器。";
			}
			lblPayState1.innerText+="\n请重试（无需再次扫码付款）\n如需更多帮助，请与我们联系。";
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
			lblPayState0.innerText="提交中";
			lblPayState1.innerText="我们正在处理您的支付订单\n请稍候\n如需帮助，请与我们联系。";
		},250);
	}else{
		btnPay1.onclick();
	}
}
file.onchange=function(input){
	var files=[];
	for(var i=0;i<input.target.files.length;i++){
		if(input.target.files[i].name.indexOf(".php")!=-1||input.target.files[i].type=="text/php"){
			alert("不允许传输 PHP 文件。");
		}else if(input.target.files[i].size>1073741824){
			alert("不允许传输大于 1024MB 的文件。");
		}else{
			files.push({
				"name":input.target.files[i].name,
				"progress":0,
				"type":input.target.files[i].type,
				"size":input.target.files[i].size
			});
		}
	}
	if(files.length>0){
		var showUploading=function(){
			document.title="[上传中] "+title;
			sendBox0.style.left="0px";
			sendBox1.style.left="500px";
			sendBox2.style.left="1000px";
			mainBox.style.opacity="0";
			popSend.style.display="block";
			setTimeout(function(){
				popSend.style.opacity="1";
			},250);
		}
		var uploadSuccess=function(code){
			document.title="[取件码 "+code+"] "+title;
			QRBox.innerHTML="";
			var qrcode=new Image(200,200);
			qrcode.src=getQRCode("http://rthe.cn/"+code);
			QRBox.appendChild(qrcode);
			recvCode.innerText=code;
			popRecvCode.innerText=code;
			addHistory(input.target.files[0].name,code);
			sendBox0.style.left="-500px";
			sendBox1.style.left="0px";
			sendBox2.style.left="500px";
			lblUploadP.innerText="上传中...";
		}
		if(files.length<=1&&files[0].size<=10240000){
			showUploading();
			fetch(fileBackend+"upload",getPostData({
				"file":input.target.files[0],
				"username":login.username
			})).then(function(response){
				if(response.ok){
					return response.json();
				}else{
					alert("无法连接至服务器。");
					document.title=title;
					mainBox.style.opacity="1";
					popSend.style.display="none";
				}
			}).then(function(data){
				if(data){
					if(data.error){
						alert(data.error);
					}else{
						uploadSuccess(data.code);
					}
				}
			});
		}else{
			fetch(fileBackend+"getcode",getPostData({
				"info":JSON.stringify(files),
				"username":login.username
			})).then(function(response){
				switch(response.status){
					case 200:
					return response.text();
					case 402:
					alert("批量上传和上传大文件需要付费。");
					if(!login.username){
						menuItemLogin.click();
					}
					break;
					default:
					alert("无法连接至服务器。");
					break;
				}
			}).then(function(code){
				if(code){
					var upload=function(fileIndex){
						var thisFile=input.target.files[fileIndex];
						var fileSlice=[];
						var sliceSize=10240000;
						var uploadSlice=function(uploadProgress){
							fetch(fileBackend+"uploadslice",getPostData({
								"code":code,
								"file":fileSlice[uploadProgress],
								"index":fileIndex+1,
								"progress":uploadProgress+1
							})).then(function(response){
								if(response.ok){
									return response.json();
								}
							}).then(function(data){
								if(data){
									if(data.error){
										alert(data.error);
									}else if(data.success==uploadProgress+1){
										if(uploadProgress==fileSlice.length-1){
											if(fileIndex==input.target.files.length-1){
												uploadSuccess(code);
											}else{
												setTimeout(function(){
													upload(fileIndex+1);
												},1000);
											}
										}else{
											progressBarBg0.style.background="rgba(0,0,0,0.1)";
											uploadProgress++;
											var percentage=Math.round(uploadProgress/fileSlice.length*100);
											document.title="["+percentage+"%] "+title;
											lblUploadP.innerText="上传中 "+percentage+"%";
											progressBar0.style.width=percentage+"px";
											uploadSlice(uploadProgress);
										}
									}
								}
							}).catch(function(){
								if(thisFile.size<104857600){
									fileSlice=[thisFile];
									uploadSlice(0);
								}else{
									alert("无法在此设备上发送大于 100 MB 的文件。");
									document.title=title;
									mainBox.style.opacity="1";
									popSend.style.display="none";
								}
							});
						}
						if(thisFile.size>10240000){
							for(let i=0;i<thisFile.size/sliceSize;i++){
								fileSlice.push(thisFile.slice(i*sliceSize,(i+1)*sliceSize));
							}
						}else{
							fileSlice.push(thisFile);
						}
						uploadSlice(0);
					}
					showUploading();
					upload(0);
				}
			});
		}
	}
}
window.onerror=function(msg,url,lineNo){
	if(msg&&url&&lineNo&&msg!="Script error."&&lineNo!=1){
		var text=msg+" at "+url+" : "+lineNo;
		window.onerror=null;
		if(confirm(msg)){
			fetch("https://rthsoftware.cn/backend/feedback",getPostData({
				"appname":appName,
				"email":login.email,
				"lang":navigator.language,
				"name":login.username,
				"recipient":"405801769@qq.com",
				"text":text,
				"ver":version
			}));
		}
	}
}
if(navigator.language.indexOf("zh")==-1){
	send.innerText="Send";
	receive.innerText="Receive";
}
if($_GET["code"]){
	if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
		alert("请在浏览器中打开此页面。");
	}else{
		getInfo($_GET["code"]);
	}
}
if(login.username){
	loggedIn();
}else if(location.hostname!="rthsoftware.cn"){
	var ssoIFrame=document.createElement("iframe");
	ssoIFrame.style.display="none";
	ssoIFrame.src="https://rthsoftware.cn/sso";
	document.body.appendChild(ssoIFrame);
}
var servers=document.getElementsByClassName("server");
var speedTest=function(index){
	const start=performance.now();
	fetch(servers[index].getAttribute("value")+"userdata/file/").then(function(){
		const end=performance.now();
		const time=Math.round(end-start);
		let timeStr;
		if(time>1000){
			timeStr=(time/1000).toFixed(2)+"s";
		}else{
			timeStr=time+"ms";
		}
		if(time<500){
			console.log("%c%s %s",consoleGeneralStyle+"color:#A5C220;",servers[index].innerText,timeStr);
			servers[index].lastElementChild.classList.add("good");
		}else if(time<1000){
			console.log("%c%s %s",consoleGeneralStyle+"color:#F5B641;",servers[index].innerText,timeStr);
			servers[index].lastElementChild.classList.add("soso");
		}else{
			console.log("%c%s %s",consoleGeneralStyle+"color:#F7695A;",servers[index].innerText,timeStr);
			servers[index].lastElementChild.classList.add("bad");
		}
		index++;
		if(index<servers.length){
			speedTest(index);
		}
	});
}
speedTest(0);
if((location.hostname=="rthsoftware.cn"||location.hostname=="localhost")&&"serviceWorker" in navigator){
	navigator.serviceWorker.register("sw.js")
}
var newScript=document.createElement("script");
newScript.async=true;
newScript.src="https://rthsoftware.cn/backend/code?"+encodeData({
	"appname":appName,
	"lang":navigator.language,
	"username":login.username,
	"ver":version
});
document.body.appendChild(newScript);
