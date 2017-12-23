// Require jquery-2.2.4.min.js
// Require mangamura.BookInfo.js
// Require mangamura.BookListUtil.js
// Require downloadModalWindow.js
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
  loader.loadScript("https://enonote.github.io/js/jquery.leanModal.min.js");
  loader.loadScript("https://enonote.github.io/js/userscript/mangamura.BookInfo.js");
  loader.loadScript("https://enonote.github.io/js/userscript/mangamura.BookListUtil.js");
  loader.loadScript("https://enonote.github.io/js/userscript/downloadModalWindow.js");

  loader.loadCss("https://enonote.github.io/css/leanmodal.css");
  loader.loadCss("https://enonote.github.io/css/downloadModalWindow.css");
  
  loader.execFunc(function(){
    onPageLoaded();
  });
},()=>{});


// ページ読み込み完了時に実行する処理
function onPageLoaded(){
  let modalWin = new DownloadModalWindow();
  modalWin.createDownloadButton({
    "buttonClass": "bookLinks",
    "container"  : document.getElementById("sorttab2") ,
    "downloadInfo": function(){
      return new Promise((resolve,reject)=>{
        console.log("createBookInfoList :call");
        createBookInfoList().done(function(data){
          console.log("createBookInfoList :done");
          console.log(data);
          resolve( ObjectConverter.convertBookInfoToDownloadInfo(data) );
        }).fail(function(){
          reject();
        });
      });
    }
  });
}
function createBookInfoList(){
  
  let dfd = $.Deferred();
  
  // HTMLを解析してBookInfoオブジェクトを作成
  let bookInfoList = [];
  bookInfoList.push(BookListUtil.parseViewerButton());
  console.log(bookInfoList);
  let dfdArr = [];
  for( let i=0 ; i<bookInfoList.length ; i++ ){
    dfdArr.push( bookInfoList[i].resolveFileUrl() );
  }
  
  $.when.apply($,dfdArr).then(function(){
    console.log("DEBUG: bookInfoListのresolveが完了");
    dfd.resolve(bookInfoList);
  });
  
  return dfd.promise();
}
