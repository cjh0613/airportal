var $_GET=(function(){
	var json={};
	if(location.search){
		var parameters=location.search.replace("?","").split("&");
		for(var i=0;i<parameters.length;i++){
			var split=parameters[i].split("=");
			json[split[0]]=decodeURIComponent(split[1]);
		}
	}
	return json;
})();
if($_GET["reason"]){
    pReason.innerText=$_GET["reason"];
}
