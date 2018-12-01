var appName="AirPortal";
var version="18w48c3";
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
var usBackend="https://cdn.rthsoftware.net/backend/";
var fileBackend=backend+"userdata/file/";
var isElectron=/Electron/i.test(navigator.userAgent);
var isIE=/MSIE|Trident/i.test(navigator.userAgent);
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
var popLogin=document.getElementById("popLogin");
var lblUploadP=document.getElementById("lblUploadP");
var fileList=document.getElementById("fileList");
function downloadFile(fileInfo,code,index){
	if(fileInfo.slice){
		var slice=[];
		var downloadSlice=function(progress){
			var xhr=new XMLHttpRequest();
			xhr.responseType="arraybuffer";
			xhr.onload=function(){
				if(xhr.status==200){
					if(progress>fileInfo.slice){
						var newA=document.createElement("a");
						var url=URL.createObjectURL(new Blob(slice,{
							"type":fileInfo.type
						}));
						newA.href=url;
						newA.download=fileInfo.name;
						newA.click();
					}else{
						slice.push(xhr.response);
						progress++;
						downloadSlice(progress);
					}
				}
			}
			xhr.onprogress=function(e){
				if(e.lengthComputable){
					console.log("下载进度：("+progress+"/"+fileInfo.slice+") "+Math.round(e.loaded/e.total*100)+"%");
				}
			}
			xhr.open("GET",fileBackend+"download?code="+code+"&index="+index+"&slice="+progress,true);
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
	fileBackend=backend+"userdata/file/";
	localStorage.setItem("Backend",backend);
	localStorage.setItem("Email",login.email);
	localStorage.setItem("Username",login.username);
	if(login.password){
		localStorage.setItem("Password",login.password);
	}
	location.reload();
}
function logOut(){
	localStorage.removeItem("Backend");
	localStorage.removeItem("Email");
	localStorage.removeItem("Password");
	localStorage.removeItem("Username");
	location.reload();
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
						"url":e.backend+"userdata/signup",
						"data":{
							"email":email,
							"password":password,
							"username":username
						},
						"method":"POST",
						"success":function(){
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
}
document.getElementById("receive").onclick=function(){
	var inputCode=document.getElementById("inputCode");
	recvBox1.style.left="500px";
	recvBox0.style.left="0px";
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
addEventListener("message",function(e){
	try{
		login=JSON.parse(atob(e.data));
		backend=login.backend;
		loggedIn();
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
	setTimeout(function(){
		popSend.style.display="none";
	},250);
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
	//显示文件队列
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
				if(file.size>10240000){
					for(var i=0;i<file.size/sliceSize;i++){
						fileSlice.push(file.slice(i*sliceSize,(i+1)*sliceSize));
					}
				}else{
					fileSlice.push(file);
				}
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
										document.getElementById("QRBox").innerHTML="";
										var qrcode=new Image(200,200);
										qrcode.src="https://rthsoftware.cn/backend/get?url="+encodeURIComponent("http://qr.topscan.com/api.php?text=https://www.rthsoftware.net/airportal/?code="+e.code)+"&username=admin";
										document.getElementById("QRBox").appendChild(qrcode);
										var recvCode=document.getElementById("recvCode");
										recvCode.innerHTML=e.code;
										sendBox0.style.left="-500px";
										sendBox1.style.left="0px";
										sendBox2.style.left="500px";
										lblUploadP.innerHTML="上传中...";
									}else{
										//一个文件上传完成，开始上传下一个文件
										setTimeout(function(){
											upload(fileIndex+1);
										},1000);
									}
								}else{
									uploadProgress++;
									var uploadPercentage=uploadProgress/(fileSlice.length-1)*100;
									lblUploadP.innerHTML="上传中 "+Math.round(uploadPercentage)+"%";
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
				uploadSlice();
				if(fileSlice.length>1){
					timer=setInterval(function(){
						time+=100;
						var maxPercentage=1/(fileSlice.length-1)*100;
						var percentagePrediction=maxPercentage*(time/10000);
						if(percentagePrediction>maxPercentage){
							percentagePrediction=maxPercentage;
						}
						lblUploadP.innerHTML = "上传中 "+Math.round(percentagePrediction)+"%";
					},100);
				}
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
if(!isIE){
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
}
if(navigator.language.indexOf("zh")==-1){
	document.getElementById("send").innerText="Send";
	document.getElementById("receive").innerText="Receive";
}
if($_GET["code"]){
	getInfo($_GET["code"]);
}
if(login.username){
	menuLogin.innerHTML="退出登录";
	var newItem=document.createElement("a");
	newItem.className="menuItem";
	ajax({
		"url":backend+"get",
		"data":{
			"url":"userdata/privilege",
			"username":"admin"
		},
		"dataType":"json",
		"success":function(e){
			var expTime=Math.round((e.airportal[login.username]-new Date().getTime()/1000)/86400);
			newItem.innerHTML=login.email+"<p>高级账号 剩余"+expTime+"天</p>"; //.split("@")[0]
		}
	});
	menu.style.height="183px";
	menu.insertBefore(newItem,menu.firstChild);
	switch(backend){
		case cnBackend:
		tickCnServer.style.opacity="1";
		break;
		case usBackend:
		tickUsServer.style.opacity="1";
		break;
	}
	if(login.password){
		ajax({
			"url":backend+"userdata/verify",
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
}else{
	popLogin.src="https://rthsoftware.cn/login";
}
