
$(document).ready(function(){
//初期化処理
	$(window).keydown(function(e){
		if(e.keycode == 9){
			return false
		}
	})
	if(window.location.pathname.match(/sheets\/[0-9]*/)){
	
  	var sheet_id = $(".title").attr("id").replace(/sheet/,"");
	var paper = Donatello.paper('paper-div', 0, 0, 4000, 3000 );
	var width = parseInt(width)
	$("#main").scrollLeft($("#main").width())
	$("#main").scrollTop($("#main").height())
	$("#main").css("width",window.innerWidth - 20)
	$("#main").css("height",window.innerHeight - 150)
	$(window).resize(function(){
		$("#main").css("width",window.innerWidth)
		$("#main").css("height",window.innerHeight - 150)
	})
	$("#side-menu").tabs()
	$.getJSON(window.location + ".json",function(notes){
		$(this).layout_sheet("#note",notes,1)
		$(this).layout_sheet("#mnote",notes,0.07)
	})
	$(this).setup_note(".note",sheet_id,paper)
	$(this).draw_line(0,paper)
	$(this).canvas_event(sheet_id,paper)
	
	$("#show_sheet").css("visibility","hidden")
	$(".notebooks").accordion({
		header:"h5",
		collapsible:true,
		autoHeight:false
	})
	$("#tab4").accordion({
		header:"h5",
		collapsible:true,
		autoHeight:false
	})
	/*
	$("#split").splitter({minAsize:440,maxAsize:800,splitVertical:true
		,A:$("#side-menu"),B:$("#main"),closeableto:1}
	)
*/

}

	$(".map").each(function(){
		var id =$(this).attr("id").replace(/map/,"")
		$.getJSON("http://"+window.location.host+"/sheets/notes.json",{sheet_id:id},function(notes){
			$(this).layout_sheet("#snote"+id,notes,0.07)		
		})
	})

	$(".smap").each(function(){
		var id =$(this).attr("id").replace(/smap/,"")
		$.getJSON("http://"+window.location.host+"/groups/"+id+"/sheet.json",function(notes){
			$(this).layout_sheet("#ssnote"+id,notes,0.07)		
		})
	})
	
	

	$("#json_download").click(function(){
		window.location.href = window.location + ".json"
	})
	$("#json_upload").click(function(e){
		$("#upload").css("visibility","visible")
		$("#upload").dialog({
			title:"ファイル読み込み",
			width:"auto",
			height:"auto",
			open:function(e){},
			close:function(e){}
		})
	})
	$("#share").click(function(e){
		$("#share_form").css("visibility","visible")
		$("#share_form").dialog({
			title:"シート共有",
			width:"auto",
			height:"auto",
			open:function(e){},
			close:function(e){}
		})
	})	

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
	



	//１つのEnoteだけを表示する	
	$(".add_image").click(function(ev){
		var id = ev.target.id.replace(/add_image/,"")
		add("/new_image",id,sheet_id)
		})
	$(".add_enote").click(function(ev){
		var id = ev.target.id.replace(/add_enote/,"")
		add("/new_note",id,sheet_id)
	})
	
	function add(url,id,sheet_id){
		if($(".note:last").attr("id")){
			var last = Number($(".note:last").attr("id").replace(/note/,""))
		}else{
			var last = 1
		}
		$.post(
			window.location+url,
			{
				authenticity_token:$("#authenticity_token").text(),
				method:url,
				sheet_id:sheet_id,
				note_id:id,
				x:$("#main").scrollLeft() + $("aside").width(), 
				y:$("#main").scrollTop() + 70,
				last:last
			},	
			function(){
				$.getJSON(
					window.location+"/note",{sheet_id:sheet_id,note_id:last+1},
					function(data){
							var note = '<div class="note" id="note'+data.note_num+'" ><article class="text">'+data.body+'</article><p class="title" >'+data.title+'</p></div>'
							$("#sheet").append(note)
							$("#note"+data.note_num).css({
								"background":"white",
								"position":"absolute",
								"border":"solid",
								"z-index":0,
								"display":"block",
								"overflow":"hidden",
								"padding":"0.2em"
							})
								setup_note("#note"+data.note_num)
					
						var ary = new Array(data)
							layout_sheet("#note",ary,1)
						var note_id = $(".note:last").attr("id")
						var note_title = $(".note:last .title").text()
						$(".side-note:last").after('<div class="side-note" id="side'+note_id+'">'+note_title +'</div>')
					}
				)
			}
		)
	}
	
	$(".show_enote").click(function(){
		$(".notebooks").css("visibility","hidden")
		$(".enote").css("visibility","visible")
		$(".enote").html($("#"+$(this).parent().parent().parent().attr("id")).html())
		$(".hidden_body").css("display","block")
		$(".note_body").css("display","none")
		$(".enote .show_enote").html("Back")
		$(".enote .show_enote").click(function(){
			$(".notebooks").css("visibility","visible")
			$(".hidden_body").css("display","none")
			$(".note_body").css("display","block")
			$(".enote").css("visibility","hidden")
			$(".enote").html("")			
		})

	})

	$(".add_sheet").click(function(ev){
		var id = ev.target.id.replace(/add_sheet/,""),
			note_num = $(".note").size(),
			line_num = $(".line").size()
			
			if($(".note:last").attr("id")){
				var last = $(".note:last").attr("id").replace(/note/,"")
			}else{
				var last = 1
			}
		$.post(
			window.location+"/add_sheet",
			{
				authenticity_token:$("#authenticity_token").text(),
				sheet_id:sheet_id,
				add_id:id,
				last:last
			},
			function(){$.getJSON(
				window.location+".json",
				function(notes){
					
					var notes = notes.slice(note_num)
					for(i in notes){
						var note = '<div class="note" id="note'+notes[i].note_num+'" ><article class="text">'+notes[i].body+'</article><p class="title" >'+notes[i].title+'</p></div>'
						$("#sheet").append(note)
						$("#note"+notes[i].note_num).css({
							"background":notes[i].bg_color,
							"position":"absolute",
							"border":"solid",
							"z-index":0,
							"display":"block",
							"overflow":"hidden",
							"padding":"0.2em"
						})
						var num = Number(notes[i].note_num) + note_num
						$(this).setup_note("#note"+notes[i].note_num)
						$("#map").append('<div class="mnote" id="mnote'+notes[i].note_num+'"></div>')
						$("#mnote"+notes[i].note_num).css({
							"background-color":notes[i].bg_color,
							"position":"absolute",
							"border":"solid",
							"z-index":0,
							"display":"block",
							"overflow":"hidden",
							"padding":"0.2em"
						})
						$("#mnote"+notes[i].note_num).css({"top":notes[i].x*0.07,"left":notes[i].y*0.07,"height":notes[i].height*0.07,"width":notes[i].width*0.07})
					}
						$(this).layout_sheet("#note",notes,1)
						
						$(this).draw_line(line_num)
				}
			)}
			
		)
	})
	
	$(".show_sheet").click(function(ev){
		if(ev.target.id.match(/show_sheet/)){
			var id = ev.target.id.replace(/show_sheet/,"")
			var url = "http://"+window.location.host+"/sheets/"+id+".json"
		}else{
			var id = ev.target.id.replace(/show_group/,"")
			var url = "http://"+window.location.host+"/groups/"+id+"/sheet.json"
		}
		$("#show_sheet").css("visibility","visible")
		$("#show_sheet").dialog({
			title:"編集",
			height:window.innerHeight -50,
			width:window.innerWidth- 100,
			modal:true,
			open: function(e){ 
				$.getJSON(url,function(notes){
					for(i in notes){
						var num = Number(i) +1
						var note = '<div class="note" id="vnote'+num+'" ><article class="text">'+notes[i].body+'</article><p class="title" >'+notes[i].title+'</p></div>'
						$("#ssheet").append(note)
					
					$("#vnote"+num).css({
						"background":"white",
						"position":"absolute",
						"border":"solid",
						"z-index":0,
						"display":"block",
						"overflow":"hidden",
						"padding":"0.2em"
					})
				}
					$(this).layout_sheet("#vnote",notes,1)
				})
			},
			close: function(e){
				$("#show_sheet > div").empty()
			} 
		})
	})
	
})
