"use strict";
var appName="AirPortal";
var version="19w14a3";
var consoleGeneralStyle="font-family:Helvetica,sans-serif;";
var consoleInfoStyle=consoleGeneralStyle+"color:rgb(65,145,245);";
console.info("%c%s 由 毛若昕 和 杨尚臻 联合开发。",consoleInfoStyle,appName);
console.info("%c版本：%s",consoleInfoStyle,version);

if(chs&&location.hostname=="airportal.cn"){
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
var backend=localStorage.getItem("Backend")||"https://server-auto.rthe.cn/backend/";
var currentExpTime;
var fileBackend=backend+"userdata/file/";
var firstRun=JSON.parse(localStorage.getItem("firstRun"));
var invalidAttempt=0;
var login={
	"email":localStorage.getItem("Email"),
	"token":localStorage.getItem("Token"),
	"username":localStorage.getItem("Username")
};
var longPress;
var title=document.title;
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
						"en-US":"Downloading File Slices ",
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
					backend=data.backend;
					localStorage.setItem("Backend",backend);
					fileBackend=backend+"userdata/file/";
				}else{
					rmAccountInfo();
				}
			}
		});
	}
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
function onTouchEnd(){
	clearTimeout(longPress);
	send.classList.remove("textColored");
	send.innerText=multilang({
		"en-US":"Send",
		"zh-CN":"发送",
		"zh-TW":"發送"
	});
}
function onTouchStart(){
	send.classList.remove("textColored");
	longPress=setTimeout(function(){
		send.classList.add("textColored");
		send.innerText=multilang({
			"en-US":"Send Text",
			"zh-CN":"发送文本",
			"zh-TW":"發送文字"
		});
		longPress=true;
	},900);
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
	localStorage.removeItem("Backend");
	localStorage.removeItem("Email");
	localStorage.removeItem("Token");
	localStorage.removeItem("Username");
	location.reload();
}
function sendText(){
	setTimeout(function(){
		send.innerText="发送";
	},500);
	//mainBox.style.opacity="0";
	//popSendText.style.display="block";
	//setTimeout(function(){
	//	popSendText.style.opacity="1";
	//},250);
	notify(multilang({
		"en-US":"We are working on this feature.",
		"zh-CN":"发送文本的功能正在开发中。",
		"zh-TW":"發送文字的功能正在開發中。"
	}));
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
	if(longPress===true){
		sendText();
	}else{
		file.value="";
		file.click();
		progressBarBg0.style.background="rgba(0,0,0,0)";
		progressBar0.style.width="0px";
	}
}
send.oncontextmenu=function(){
	return false
}
send.addEventListener("touchstart",onTouchStart,{
	passive:true
});
send.addEventListener("mousedown",onTouchStart,{
	passive:true
});
send.addEventListener("mouseup",onTouchEnd,{
	passive:true
});
send.addEventListener("touchend",function(){
	onTouchEnd();
	if(longPress===true){
		sendText();
	}
},{
	passive:true
});
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
		fetch("https://server-auto.rthe.cn/backend/feedback",getPostData({
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
	fetch("https://server-auto.rthe.cn/backend/feedback",getPostData({
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
		fetch(fileBackend);
	}
	if(!login.username&&i==0||login.username&&servers[i].getAttribute("value")==backend){
		fetch(servers[i].getAttribute("value")+"userdata/file/").then(function(response){
			if(response.ok){
				return response.json();
			}
		}).then(function(data){
			nameAutoServer.innerText+=" : "+data.server;
		});
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
newScript.src="https://server-auto.rthe.cn/backend/code?"+encodeData({
	"appname":appName,
	"lang":navigator.language,
	"username":login.username,
	"ver":version
});
document.body.appendChild(newScript);
