// ----------------------------------------------------------------------------
// ダウンロードポップアップ（モーダルウインドウ版）
// ----------------------------------------------------------------------------
// [依存モジュール]
// jquery-2.2.4.min.js
// jquery.leanModal.min.js
// leanmodal.css
// 
// [コンストラクタ引数]
// なし
// 
// ----------------------------------------------------------------------------
class FileInfo {
  constructor(name,url){
    this._name = name;
    this._url  = url;
  }
  get name(){
    return this._name;
  }
  set name(name){
    this._name = name;
  }
  get url(){
    return this._url;
  }
  set url(url){
    this._url = url;
  }
}
class DownloadInfo {
  constructor(param){
    param = ( param || {} );
    this._groupName = ( param["groupName"] || "" );
    this._files     = ( param["files"]     || [] );
  }
  get groupName(){
    return this._groupName;
  }
  set groupName(groupName){
    this._groupName = groupName;
  }
  get files(){
    return this._files;
  }
  set files(files){
    this._files = files;
  }
  putFile(name,url){
    this._files.push(new FileInfo(name,url));
  }
}
class DownloadModalWindow {

  constructor(param){
    param = ( param || {} );
    this._modalId = ( param["modalId"] || "modalWindow" )
    this._modalWindowElement = this._createModalWindow(this._modalId);
    document.body.appendChild(this._modalWindowElement);
  }
  
  // ------------------------------------------
  // ダウンロードボタンを作成する
  // ------------------------------------------
  // [引数]
  // param : パラメータオブジェクト
  //   container : ボタンを挿入するElement
  //   action    : ボタンを押下した時の処理
  // 
  // [返値]
  // なし
  // 
  // ------------------------------------------
  createDownloadButton(param){
    param = ( param || {} );
    let buttonId     = ( param["buttonId"]     || "openModalWinBtn" );
    let buttonClass  = ( param["buttonClass"]  || "modalWinBtn" );
    let buttonTitle  = ( param["buttonTitle"]  || "Download" );
    let modalId      = ( param["modalId"]      || "modalWin" );
    let container    = ( param["container"]    || document.body );
    let downloadInfo = ( param["downloadInfo"] || [] );
    
    let btnElm = this._createDownloadButtonElement( buttonId ,buttonClass ,buttonTitle );
    container.appendChild( btnElm );
    
    $("#"+buttonId).leanModal().on("click",()=>{
      this._onDownloadButtonClick(downloadInfo);
    });

  }
  
  _createModalWindow(modalId){
    let tag = document.createElement("div");
    tag.setAttribute("id",modalId);
    tag.setAttribute("class","modal");
    tag.appendChild(document.createElement("p"))
    return tag;
  }
  _onDownloadButtonClick(downloadInfo){
    this._clearModalWindow();
    this._validateDownloadInfo(downloadInfo).then((data)=>{
      this._updateModalWindow(data);
    },()=>{});
  }
  _validateDownloadInfo(obj){
    return new Promise((resolve,reject) => {
      if( typeof obj == "function" ){
        obj().then((data)=>{
          this._validateDownloadInfo(data).then((validData)=>{
            console.log("_validateDownloadInfo : valid data (function result)");
            console.log(validData);
            resolve(validData);
          },()=>{
            console.log("_validateDownloadInfo : validate error (function result)");
            reject();
          });
        },()=>{
          console.log("_validateDownloadInfo : validate error");
          reject();
        });
        
      }else if(
        (obj instanceof DownloadInfo) ||
        (obj instanceof Array && obj.length > 0 && obj[0] instanceof DownloadInfo)
      ){
        console.log("_validateDownloadInfo : valid data");
        console.log(obj);
        resolve(obj);
        
      }else{
        console.log("_validateDownloadInfo : unknown data");
        console.log(obj);
        reject();
      }
      setTimeout(()=>{
        reject();
      },1000*30);
    });
  }
  _clearModalWindow(){
    let parent = this._modalWindowElement.firstChild;
    while( parent.children.length > 0 ){
      parent.removeChild(parent.children[parent.children.length -1]);
    }
  }
  _updateModalWindow(downloadInfo){
    if( downloadInfo instanceof Array ){
      for( let obj of downloadInfo ){
        this._modalWindowElement.firstChild.appendChild(this._createDownloadLinkList(obj));
      }
    }else{
      this._modalWindowElement.firstChild.appendChild(this._createDownloadLinkList(downloadInfo));
    }
  }
  _createDownloadLinkList( downloadInfo ){
    let container = document.createElement("div");
    
    let titleElm = document.createElement("h1");
    titleElm.textContent = downloadInfo.groupName;
    
    let listElm = document.createElement("ol");
    for( let file of downloadInfo.files ){
      listElm.appendChild(this._createDownloadLinkElement(file.name,file.url));
    }

    container.appendChild(titleElm);
    container.appendChild(listElm);
    
    return container;
  }
  _createDownloadLinkElement( title ,url ){
    let container = document.createElement("li");
    let elm = document.createElement("a");
    elm.setAttribute("href",url);
    elm.setAttribute("download",title);
    elm.textContent = title;
    
    container.appendChild(elm);
    return container;
  }
  _createDownloadButtonElement( buttonId ,buttonClass ,buttonTitle ){
    let btnContainer = document.createElement("p");
    btnContainer.setAttribute("class",buttonClass);
    
    let btn = document.createElement("a");
    btn.setAttribute("id",buttonId);
    btn.setAttribute("href","#"+this._modalId);
    btn.setAttribute("rel","leanModal");
    btn.textContent = buttonTitle;
    
    btnContainer.appendChild(btn);
    
    return btnContainer;
  }
  
}

// ----------------------------------------------------------------------------
// オブジェクト変換クラス
// ----------------------------------------------------------------------------
// [依存モジュール]
// class FileNameFormatter
// class BookInfo
// class DownloadInfo
// class FileInfo
// 
// [コンストラクタ引数]
// なし
// 
// ----------------------------------------------------------------------------
class FileNameFormatter{
  static saveFileNameFormatting(title,seq,ext){
    return title + "_" + (("0000" + seq).slice(-4)) + ext;
  }
  static titleFormatting(title){
    let result = removeSpace(toHalfChar(title));
    
    return result;

    function toHalfChar(str){
      return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
      }).replace(/　/g," ").replace(/[（【]/g,"(").replace(/[）】]/g,")");
    }
    function removeSpace(str){
      return str.replace(/\s+/g," ").trim();
    }
  }
}
class ObjectConverter{

  // BookInfo ⇒ DownloadInfo 変換
  static convertBookInfoToDownloadInfo(obj){
    if( obj instanceof Array ){
      let list = [];
      for( let i=0 ; i<obj.length ; i++ ){
        list.push( this.convertBookInfoToDownloadInfo(obj[i]) );
      }
      return list;
    }else{
      let groupName = FileNameFormatter.titleFormatting(obj.bookTitle);
      let files = [];
      
      for( let i=0 ; i<obj.fileUrlList.length ; i++ ){
        files.push( new FileInfo( 
          FileNameFormatter.saveFileNameFormatting(groupName,i+1,".jpg") ,obj.fileUrlList[i]
        ));
      }

      return new DownloadInfo({
        "groupName": groupName,
        "files": files
      });
    }
  }
}
