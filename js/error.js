var code=parseInt(location.pathname.substr(1));
if(code&&!/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
	localStorage.setItem("code",code);
}
location.href="/";
