var appName="AirPortal";
var version="18w50c";
console.info(appName+" 由 毛若昕 和 杨尚臻 联合开发。");
console.info("版本："+version);
var txtVer=document.getElementById("version");
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
var cnBackend="https://www.rthsoftware.cn/backend/";
var usBackend="https://rthsoftware.net/backend/";
var fileBackend=backend+"userdata/file/";
var login={
	"email":localStorage.getItem("Email"),
	"password":localStorage.getItem("Password"),
	"username":localStorage.getItem("Username")
};
var menuIcon=document.getElementById("menuIcon");
var menu=document.getElementById("menu");
var mask=document.getElementById("mask");
var tickCnServer=document.getElementById("tickCnServer");
var tickUsServer=document.getElementById("tickUsServer");
var menuLogin=document.getElementById("menuItemLogin");
var mainBox=document.getElementById("mainBox");
var sendBox0=document.getElementById("sendBox0");
var sendBox1=document.getElementById("sendBox1");
var sendBox2=document.getElementById("sendBox2");
var recvBox0=document.getElementById("recvBox0");
var recvBox1=document.getElementById("recvBox1");
var popSend=document.getElementById("popSend");
var popRecv=document.getElementById("popRecv");
var popDownl=document.getElementById("popDownl");
var popLogin=document.getElementById("popLogin");
var popHistory=document.getElementById("popHistory");
var popRecvCode=document.getElementById("popRecvCode");
var popSetPri=document.getElementById("popSetPri");
var lblUploadP=document.getElementById("lblUploadP");
var progressBarBg0=document.getElementById("progressBarBg0");
var progressBar0=document.getElementById("progressBar0");
var progressBar1=document.getElementById("progressBar1");
var progressBar2=document.getElementById("progressBar2");
var lblDownloadP=document.getElementById("lblDownloadP1");
var lblDownloadP2=document.getElementById("lblDownloadP2");
var fileList=document.getElementById("fileList");
var historyList=document.getElementById("historyList");
var lblEmpty=document.getElementById("lblEmpty");
var lblUsername=document.getElementById("lblUsername");
var lblExpTime=document.getElementById("lblExpTime");
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
					//console.log("下载进度：("+progress+"/"+fileInfo.slice+") "+Math.round(e.loaded/e.total*100)+"%");
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
						document.getElementById("inputCode").value="";
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
function loggedIn(){
	if(popLogin.src){
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
	menuLogin.innerHTML="退出登录";
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
				newP.innerText="高级账号 剩余"+expTime+"天";
				lblExpTime.innerText="高级账号 剩余"+expTime+"天";
			}else{
				newP.innerText="高级账号 未激活";
				lblExpTime.innerText="高级账号 未激活";
			}
			newItem.appendChild(newP);
		}
	});
	menu.insertBefore(newItem,menu.firstChild);
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
		menu.insertBefore(newItem0,document.getElementById("menuItemCnServer"));
	}
	switch(backend){
		case cnBackend:
		tickCnServer.style.opacity="1";
		break;
		case usBackend:
		tickUsServer.style.opacity="1";
		break;
	}
	if(!popLogin.src&&login.password){
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
function submitLogin(email,password,signUp){
	if(email&&password){
		email=email.toLowerCase();
		password=MD5(password);
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
						loggedIn();
					}else if(confirm("密码错误。您想重置密码吗？")){
						location.href="https://rthsoftware.cn/login?email="+encodeURIComponent(email)+"&page=resetpassword";
					}
				}else if(signUp){
					var username=email.split("@")[0]+new Date().getTime().toString(36);
					ajax({
						"url":"https://rthsoftware.cn/backend/userdata/signup",
						"data":{
							"email":email,
							"password":password,
							"username":username
						},
						"method":"POST",
						"success":function(){
							backend=e.backend;
							login.email=email;
							login.password=password;
							login.username=username;
							loggedIn();
						},
						"error":function(){
							alert("无法连接至服务器");
						}
					});
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
document.getElementById("send").onclick=function(){
	document.getElementById("file").value="";
	document.getElementById("file").click();
	progressBarBg0.style.background="rgba(0,0,0,0)"
	progressBar0.style.width="0px";
}
document.getElementById("receive").onclick=function(){
	var inputCode=document.getElementById("inputCode");
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
function btnSub(){
	getInfo(document.getElementById("inputCode").value);
}
function inputSub(event){
	event = event || window.event;
	source = event.srcElement;
	if(event.keyCode==13){
		btnSub();
	}
}
function showMenu(){
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
function menuItemLogin(){
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
function menuItemHistory(){
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
			loggedIn();
		}
	}catch(e){}
});
function menuItemCnServer(){
	backend=cnBackend;
	fileBackend=backend+"userdata/file/";
	tickCnServer.style.opacity="1";
	tickUsServer.style.opacity="0";
	hideMenu();
}
function menuItemUsServer(){
	backend=usBackend;
	fileBackend=backend+"userdata/file/";
	tickCnServer.style.opacity="0";
	tickUsServer.style.opacity="1";
	hideMenu();
}
function viewQRC(){
	sendBox1.style.left="-500px";
	sendBox2.style.left="0px";
}
function btnDone0(){
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
function btnDone1(){
	popRecv.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popRecv.style.display="none";
	},250);
	recvBox1.style.left="500px";
	recvBox0.style.left="0px";
}
function btnDone2(){
	popHistory.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popHistory.style.display="none";
	},250);
}
function btnBack0(){
	sendBox1.style.left="0px";
	sendBox2.style.left="500px";
}
function btnBack1(){
	popRecv.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popRecv.style.display="none";
	},250);
}
document.getElementById("file").onchange=function(input){
	var files=[];
	for(var i=0;i<input.target.files.length;i++){
		if(input.target.files[i].type=="text/php"){
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
	sendBox0.style.left="0px";
	sendBox1.style.left="500px";
	sendBox2.style.left="1000px";
	mainBox.style.opacity="0";
	popSend.style.display="block";
	setTimeout(function(){
		popSend.style.opacity="1";
	},250);
	var uploadSuccess=function(code){
		document.getElementById("QRBox").innerHTML="";
		var qrcode=new Image(200,200);
		qrcode.src="https://rthsoftware.cn/backend/get?url="+encodeURIComponent("http://qr.topscan.com/api.php?text=http://rthe.cn/"+code)+"&username=admin";
		document.getElementById("QRBox").appendChild(qrcode);
		var recvCode=document.getElementById("recvCode");
		recvCode.innerHTML=code;
		popRecvCode.innerHTML=code;
		var newHistory=document.createElement("span");
		var newP=document.createElement("p");
		newHistory.className="historyItem";
		newHistory.innerHTML=code;
		newP.innerHTML=input.target.files[0].name;
		newHistory.appendChild(newP);
		historyList.insertBefore(newHistory,historyList.firstChild);
		lblEmpty.style.display="none";
		historyList.style.marginTop="-10px";
		sendBox0.style.left="-500px";
		sendBox1.style.left="0px";
		sendBox2.style.left="500px";
		lblUploadP.innerHTML="上传中...";
	}
	if(files.length<=1&&files[0].size<=10240000){
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
					var file=input.target.files[fileIndex];
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
					if(file.size>10240000){
						for(var i=0;i<file.size/sliceSize;i++){
							fileSlice.push(file.slice(i*sliceSize,(i+1)*sliceSize));
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
						fileSlice.push(file);
					}
					uploadSlice();
				}
				upload(0);
			},
			"error":function(e){
				if(e.status==402){
					alert("批量上传功能需要付费");
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
	document.getElementById("send").innerText="Send";
	document.getElementById("receive").innerText="Receive";
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
	popLogin.src="https://rthsoftware.cn/login";
}
var newStatDiv=document.createElement("div");
var newScript=document.createElement("script");
newStatDiv.style.display="none";
newScript.src="https://s4.cnzz.com/z_stat.php?id=1261177803&web_id=1261177803";
newStatDiv.appendChild(newScript);
document.body.appendChild(newStatDiv);

function setPrivilege() {
	ajax({
	    "url":backend+"userdata/renew",
	    "data":{
	        "appname":appName,
	        "email":document.getElementById("inputPriEmail").value,
	        "password":login.password,
	        "time":new Date(document.getElementById("inputPriExpDate").value).getTime()/1000,
	        "username":login.username
	    },
	    "method":"POST"
	})
}
