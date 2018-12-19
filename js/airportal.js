"use strict";
var appName="AirPortal";
var version="18w51b";
console.info(appName+" 由 毛若昕 和 杨尚臻 联合开发。");
console.info("版本："+version);
txtVer.innerHTML=version;

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
function addHistory(filename,code){
	var newHistory=document.createElement("span");
	var newP=document.createElement("p");
	newHistory.className="historyItem";
	newHistory.innerHTML=code;
	newP.innerHTML=filename;
	newHistory.appendChild(newP);
	historyList.insertBefore(newHistory,historyList.firstChild);
	lblEmpty.style.display="none";
	historyList.style.marginTop="-10px";
}
function downloadFile(fileInfo,code,index){
	if(fileInfo.slice){
		mainBox.style.opacity="0";
		popDownl.style.display="block";
		setTimeout(function(){
			popDownl.style.opacity="1";
		},250);
		var slice=[];
		var downloadSlice=function(progress){
			var xhr=new XMLHttpRequest();
			xhr.responseType="arraybuffer";
			xhr.onload=function(){
				if(xhr.status==200){
					slice.push(xhr.response);
					if(progress>=fileInfo.slice){
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
					alert("无法连接至服务器");
				}
			}
			xhr.onprogress=function(e){
				if(e.lengthComputable){
					progressBar1.style.width=Math.round(e.loaded/e.total*100)+"px";
					lblDownloadP1.innerText="下载文件碎片中 "+Math.round(e.loaded/e.total*100)+"%";
					progressBar2.style.width=Math.round(progress/fileInfo.slice*100)+"px";
					lblDownloadP2.innerText="总下载进度 "+progress+"/"+fileInfo.slice;
				}
			}
			xhr.open("GET",fileBackend+"tmp/"+code+"-"+index+"-"+progress,true);
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
		ajax({
			"url":fileBackend+"getinfo",
			"data":{
				"code":code
			},
			"dataType":"json",
			"success":function(e){
				if(e.multifile.length==1){
					downloadFile(e.multifile[0],code,1);
					popRecv.style.opacity="0";
					mainBox.style.opacity="1";
					setTimeout(function(){
						inputCode.value="";
						popRecv.style.display="none";
					},250);
				}else{
					for(var file=0;file<e.multifile.length;file++){
						var newLi=document.createElement("li");
						newLi.classList.add("menu");
						newLi.innerText=e.multifile[file].name;
						newLi.setAttribute("code",e.code);
						if(e.multifile.length>1){
							newLi.setAttribute("index",file+1);
						}
						newLi.onclick=function(){
							var index=this.getAttribute("index")-1;
							downloadFile(e.multifile[index],code,index+1);
						}
						fileList.appendChild(newLi);
					}
				}
				recvBox0.style.left="-500px";
				recvBox1.style.left="0px";
			},
			"error":function(e){
				if(e.status==200){
					alert("文件不存在");
				}else{
					alert("无法连接至服务器");
				}
			}
		});
	}
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
	menuItemLogin.innerHTML="退出登录";
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
	ajax({
		"url":backend+"get",
		"data":{
			"url":"userdata/privilege",
			"username":"admin"
		},
		"dataType":"json",
		"success":function(e){
			var expTime=Math.round((e.airportal[login.username]-new Date().getTime()/1000)/86400);
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
	ajax({
		"url":fileBackend+"get",
		"data":{
			"username":login.username
		},
		"dataType":"json",
		"success":function(e){
			for(var i=0;i<e.length;i++){
				addHistory(e[i].multifile[0].name,e[i].code);
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
		ajax({
			"url":"https://rthsoftware.cn/backend/userdata/verify",
			"data":{
				"email":login.email,
				"password":login.password
			},
			"dataType":"json",
			"showLoading":true,
			"success":function(e){
				if(e.pass){
					backend=e.backend;
					localStorage.setItem("Backend",backend);
					fileBackend=backend+"userdata/file/";
				}else{
					alert("密码错误");
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
		location.reload()
	}else{
		var ssoIFrame=document.createElement("iframe");
		ssoIFrame.style.display="none";
		ssoIFrame.src="https://rthsoftware.cn/sso?action=logout";
		document.body.appendChild(ssoIFrame);
	}
}
btnSetPri.onclick=function(){
	ajax({
		"url":backend+"userdata/renew",
		"data":{
			"appname":appName,
			"email":inputPriEmail.value,
			"password":login.password,
			"time":new Date(inputPriExpDate.value).getTime()/1000,
			"username":login.username
		},
		"method":"POST",
		"success":function(){
			alert("设置成功");
			inputPriEmail.value="";
		}
	});
}
btnLogin.onclick=function(){
	if(inputEmail.value&&inputPsw.value){
		var email=inputEmail.value.toLowerCase();
		var password=MD5(inputPsw.value);
		ajax({
			"url":"https://rthsoftware.cn/backend/userdata/verify",
			"data":{
				"email":email,
				"password":password
			},
			"dataType":"json",
			"showLoading":true,
			"success":function(e){
				if(e.index){
					if(e.pass){
						backend=e.backend;
						login.email=email;
						login.password=password;
						login.username=e.username;
						loggedIn(true);
					}else if(confirm("密码错误。您想重置密码吗？")){
						location.href="https://rthsoftware.cn/login?"+encodeData({
							"email":email,
							"page":"resetpassword"
						});
					}
				}else{
					alert("此用户不存在");
				}
			},
			"error":function(){
				alert("无法连接至服务器");
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
	progressBarBg0.style.background="rgba(0,0,0,0)"
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
			location.reload()
		}else{
			backend=login.backend;
			loggedIn(true);
		}
	}catch(e){}
});
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
		element.classList.remove("selected")
	}else{
		var elements=document.getElementsByClassName(className)
		for(var i=0;i<elements.length;i++){
			if(elements[i]==element){
				element.classList.add("selected")
			}else{
				elements[i].classList.remove("selected")
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
file.onchange=function(input){
	var files=[];
	for(var i=0;i<input.target.files.length;i++){
		if(input.target.files[i].name.indexOf(".php")!=-1||input.target.files[i].type=="text/php"){
			alert("不允许传输 PHP 文件");
		}else{
			files.push({
				"name":input.target.files[i].name,
				"progress":0,
				"type":input.target.files[i].type,
				"size":input.target.files[i].size
			});
		}
	}
	var showUploading=function(){
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
		QRBox.innerHTML="";
		var qrcode=new Image(200,200);
		qrcode.src="https://rthsoftware.cn/backend/get?"+encodeData({
			"url":"http://qr.topscan.com/api.php?text=http://rthe.cn/"+code,
			"username":"admin"
		});
		QRBox.appendChild(qrcode);
		recvCode.innerHTML=code;
		popRecvCode.innerHTML=code;
		addHistory(input.target.files[0].name,code);
		sendBox0.style.left="-500px";
		sendBox1.style.left="0px";
		sendBox2.style.left="500px";
		lblUploadP.innerHTML="上传中...";
	}
	if(files.length<=1&&files[0].size<=10240000){
		showUploading();
		ajax({
			"url":fileBackend+"upload",
			"data":{
				"file":input.target.files[0],
				"username":login.username
			},
			"dataType":"json",
			"method":"POST",
			"processData":false,
			"success":function(e){
				if(e.error){
					alert(e.error);
				}else{
					uploadSuccess(e.code);
				}
			},
			"error":function(){
				alert("无法连接至服务器");
			}
		});
	}else{
		ajax({
			"url":fileBackend+"getcode",
			"data":{
				"info":JSON.stringify(files),
				"username":login.username
			},
			"dataType":"json",
			"method":"POST",
			"success":function(code){
				var upload=function(fileIndex){
					var thisFile=input.target.files[fileIndex];
					var fileSlice=[];
					var passedTime=0;
					var progressCalc;
					var sliceSize=10240000;
					var time=0;
					var timer;
					var uploadProgress=0;
					var uploadSlice=function(){
						clearInterval(timer);
						ajax({
							"url":fileBackend+"uploadslice",
							"data":{
								"code":code,
								"file":fileSlice[uploadProgress],
								"index":fileIndex+1,
								"progress":uploadProgress+1
							},
							"dataType":"json",
							"method":"POST",
							"processData":false,
							"success":function(e){
								clearInterval(progressCalc);
								if(e.error){
									alert(e.error);
								}else if(e.success==uploadProgress+1){
									if(uploadProgress==fileSlice.length-1){
										if(fileIndex==input.target.files.length-1){
											uploadSuccess(code);
										}else{
											setTimeout(function(){
												upload(fileIndex+1);
											},1000);
										}
									}else{
										progressBarBg0.style.background="rgba(0,0,0,0.1)"
										uploadProgress++;
										var uploadPercentage=uploadProgress/(fileSlice.length-1)*100;
										lblUploadP.innerHTML="上传中 "+Math.round(uploadPercentage)+"%";
										progressBar0.style.width=Math.round(uploadPercentage)+"px";
										setTimeout(function(){
											uploadSlice();
											passedTime=0;
											progressCalc=setInterval(function(){
												passedTime+=100;
												var maxPercentage=(uploadProgress+1)/(fileSlice.length-1)*100;
												var percentagePrediction=uploadPercentage*(1+passedTime/time);
												if(maxPercentage>100){
													maxPercentage=100;
												}
												if(percentagePrediction>maxPercentage){
													percentagePrediction=maxPercentage;
												}
												lblUploadP.innerHTML="上传中 "+Math.round(percentagePrediction)+"%";
												progressBar0.style.width=Math.round(percentagePrediction)+"px";
											},100);
										},1000);
									}
								}
							},
							"error":function(){
								alert("无法连接至服务器");
							}
						});
					}
					if(thisFile.size>10240000){
						for(var i=0;i<thisFile.size/sliceSize;i++){
							fileSlice.push(thisFile.slice(i*sliceSize,(i+1)*sliceSize));
						}
						timer=setInterval(function(){
							time+=100;
							var maxPercentage=1/(fileSlice.length-1)*100;
							var percentagePrediction=maxPercentage*(time/10000);
							if(percentagePrediction>maxPercentage){
								percentagePrediction=maxPercentage;
							}
							lblUploadP.innerHTML = "上传中 "+Math.round(percentagePrediction)+"%";
							progressBar0.style.width=Math.round(percentagePrediction)+"px";
						},100);
					}else{
						fileSlice.push(thisFile);
					}
					uploadSlice();
				}
				showUploading();
				upload(0);
			},
			"error":function(e){
				if(e.status==402){
					alert("批量上传和上传大文件需要付费");
				}else{
					alert("无法连接至服务器");
				}
			}
		});
	}
}
window.onerror=function(msg,url,lineNo){
	if(msg&&url&&lineNo&&msg!="Script error."&&lineNo!=1){
		var text=msg+" at "+url+" : "+lineNo;
		window.onerror=null;
		if(confirm(msg)){
			ajax({
				"url":"https://rthsoftware.cn/backend/feedback",
				"data":{
					"appname":appName,
					"email":login.email,
					"lang":navigator.language,
					"name":login.username,
					"text":text,
					"ver":version
				},
				"method":"POST"
			});
		}
	}
}
if(navigator.language.indexOf("zh")==-1){
	send.innerText="Send";
	receive.innerText="Receive";
}
if($_GET["code"]){
	if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
		alert("请在浏览器中打开此页面")
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
if("fetch" in window){
	var hostname={};
	var servers=document.getElementsByClassName("server");
	for(var i=0;i<servers.length;i++){
		var time=0;
		var intervalId=setInterval(function(){
			time++;
		},10);
		hostname[new URL(servers[i].getAttribute("value")).hostname]=servers[i];
		fetch(servers[i].getAttribute("value")+"geo").then(function(e){
			clearInterval(intervalId);
			//var newSpan=document.createElement("span");
			//newSpan.className="latencyStatus"
			//newSpan.innerText=" ●";
			//newSpan.innerText=" - "+time+"ms";
			var thisServer=hostname[new URL(e.url).hostname];
			console.log(thisServer.innerText+" "+time+"ms");
			if(time<200){
				thisServer.lastElementChild.style.color="#A5C220";//27c54a
			}else{
				thisServer.lastElementChild.style.color="#F5B641";//ffc100
			}
			if(time>500){
				thisServer.lastElementChild.style.color="#F7695A";//fc5243
			}
			//hostname[new URL(e.url).hostname].appendChild(newSpan);
		});
	}
}else{
	alert("请升级您的网络浏览器");
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
