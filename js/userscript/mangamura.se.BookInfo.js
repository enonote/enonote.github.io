// Require jQuery2.2.4
// BookInfoクラス
var BookInfo = class {
  constructor(obj){
    if( obj ){
      this._bookId = obj["_bookId"];
      this._bookTitle = obj["_bookTitle"];
      this._bookCategory = obj["_bookCategory"];
      this._fileUrlList = obj["_fileUrlList"];
    }else{
      this._bookId = "";
      this._bookTitle = "";
      this._bookCategory = "";
      this._fileUrlList = [];
    }
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
  set bookCategory(bookCategory){
    this._bookCategory = bookCategory;
    if( this._bookCategory == null ){
      console.log("(BookInfo Class)Invalid value: bookCategoryにnullがセットされました。");
    }
  }
  get bookCategory(){
    return this._bookCategory;
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
    
    _getFileList(that.bookId ,that.bookCategory ,that.bookTitle).done(function(fileList){
      that.fileUrlList.push(fileUrl);
      dfd.resolve();
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

    function _getFileList(bookId ,category ,title ){
      console.log("DEBUG: _getFileList bookId = "+bookId + " ,category = "+category + " ,title = "+title);
      var dfd = $.Deferred();
      
      var datas = $.ajax({
            type: 'GET',
            datatype: 'html',
            url: "http://mangamura.se/"+category+"/"+encodeURI(title)
        }).done(function(data){
            console.log("DEBUG: _getFileList done");
            parseBookPage(data).done(function(obj){
                let fileUrlList = [];
                for(let i=1 ; i <= obj.page ;i++){
                  fileUrlList.push("http://comic1.mangamura.se/"+bookId+"/"+ (("0000" + i).slice(-4)) +".jpg");
                }
                dfd.resolve(fileUrlList);
            }).fail(function(){
                console.log("ERROR：リクエストキーの取得に失敗");
                dfd.reject();
            });
        }).fail(function(){
            console.log("ERROR：ビュワーの取得に失敗");
            dfd.reject();
        }).always(function(){
        });

        return dfd.promise();

        function parseBookPage(htmlStr){

          console.log("DEBUG: CALL parseBookPage");
          console.log(htmlStr);
          
          let r = htmlStr.match(/"<span class=\"book_max_num\">(.*?)</span>"/m);
          if( r ){
            page = r[1];
            console.log("DEBUG: page = "+page);
          }else{
            console.log("ERROR: parseBookPage page取得失敗");
            dfd.reject();
            return;
          }
          
          return {"page":Number(page)};
        }
     }
  }
}
