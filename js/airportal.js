var version="18w47b";
console.info("AirPortal 由 毛若昕 和 杨尚臻 联合开发。");
console.info("版本："+version);
var txtVer=document.getElementById("version");
txtVer.innerHTML=version;

var backend="https://www.rthsoftware.cn/backend/userdata/file/";
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
var mainBox=document.getElementById("mainBox");
var sendBox0=document.getElementById("sendBox0");
var sendBox1=document.getElementById("sendBox1");
var sendBox2=document.getElementById("sendBox2");
var popSend=document.getElementById("popSend");
var popRecv=document.getElementById("popRecv");
var lblUploadP=document.getElementById("lblUploadP");
function downloadFile(code){
	if(code){
		ajax({
			"url":backend+"getinfo",
			"data":{
				"code":code
			},
			"dataType":"json",
			"success":function(e){
				if(e.multifile.length==1){
					if(e.multifile[0].type=="text/plain"){
						prompt(e.multifile[0].content);
					}else{
						location.href=e.multifile[0].download;
					}
				}else{
					console.log(e.multifile);
					//显示文件列表
				}
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
			})
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
		"url":backend+"getcode",
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
					fileSlice.push(file)
				}
				var uploadSlice=function(){
					clearInterval(timer);
					ajax({
						"url":backend+"uploadslice",
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
										qrcode.src="https://www.rthsoftware.cn/backend/get?url="+encodeURIComponent("http://qr.topscan.com/api.php?text=https://airportal.maorx.cn/?code="+e.code)+"&username=admin";
										document.getElementById("QRBox").appendChild(qrcode);
										var recvCode=document.getElementById("recvCode");
										recvCode.innerHTML=e.code;
										sendBox0.style.left="-500px";
										sendBox1.style.left="0px";
										sendBox2.style.left="500px";
										lblUploadP.innerHtml = "上传中...";
									}else{
										//一个文件上传完成，开始上传下一个文件
										setTimeout(function(){
											upload(fileIndex+1);
										},1000);
									}
								}else{
									uploadProgress++;
									var uploadPercentage=uploadProgress/(fileSlice.length-1)*100;
									console.log("上传进度："+uploadPercentage+"%");
									lblUploadP.innerHtml = "上传中 "+uploadPercentage+"%"; //更新进度条
									setTimeout(function(){
										uploadSlice();
										passedTime=0;
										progressCalc=setInterval(function(){
											passedTime+=100;
											var maxPercentage=(uploadProgress+1)/(fileSlice.length-1)*100;
											var percentagePrediction=uploadPercentage*(1+passedTime/time);
											if(maxPercentage>100){
												maxPercentage=100
											}
											if(percentagePrediction>maxPercentage){
												percentagePrediction=maxPercentage;
											}
											console.log("上传进度："+percentagePrediction+"%");
											lblUploadP.innerHtml = "上传中 "+percentagePrediction+"%"; //更新进度条
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
						console.log("上传进度："+percentagePrediction+"%");
						lblUploadP.innerHtml = "上传中 "+percentagePrediction+"%"; //更新进度条
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
