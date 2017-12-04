// Require jQuery2.2.4

//１．検索結果一覧取得
// hrefからBookIDを抽出する正規表現
const PTN_HREF_BOOKID = { "pattern": /.*?p=(.*)/ ,"index": 1 };

// BookInfoクラス
class BookInfo {
  constructor(){
    this._bookId = "";
    this._bookTitle = "";
    this._fileUrlList = [];
  }
  set bookId(bookId){
    this._bookId = bookId;
    if( this._bookId == null ){
      console.log("(BookInfo Class)Invalid value: bookIdにnullがセットされました。");
    }
  }
  get bookId(){
    return this._bookId;
  }
  set bookTitle(bookTitle){
    this._bookTitle = bookTitle;
    if( bookTitle != null ){
      this._bookTitle = bookTitle.trim();
    }else{
      console.log("(BookInfo Class)Invalid parameter: bookTitleにnullが渡されました。");
    }
  }
  get bookTitle(){
    return this._bookTitle;
  }
  get fileUrlList(){
    return this._fileUrlList;
  }
  
  // BookIdからファイルのURLを取得
  resolveFileUrl(){
    let dfd = $.Deferred();
    let that = this;
    
    _getRequestKey(that.bookId).done(function(reqKey){
      _getFileList(that.bookId ,reqKey).done(function(fileList){
        for( let key in fileList ){
          let data = fileList[key];
          let fileUrl = data.img + "?" + "h="+data.h + "&t="+data.t;
          that.fileUrlList.push(fileUrl);
        }
        
        dfd.resolve();
      }).fail(function(){
        dfd.resolve();
      });
    }).fail(function(){
      dfd.resolve();
    });
    
    // 10秒でタイムアウト
    setTimeout(function(){
      if( dfd.state() == "pending" ){
        alert("ERROR: resolveFileUrl リクエストがタイムアウト");
        dfd.resolve();
      }
    },1000*60);
    
    return dfd.promise();

    // VIEWERページのHTMLを取得し、KEYを抽出
    function _getRequestKey(bookId){

      var dfd = $.Deferred();

        var datas = $.ajax({
            type: 'GET',
            datatype: 'html',
            url: "http://mangamura.org/kai_pc_viewer?p=" + bookId
        }).done(function(data){
            var obj = parseViewerPage(data);
            if(obj != null){
                dfd.resolve(obj.key);
            }else{
                console.log("ERROR：リクエストキーの取得に失敗");
                dfd.reject();
            }
        }).fail(function(){
            console.log("ERROR：ビュワーの取得に失敗");
            dfd.reject();
        }).always(function(){
        });

        return dfd.promise();

        // 取得したHTMLからKEYを抽出
        function parseViewerPage(htmlStr){
            var ptn = /<div\s+id="([A-z0-9]{13,13})"\s+class="(.*?)".*>/m;
            var r = htmlStr.match(ptn);
            if(r){
                return {"id": r[1] , "key": r[2]};
            }
            return null;
        }

    }
    // ファイル一覧取得リクエスト送信
    function _getFileList(bookId,key){
        var dfd = $.Deferred();

        var datas = $.ajax({
            type: 'GET',
            datatype: 'json',
            url: "http://mangamura.org/pages/xge5?id="+bookId+"&x="+key
        }).done(function(data){
            dfd.resolve(data);

        }).fail(function(){
            console.log("ERROR：リクエストキーの取得に失敗");
            dfd.reject();

        }).always(function(){
            dfd.resolve();
        });

        return dfd.promise();
    }

  }
}

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
  
  return {
    // 指定した要素に一括ダウンロードボタンを挿入
    // 引数：親要素 , BookInfoオブジェクト（を返す関数でも可）
    insertDownloadAllButton: function(parentElm,bookInfo){
      removeDlAllButtonContainer();
      let dlBtnContainer = createDlAllButtonContainer();
      parentElm.insertBefore(
        dlBtnContainer,
        parentElm.firstChild);
      
      let dlBtn = createDlAllButton(NAME_DLALLBTN,bookInfo);
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
  
  // ダウンロードボタン作成
  function createDlAllButton(buttonId , bookInfo ){
    let elm = document.createElement("div");
    elm.setAttribute("id",buttonId);
    elm.setAttribute("class",NAME_DLALLBTN);
    elm.setAttribute("style","width:600px;height:24px;border:solid 1px #F00;z-index:1000;");
    elm.textContent = "[一括ダウンロード]";

    elm.removeEventListener("click", openDlPopup, false);
    elm.addEventListener("click", openDlPopup, false);
    
    return elm;
  
    // ダウンロードポップアップを開く
    function openDlPopup(e){
      
 	    // ダウンロードポップアップ生成
	    let winDlPopup = window.open("","dlpop","width=600, height=400, menubar=yes, toolbar=yes, scrollbars=yes");

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
      elm.setAttribute("href",url);
      elm.setAttribute("download",getSaveFileName(title,page));
      elm.textContent = title + "["+ (("0000" + page).slice(-4)) +"]";
      return elm;
      
      // 保存ファイル名生成
      function getSaveFileName(title,page){
        var page = ("0000" + page).slice(-4);
        return title + "_" + page + ".jpg";
      }
    }

  }
  
})();

// 検索結果からBookInfoListを作成
var onClickDlAllButton = function (){
  alert("call onClickDlAllButton");
  let dfd = $.Deferred();
  // 検索結果を解析してBookInfoオブジェクトを作成
  let bookInfoList = BookListUtil.parseListContainer();

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
var dlButtonContainer = document.getElementsByClassName("tab-content")[0];
DownloadPopupUtil.insertDownloadAllButton( dlButtonContainer , onClickDlAllButton );
