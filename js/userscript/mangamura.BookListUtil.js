/*
 * BookListUtil
 * �ȉ��̍\����HTML����͂��ABookInfo�̔z���Ԃ�
 * 
 * ListContainer      : �������ʃ��X�g
 *   + ListItem       : �������ʂ̍s
 *   + ListItem
 *       + ItemDetail : �s�̏ڍ�
 */
var BookListUtil = (function(){
  return {
    // ���X�g�R���e�i����͂��ABookInfo�̔z���Ԃ�
    parseListContainer: function(){
      let bookInfoList = [];
      for( listItem of getListItems( getListContainer() )){
        let bookInfo = getItemDetail(listItem);
        bookInfoList.push(bookInfo);
      }
      return bookInfoList;
    }
    // �r�����[�{�^������BookInfo���쐬����
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
          console.log("ERROR: BookId �̎擾�Ɏ��s");
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

  // ���X�g�R���e�i�擾
  function getListContainer(){
    // let container = document.getElementById("result");
    let container = document.getElementsByClassName("list-group")[0];

    if( container == null ){
      console.log("ERROR: container��null");
    }
    return container;
  }
  
  // ���X�g��z��Ŏ擾
  function getListItems(elmContainer){
    let listItems = elmContainer.getElementsByTagName("a");
    if( listItems == null ){
      console.log("ERROR: listItems��null");
    }
    return listItems;
  }
  
  // ���ׂ���BookInfo�����쐬
  function getItemDetail(elmListItem){
    
    let bookInfo = new BookInfo();

    bookInfo.bookId = getBookId(elmListItem);
    bookInfo.bookTitle = getBookTitle(elmListItem);

    return bookInfo;

    // BookId�𒊏o
    function getBookId(elmListItem){
      let href = elmListItem.getAttribute("href");
      let r = href.match(PTN_HREF_BOOKID.pattern);
      if( r ){
        return r[PTN_HREF_BOOKID.index];
      }else{
        console.log("ERROR: BookId �̎擾�Ɏ��s");
        return "";
      }
    }
    // �^�C�g�����擾
    function getBookTitle(elmListItem){
      let elms = elmListItem.getElementsByClassName("media-heading");
      if( elms.length > 0 ){
        let title = elms[0].textContent;
        return title.trim();
      }else{
        console.log("ERROR: BookTitle �̎擾�Ɏ��s");
        return "";
      }
    }
  }
})();