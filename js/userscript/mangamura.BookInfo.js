// Require jQuery2.2.4

// BookInfoクラス
var BookInfo = class {
  constructor(obj){
    if( obj ){
      this._bookId = obj["_bookId"];
      this._bookTitle = obj["_bookTitle"];
      this._fileUrlList = obj["_fileUrlList"];
    }else{
      this._bookId = "";
      this._bookTitle = "";
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
      console.log("DEBUG: _getRequestKey bookId = "+bookId);
      var dfd = $.Deferred();
      
      var datas = $.ajax({
            type: 'GET',
            datatype: 'html',
            url: "http://mangamura.org/",
            data:{ "p": bookId }
        }).done(function(data){
            console.log("DEBUG: _getRequestKey done");
            parseBookPage(data,bookId).done(function(obj){
                dfd.resolve(obj.key);
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

        function parseBookPage(htmlStr,bookId){
          var dfd = $.Deferred();
          console.log("DEBUG: CALL parseBookPage");
          console.log(htmlStr);
          
          let r = htmlStr.match(/"authview"\s*,\s*"(.*?)"/m);
          let auth = "";
          if( r ){
            auth = r[1];
            console.log("DEBUG: auth = "+auth);
            document.cookie ="authview="+auth;
          }else{
            console.log("ERROR: parseBookPage authキー取得失敗");
            dfd.reject();
            return;
          }
          
          $.ajax({
            url: "http://mangamura.org/pages/getxb",
            type: 'get',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            scriptCharset: 'utf-8',
            data:{
              wp_id: bookId
            }
          }).done(function(data){
            console.log("DEBUG: parseBookPage done");

            // データチェック
            var r = data.match(/([A-z0-9]{13,13})/);
            console.log(r);
            if( r ){
              dfd.resolve({"id": bookId, "key": data});
            }else{
              console.log("ERROR: parseBookPage データチェックエラー");
              dfd.reject();
            }
            
          }).fail(function(){
            console.log("DEBUG: parseBookPage リクエストキーの取得に失敗");
            dfd.reject();
          });

          // 10秒でタイムアウト
          setTimeout(function(){
            if( dfd.state() == "pending" ){
              alert("ERROR: parseBookPage リクエストがタイムアウト");
              dfd.resolve();
            }
          },1000*60);
          
          return dfd.promise();

        }
        
        // 取得したHTMLからKEYを抽出
        function parseViewerPage(htmlStr,bookId){
          var dfd = $.Deferred();
          
          console.log("DEBUG: parseViewerPage");
          console.log(htmlStr);

          console.log("DEBUG: parseViewerPage send getRequestKey request.");
          $.ajax({
            url: "http://mangamura.org/pages/getxb",
            type: 'get',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            scriptCharset: 'utf-8',
            data:{
              wp_id: bookId
            }
          }).done(function(data){
            console.log("DEBUG: parseViewerPage done");

            // データチェック
            var r = data.match(/([A-z0-9]{13,13})/);
            console.log(r);
            if( r ){
              dfd.resolve({"id": bookId, "key": data});
            }else{
              console.log("ERROR: parseViewerPage データチェックエラー");
              dfd.reject();
            }
            
          }).fail(function(){
            console.log("DEBUG: parseViewerPage リクエストキーの取得に失敗");
            dfd.reject();
          });

          // 10秒でタイムアウト
          setTimeout(function(){
            if( dfd.state() == "pending" ){
              alert("ERROR: parseViewerPage リクエストがタイムアウト");
              dfd.resolve();
            }
          },1000*60);
          
          return dfd.promise();
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
