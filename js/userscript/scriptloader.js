// ----------------------------------------------------------------------------
// 実行関数を格納するキュークラス
// ----------------------------------------------------------------------------
// [コンストラクタ引数]
// なし
// 
// ----------------------------------------------------------------------------
class _FunctionQueue {
  constructor() {
    this.list = [];
    this.processing = false;
  }
  push(func,param) {
    this.list.push({"func":func,"param":param});
  }
  exec(){
    let that = this;
    if( this.list.length > 0 && that.processing == false ){
      let obj = this.list[0];
      that.processing = true;
      obj.func(obj.param).then(function(data){
        // resolve
        console.log(data);
        that.list.shift();
        that.processing = false;
        that.exec();
      },
      function(data){
        // reject
        console.log(data);
        that.list.shift();
        that.processing = false;
        that.exec();
      });
    }
  }
}

// ----------------------------------------------------------------------------
// scriptを動的読み込みするクラス
// 呼び出した読み込み処理はキューに格納され、onloadで順次実行を行う。
// ----------------------------------------------------------------------------
// [コンストラクタ引数]
// なし
// 
// [使用サンプル]
//   var loader = new ScriptLoader();
//   
//   loader.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js");
//   loader.loadCss("http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/themes/ui-lightness/jquery-ui.css");
//   loader.execFunc(function(){
//     console.log("loaded");
//   });
// 
// ----------------------------------------------------------------------------
class ScriptLoader {
  constructor() {
    this.queue = new _FunctionQueue();
  }

  // ------------------------------------------
  // scriptタグをheadに追加する
  // ------------------------------------------
  // [引数]
  // src : スクリプトのURL
  // 
  // [返値]
  // なし
  // 
  // ------------------------------------------
  loadScript(src){
    let elm = document.createElement("script");
    elm.setAttribute("src",src);
    this.queue.push(this._insertTag,elm);
    this.queue.exec();
  }

  // ------------------------------------------
  // link(css)タグをheadに追加する
  // ------------------------------------------
  // [引数]
  // src : CSSのURL
  // 
  // [返値]
  // なし
  // 
  // ------------------------------------------
  loadCss(src){
    let elm = document.createElement("link");
    elm.setAttribute("rel","stylesheet");
    elm.setAttribute("href",src);
    this.queue.push(this._insertTag,elm);
    this.queue.exec();
  }
  
  // ------------------------------------------
  // 指定した関数を実行する
  // ------------------------------------------
  // [引数]
  // func : 実行する関数
  // 
  // [返値]
  // なし
  // 
  // ------------------------------------------
  execFunc(func){
    this.queue.push(function(){
      return new Promise(function(resolve,reject){
        try{
          func();
          resolve("resolve: Function execution completed.");
        }catch(e){
          console.log(e);
          reject("  reject: Function execution error.");
        }
      });
    },null);
    this.queue.exec();
  }
  
  // ------------------------------------------
  // [private]指定したElementをheadに挿入する
  // ------------------------------------------
  // [引数]
  // elm : Elementオブジェクト
  // 
  // [返値]
  // Promiseオブジェクト
  //   resolve: onloadイベント発行時
  //   reject : タイムアウト発生時(1000ms)
  // 
  // ------------------------------------------
  _insertTag(elm){
    return new Promise(function(resolve,reject){

      elm.addEventListener("load",function(){
        resolve("resolve: " + (elm.getAttribute("src") || elm.getAttribute("href") ));
      });
      setTimeout(function(){
        reject("  reject: " + (elm.getAttribute("src") || elm.getAttribute("href") ));
      },1000);

      let tagName = elm.tagName.toLowerCase();
      let tags = document.getElementsByTagName(tagName);
      if( tags.length > 0 ){
        tags[0].parentNode.insertBefore(elm,tags[0]);
      }else{
        if( tagName == "script" || tagName == "link" ){
          document.head.appendChild(elm);
        }else{
          document.body.appendChild(elm);
        }
      }
      
    });
  }
}