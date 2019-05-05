var chs=/zh-cn|zh-hans|zh-hans-cn/i.test(navigator.language);
var zh=navigator.language.indexOf("zh")!=-1;
try{
	if(!chs){
		var mrxLink=document.createElement("a");
		mrxLink.classList.add("link1");
		mrxLink.href="https://www.maorx.cn/";
		var yszLink=document.createElement("a");
		yszLink.classList.add("link1");
		yszLink.href="https://shangzhen.rthe.cn/";
		mrxLink.target=yszLink.target="_blank";
		if(!zh){
			document.getElementsByTagName("html")[0].lang="en-US";
			send.innerText="Send";
			send.title="Right click to send text";
			receive.innerText="Receive";
			privacyPolicy.innerText="Privacy Policy";
			footerR.innerHTML="Developed by";
			mrxLink.innerText="Ruoxin Mao";
			footerR.appendChild(mrxLink);
			footerR.innerHTML+="and";
			yszLink.innerText="Shangzhen Yang";
			yszLink.style.marginRight="0px";
			footerR.appendChild(yszLink);
			footerR.innerHTML+=".<br>All rights reserved.";
			menuItemLogin.innerText="Login";
			menuItemHistory.innerText="History";
			menuItemSettings.innerText="Settings";
			menuItemFeedback.innerText="Contact Us";
			nameSelectServer.innerText="Select Server";
		}else{
			document.getElementsByTagName("html")[0].lang="zh-TW";
			send.innerText="發送";
			send.title="右鍵單擊發送文字";
			receive.innerText="接收";
			privacyPolicy.innerText="隱私政策";
			footerR.innerHTML="由";
			mrxLink.innerText="毛若昕";
			footerR.appendChild(mrxLink);
			footerR.innerHTML+="和";
			yszLink.innerText="楊尚臻";
			footerR.appendChild(yszLink);
			footerR.innerHTML+="聯合開發。保留所有權利。";
			menuItemLogin.innerText="登入";
			menuItemHistory.innerText="歷史記錄";
			menuItemSettings.innerText="設定";
			menuItemFeedback.innerText="聯繫我們";
			nameSelectServer.innerText="選擇伺服器";
		}
	}
}catch(e){
	console.error(e);
}
