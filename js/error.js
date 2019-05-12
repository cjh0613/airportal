if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
	location.hostname="ap.rthe.cn";
}else{
	var code=parseInt(location.pathname.substr(1));
	if(code){
		localStorage.setItem("code",code);
	}
	location.href="/";
}
