function bootstrap(){
  return new Promise((rslv,rjct)=>{
    let script = document.createElement( "script" );
    script.addEventListener("load",()=>{ rslv(); },true);
    script.type = "text/javascript";
    script.src = "https://enonote.github.io/js/userscript/scriptloader.js";
    document.head.appendChild(script);
    setTimeout(()=>{ rjct(); },3000);
  });
}
bootstrap().then(()=>{
  let loader = new ScriptLoader();
  loader.loadScript("https://code.jquery.com/jquery-2.2.4.min.js");
  
  loader.execFunc(function(){
    onPageLoaded();
  });
},()=>{});


// ページ読み込み完了時に実行する処理
function onPageLoaded(){
  $("a").off("click");
}
