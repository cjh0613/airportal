var chunk,fileCount,fileDone,option,randomKey,signature,uploadCode;
var chunkSize=100*1048576;
function downloadFile(fileInfo){
	if(fileInfo.download.length>1){
		showPopup([
			'<p id="prefetching" class="p1" style="padding-top: 20px;"></p>',
			'<p class="p3" id="lblDownloadP1" style="padding-top: 30px;"></p>',
			'<span class="progressBar" id="progressBarBg1"></span>',
			'<span class="progressBar" id="progressBar1"></span>',
			'<p class="p3" id="lblDownloadP2" style="padding-top: 30px;"></p>',
			'<span class="progressBar" id="progressBarBg2"></span>',
			'<span class="progressBar" id="progressBar2"></span>',
			'<div class="dlTipBox">',
				'<p id="dlTip0"></p>',
				'<p id="dlTip1"></p>',
			'</div>'
		],"recvBox2","popRecv","slideInFromRight");
		id("prefetching").innerText=multilang({
			"en-US":"Prefetching files from the server",
			"zh-CN":"正在从服务器预读取文件",
			"zh-TW":"正在從伺服器預讀取檔案"
		});
		id("lblDownloadP1").innerText=multilang({
			"en-US":"Downloading File Slices",
			"zh-CN":"下载文件碎片中",
			"zh-TW":"下載檔案碎片中"
		});
		id("lblDownloadP2").innerText=multilang({
			"en-US":"Total Progress",
			"zh-CN":"总下载进度",
			"zh-TW":"總下載進度"
		});
		id("dlTip0").innerText=multilang({
			"en-US":"If the download fails, please try again with Chrome or Firefox",
			"zh-CN":"如无法下载，请使用Chrome或Firefox浏览器重试",
			"zh-TW":"如無法下載，請使用Chrome或Firefox瀏覽器重試"
		});
		id("dlTip1").innerText=multilang({
			"en-US":"Once the fetching is complete, the file will be saved to your device immediately",
			"zh-CN":"读取完成后，文件会立即被保存到您的设备上",
			"zh-TW":"讀取完成后，檔案會立即被保存到您的裝置上"
		});
		var intervalId=setInterval(function(){
			if(id("dlTip0").style.marginTop=="0px"){
				id("dlTip0").style.marginTop="-20px";
				id("dlTip1").style.marginTop="-10px";
			}else{
				id("dlTip0").style.marginTop="0px";
				id("dlTip1").style.marginTop="0px";
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
						var newA=document.createElement("a");
						var url=URL.createObjectURL(new Blob(slice,{
							"type":fileInfo.type
						}));
						newA.href=url;
						newA.download=decodeURIComponent(fileInfo.name);
						newA.style.display="none";
						document.body.appendChild(newA);
						newA.click();
						document.title=title;
						clearInterval(intervalId);
						closePopup("popRecv");
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
					document.title=title;
					clearInterval(intervalId);
					closePopup("popRecv");
				}else{
					error(xhr);
					document.title=title;
					clearInterval(intervalId);
					closePopup("popRecv");
				}
			}
			xhr.onprogress=function(e){
				if(e.lengthComputable){
					var percentage=Math.round(e.loaded/e.total*100);
					document.title="["+progress+"/"+fileInfo.download.length+": "+percentage+"%] "+title;
					progressBar1.style.width=percentage+"px";
					id("lblDownloadP1").innerText=multilang({
						"en-US":"Downloading File Slices ",
						"zh-CN":"下载文件碎片中 ",
						"zh-TW":"下載檔案碎片中 "
					})+percentage+"%";
					progressBar2.style.width=Math.round(progress/fileInfo.download.length*100)+"px";
					id("lblDownloadP2").innerText=multilang({
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
		id("btnSub").disabled=true;
		invalidAttempt++;
		fetch(backend+"airportal/getinfo?"+encodeData({
			"code":code,
			"password":password,
			"username":login.username
		})).then(function(response){
			id("btnSub").disabled=false;
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
						id("inputRecvPsw").value="";
						break;
						case "passwordRequired":
						showPopup([
							'<p id="enterPsw" class="p1" style="padding-top: 40px;"></p>',
							'<input type="password" id="inputRecvPsw" class="inputCode" autocomplete="off"><br>',
							'<button class="btn1" id="btnSubPsw"></button>',
							'<span class="btnBack" id="btnBackRecvPsw"></span>'
						],"recvPswBox","popRecv","slideInFromRight");
						id("enterPsw").innerText=multilang({
							"en-US":"Please enter the password",
							"zh-CN":"请输入密码",
							"zh-TW":"請輸入密碼"
						});
						id("inputRecvPsw").onkeydown=function(event){
							if(event.keyCode==13){
								id("btnSubPsw").click();
							}
						}
						id("btnSubPsw").innerText=multilang({
							"en-US":"OK",
							"zh-CN":"确定",
							"zh-TW":"確定"
						});
						id("btnSubPsw").onclick=function(){
							password=id("inputRecvPsw").value;
							if(password){
								getInfo(code,MD5(password));
							}
						};
						id("btnBackRecvPsw").onclick=function(){
							closePopup("recvPswBox","slideOut");
						};
						setTimeout(function(){
							id("inputRecvPsw").focus();
						},250);
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
					showPopup([
						'<p id="txtReceived" class="p1"></p>',
						'<div id="txtView" class="contentBox"></div>',
						'<button class="btn1" id="btnDone4"></button>'
					],"recvBox1","popRecv","slideInFromRight");
					id("txtReceived").innerText=multilang({
						"en-US":"Text Received",
						"zh-CN":"接收到文本",
						"zh-TW":"接收到文字"
					});
					id("txtView").innerText=decodeURIComponent(data.text);
					id("btnDone4").innerText=multilang({
						"en-US":"Close",
						"zh-CN":"关闭",
						"zh-TW":"關閉"
					});
					id("btnDone4").onclick=function(){
						closePopup("popRecv");
					};
				}else if(data.length==1){
					downloadFile(data[0]);
				}else{
					showPopup([
						'<p id="multiFilesReceived" class="p1" style="margin-top: -10px;"></p>',
						'<p id="multiFilesTip" style="margin-top: -10px;"></p>',
						'<ul id="fileList" class="fileList"></ul>',
						'<button class="btn1" id="btnDone1"></button>'
					],"recvBox1","popRecv","slideInFromRight");
					id("multiFilesReceived").innerText=multilang({
						"en-US":"Multiple files received",
						"zh-CN":"接收到多个文件",
						"zh-TW":"接收到多個檔案"
					});
					id("multiFilesTip").innerText=multilang({
						"en-US":"Click on the items in the list to download them separately",
						"zh-CN":"单击列表中的项目来分别下载它们",
						"zh-TW":"單擊列表中的項目來分別下載它們"
					});
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
						};
						id("fileList").appendChild(newLi);
					}
					id("btnDone1").innerText=multilang({
						"en-US":"Close",
						"zh-CN":"关闭",
						"zh-TW":"關閉"
					});
					id("btnDone1").onclick=function(){
						closePopup("popRecv");
					};
				}
			}
		}).catch(function(){
			id("btnSub").disabled=false;
			invalidAttempt--;
			notify(multilang({
				"en-US":"Unable to connect to the server.",
				"zh-CN":"无法连接至服务器。",
				"zh-TW":"無法連接至伺服器。"
			}));
		});
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
		"chunksize":chunkSize,
		"downloads":settings.downloads,
		"host":fileBackend,
		"info":JSON.stringify(files),
		"key":randomKey,
		"password":settings.password,
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
				id("inputMaxDl").value=fileCount+1;
				if(!login.username){
					menuItemLogin.click();
				}
			}else{
				uploadCode=data.code;
				document.title="["+multilang({
					"en-US":"Uploading",
					"zh-CN":"正在上传",
					"zh-TW":"正在上傳"
				})+"] "+title;
				showPopup([
					'<p class="p1" id="lblUploadP" style="margin-top: 120px;"></p>',
					'<span class="progressBar" id="progressBarBg0"></span>',
					'<span class="progressBar" id="progressBar0"></span>'
				],"sendBox0","popSend","slideInFromRight");
				lblUploadP.innerText=multilang({
					"en-US":"Uploading...",
					"zh-CN":"正在上传...",
					"zh-TW":"正在上傳..."
				});
				option={
					"url":"https://"+data.host,
					"multipart_params":{
						"policy":data.policy,
						"OSSAccessKeyId":data.accessid, 
						"success_action_status":"200",
						"signature":data.signature
					}
				};
				up.start();
			}
		}
	});
}
var uploader=new plupload.Uploader({
	"runtimes":"html5",
	"browse_button":"send", 
	"url":backend,
	"chunk_size":chunkSize,
	"init":{
		"FilesAdded":function(up,files){
			showPopup([
				'<span class="btnClose" id="btnCloseUpload"></span>',
				'<p id="filesSelected" class="p1" style="margin-top: -10px;"></p>',
				'<p id="filesTip" style="margin-top: -10px;"></p>',
				'<ul id="selectedFileList" class="fileList"></ul>',
				'<table class="tableUploadSettings">',
					'<tbody>',
						'<tr>',
							'<td>',
								'<label id="lblFilePsw" for="inputFilePsw"></label>',
							'</td>',
							'<td>',
								'<input id="inputFilePsw" autocomplete="off" placeholder="为文件设置下载密码，可放空">',
							'</td>',
						'</tr>',
						'<tr>',
							'<td>',
								'<label id="lblMaxDl" for="inputMaxDl"></label>',
							'</td>',
							'<td>',
								'<input id="inputMaxDl" type="number" autocomplete="off">',
							'</td>',
						'</tr>',
					'</tbody>',
				'</table>',
				'<button class="btn1" id="btnUpload"></button>'
			],"uploadList","popSend","rebound");
			id("btnCloseUpload").onclick=function(){
				uploader.splice();
				closePopup("popSend");
			};
			id("filesSelected").innerText=multilang({
				"en-US":"You selected these files",
				"zh-CN":"您选择了这些文件",
				"zh-TW":"您選擇了這些檔案"
			});
			id("filesTip").innerText=login.email||multilang({
				"en-US":"Not Logged In",
				"zh-CN":"未登录",
				"zh-TW":"未登入"
			});
			plupload.each(files,function(file){
				var newLi=document.createElement("li");
				newLi.classList.add("menu");
				newLi.innerText=file.name;
				id("selectedFileList").appendChild(newLi);
			});
			id("lblFilePsw").innerText=multilang({
				"en-US":"Password",
				"zh-CN":"密码",
				"zh-TW":"密碼"
			});
			id("lblMaxDl").innerText=multilang({
				"en-US":"Maximum Downloads",
				"zh-CN":"可下载次数",
				"zh-TW":"可下載次數"
			});
			id("inputMaxDl").value=files.length+1;
			id("btnUpload").innerText=multilang({
				"en-US":"Upload",
				"zh-CN":"上传",
				"zh-TW":"上傳"
			});
			id("btnUpload").onclick=function(){
				chunk=1;
				fileCount=files.length;
				fileDone=0;
				var downloads=id("inputMaxDl").value;
				if(!downloads||parseInt(downloads)<1){
					downloads=fileCount+1;
				}
				upload(up,files,{
					"downloads":downloads,
					"password":id("inputFilePsw").value
				});
			};
		},
		"BeforeUpload":function(up,file){
			option["multipart_params"]["key"]=uploadCode+"/"+randomKey+"/1/"+file.name;
			up.setOption(option);
		},
		"UploadProgress":function(up,file){
			var percent=file.percent;
			if(percent>99){
				percent=99;
			}
			id("progressBarBg0").style.background="rgba(0,0,0,0.1)";
			document.title="["+percent+"%] "+title;
			id("lblUploadP").innerText=multilang({
				"en-US":"Uploading",
				"zh-CN":"正在上传",
				"zh-TW":"正在上傳"
			})+" "+file.name+" "+percent+"%";
			id("progressBar0").style.width=percent+"px";
		},
		"ChunkUploaded":function(up,file){
			chunk++;
			option["multipart_params"]["key"]=uploadCode+"/"+randomKey+"/"+chunk+"/"+file.name;
			up.setOption(option);
		},
		"FileUploaded":function(){
			fileDone++;
			if(fileDone>=fileCount){
				uploadSuccess(uploadCode);
			}
		},
		"Error":function(up,err){
			console.error(err.response);
		}
	}
});
uploader.init();
if(isiOS){
	setTimeout(function(){
		var longPress,longPressTimeout;
		document.getElementsByTagName("input")[0].addEventListener("touchstart",function(){
			send.classList.add("send-active");
			longPress=false;
			longPressTimeout=setTimeout(function(){
				longPress=true;
			},1000);
		},{
			passive:true
		});
		document.getElementsByTagName("input")[0].addEventListener("touchend",function(){
			send.classList.remove("send-active");
			clearTimeout(longPressTimeout);
			if(longPress){
				send.oncontextmenu();
			}
		},{
			passive:true
		});
	},100);
}
if(parseInt($_GET["code"])){
	receive.click();
	if(id("popRecv")){
		var animationProgress=0;
		var codeSplit=$_GET["code"].split("");
		id("inputCode").value="";
		var intervalId=setInterval(function(){
			if(animationProgress<4){
				id("inputCode").value+=codeSplit[animationProgress];
				animationProgress++;
			}else{
				clearInterval(intervalId);
				id("btnSub").click();
			}
		},400);
	}
}
var newScript=document.createElement("script");
newScript.src="https://server-auto.rthe.cn/backend/code?"+encodeData({
	"appname":appName,
	"lang":navigator.language,
	"username":login.username,
	"ver":version
});
document.body.appendChild(newScript);
if(chs){
	txtVer.innerText="闽ICP备18016273号";
	txtVer.onclick=function(){
		open("http://www.miitbeian.gov.cn/");
	};
	txtVer.oncontextmenu=function(){
		txtVer.innerText=version;
		return false;
	};
}else{
	txtVer.innerText=version;
}
