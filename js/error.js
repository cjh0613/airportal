var code=parseInt(location.pathname.substr(1));
if(code){
	localStorage.setItem("code",code);
}
location.href="/";
