"use strict";
var appName="AirPortal";
var version="19w11c";
var consoleGeneralStyle="font-family:Helvetica,sans-serif;";
var consoleInfoStyle=consoleGeneralStyle+"color:rgb(65,145,245);";
console.info("%c%s 由 毛若昕 和 杨尚臻 联合开发。",consoleInfoStyle,appName);
console.info("%c版本：%s",consoleInfoStyle,version);

if(navigator.language=="zh-CN"&&(location.hostname=="rthsoftware.cn"||location.hostname=="www.rthsoftware.cn")){
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
var backend=localStorage.getItem("Backend")||"https://cdn.rthsoftware.cn/backend/";
var currentExpTime;
var fileBackend=backend+"userdata/file/";
var invalidAttempt=0;
var login={
	"email":localStorage.getItem("Email"),
	"token":localStorage.getItem("Token"),
	"username":localStorage.getItem("Username")
};
var title=document.title;
var firstRun=JSON.parse(localStorage.getItem("firstRun"));
if(!firstRun||firstRun[version]==undefined){
	firstRun={};
}
if(firstRun[version]!=false){
	firstRun[version]=false;
	localStorage.setItem("firstRun",JSON.stringify(firstRun));
	firstRun=true;
}
function addHistory(filename,code){
	var newHistory=document.createElement("span");
	var newP=document.createElement("p");
	var newDelBtn=document.createElement("span");
	newHistory.className="historyItem";
	newHistory.innerText=code;
	newP.innerText=filename;
	newDelBtn.className="btnDel";
	newDelBtn.title=multilang({
		"en-US":"Delete",
		"zh-CN":"删除",
		"zh-TW":"刪除"
	});
	newDelBtn.onclick=function(){
		if(confirm(multilang({
			"en-US":"Are you sure that you want to delete "+filename+" from the server?",
			"zh-CN":"确定要删除存储在服务器上的 "+filename+" 吗？",
			"zh-TW":"確定要刪除存儲在伺服器上的 "+filename+" 嗎？"
		}))){
			fetch(fileBackend+"del",getPostData({
				"code":code,
				"username":login.username
			})).then(function(response){
				if(response.ok){
					notify(multilang({
						"en-US":"Deleted successfully.",
						"zh-CN":"删除成功。",
						"zh-TW":"刪除成功。"
					}));
					historyList.removeChild(newHistory);
				}else{
					notify(multilang({
						"en-US":"Unable to connect to the server: ",
						"zh-CN":"无法连接至服务器：",
						"zh-TW":"無法連接至伺服器："
					})+response.status);
				}
			});
		}
	}
	newHistory.appendChild(newP);
	newHistory.appendChild(newDelBtn);
	historyList.insertBefore(newHistory,historyList.firstChild);
	lblEmpty.style.display="none";
	historyList.style.marginTop="-10px";
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
					document.title="["+progress+"/"+fileInfo.slice+": "+percentage+"%] "+title;
					progressBar1.style.width=percentage+"px";
					lblDownloadP1.innerText=multilang({
						"en-US":"Downloading file slices ",
						"zh-CN":"下载文件碎片中 ",
						"zh-TW":"下載檔案碎片中 "
					})+percentage+"%";
					progressBar2.style.width=Math.round(progress/fileInfo.slice*100)+"px";
					lblDownloadP2.innerText=multilang({
						"en-US":"Total Progress ",
						"zh-CN":"总下载进度 ",
						"zh-TW":"總下載進度 "
					})+progress+"/"+fileInfo.slice;
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
		btnSub.disabled=true;
		invalidAttempt++;
		fetch(fileBackend+"getinfo?"+encodeData({
			"code":code,
			"username":function(){
				if(login.username){
					return login.username
				}else{
					return "null"
				}
			}()
		})).then(function(response){
			btnSub.disabled=false;
			if(response.ok){
				return response.text();
			}else{
				invalidAttempt--;
				notify(multilang({
					"en-US":"Unable to connect to the server: ",
					"zh-CN":"无法连接至服务器：",
					"zh-TW":"無法連接至伺服器："
				})+response.status);
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
				if(data.download===false){
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
				}else if(data.multifile.length==1){
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
						newLi.innerText=decodeURIComponent(data.multifile[file].name);
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
	return "https://cdn.rthsoftware.cn/backend/get?"+encodeData({
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
function loadPrice(priceInfo){
	window.priceInfo=priceInfo;
	Object.keys(priceInfo).forEach(function(key){
		var newP=document.createElement("p");
		newP.classList.add("p2");
		if(priceInfo[key]["discount"]===true||priceInfo[key]["discount"]<1){
			var newSpan=document.createElement("span");
			newSpan.classList.add("pDel");
			newP.innerText="¥"+priceInfo[key]["specialPrice"];
			newSpan.innerText="¥"+priceInfo[key]["price"];
			newP.appendChild(newSpan);
		}else{
			newP.innerText="¥"+priceInfo[key]["price"];
		}
		document.getElementById("price-"+key).appendChild(newP);
	})
}
function loggedIn(newLogin){
	if(newLogin){
		fileBackend=backend+"userdata/file/";
		localStorage.setItem("Backend",backend);
		localStorage.setItem("Email",login.email);
		localStorage.setItem("Token",login.token);
		localStorage.setItem("Username",login.username);
		mainBox.style.opacity="1";
		popLogin.style.display="none";
		fetch(fileBackend+"get?"+encodeData({
			"token":login.token,
			"username":login.username
		})).then(function(response){
			if(response.ok){
				return response.json();
			}
		}).then(function(data){
			if(data){
				for(var i=0;i<data.length;i++){
					addHistory(decodeURIComponent(data[i].multifile[0].name),data[i].code);
				}
			}
		});
	}
	menuItemLogin.innerText=multilang({
		"en-US":"Log Out",
		"zh-CN":"退出登录",
		"zh-TW":"登出"
	});
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
	newItem.innerText=login.email;
	menu.insertBefore(newItem,menu.firstChild);
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
		var newP=document.createElement("p");
		if(data){
			var expTime=Math.round((data-new Date().getTime()/1000)/86400);
			if(expTime>0){
				currentExpTime=data*1;
				newP.innerText=lblExpTime.innerText=multilang({
					"en-US":"Premium Plan "+expTime+" Days Remaining",
					"zh-CN":"高级账号 剩余"+expTime+"天",
					"zh-TW":"高級賬號 剩餘"+expTime+"天"
				});
			}else{
				newP.innerText=lblExpTime.innerText=multilang({
					"en-US":"Premium Plan Not Activated",
					"zh-CN":"高级账号 未激活",
					"zh-TW":"高級賬號 未激活"
				});
			}
		}else{
			newP.innerText=lblExpTime.innerText=multilang({
				"en-US":"Premium Plan Not Activated",
				"zh-CN":"高级账号 未激活",
				"zh-TW":"高級賬號 未激活"
			});
		}
		newItem.appendChild(newP);
	});
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
	if(!newLogin){
		fetch("https://cdn.rthsoftware.cn/backend/userdata/verify?"+encodeData({
			"token":login.token,
			"username":login.username
		})).then(function(response){
			if(response.ok){
				return response.json();
			}
		}).then(function(data){
			if(data){
				if(data.token){
					backend=data.backend;
					localStorage.setItem("Backend",backend);
					fileBackend=backend+"userdata/file/";
				}else{
					notify(multilang({
						"en-US":"Login session is expired.",
						"zh-CN":"登录会话已过期。",
						"zh-TW":"登入對談已過期。"
					}));
					logOut();
				}
			}
		});
	}
}
function logOut(){
	var ssoIFrame=document.createElement("iframe");
	ssoIFrame.style.display="none";
	ssoIFrame.src="https://rthsoftware.cn/sso?"+encodeData({
		"action":"logout"
	});
	document.body.appendChild(ssoIFrame);
}
function multilang(json){
	if(navigator.language.toLowerCase()=="zh-cn"){
		return json["zh-CN"];
	}else if(navigator.language.indexOf("zh")!=-1){
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
function upload(input){
	var files=[];
	for(var i=0;i<input.target.files.length;i++){
		if(input.target.files[i].name.indexOf(".php")!=-1||input.target.files[i].type=="text/php"){
			notify(multilang({
				"en-US":"Transferring PHP files is not allowed.",
				"zh-CN":"不允许传输 PHP 文件。",
				"zh-TW":"不允許傳輸 PHP 檔案。"
			}));
		}else if(input.target.files[i].size>4294967296){
			notify(multilang({
				"en-US":"Transferring files larger than 4 GB is not allowed.",
				"zh-CN":"不允许传输大于 4 GB 的文件。",
				"zh-TW":"不允許傳輸大於 4 GB 的檔案。"
			}));
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
			lblUploadP.innerText=multilang({
				"en-US":"Uploading...",
				"zh-CN":"上传中...",
				"zh-TW":"上傳中..."
			});
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
					notify(multilang({
						"en-US":"Unable to connect to the server: ",
						"zh-CN":"无法连接至服务器：",
						"zh-TW":"無法連接至伺服器："
					})+response.status);
					document.title=title;
					mainBox.style.opacity="1";
					popSend.style.opacity="0";
					popSend.style.display="none";
				}
			}).then(function(data){
				if(data){
					if(data.error){
						alert(data.error);
						document.title=title;
						mainBox.style.opacity="1";
						popSend.style.opacity="0";
						popSend.style.display="none";
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
					alert(multilang({
						"en-US":"Payment is required for uploading multiple files or large files.",
						"zh-CN":"批量上传和上传大文件需要付费。",
						"zh-TW":"批量上傳和上傳大檔案需要付費。"
					}));
					if(!login.username){
						menuItemLogin.click();
					}
					break;
					default:
					notify(multilang({
						"en-US":"Unable to connect to the server: ",
						"zh-CN":"无法连接至服务器：",
						"zh-TW":"無法連接至伺服器："
					})+response.status);
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
										document.title=title;
										mainBox.style.opacity="1";
										popSend.style.opacity="0";
										popSend.style.display="none";
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
											lblUploadP.innerText=multilang({
												"en-US":"Uploading ",
												"zh-CN":"上传中 ",
												"zh-TW":"上傳中 "
											})+percentage+"%";
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
									alert(multilang({
										"en-US":"Unable to send files larger than 100 MB on this device.",
										"zh-CN":"无法在此设备上发送大于 100 MB 的文件。",
										"zh-TW":"無法在此裝置上發送大於 100 MB 的檔案。"
									}));
									document.title=title;
									mainBox.style.opacity="1";
									popSend.style.opacity="0";
									popSend.style.display="none";
								}
							});
						}
						if(thisFile.size>10240000){
							for(var i=0;i<thisFile.size/sliceSize;i++){
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
if(navigator.language.indexOf("zh")==-1){
	document.getElementsByTagName("html")[0].lang="en-US"
	send.innerText=btnSendFeed.innerText="Send";
	receive.innerText="Receive";
	privacyPolicy.innerText="Privacy Policy";
	footerR.innerHTML="Developed by <a href=\"https://maorx.cn/\" target=\"_blank\" class=\"link1\">Ruoxin Mao</a> and <a href=\"https://yangshangzhen.com/\" target=\"_blank\" class=\"link1\">Shangzhen Yang</a>. All rights reserved.";
	menuItemLogin.innerText="Login";
	menuItemHistory.innerText="History";
	menuItemSettings.innerText="Settings";
	menuItemFeedback.innerText="Contact Us";
	nameAutoServer.innerText="Auto-Select Server";
	nameCnServer.innerText="CN Server";
	nameUsServer.innerText="US Server";
	enterCode.innerText="Please enter the code";
	btnSub.value="OK";
	loginTip.innerText="Log in to AirPortal with Your RTH Account";
	signUp.innerText="Sign Up";
	inputEmail.placeholder="Email";
	inputPsw.placeholder="Password";
	btnLogin.innerText="Login";
	sentSuccessfully.innerText="File is sent successfully.";
	yourCode.innerText="Your Code (Expires in 1 Day):";
	whenReceving.innerText="When receving files, please enter this code.";
	otherWays.innerHTML="You can also <a class=\"link1\" id=\"copyLink\">copy the download link</a> or <a class=\"link1\" id=\"viewQRC\">scan the QR code to download</a>.";
	btnDone0.innerText=btnDone5.innerText="Done";
	titleHistory.innerText="History";
	lblEmpty.innerText="You have not uploaded any files yet";
	btnDone1.innerText=btnDone2.innerText=btnDone4.innerText="Close";
	titleSettings.innerText="Settings";
	labelNeedLogin.innerText="Require my password when receiving my files";
	titleFeedback.innerText="Send us a message";
	txtFeedback.placeholder="If you are not logged in, please leave your email address or other contact information";
	showPrivilege.innerText="Why Premium Plan?";
	titlePrivileges.innerText="Privileges of Premium Plan";
	txtPrivileges.innerText="1. Batch upload;\n2. Upload files larger than 100 MB.";
	multiFilesReceived.innerText="Multiple files received.";
	multiFilesTip.innerText="Click on the items in the list to download them separately.";
	titleUpdate.innerText="We Updated AirPortal";
	lblUploadP.innerText="Uploading...";
	prefetching.innerText="Prefetching files from the server";
	lblDownloadP1.innerText="Downloading File Slices";
	lblDownloadP2.innerText="Total Progress";
	dlTip0.innerText="If the download fails, please try again with Chrome or Firefox";
	dlTip1.innerText="Once the fetching is complete, the file will be saved to your device immediately";
}else if(navigator.language.toLowerCase()!="zh-cn"){
	document.getElementsByTagName("html")[0].lang="zh-TW"
	send.innerText=btnSendFeed.innerText="發送";
	receive.innerText="接收";
	privacyPolicy.innerText="隱私政策";
	footerR.innerHTML="由 <a href=\"https://maorx.cn/\" target=\"_blank\" class=\"link1\">毛若昕</a> 和 <a href=\"https://yangshangzhen.com/\" target=\"_blank\" class=\"link1\">楊尚臻</a> 聯合開發。保留所有權利。";
	menuItemLogin.innerText="登入";
	menuItemHistory.innerText="歷史記錄";
	menuItemSettings.innerText="設定";
	menuItemFeedback.innerText="聯繫我們";
	nameAutoServer.innerText="自動選擇伺服器";
	nameCnServer.innerText="大陸伺服器（更快）";
	nameUsServer.innerText="北美伺服器（更安全）";
	enterCode.innerText="請輸入取件碼";
	btnSub.value="確定";
	loginTip.innerText="使用熱鐵盒賬號來登入到 AirPortal";
	signUp.innerText="註冊";
	inputEmail.placeholder="郵箱";
	inputPsw.placeholder="密碼";
	btnLogin.innerText="登入";
	sentSuccessfully.innerText="檔案已成功傳送。";
	yourCode.innerText="您的取件碼（1天內有效）：";
	whenReceving.innerText="接收檔案時，請輸入該四位數密碼。";
	otherWays.innerHTML="您也可以<a class=\"link1\" id=\"copyLink\">複製下載連結</a>或<a class=\"link1\" id=\"viewQRC\">直接掃描 QR 碼下載</a>。";
	titleHistory.innerText="歷史記錄";
	lblEmpty.innerText="您尚未上傳任何檔案";
	btnDone1.innerText=btnDone2.innerText=btnDone4.innerText="關閉";
	titleSettings.innerText="設定";
	labelNeedLogin.innerText="接收我的檔案時需要登入我的賬號";
	titleFeedback.innerText="向我們發送訊息";
	txtFeedback.placeholder="如果您沒有登入，請留下您的電子郵箱地址或其它聯繫方式";
	showPrivilege.innerText="高級賬號有哪些特權？";
	titlePrivileges.innerText="高級賬號特權";
	txtPrivileges.innerText="1. 批量上傳檔案；\n2. 上傳大於 100 MB 的檔案；\n3. 用最實在的方式表達對我們的愛 _(:з)∠)_";
	multiFilesReceived.innerText="您接收到多個檔案。";
	multiFilesTip.innerText="單擊列表中的項目來分別下載它們。";
	titleUpdate.innerText="我們更新了 AirPortal";
	lblUploadP.innerText="上傳中...";
	prefetching.innerText="正在從伺服器預讀取檔案";
	lblDownloadP1.innerText="下載檔案碎片中";
	lblDownloadP2.innerText="總下載進度";
	dlTip0.innerText="如無法下載，請使用Chrome或Firefox瀏覽器重試";
	dlTip1.innerText="讀取完成后，檔案會立即被保存到您的裝置上";
}
btnLogin.onclick=function(){
	if(inputEmail.value&&inputPsw.value){
		var email=inputEmail.value.toLowerCase();
		var password=MD5(inputPsw.value);
		fetch("https://cdn.rthsoftware.cn/backend/userdata/verify?"+encodeData({
			"email":email,
			"password":password,
			"token":true
		})).then(function(response){
			if(response.ok){
				return response.json();
			}else{
				notify(multilang({
					"en-US":"Unable to connect to the server: ",
					"zh-CN":"无法连接至服务器：",
					"zh-TW":"無法連接至伺服器："
				})+response.status);
			}
		}).then(function(data){
			if(data){
				if(data.index){
					if(data.token){
						backend=data.backend;
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
send.onclick=function(){
	file.value="";
	file.click();
	progressBarBg0.style.background="rgba(0,0,0,0)";
	progressBar0.style.width="0px";
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
			localStorage.removeItem("Backend")
			localStorage.removeItem("Email")
			localStorage.removeItem("Token")
			localStorage.removeItem("Username")
			location.reload();
		}else{
			backend=login.backend;
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
		fetch("https://cdn.rthsoftware.cn/backend/feedback",getPostData({
			"appname":appName,
			"email":login.email,
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
	var action="续期";
	var expTime=currentExpTime;
	if(!expTime){
		action="激活";
		expTime=Math.round(new Date().getTime()/1000);
	}
	switch(pubPayPlan){
		case "一个月":
		expTime=expTime+60*60*24*30*1;
		break;
		case "三个月":
		expTime=expTime+60*60*24*30*3;
		break;
		case "一年":
		expTime=expTime+60*60*24*30*12;
		break;
	}
	fetch("https://cdn.rthsoftware.cn/backend/feedback",getPostData({
		"appname":appName,
		"email":login.email,
		"lang":navigator.language,
		"name":login.username,
		"recipient":"405801769@qq.com",
		"text":"用户通过 "+pubPayMethod+" "+action+"了 "+pubPayPlan+" 的高级账号，将于 "+expTime+" ("+new Date(expTime*1000).toLocaleDateString()+") 到期。",
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
				notify(multilang({
					"en-US":"Unable to connect to the server: ",
					"zh-CN":"无法连接至服务器：",
					"zh-TW":"無法連接至伺服器："
				})+response.status);
			}
		})
	}else{
		this.checked=false;
		menuItemLogin.click();
	}
}
file.onchange=function(input){
	upload(input);
}
var servers=document.getElementsByClassName("server");
for(var i=0;i<servers.length;i++){
	servers[i].onclick=function(){
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
	if(!login.username&&i==0||login.username&&servers[i].getAttribute("value")==backend){
		fetch(servers[i].getAttribute("value")+"userdata/file/").then(function(response){
			if(response.ok){
				return response.json();
			}
		}).then(function(data){
			nameAutoServer.innerText+=" = "+data.server;
		});
	}else{
		fetch(servers[i].getAttribute("value")+"userdata/file/");
	}
}
if($_GET["code"]){
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
fetch(fileBackend+"get?"+encodeData({
	"token":login.token,
	"username":login.username
})).then(function(response){
	if(response.ok){
		return response.json();
	}
}).then(function(data){
	if(data){
		for(var i=0;i<data.length;i++){
			addHistory(decodeURIComponent(data[i].multifile[0].name),data[i].code);
		}
	}
});
if(login.username){
	loggedIn();
}else if(location.hostname!="rthsoftware.cn"){
	var ssoIFrame=document.createElement("iframe");
	ssoIFrame.style.display="none";
	ssoIFrame.src="https://rthsoftware.cn/sso";
	document.body.appendChild(ssoIFrame);
}
if(location.hostname&&"serviceWorker" in navigator){
	navigator.serviceWorker.getRegistrations().then(function(registrations){
		for(var i=0;i<registrations.length;i++){
			if(registrations[i].scope.indexOf("airportal")!=-1){
				registrations[i].unregister();
			}
		}
	})
}
var newScript=document.createElement("script");
newScript.async=true;
newScript.src="https://cdn.rthsoftware.cn/backend/code?"+encodeData({
	"appname":appName,
	"lang":navigator.language,
	"username":login.username,
	"ver":version
});
newScript.onerror=function(){
	document.body.innerHTML="";
	if(!$_GET["code"]){
		alert(multilang({
			"en-US":"Unable to connect to the server.",
			"zh-CN":"无法连接至服务器。",
			"zh-TW":"無法連接至伺服器。"
		}));
	}
}
document.body.appendChild(newScript);
