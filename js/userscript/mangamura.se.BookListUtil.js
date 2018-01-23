/*
 * BookListUtil
 * 以下の構造のHTMLを解析し、BookInfoの配列を返す
 * 
 */
var BookListUtil = (function(){
  return {
    // HTMLを解析し、BookInfoの配列を返す
    createBookInfoList: function(){
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
    let container = null;
    try{
      for( let elmKanren of document.getElementById("contentInner").getElementsByClassName("kanren") ){
        if( elmKanren.className.trim() == "kanren" ){
          container = elmKanren;
          break;
        }
      }
    }catch(e){
      console.log("ERROR: getListContainer実行時に予期せぬエラー");
      console.log(e);
      return null;
    }
    if( container == null ){
      console.log("ERROR: containerがnull");
    }
    return container;
  }
  
  // リストを配列で取得
  function getListItems(elmContainer){
    let listItems = elmContainer.getElementsByClassName("wp-post-image");
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
    bookInfo.bookCategory = getBookCategory(elmListItem);

    return bookInfo;

    // BookIdを抽出
    function getBookId(elmListItem){
      try{
        let m = elmListItem.getAttribute("style").match(/background:url\('http:\/\/image1\.mangamura\.se\/(.*?)\.jpg'\)/);
        if( m ){
          return m[1];
        }
      }catch(e){
        console.log(e);
      }
      console.log("ERROR: BookId の取得に失敗");
      return "";
    }
    // タイトルを取得
    function getBookTitle(elmListItem){
      try{
        let m = decodeURI(elmListItem.parentElement.getAttribute("href")).match("http://mangamura.se/.*/(.*?)/");
        if( m ){
          return m[1];
        }
      }catch(e){
        console.log(e);
      }
      console.log("ERROR: BookTitle の取得に失敗");
      return "";
    }
    // カテゴリを取得
    function getBookCategory(elmListItem){
      try{
        let m = decodeURI(elmListItem.parentElement.getAttribute("href")).match("http://mangamura.se/(.*?)/.*/");
        if( m ){
          return m[1];
        }
      }catch(e){
        console.log(e);
      }
      console.log("ERROR: BookCategory の取得に失敗");
      return "";
    }
  }
})();