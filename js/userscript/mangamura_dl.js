// Require jQuery2.2.4
// Require mangamura_bookinfo_class.js

//１．検索結果一覧取得
// hrefからBookIDを抽出する正規表現
const PTN_HREF_BOOKID = { "pattern": /.*?p=(.*)/ ,"index": 1 };

/*
 * BookListUtil
 * 以下の構造のHTMLを解析し、BookInfoの配列を返す
 * 
 * ListContainer      : 検索結果リスト
 *   + ListItem       : 検索結果の行
 *   + ListItem
 *       + ItemDetail : 行の詳細
 */
var BookListUtil = (function(){
  return {
    // リストコンテナを解析し、BookInfoの配列を返す
    parseListContainer: function(){
      let bookInfoList = [];
      for( listItem of getListItems( getListContainer() )){
        let bookInfo = getItemDetail(listItem);
        bookInfoList.push(bookInfo);
      }
      return bookInfoList;
    }
    // ビュワーボタンからBookInfoを作成する
    ,parseViewerButton: function(){
      let bookInfo = new BookInfo();

      bookInfo.bookId = getBookId();
      bookInfo.bookTitle = getBookTitle();
      
      return bookInfo;
      
      function getBookId(){
        let viewerBtn = null;
        let href = "";
        for( let elm of document.getElementsByClassName("open_viewer") ){
          href = elm.getAttribute("href");
          if( href && href != "#" ){
            break;
          }
        }
        
        let r = href.match(PTN_HREF_BOOKID.pattern);
        if( r ){
          return r[PTN_HREF_BOOKID.index];
        }else{
          console.log("ERROR: BookId の取得に失敗");
          return "";
        }
      }

      function getBookTitle(){
        let elmSection = document.getElementById("data");
        let elmLi = elmSection.getElementsByClassName("title")[0];
        let elmH2 = elmLi.getElementsByClassName("normalfont")[0];
        return elmH2.textContent;
      }

    }
  };

  // リストコンテナ取得
  function getListContainer(){
    // let container = document.getElementById("result");
    let container = document.getElementsByClassName("list-group")[0];

    if( container == null ){
      console.log("ERROR: containerがnull");
    }
    return container;
  }
  
  // リストを配列で取得
  function getListItems(elmContainer){
    let listItems = elmContainer.getElementsByTagName("a");
    if( listItems == null ){
      console.log("ERROR: listItemsがnull");
    }
    return listItems;
  }
  
  // 明細からBookInfo情報を作成
  function getItemDetail(elmListItem){
    
    let bookInfo = new BookInfo();

    bookInfo.bookId = getBookId(elmListItem);
    bookInfo.bookTitle = getBookTitle(elmListItem);

    return bookInfo;

    // BookIdを抽出
    function getBookId(elmListItem){
      let href = elmListItem.getAttribute("href");
      let r = href.match(PTN_HREF_BOOKID.pattern);
      if( r ){
        return r[PTN_HREF_BOOKID.index];
      }else{
        console.log("ERROR: BookId の取得に失敗");
        return "";
      }
    }
    // タイトルを取得
    function getBookTitle(elmListItem){
      let elms = elmListItem.getElementsByClassName("media-heading");
      if( elms.length > 0 ){
        let title = elms[0].textContent;
        return title.trim();
      }else{
        console.log("ERROR: BookTitle の取得に失敗");
        return "";
      }
    }
  }
})();

var DownloadPopupUtil = (function(){

  var NAME_DLALLBTN = "dlAllBtn";
  var NAME_DLALLBTN_CONTAINER = "dlAllBtnContainer";
  var NAME_DLBTN = "dlBtn";
  var NAME_DLBTN_CONTAINER = "dlBtnContainer";
  
  return {
    // 指定した要素に一括ダウンロードボタンを挿入
    // 引数：親要素 , BookInfoオブジェクト（を返す関数でも可）
    insertDownloadAllButton: function(parentElm,bookInfo){
      removeDlAllButtonContainer();
      let dlBtnContainer = createDlAllButtonContainer();
      parentElm.insertBefore(
        dlBtnContainer,
        parentElm.firstChild);
      
      let dlBtn = createDlButton( createDlAllButtonElm(NAME_DLALLBTN) ,bookInfo);
      dlBtnContainer.appendChild(dlBtn);

    },
    // 指定した要素にダウンロードボタンを挿入
    insertDownloadButton: function(parentElm,bookInfo){
      removeDlButtonContainer();
      let dlBtnContainer = createDlButtonContainer();
      parentElm.insertBefore(
        dlBtnContainer,
        parentElm.firstChild);
      
      let dlBtn = createDlButton( createDlButtonElm(NAME_DLBTN) ,bookInfo);
      dlBtnContainer.appendChild(dlBtn);

    }

  };

  // ボタン配置コンテナ削除
  function removeDlAllButtonContainer(){
    let elm = document.getElementById(NAME_DLALLBTN_CONTAINER);
    if( elm ){
      elm.parentElement.removeChild(elm);
    }
  }
  // ボタン配置コンテナ作成
  function createDlAllButtonContainer(){
    let elm = document.createElement("div");
    elm.setAttribute("id",NAME_DLALLBTN_CONTAINER);
    elm.setAttribute("class",NAME_DLALLBTN_CONTAINER);
    return elm;    
  }

  // ボタン配置コンテナ削除
  function removeDlButtonContainer(){
    let elm = document.getElementById(NAME_DLBTN_CONTAINER);
    if( elm ){
      elm.parentElement.removeChild(elm);
    }
  }
  // ボタン配置コンテナ作成
  function createDlButtonContainer(){
    let elm = document.createElement("li");
    elm.setAttribute("id",NAME_DLBTN_CONTAINER);
    elm.setAttribute("class",NAME_DLBTN_CONTAINER);
    return elm;    
  }
  
  // ダウンロードボタン作成
  function createDlAllButtonElm(buttonId){
    let elm = document.createElement("div");
    elm.setAttribute("id",buttonId);
    elm.setAttribute("class",NAME_DLALLBTN);
    elm.setAttribute("style","width:600px;height:24px;border:solid 1px #F00;z-index:1000;");
    elm.textContent = "[一括ダウンロード]";
    return elm;
  }
  function createDlButtonElm(buttonId){
    let elm = document.createElement("a");
    elm.setAttribute("id",buttonId);
    elm.setAttribute("class",NAME_DLALLBTN + " open_viewer");
    elm.setAttribute("href","#");
    elm.setAttribute("style","");
    elm.textContent = "ダウンロード";
    return elm;
  }
  
  function createDlButton( elm ,bookInfo){

    elm.removeEventListener("click", openDlPopup, false);
    elm.addEventListener("click", openDlPopup, false);
    
    return elm;
  
    // ダウンロードポップアップを開く
    function openDlPopup(e){
      
       // ダウンロードポップアップ生成
      let winDlPopup = window.open("","","width=600, height=400, menubar=yes, toolbar=yes, scrollbars=yes");
      winDlPopup.document.body.appendChild(createReferer());

      if( typeof bookInfo === "function" ){
        // bookInfoが関数の場合(BookInfoClassのオブジェクトを返すこと)
        let result = bookInfo();
        if ( result.promise ){
          // Deffered対応関数
          result.done(function(data){
            console.log("DEBUG: bookInfo関数のPromiseがresolveした。");
            
            // ダウンロードリンク作成
            winDlPopup.document.body.appendChild(createDlLinks(data));

            console.log("DEBUG: ダウンロードリンクを作成した。");
            
          }).fail(function(){
            console.log("DEBUG: bookInfo関数のPromiseがrejectした。");
          });
        }else{
          // 通常関数
          console.log("DEBUG: bookInfo関数は通常関数。");
        }
      }else{
        // 未対応
        console.log("ERROR: 未対応の形式");
      }
      
    }
    
    function createReferer(){
      let tag = document.createElement("script");
      tag.textContent = "Object.defineProperty(document,\"referrer\",{value:\"http://mangamura.org/\"})";
      return tag;
    }

    function removeDlLinks(winDlPopup){
      let linkContainer = winDlPopup.document.getElementsByClassName("linkContainer");
      for( let i=linkContainer.length -1 ; i >= 0 ; i-- ){
        linkContainer.parentElement.removeChild(linkContainer[i]);
      }
    }
    function createDlLinks(bookInfoList){
      let tagDiv = document.createElement("div");
      tagDiv.setAttribute("class","linkContainer");
      tagDiv.setAttribute("style","background-color:FFC;");
      for( let bookInfo of bookInfoList ){
        tagDiv.appendChild(createBookDlLink(bookInfo));
      }
      
      return tagDiv;
    }
    function createBookDlLink(bookInfo){

      // ダウンロードリンク領域生成
      let tagDiv = document.createElement("div");
      tagDiv.setAttribute("class","bookLinks");
      tagDiv.setAttribute("style","background-color:FFC;");

      var tagH1 = document.createElement("h1");
      tagH1.textContent = bookInfo.bookTitle;
      tagDiv.appendChild(tagH1);

      let page = 1;
      for( fileUrl of bookInfo.fileUrlList ){
        tagDiv.appendChild(createDlLinkTag(fileUrl ,bookInfo.bookTitle ,page ));
        tagDiv.appendChild(document.createElement("br"));
        page++;
      }
      
      return tagDiv;
    }
    // ダウンロードアンカータグ作成
    function createDlLinkTag(url,title,page){
      var elm = document.createElement("a");
      
      title = titleFormatting(title);
      
      elm.setAttribute("href",url);
      elm.setAttribute("download",getSaveFileName(title,page));
      elm.textContent = title + "["+ (("0000" + page).slice(-4)) +"]";
      return elm;
      
      // 保存ファイル名生成
      function getSaveFileName(title,page){
        var page = ("0000" + page).slice(-4);
        return title + "_" + page + ".jpg";
      }

      // タイトル整形
      function titleFormatting(title){

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

  }
  
})();

// 検索結果からBookInfoListを作成
var onClickDlButton = function (){

  let dfd = $.Deferred();
  
  // 検索結果を解析してBookInfoオブジェクトを作成
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

// 検索結果リストにダウンロードボタンを挿入
// var dlButtonContainer = document.getElementById("result");
var dlButtonContainer = document.getElementById("sorttab2");
DownloadPopupUtil.insertDownloadButton( dlButtonContainer , onClickDlButton );

