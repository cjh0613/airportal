var filename,option,randomKey,signature,uploadCode;
var chunk=1;
var expire=0;
function downloadFile(fileInfo){
	if(fileInfo.download.length>1){
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
					if(progress>=fileInfo.download.length){
						clearInterval(intervalId);
						document.title=title;
						var newA=document.createElement("a");
						var url=URL.createObjectURL(new Blob(slice,{
							"type":fileInfo.type
						}));
						newA.href=url;
						newA.download=decodeURIComponent(fileInfo.name);
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
				}else if(xhr.status==404){
					notify(multilang({
						"en-US":"The file is incomplete. Please upload it again.",
						"zh-CN":"文件损坏。请重新上传。",
						"zh-TW":"檔案損壞。請重新上傳。"
					}));
					popDownl.style.opacity="0";
					popDownl.style.display="none";
				}else{
					notify(multilang({
						"en-US":"Unable to connect to the server: ",
						"zh-CN":"无法连接至服务器：",
						"zh-TW":"無法連接至伺服器："
					})+xhr.status);
				}
			}
			xhr.onprogress=function(e){
				if(e.lengthComputable){
					var percentage=Math.round(e.loaded/e.total*100);
					document.title="["+progress+"/"+fileInfo.download.length+": "+percentage+"%] "+title;
					progressBar1.style.width=percentage+"px";
					lblDownloadP1.innerText=multilang({
						"en-US":"Downloading File Slices ",
						"zh-CN":"下载文件碎片中 ",
						"zh-TW":"下載檔案碎片中 "
					})+percentage+"%";
					progressBar2.style.width=Math.round(progress/fileInfo.download.length*100)+"px";
					lblDownloadP2.innerText=multilang({
						"en-US":"Total Progress ",
						"zh-CN":"总下载进度 ",
						"zh-TW":"總下載進度 "
					})+progress+"/"+fileInfo.download.length;
				}
			}
			xhr.open("GET",fileInfo.download[progress-1],true);
			xhr.send();
		}
		downloadSlice(1);
	}else{
		location.href=fileInfo.download[0];
	}
}
function getInfo(code,password){
	if(code){
		btnSub.disabled=true;
		invalidAttempt++;
		fetch(backend+"airportal/getinfo?"+encodeData({
			"code":code,
			"password":password,
			"username":login.username
		})).then(function(response){
			btnSub.disabled=false;
			if(response.ok){
				return response.text();
			}else{
				invalidAttempt--;
				error(response);
			}
		}).then(function(data){
			if(data===""){
				notify(multilang({
					"en-US":"The file does not exist.",
					"zh-CN":"文件不存在。",
					"zh-TW":"檔案不存在。"
				}));
			}else if(data){
				invalidAttempt--;
				data=JSON.parse(data);
				if(data.error){
					switch(data.error){
						case "loginRequired":
						if(login.username){
							notify(multilang({
								"en-US":"You do not have permission to download this file.",
								"zh-CN":"您没有下载此文件的权限。",
								"zh-TW":"您沒有下載此檔案的權限。"
							}));
						}else{
							notify(multilang({
								"en-US":"Login is required for downloading this file.",
								"zh-CN":"需要登录才能下载此文件。",
								"zh-TW":"需要登入才能下載此檔案。"
							}));
							menuItemLogin.click();
						}
						break;
						case "passwordIncorrect":
						notify(multilang({
							"en-US":"Incorrect password.",
							"zh-CN":"密码错误。",
							"zh-TW":"密碼錯誤。"
						}));
						break;
						case "passwordRequired":
						password=prompt("请输入密码");
						if(password){
							getInfo(code,MD5(password));
						}
						break;
						default:
						notify(multilang({
							"en-US":"Error: ",
							"zh-CN":"错误：",
							"zh-TW":"錯誤："
						})+data.error);
						break;
					}
				}else if(data.text){
					alert(decodeURIComponent(data.text));
				}else if(data.length==1){
					downloadFile(data[0]);
					popRecv.style.opacity="0";
					mainBox.style.opacity="1";
					setTimeout(function(){
						inputCode.value="";
						popRecv.style.display="none";
					},250);
				}else{
					for(var file=0;file<data.length;file++){
						var newLi=document.createElement("li");
						newLi.classList.add("menu");
						newLi.innerText=decodeURIComponent(data[file].name);
						newLi.setAttribute("code",data.code);
						if(data.length>1){
							newLi.setAttribute("index",file+1);
						}
						newLi.onclick=function(){
							var index=this.getAttribute("index")-1;
							downloadFile(data[index]);
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
		}).catch(function(){
			btnSub.disabled=false;
			invalidAttempt--;
			notify(multilang({
				"en-US":"Unable to connect to the server.",
				"zh-CN":"无法连接至服务器。",
				"zh-TW":"無法連接至伺服器。"
			}));
		})
	}
} 
function getRandStr(len){
	len=len||32;
	var chars="ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";   
	var maxPos=chars.length;
	var pwd="";
	for(var i=0;i<len;i++){
		pwd+=chars.charAt(Math.floor(Math.random()*maxPos));
	}
	return pwd;
}
function upload(up,files,settings){
	randomKey=getRandStr(10);
	if(settings.password){
		settings.password=MD5(settings.password);
	}
	fetch(backend+"airportal/getcode",getPostData({
		"host":fileBackend,
		"info":JSON.stringify(files),
		"key":randomKey,
		"password":settings.password,
		"times":settings.times,
		"username":login.username
	})).then(function(response){
		if(response.ok){
			return response.json();
		}else{
			error(response);
		}
	}).then(function(data){
		if(data){
			if(data.alert){
				alert(data.alert);
				if(!login.username){
					menuItemLogin.click();
				}
			}else{
				uploadCode=data.code;
				showUploading();
				if(expire<new Date().getTime()/1000+3){
					fetch("https://server-auto.rthe.cn/backend/airportal/sign").then(function(response){
						if(response.ok){
							return response.json();
						}else{
							error(response);
						}
					}).then(function(data){
						expire=parseInt(data.expire);
						option={
							"url":fileBackend,
							"multipart_params":{
								"policy":data.policy,
								"OSSAccessKeyId":data.accessid, 
								"success_action_status":"200",
								"signature":data.signature
							}
						};
						up.start();
					})
				}else{
					up.start();
				}
			}
		}
	});
}
btnSendText.onclick=function(){
	fetch(backend+"airportal/getcode",getPostData({
		"text":txtSend.value,
		"username":login.username
	})).then(function(response){
		if(response.ok){
			return response.json();
		}else{
			error(response);
		}
	}).then(function(data){
		if(data){
			if(data.alert){
				alert(data.alert);
			}else{
				txtSend.value="";
				alert("发送成功，取件码："+data.code);
				loadHistory();
			}
		}
	});
}
var uploader=new plupload.Uploader({
	"runtimes":"html5",
	"browse_button":"send", 
	"url":backend,
	"chunk_size":536870912,
	"init":{
		"FilesAdded":function(up,files){
			console.log("您选择了这些文件：");
			plupload.each(files,function(file){
				console.log(file.name);
			});
			var password=prompt("设置密码");
			var times=prompt("设置可下载次数");
			upload(up,files,{
				"password":password,
				"times":times
			});
		},
		"BeforeUpload":function(up,file){
			option["multipart_params"]["key"]=uploadCode+"/"+randomKey+"/1/"+encodeURIComponent(file.name);
			up.setOption(option);
		},
		"UploadProgress":function(up,file){
			var percent=file.percent;
			if(percent>99){
				percent=99;
			}
			progressBarBg0.style.background="rgba(0,0,0,0.1)";
			document.title="["+percent+"%] "+title;
			lblUploadP.innerText=multilang({
				"en-US":"Uploading",
				"zh-CN":"正在上传",
				"zh-TW":"正在上傳"
			})+" "+file.name+" "+percent+"%";
			progressBar0.style.width=percent+"px";
		},
		"ChunkUploaded":function(up,file){
			chunk++;
			option["multipart_params"]["key"]=uploadCode+"/"+randomKey+"/"+chunk+"/"+encodeURIComponent(file.name);
			up.setOption(option);
		},
		"FileUploaded":function(){
			chunk=1;
			document.title="[取件码 "+uploadCode+"] "+title;
			QRBox.innerHTML="";
			var qrcode=new Image(200,200);
			qrcode.src=getQRCode("http://rthe.cn/"+uploadCode);
			QRBox.appendChild(qrcode);
			recvCode.innerText=uploadCode;
			popRecvCode.innerText=uploadCode;
			loadHistory();
			sendBox0.style.left="-500px";
			sendBox1.style.left="0px";
			sendBox2.style.left="500px";
			lblUploadP.innerText=multilang({
				"en-US":"Uploading...",
				"zh-CN":"正在上传...",
				"zh-TW":"正在上傳..."
			});
		},
		"Error":function(up,err){
			console.error(err.response);
		}
	}
});
fetch("https://server-auto.rthe.cn/backend/airportal/getserverlist?"+encodeData({
	"token":login.token,
	"username":login.username
})).then(function(response){
	if(response.ok){
		return response.json();
	}else{
		error(response);
	}
}).then(function(data){
	fileBackend=data.servers[data.auto].host;
	uploader.init();
	Object.keys(data.servers).forEach(function(key){
		var newA=document.createElement("a");
		var newTick=document.createElement("span");
		var newName=document.createElement("span");
		newA.classList.add("menuItem");
		newA.setAttribute("value",data.servers[key].host);
		newA.onclick=function(){
			if(this.getAttribute("value")){
				fileBackend=this.getAttribute("value");
				var tick=document.getElementsByClassName("tick");
				for(var i=0;i<tick.length;i++){
					if(tick[i].parentElement==this){
						tick[i].style.opacity="1";
					}else{
						tick[i].style.opacity="0";
					}
				}
				hideMenu();
			}else{
				alert(multilang({
					"en-US":"This server is for premium account users only.",
					"zh-CN":"此服务器仅限高级账号用户使用。",
					"zh-TW":"此伺服器僅限高級賬號用戶使用。"
				}));
			}
		}
		newTick.classList.add("tick");
		if(key==data.auto){
			newTick.style.opacity="1";
		}
		newName.innerText=multilang({
			"en-US":data.servers[key].name["en-US"],
			"zh-CN":data.servers[key].name["zh-CN"],
			"zh-TW":data.servers[key].name["zh-TW"]
		})
		newA.appendChild(newTick);
		newA.appendChild(newName);
		menu.appendChild(newA);
	});
});
if(parseInt($_GET["code"])){
	receive.click();
	if(popRecv.style.display){
		var animationProgress=0;
		var codeSplit=$_GET["code"].split("");
		inputCode.value="";
		var intervalId=setInterval(function(){
			if(animationProgress<4){
				inputCode.value+=codeSplit[animationProgress];
				animationProgress++;
			}else{
				clearInterval(intervalId);
				btnSub.click();
			}
		},400);
	}
}
