/*
  jQuery.dropCap plugin
  Version 1.0.0 - 20140430
  @requires jQuery v1.2.3, recommends v1.2.6
  By Abhishek Ghosh & Licensed under GNU GPL 3.0 Licence
*/

(function($) {
// Unicode resource - http://unicode.org/versions/Unicode4.1.0/
// CJK unified => 4E00-9FFF
// Korean _syllables_ => AC00-D7A3
// Latin extended => 00C0-02B8
var CJKrx = /^\s*([^\uAC00-\uD7A3\u4E00-\u9FFF]?[\u00C0-\u02B8\uAC00-\uD7A3\u4E00-\u9FFF])(.*)/im;
var ExtRx = /^\s*([^a-z\u00C0-\u02B8]?[a-z\u00C0-\u02B8])(.*)/im;
var ASCIIrx = /^\s*(\W?[a-z])(.*)/im;
var UnifiedRx = /^\s*([^a-z\u00C0-\u02B8\uAC00-\uD7A3\u4E00-\u9FFF]?[a-z\u00C0-\u02B8\uAC00-\uD7A3\u4E00-\u9FFF])(.*)/im;

var Mode = {
  "ascii":ASCIIrx
 ,"cjk":CJKrx
 ,"extended":ExtRx
 ,"unified":UnifiedRx
};

var dCSS = {
   opacity:0.7           // Big charector will appear darker.
  ,padding:0
  ,display:"block"
  ,textAlign:"right"
  ,float:"left"          // Other text should flow around it.
  ,fontStyle:"normal"    // Italics would be bad here.
  ,fontWeight:"bold"     // Bold will be good.
  ,overflow:"visible"    // Bottom margin can clip.
  ,textDecoration:"none" // When drop cap is a link. ! important breaks IE
};

$.fn.dropJ = function(arg) {
    var opts = $.extend({}, $.fn.dropJ.defaults, arg);
    return this.each(function() {
      $this = $(this);
      var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
      if ( _addDropCap($this.get(0),$this.get(0),o) && o.clear )
      {
          $this.css({clear:"left"});
      }
    });
};

$.fn.dropJ.defaults = {
    "css":dCSS
   ,"clear":true
   ,"keepCase":true
   ,"regex":Mode.ascii
   ,"element":"span"
   ,"factor":3
   ,"toggleFamily":false
   ,"class":"dropj"
};

function _addDropCap(c,n,o) {
   var rx = Mode[o.mode] || Mode.ascii;
   if ( ( n.nodeType == 3 ) && n.nodeValue.match(rx) )
   {
      var val = n.nodeValue;
      val = val.replace(/\n+/g, " "); // stupid Rx is missing s flag.
      var capRemainder = val.match(rx);

      // this shuffle step courtesy of uneven Rx handling across browsers
      var capText = capRemainder ?
            capRemainder[ capRemainder.length - 2 ] : '';
      var remainderText = capRemainder ?
            capRemainder[ capRemainder.length - 1 ] : '';

      if ( ! o.keepCase ) capText = capText.toUpperCase();
      var cap = document.createTextNode(capText);
      var remainder = document.createTextNode(remainderText);
      var dropCap = document.createElement(o["element"]);
      dropCap.appendChild(cap);
      n.parentNode.replaceChild(remainder,n);
      remainder.parentNode.insertBefore(dropCap,remainder);
      $(dropCap).css(o["css"]);
      $(dropCap).addClass(o["class"]);
      _setSpecialCSS(c,dropCap,o)
      return dropCap;
   }
   else if ( n.nodeType == 3 )
   {
      $(n).parent().css({float:"left",display:"inline"});
   }
   for ( var i = 0; i < n.childNodes.length; i++ )
   {
      var dc = _addDropCap(c,n.childNodes[i],o);
      if ( dc ) return dc;
   }
};

function _setSpecialCSS(c,dc,o){
  var h = $(dc).css("lineHeight");
  if ( o.factor == true )
  {
  // should have an immediate fail case, yes? width v height test
     if ( o.hang )
     {
        var fs = ( $(c).height() ) + "px";
        var lh = ( $(c).height() * .9 ) + "px";
        $(dc).css({fontSize:fs,lineHeight:lh});
        _update_hang(dc); // do a mini-recurse here too...? everwhere?
     }
     else
     {
       var i = 6;
       while ( i-- ) {
         if ( $(dc).height() >= $(c).height() ) break;
         if ( $(dc).width() > ( .4 * $(c).width() ) ) break;
         var fs = ( $(c).height() * 1.2 ) + "px";
         var lh = ( $(c).height() * 1 ) + "px";
         $(dc).css({fontSize:fs,lineHeight:lh});
       }
       var mb = ( -1 * $(dc).height() / 9 ) + "px";
       $(dc).css({marginBottom:mb});
     }
  }
  else if ( h.substr(h.length - 2, 2) == "px" ) // pixel mode
  {
     var px = h.substring(0,h.length - 2);
     var mt = ( -1 * Math.round( px / 10 ) ) + "px";
     var mb = ( -1 * Math.round( px / 5 ) ) + "px";
     $(dc).css({marginTop:mt,marginBottom:mb});
     var fs = ( o.factor * 1.05 * px ) + "px";
     var lh = ( o.factor * px * 0.98 ) + "px";
     $(dc).css({fontSize:fs,lineHeight:lh});
  }
  else // em mode
  {
     var fs = ( o.factor * 1.05 ) + "em";
     $(dc).css({fontSize:fs});
     $(dc).css({margin:"-.1ex 0 -.25ex 0",lineHeight:"95%"});
  }
  if ( o.hang ) _update_hang(dc);
}
function _update_hang(dc){
   var m = ( -1 * $(dc).width() ) + "px";
   $(dc).css({marginLeft:m,marginRight:m});
}

})(jQuery);
