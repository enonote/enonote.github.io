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


// �y�[�W�ǂݍ��݊������Ɏ��s���鏈��
function onPageLoaded(){
  let modalWin = new DownloadModalWindow();
  modalWin.createDownloadButton({
    "buttonClass": "bookLinks",
     "container" : document.getElementById("sorttab2") ,
    "downloadInfo": function(){
      return new Promise((resolve,reject)=>{
        createBookInfoList().success(function(data){
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
  
  // HTML����͂���BookInfo�I�u�W�F�N�g���쐬
  let bookInfoList = [];
  bookInfoList.push(BookListUtil.parseViewerButton());
  console.log(bookInfoList);
  let dfdArr = [];
  for( let i=0 ; i<bookInfoList.length ; i++ ){
    dfdArr.push( bookInfoList[i].resolveFileUrl() );
  }
  
  $.when.apply($,dfdArr).then(function(){
    console.log("DEBUG: bookInfoList��resolve������");
    dfd.resolve(bookInfoList);
  });
  
  return dfd.promise();
}
