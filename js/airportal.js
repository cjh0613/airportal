var version="18w43a";
console.info("AirPortal 由 毛若昕 和 杨尚臻 联合开发。");
console.info("版本："+version);
var txtVer=document.getElementById("version");
txtVer.innerHTML=version;

var backend="https://www.rthsoftware.cn/backend/userdata/file/";
var isElectron=/Electron/i.test(navigator.userAgent);
var isIE=/MSIE|Trident/i.test(navigator.userAgent);
var isLocalhost=false;
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
var mainBox=document.getElementById("mainBox");
var sendBox0=document.getElementById("sendBox0");
var sendBox1=document.getElementById("sendBox1");
var sendBox2=document.getElementById("sendBox2");
var popSend=document.getElementById("popSend");
var popRecv=document.getElementById("popRecv");
function downloadFile(code){
	if(code){
		ajax({
			"url":backend+"getinfo.php",
			"data":{
				"code":code
			},
			"dataType":"json",
			"success":function(e){
				location.href=e.download
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
document.getElementById("send").onclick=function(){
	document.getElementById("file").value="";
	document.getElementById("file").click();
}
document.getElementById("receive").onclick=function(){
	var inputCode=document.getElementById("inputCode");
	mainBox.style.opacity="0";
	popRecv.style.display="block";
	setTimeout(function(){
		popRecv.style.opacity="1";
	},250); 
	inputCode.focus();
}
function btnSub(){
	downloadFile(document.getElementById("inputCode").value);
	popRecv.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		document.getElementById("inputCode").value="";
		popRecv.style.display="none";
	},250);
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
function menuItemCnServer(){
	backend="https://www.rthsoftware.cn/backend/userdata/file/";
	tickCnServer.style.opacity="1";
	tickUsServer.style.opacity="0";
	hideMenu()
}
function menuItemUsServer(){
	backend="https://us.rths.tk/backend/userdata/file/";
	tickCnServer.style.opacity="0";
	tickUsServer.style.opacity="1";
	hideMenu()
}
function viewQRC(){
	sendBox1.style.left="-500px";
	sendBox2.style.left="0px";
}
function btnDone(){
	popSend.style.opacity="0";
	mainBox.style.opacity="1";
	setTimeout(function(){
		popSend.style.display="none";
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
document.getElementById("file").onchange=function(e){
	var file=e.target.files[0];
	if(file.type=="text/php"){
		alert("不允许传输的文件类型");
	}else if(file.size>104857600&&!isLocalhost){
		alert("暂不支持传输大于100MB的文件");
	}else if(isLocalhost&&file.size>1073741824){
		alert("暂不支持传输大于1GB的文件");
	}else{
		sendBox0.style.left="0px";
		sendBox1.style.left="500px";
		sendBox2.style.left="1000px";
		mainBox.style.opacity="0";
		popSend.style.display="block";
		setTimeout(function(){
			popSend.style.opacity="1";
		},250);
		ajax({
			"url":backend+"upload.php",
			"data":{
				"file":file,
				"username":login.username
			},
			"dataType":"json",
			"method":"POST",
			"processData":false,
			"success":function(e){
				if(e.error){
					alert(e.error);
				}else{
					document.getElementById("QRBox").innerHTML="";
					var qrcode=new Image(200,200);
					if(isLocalhost){
						qrcode.src="http://qr.topscan.com/api.php?text="+encodeURIComponent("http://"+location.hostname+"/?code="+e.code);
					}else{
						qrcode.src="https://www.rthsoftware.cn/backend/get?url="+encodeURIComponent("http://qr.topscan.com/api.php?text=https://airportal.maorx.cn/?code="+e.code)+"&username=admin";
					}
					document.getElementById("QRBox").appendChild(qrcode);
					var recvCode=document.getElementById("recvCode");
					recvCode.innerHTML=e.code;
					sendBox0.style.left="-500px";
					sendBox1.style.left="0px";
					sendBox2.style.left="500px";
				}
			},
			"error":function(){
				alert("无法连接至服务器");
			}
		});
	}
}
if(!isIE){
	window.onerror=function(msg,url,lineNo){
		if(msg&&url&&lineNo&&msg!="Script error."&&lineNo!=1){
			var text=msg+" at "+url+" : "+lineNo;
			window.onerror=null;
			if(confirm(msg)){
				ajax({
					"url":"https://www.rthsoftware.cn/backend/feedback",
					"data":{
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
var match=location.search.substr(1).match(/(^|&)code=([^&]*)(&|$)/);
if(match){
	downloadFile(unescape(decodeURI(match[2])));
}
if(!location.hostname||location.hostname=="airportal.maorx.cn"){
	ajax({
		"url":"https://us.rths.tk/backend/geo",
		"success":function(e){
			if(e!="CN"){
				backend="https://us.rths.tk/backend/userdata/file/";
				tickCnServer.style.opacity="0";
				tickUsServer.style.opacity="1";
			}
		}
	});
}else{
	ajax({
		"url":"http://"+location.hostname+"/airportal/getinfo.php",
		"dataType":"json",
		"success":function(e){
			if(e.version>=2018092301){
				backend="http://"+location.hostname+"/airportal/";
				isLocalhost=true;
			}else{
				alert("请更新 AirPortal 的后端脚本");
			}
		}
	});
}
