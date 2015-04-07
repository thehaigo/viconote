$(document).ready(function(){
//初期化処理


  	var sheet_id = $(".title").attr("id").replace(/sheet/,"");
	var paper = Donatello.paper('paper-div', 0, 0, 4000, 3000 );
	var width = parseInt(width)
	$("#main").scrollLeft($("#main").width())
	$("#main").scrollTop($("#main").height())
	$("#side-menu").tabs()
	$.getJSON(window.location + ".json",function(notes){
		$(this).layout_sheet("#note",notes,1)
		$(this).layout_sheet("#mnote",notes,0.07)
	})
	$(this).draw_line(0,paper)
	
	$("#main").bind("scroll",scroll_move)
	function scroll_move(){
		$("#map-view").css("top",($(this).scrollTop()/4*3/10)) 
		if(Number($("#map-view").css("top").replace(/px/,""))+80 > 225){
			$("#map-view").css("top",144) 
		}
		$("#map-view").css("left",($(this).scrollLeft()/4*3/10))
	}
	
	$("#map-view").draggable({
		containment:"parent",
		drag:function(e){
			$("#main").unbind("scroll",scroll_move)

		},
		stop:function(){
			$("#main").bind("scroll",scroll_move)
			$("#main").scrollTop(Number($("#map-view").css("top").replace(/px/,""))/ 0.07)
			$("#main").scrollLeft(Number($("#map-view").css("left").replace(/px/,""))/ 0.07)
		}		
	})
	
	$("#map-hidden").click(function(){
		if($("#map-hidden").html() == "-"){
			$("#map").hide()
			$("#map-hidden").html("+")
		}else{
			$("#map").show()
			$("#map-hidden").html("-")
		}	

	})
	
	$("#start").click(function(){

		$("#next").unbind("click")
		$(".note").css("visibility","hidden")
		$(".mnote").css("visibility","hidden")
		$(".note:first").css("visibility","visible")
		$(".mnote:first").css("visibility","visible")
		$("#next").removeClass()
		$("#next").addClass("note1")

		$("#main").scrollTop(Number($(".note:first").css("top").replace(/px/,""))-100)
		$("#main").scrollLeft(Number($(".note:first").css("left").replace(/px/,""))-200)
		$("#next").bind("click",function(){
			var num = Number($("#next").attr("class").replace(/note/,""))+1
			var eq = ".note:eq("+num+")"
			var meq = ".mnote:eq("+num+")"

			$("#next").removeClass()
			$(eq).css("visibility","visible")
			$(meq).css("visibility","visible")
			$("#next").addClass("note"+num)

			$("#main").scrollTop(Number($(eq).css("top").replace(/px/,""))-100)
			$("#main").scrollLeft(Number($(eq).css("left").replace(/px/,""))-200)		
		})

	})
	

})