function closePopup(elementId,animation){
	switch(animation){
		case "slideOut":
		id(elementId).parentElement.childNodes[id(elementId).parentElement.childElementCount-2].style.left=id(elementId).style.left="";
		break;
		default:
		id(elementId).style.opacity="";
		if(document.getElementsByClassName("popUp").length<=1){
			mainBox.style.opacity="";
		}
		break;
	}
	setTimeout(function(){
		id(elementId).style.display="none";
		id(elementId).parentElement.removeChild(id(elementId));
	},250);
}
function notify(content,duration){
	var newDiv=document.createElement("div");
	newDiv.classList.add("notificationBar");
	if(duration==undefined){
		duration=3000;
	}
	newDiv.innerText=content;
	document.body.appendChild(newDiv);
	setTimeout(function(){
		newDiv.style.bottom="0px";
		setTimeout(function(){
			newDiv.style.bottom="-50px";
			setTimeout(function(){
				newDiv.parentElement.removeChild(newDiv);
			},250);
		},duration);
	},25);
}
function showChangelog(text,firstRunOnly){
	if(firstRun===true||!firstRunOnly){
		showPopup([
			'<p id="titleUpdate" class="p1"></p>',
			'<div id="txtUpdate" class="contentBox"></div>',
			'<button class="btn1" id="btnDone4"></button>'
		],null,"popUpdate","rebound");
		id("titleUpdate").innerText=multilang({
			"en-US":"What's New",
			"zh-CN":"最近更新",
			"zh-TW":"最近更新"
		});
		txtUpdate.innerHTML=text;
		id("btnDone4").innerText=multilang({
			"en-US":"Close",
			"zh-CN":"关闭",
			"zh-TW":"關閉"
		});
		id("btnDone4").onclick=function(){
			closePopup("popUpdate");
		}
	}
}
function showPopup(html,elementId,parentId,animation){
	if(!id(parentId)){
		var newParent=document.createElement("div");
		newParent.classList.add("popUp")
		newParent.id=parentId;
		if(!elementId){
			newParent.innerHTML=html.join("");
		}
		mainBox.style.opacity="0";
		document.body.appendChild(newParent);
		setTimeout(function(){
			newParent.style.opacity="1";
			if(animation=="rebound"){
				newParent.style.transform="scale(1.05)";
			}
		},250);
		if(animation=="rebound"){
			setTimeout(function(){
				newParent.style.transform="";
			},500);
		}
	}
	if(elementId&&!id(elementId)){
		var newDiv=document.createElement("div");
		newDiv.id=elementId;
		newDiv.innerHTML=html.join("");
		switch(animation){
			case "slideInFromLeft":
			newDiv.classList.add("slideInFromLeft");
			id(parentId).appendChild(newDiv);
			setTimeout(function(){
				id(parentId).childNodes[id(parentId).childElementCount-2].style.left="500px";
				newDiv.style.left="0px";
			},25);
			break;
			case "slideInFromRight":
			newDiv.classList.add("slideInFromRight");
			id(parentId).appendChild(newDiv);
			setTimeout(function(){
				id(parentId).childNodes[id(parentId).childElementCount-2].style.left="-500px";
				newDiv.style.left="0px";
			},25);
			break;
			default:
			newDiv.classList.add("popUpBox");
			id(parentId).appendChild(newDiv);
			break;
		}
	}
}
function uploadSuccess(code){
	document.title="[取件码 "+code+"] "+title;
	showPopup([
		'<p id="sentSuccessfully" class="p1"></p>',
		'<p id="yourCode"></p>',
		'<p id="recvCode"></p>',
		'<p id="whenReceving"></p>',
		'<p id="otherWays">'+multilang({
			"en-US":'You can also <a class="link1" id="copyLink">copy the download link</a> or <a class="link1" id="viewQRC">scan the QR code to download</a>.',
			"zh-CN":'您也可以<a class="link1" id="copyLink">复制下载链接</a>或<a class="link1" id="viewQRC">直接扫描二维码下载</a>。',
			"zh-TW":'您也可以<a class="link1" id="copyLink">複製下載連結</a>或<a class="link1" id="viewQRC">直接掃描 QR 碼下載</a>。'
		})+'</p>',
		'<button class="btn1" id="btnDone0"></button>'
	],"sendBox1","popSend","slideInFromRight");
	id("sentSuccessfully").innerText=multilang({
		"en-US":"File is sent successfully.",
		"zh-CN":"文件已成功传送。",
		"zh-TW":"檔案已成功發送。"
	});
	id("yourCode").innerText=multilang({
		"en-US":"Your Code (Expires in 1 Day):",
		"zh-CN":"您的取件码（1天内有效）：",
		"zh-TW":"您的取件碼（1天內有效）："
	});
	id("recvCode").innerText=code;
	id("whenReceving").innerText=multilang({
		"en-US":"When receving files, please enter this code.",
		"zh-CN":"接收文件时，请输入该四位数密码。",
		"zh-TW":"接收檔案時，請輸入該四位數密碼。"
	});
	btnDone0.innerText=multilang({
		"en-US":"Done",
		"zh-CN":"完成",
		"zh-TW":"完成"
	});
	copyLink.onclick=function(){
		var url="https://rthe.cn/"+id("recvCode").innerText;
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
	viewQRC.onclick=function(){
		showPopup([
			'<div id="QRBox"></div>',
			'<span class="btnBack" id="btnBack0"></span>'
		],"sendBox2","popSend","slideInFromRight");
		var qrcode=new Image(200,200);
		qrcode.src=getQRCode("http://rthe.cn/"+code);
		id("QRBox").appendChild(qrcode);
		id("btnBack0").onclick=function(){
			closePopup("sendBox2","slideOut");
		}
	};
	btnDone0.onclick=function(){
		document.title=title;
		closePopup("popSend");
		var popRecvCode=document.createElement("div");
		popRecvCode.classList.add("popRecvCode");
		popRecvCode.innerText=code;
		document.body.appendChild(popRecvCode);
		setTimeout(function(){
			popRecvCode.style.transform="scale(0.5,0.5)";
		},500);
		setTimeout(function(){
			popRecvCode.style.top="0px";
			popRecvCode.style.left="100%";
			popRecvCode.style.marginTop="0px";
			popRecvCode.style.marginLeft="-135px";
		},750);
		setTimeout(function(){
			popRecvCode.style.transformOrigin="65% 50%";
			popRecvCode.style.transform="scale(0,0)";
		},1750);
		setTimeout(function(){
			popRecvCode.style.opacity="0";
			setTimeout(function(){
				popRecvCode.style.display="none";
				popRecvCode.parentElement.removeChild(popRecvCode);
			},250);
		},2250);
	}
}
send.oncontextmenu=function(){
	showPopup([
		'<span class="btnClose" id="btnClose4"></span>',
		'<p id="titleSendText" class="p1">发送文本</p>',
		//'<span class="line"></span>',
		'<textarea id="txtSend" placeholder="在此处键入任意纯文本"></textarea>',
		'<button class="btn1" id="btnSendText">发送</button>'
	],"sendBox0","popSend","rebound");
	id("btnClose4").onclick=function(){
		closePopup("popSend");
	}
	id("btnSendText").onclick=function(){
		var value=id("txtSend").value;
		if(value){
			fetch(backend+"airportal/getcode",getPostData({
				"text":value,
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
						uploadSuccess(data.code);
					}
				}
			});
		}
	}
	id("txtSend").focus();
	return false;
}
receive.onclick=function(){
	if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
		alert("请在浏览器中打开此页面。");
	}else{
		showPopup([
			'<p id="enterCode" class="p1" style="padding-top: 40px;"></p>',
			'<input type="tel" id="inputCode" class="inputCode" maxlength="4" autocomplete="off"><br>',
			'<button class="btn1" id="btnSub"></button>',
			'<span class="btnBack" id="btnBack1"></span>'
		],"recvBox0","popRecv");
		id("enterCode").innerText=multilang({
			"en-US":"Please enter the code",
			"zh-CN":"请输入取件码",
			"zh-TW":"請輸入取件碼"
		});
		id("inputCode").onkeydown=function(event){
			if(event.keyCode==13){
				id("btnSub").click();
			}
		}
		id("btnSub").innerText=multilang({
			"en-US":"OK",
			"zh-CN":"确定",
			"zh-TW":"確定"
		});
		id("btnSub").onclick=function(){
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
		id("btnBack1").onclick=function(){
			closePopup("popRecv");
		}
		id("inputCode").focus();
	}
}
menuItemLogin.onclick=function(){
	if(login.username){
		var ssoIFrame=document.createElement("iframe");
		ssoIFrame.style.display="none";
		ssoIFrame.src="https://rthsoftware.cn/sso.html?"+encodeData({
			"action":"logout"
		});
		document.body.appendChild(ssoIFrame);
	}else{
		showPopup([
			'<span class="btnClose" id="btnClose1"></span>',
			'<div class="loginLogo"></div>',
			'<p class="p4">',
				'<span id="loginTip"></span>',
				'<a id="signUp" href="https://rthsoftware.cn/login.html?continue=https%3A%2F%2Fairportal.cn%2F&amp;page=signup" class="link1"></a>',
			'</p>',
			'<input type="email" name="email" class="input1" id="inputEmail">',
			'<input type="password" name="password" class="input1" id="inputPsw">',
			'<button class="btn1" id="btnLogin"></button>'
		],null,"popLogin");
		id("btnClose1").onclick=function(){
			closePopup("popLogin");
		}
		id("loginTip").innerText=multilang({
			"en-US":"Log in to AirPortal with Your RTH Account",
			"zh-CN":"使用热铁盒账号来登录到 AirPortal",
			"zh-TW":"使用熱鐵盒賬號來登入到 AirPortal"
		});
		id("signUp").innerText=multilang({
			"en-US":"Sign Up",
			"zh-CN":"注册",
			"zh-TW":"註冊"
		});
		id("inputEmail").placeholder=multilang({
			"en-US":"Email",
			"zh-CN":"邮箱",
			"zh-TW":"郵箱"
		});
		id("inputEmail").onkeydown=function(event){
			if(event.keyCode==13&&this.value){
				id("inputPsw").focus();
			}
		}
		id("inputPsw").placeholder=multilang({
			"en-US":"Password",
			"zh-CN":"密码",
			"zh-TW":"密碼"
		});
		id("inputPsw").onkeydown=function(event){
			if(event.keyCode==13){
				btnLogin.click();
			}
		}
		id("btnLogin").innerText=multilang({
			"en-US":"Login",
			"zh-CN":"登录",
			"zh-TW":"登入"
		});
		id("btnLogin").onclick=function(){
			if(id("inputEmail").value&&id("inputPsw").value){
				var email=id("inputEmail").value.toLowerCase();
				var password=MD5(id("inputPsw").value);
				fetch("https://server-auto.rthe.cn/backend/userdata/verify?"+encodeData({
					"email":email,
					"password":password,
					"token":true
				})).then(function(response){
					if(response.ok){
						return response.json();
					}else{
						error(response);
					}
				}).then(function(data){
					if(data){
						if(data.alert){
							alert(data.alert)
						}else if(data.index){
							if(data.token){
								login.email=data.email;
								login.token=data.token;
								login.username=data.username;
								loggedIn(true);
							}else if(confirm(multilang({
								"en-US":"Incorrect password. Do you want to reset the password?",
								"zh-CN":"密码错误。您想重置密码吗？",
								"zh-TW":"密碼錯誤。您想重設密碼嗎？"
							}))){
								location.href="https://rthsoftware.cn/login.html?"+encodeData({
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
	}
	hideMenu();
}
menuItemHistory.onclick=function(){
	showPopup([
		'<p id="titleHistory" class="p1"></p>',
		'<span class="line"></span>',
		'<div id="historyList">',
			'<p id="lblPlaceholder" class="placeholder"></p>',
		'</div>',
		'<button class="btn1" id="btnDoneHistory"></button>'
	],null,"popHistory");
	id("titleHistory").innerText=multilang({
		"en-US":"History",
		"zh-CN":"历史记录",
		"zh-TW":"歷史記錄"
	});
	id("btnDoneHistory").innerText=multilang({
		"en-US":"Close",
		"zh-CN":"关闭",
		"zh-TW":"關閉"
	});
	id("btnDoneHistory").onclick=function(){
		closePopup("popHistory");
	}
	var loadHistory=function(){
		id("historyList").innerHTML="";
		var lblPlaceholder=document.createElement("p");
		lblPlaceholder.classList.add("placeholder");
		id("historyList").appendChild(lblPlaceholder);
		lblPlaceholder.innerText=multilang({
			"en-US":"Loading",
			"zh-CN":"正在加载",
			"zh-TW":"正在加載"
		});
		fetch(backend+"airportal/get?"+encodeData({
			"token":login.token,
			"username":login.username
		})).then(function(response){
			if(response.ok){
				return response.json();
			}else{
				lblPlaceholder.innerText=multilang({
					"en-US":"Unable to connect to the server",
					"zh-CN":"无法连接至服务器",
					"zh-TW":"無法連接至伺服器"
				})+" ("+response.status+")";
			}
		}).then(function(data){
			if(data){
				lblPlaceholder.innerText=multilang({
					"en-US":"You have not uploaded any files yet",
					"zh-CN":"您尚未上传任何文件",
					"zh-TW":"您尚未上傳任何檔案"
				});
				if(data.length>0){
					lblPlaceholder.style.display="none";
					for(var i=data.length-1;i>=0;i--){
						var newHistory=document.createElement("span");
						var newSpan=document.createElement("span");
						var newP=document.createElement("p");
						var newDelBtn=document.createElement("span");
						newHistory.classList.add("historyItem");
						newHistory.setAttribute("code",data[i].code);
						newSpan.innerText=data[i].code;
						newSpan.title=multilang({
							"en-US":"Download",
							"zh-CN":"下载",
							"zh-TW":"下載"
						});
						newSpan.onclick=function(){
							open("https://rthe.cn/"+this.parentElement.getAttribute("code"));
						}
						newP.innerText=decodeURIComponent(data[i].name);
						newDelBtn.classList.add("btnDel");
						newDelBtn.title=multilang({
							"en-US":"Delete",
							"zh-CN":"删除",
							"zh-TW":"刪除"
						});
						newDelBtn.onclick=function(){
							var thisItem=this.parentElement;
							var code=thisItem.getAttribute("code");
							var filename=thisItem.getElementsByTagName("p")[0].innerText;
							if(confirm(multilang({
								"en-US":"Are you sure that you want to delete "+filename+" from the server?",
								"zh-CN":"确定要删除存储在服务器上的 "+filename+" 吗？",
								"zh-TW":"確定要刪除存儲在伺服器上的 "+filename+" 嗎？"
							}))){
								fetch(backend+"airportal/del",getPostData({
									"code":code,
									"username":login.username
								})).then(function(response){
									if(response.ok){
										loadHistory();
									}else{
										error(response);
									}
								});
							}
						}
						newHistory.appendChild(newSpan);
						newHistory.appendChild(newP);
						newHistory.appendChild(newDelBtn);
						id("historyList").appendChild(newHistory);
					}
				}else{
					lblPlaceholder.style.display=id("historyList").style.marginTop="";
				}
			}
		});
	}
	loadHistory();
	hideMenu();
}
menuItemSettings.onclick=function(){
	showPopup([
		'<p id="titleSettings" class="p1"></p>',
		'<span class="line"></span>',
		'<div>',
			'<input type="checkbox" class="cbox" id="inputLoginRequired"></input>',
			'<label id="lblLoginRequired" class="lblCbox" for="inputLoginRequired"></label>',
		'</div>',
		'<button class="btn1" id="btnDone5"></button>'
	],null,"popSettings");
	if(settings["loginRequired"]){
		id("inputLoginRequired").checked=true;
	}
	id("titleSettings").innerText=multilang({
		"en-US":"Settings",
		"zh-CN":"设置",
		"zh-TW":"設定"
	});
	id("lblLoginRequired").innerText=multilang({
		"en-US":"Require my password when receiving my files",
		"zh-CN":"接收我的文件时需要登录我的账号",
		"zh-TW":"接收我的檔案時需要登入我的賬號"
	});
	id("inputLoginRequired").onchange=function(){
		if(login.username){
			settings["loginRequired"]=this.checked;
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
					error(response);
				}
			})
		}else{
			this.checked=false;
			menuItemLogin.click();
		}
	}
	id("btnDone5").innerText=multilang({
		"en-US":"Done",
		"zh-CN":"完成",
		"zh-TW":"完成"
	});
	id("btnDone5").onclick=function(){
		closePopup("popSettings");
	}
	hideMenu();
}
menuItemFeedback.onclick=function(){
	showPopup([
		'<span class="btnClose" id="btnClose3"></span>',
		'<p id="titleFeedback" class="p1"></p>',
		'<span class="line"></span>',
		'<a id="faq" class="link1" href="https://rthe.cn/faq-ap" target="_blank"></a>&amp;<a id="qqGroup" class="link1" href="https://shang.qq.com/wpa/qunwpa?idkey=846414dde5b85a4ac77be8d6e63029d9abea174e571b52d45e4840257f5cb850" target="_blank"></a>',
		'<textarea id="txtFeedback"></textarea>',
		'<button class="btn1" id="btnSendFeed"></button>'
	],null,"popFeedback");
	id("titleFeedback").innerText=multilang({
		"en-US":"Send Us a Message",
		"zh-CN":"向我们发送消息",
		"zh-TW":"向我們發送訊息"
	});
	id("faq").innerText=multilang({
		"en-US":"FAQ",
		"zh-CN":"常见问题",
		"zh-TW":"常見問題集"
	});
	id("qqGroup").innerText=multilang({
		"en-US":"Our QQ Group: ",
		"zh-CN":"我们的QQ群：",
		"zh-TW":"我們的QQ群："
	})+"319496964";
	id("txtFeedback").placeholder=multilang({
		"en-US":"Enter the text here",
		"zh-CN":"在这里键入文本",
		"zh-TW":"在這裡鍵入文字"
	});
	id("btnSendFeed").innerText=multilang({
		"en-US":"Send",
		"zh-CN":"发送",
		"zh-TW":"發送"
	});
	id("btnSendFeed").onclick=function(){
		if(txtFeedback.value){
			var emailPattern=/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
			var email=login.email||emailPattern.exec(txtFeedback.value)&&emailPattern.exec(txtFeedback.value)[0]||prompt(multilang({
				"en-US":"Please enter your email address.",
				"zh-CN":"请输入您的电子邮箱地址。",
				"zh-TW":"請輸入您的電子郵箱地址。"
			}));
			if(emailPattern.test(email)){
				fetch("https://server-auto.rthe.cn/backend/feedback",getPostData({
					"appname":appName,
					"email":email,
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
			}else{
				alert(multilang({
					"en-US":"Please provide the correct email address, or we will not be able to reply to you.",
					"zh-CN":"请提供正确的电子邮箱地址，否则我们将无法回复您。",
					"zh-TW":"請提供正確的電子郵箱地址，否則我們將無法回復您。"
				}));
			}
		}
	}
	id("btnClose3").onclick=function(){
		closePopup("popFeedback");
	}
	hideMenu();
}
