$(document).ready(function(){function t(){$("#map-view").css("top",$(this).scrollTop()/4*3/10),Number($("#map-view").css("top").replace(/px/,""))+80>225&&$("#map-view").css("top",144),$("#map-view").css("left",$(this).scrollLeft()/4*3/10)}function e(t,e,i){if($(".note:last").attr("id"))var o=Number($(".note:last").attr("id").replace(/note/,""));else var o=1;$.post(window.location+t,{authenticity_token:$("#authenticity_token").text(),method:t,sheet_id:i,note_id:e,x:$("#main").scrollLeft()+$("aside").width(),y:$("#main").scrollTop()+70,last:o},function(){$.getJSON(window.location+"/note",{sheet_id:i,note_id:o+1},function(t){var e='<div class="note" id="note'+t.note_num+'" ><article class="text">'+t.body+'</article><p class="title" >'+t.title+"</p></div>";$("#sheet").append(e),$("#note"+t.note_num).css({background:"white",position:"absolute",border:"solid","z-index":0,display:"block",overflow:"hidden",padding:"0.2em"}),setup_note("#note"+t.note_num);var i=new Array(t);layout_sheet("#note",i,1);var o=$(".note:last").attr("id"),n=$(".note:last .title").text();$(".side-note:last").after('<div class="side-note" id="side'+o+'">'+n+"</div>")})})}if($(window).keydown(function(t){return 9==t.keycode?!1:void 0}),window.location.pathname.match(/sheets\/[0-9]*/)){var o=$(".title").attr("id").replace(/sheet/,""),n=Donatello.paper("paper-div",0,0,4e3,3e3),s=parseInt(s);$("#main").scrollLeft($("#main").width()),$("#main").scrollTop($("#main").height()),$("#main").css("width",window.innerWidth-20),$("#main").css("height",window.innerHeight-150),$(window).resize(function(){$("#main").css("width",window.innerWidth),$("#main").css("height",window.innerHeight-150)}),$("#side-menu").tabs(),$.getJSON(window.location+".json",function(t){$(this).layout_sheet("#note",t,1),$(this).layout_sheet("#mnote",t,.07)}),$(this).setup_note(".note",o,n),$(this).draw_line(0,n),$(this).canvas_event(o,n),$("#show_sheet").css("visibility","hidden"),$(".notebooks").accordion({header:"h5",collapsible:!0,autoHeight:!1}),$("#tab4").accordion({header:"h5",collapsible:!0,autoHeight:!1})}$(".map").each(function(){var t=$(this).attr("id").replace(/map/,"");$.getJSON("http://"+window.location.host+"/sheets/notes.json",{sheet_id:t},function(e){$(this).layout_sheet("#snote"+t,e,.07)})}),$(".smap").each(function(){var t=$(this).attr("id").replace(/smap/,"");$.getJSON("http://"+window.location.host+"/groups/"+t+"/sheet.json",function(e){$(this).layout_sheet("#ssnote"+t,e,.07)})}),$("#json_download").click(function(){window.location.href=window.location+".json"}),$("#json_upload").click(function(t){$("#upload").css("visibility","visible"),$("#upload").dialog({title:"\u30d5\u30a1\u30a4\u30eb\u8aad\u307f\u8fbc\u307f",width:"auto",height:"auto",open:function(t){},close:function(t){}})}),$("#share").click(function(t){$("#share_form").css("visibility","visible"),$("#share_form").dialog({title:"\u30b7\u30fc\u30c8\u5171\u6709",width:"auto",height:"auto",open:function(t){},close:function(t){}})}),$("#main").bind("scroll",t),$("#map-view").draggable({containment:"parent",drag:function(e){$("#main").unbind("scroll",t)},stop:function(){$("#main").bind("scroll",t),$("#main").scrollTop(Number($("#map-view").css("top").replace(/px/,""))/.07),$("#main").scrollLeft(Number($("#map-view").css("left").replace(/px/,""))/.07)}}),$("#map-hidden").click(function(){"-"==$("#map-hidden").html()?($("#map").hide(),$("#map-hidden").html("+")):($("#map").show(),$("#map-hidden").html("-"))}),$(".add_image").click(function(t){var i=t.target.id.replace(/add_image/,"");e("/new_image",i,o)}),$(".add_enote").click(function(t){var i=t.target.id.replace(/add_enote/,"");e("/new_note",i,o)}),$(".show_enote").click(function(){$(".notebooks").css("visibility","hidden"),$(".enote").css("visibility","visible"),$(".enote").html($("#"+$(this).parent().parent().parent().attr("id")).html()),$(".hidden_body").css("display","block"),$(".note_body").css("display","none"),$(".enote .show_enote").html("Back"),$(".enote .show_enote").click(function(){$(".notebooks").css("visibility","visible"),$(".hidden_body").css("display","none"),$(".note_body").css("display","block"),$(".enote").css("visibility","hidden"),$(".enote").html("")})}),$(".add_sheet").click(function(t){var e=t.target.id.replace(/add_sheet/,""),n=$(".note").size(),s=$(".line").size();if($(".note:last").attr("id"))var a=$(".note:last").attr("id").replace(/note/,"");else var a=1;$.post(window.location+"/add_sheet",{authenticity_token:$("#authenticity_token").text(),sheet_id:o,add_id:e,last:a},function(){$.getJSON(window.location+".json",function(t){var t=t.slice(n);for(i in t){var e='<div class="note" id="note'+t[i].note_num+'" ><article class="text">'+t[i].body+'</article><p class="title" >'+t[i].title+"</p></div>";$("#sheet").append(e),$("#note"+t[i].note_num).css({background:t[i].bg_color,position:"absolute",border:"solid","z-index":0,display:"block",overflow:"hidden",padding:"0.2em"});Number(t[i].note_num)+n;$(this).setup_note("#note"+t[i].note_num),$("#map").append('<div class="mnote" id="mnote'+t[i].note_num+'"></div>'),$("#mnote"+t[i].note_num).css({"background-color":t[i].bg_color,position:"absolute",border:"solid","z-index":0,display:"block",overflow:"hidden",padding:"0.2em"}),$("#mnote"+t[i].note_num).css({top:.07*t[i].x,left:.07*t[i].y,height:.07*t[i].height,width:.07*t[i].width})}$(this).layout_sheet("#note",t,1),$(this).draw_line(s)})})}),$(".show_sheet").click(function(t){if(t.target.id.match(/show_sheet/))var e=t.target.id.replace(/show_sheet/,""),o="http://"+window.location.host+"/sheets/"+e+".json";else var e=t.target.id.replace(/show_group/,""),o="http://"+window.location.host+"/groups/"+e+"/sheet.json";$("#show_sheet").css("visibility","visible"),$("#show_sheet").dialog({title:"\u7de8\u96c6",height:window.innerHeight-50,width:window.innerWidth-100,modal:!0,open:function(t){$.getJSON(o,function(t){for(i in t){var e=Number(i)+1,o='<div class="note" id="vnote'+e+'" ><article class="text">'+t[i].body+'</article><p class="title" >'+t[i].title+"</p></div>";$("#ssheet").append(o),$("#vnote"+e).css({background:"white",position:"absolute",border:"solid","z-index":0,display:"block",overflow:"hidden",padding:"0.2em"})}$(this).layout_sheet("#vnote",t,1)})},close:function(t){$("#show_sheet > div").empty()}})})});