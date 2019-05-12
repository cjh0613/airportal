if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
	location.hostname="ap.rthe.cn";
}else{
	var code=location.pathname.substr(1);
	if(parseInt(code)&&code.length==4){
		localStorage.setItem("code",code);
	}
	location.href="/";
}
