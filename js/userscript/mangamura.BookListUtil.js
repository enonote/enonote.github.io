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
  var PTN_HREF_BOOKID = { "pattern": /.*?p=(.*)/ ,"index": 1 };
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