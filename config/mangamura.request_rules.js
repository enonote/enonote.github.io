[
{
  "url" : /^http:\/\/mangamura.org\/pages\/getxb/,
  "headers" : function(){
    var prm = "";
    var q = request.original_uri.query;
    var m = q.match(/wp_id=(\d{10,10})/);
    if( m ){
      prm = m[1];
    }else{
      return {};
    }
    
    return {
      "referer" : "http://mangamura.org/kai_pc_viewer?p=" + prm
    };
  }
}
]
