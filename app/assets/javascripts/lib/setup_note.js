
(function($){

	$.fn.setup_note = function(id,sheet_id,paper){
		var paper = paper
		drag_note(id,sheet_id,paper);
		resize_note(id,sheet_id);
		edit_note(id,sheet_id);
		$(this).note_event(id,sheet_id,paper);
	};
	$.fn.canvas_event = function(sheet_id,paper){
　　　		$(".canvas").haloContext({
			bindings:{
		　		"New":function(ev){new_note(ev,1,"black","white",sheet_id,paper)},
				"Red":function(ev){new_note(ev,1,"black","red",sheet_id,paper)},
				"Blue":function(ev){new_note(ev,1,"white","blue",sheet_id,paper)},
				"Green":function(ev){new_note(ev,1,"white","green",sheet_id,paper)},
				"Yellow":function(ev){new_note(ev,1,"black","yellow",sheet_id,paper)}
			
			}
		})
	}
	//初期位置データ取得		
	 $.fn.layout_sheet = function(id,notes,scale){
		for(i in notes){
			var note = notes[i];
			var nid = id + note.note_num;
			$(nid).css({
				left:note.x *scale,
				top:note.y * scale,
				width:note.width * scale,
				height:note.height *scale,
				color:note.color,
				"text-align":note.text_align,
				"font-size":note.font_size,
				"background-color":note.bg_color,
				"z-index":note.z
			})
			if(note.united_num > 0 && id == "#note"){
				$(nid).addClass("u-ele")
				$(nid).addClass("und"+note.united_num)
			}
			if(note.unite_flag && id == "#note"){
				$(nid).addClass("unite")
			}
		}
		
		if(id == "#note"){
			$.each($(".u-ele"),function(){
				var united_id = String($(this).attr("class").match(/und[0-9]+/)).replace(/und/,"")
				$(this).appendTo($("#note"+united_id))
				var parent_id = $("#note"+united_id+":parent").attr("id")
				if($("#"+parent_id).attr("class").match(/unite/) && $("#"+parent_id).attr("class").match(/u-ele/)){
					var unote = $("#"+$(this).attr("id")+":parent")
					var	ux = Number(unote.css("left").replace(/px/,"")),
						uy = Number(unote.css("top").replace(/px/,""))

				}else{
					var ux = 0,uy =0
				}
				var x = Number($("#note"+united_id).css("left").replace(/px/,"")),
					y = Number($("#note"+united_id).css("top").replace(/px/,""))	
					$(this).css({
						"left":Number($(this).css("left").replace(/px/,"")) - x,
						"top":Number($(this).css("top").replace(/px/,"")) - y,
						"postion":"relative"
					})
				
			})
		}
     }

	$.fn.draw_line = function(num,paper){
		var url = String(window.location).replace(/\/detail/,"")
		$.getJSON(url+"/lines.json",function(lines){
			var lines = lines.slice(num)
			for(i in lines){
				var data = lines[i],
			 		note1 = "#note" + data.note_id,
			 		note2 = "#note" + data.connected_id,		 	
					pos1 = $(note1).position(),
					pos2 = $(note2).position(),
					x1 = pos1.left + Number($(note1).css("width").replace(/px/,""))/2,
			 		y1 = pos1.top +  Number($(note1).css("height").replace(/px/,""))/2,
					x2 = pos2.left + Number($(note2).css("width").replace(/px/,""))/2,
			 		y2 = pos2.top +  Number($(note2).css("height").replace(/px/,""))/2,
			 		line = paper.line(x1,y1,x2-x1,y2-y1)
				$("#paper-div > div:last").attr("id",data.title)
				$("#"+data.title).addClass("line")
				$(note1).addClass("connected")
				$(note1).addClass(data.title)
				$(note2).addClass("connected")
				$(note2).addClass(data.title)			
				$("#"+data.title).css("z-index",$(note1).css("z-index"))			
			}
		})
	}
	
	$.fn.note_event = function(id,sheet_id,paper){
		$(id).haloContext({
			bindings:{
				"Edit":function(){
					edit_dialog($(this).attr("id").replace(/hb[0-9]+/,""),sheet_id)
				},
				"Divide":function(ev){divide_note(ev,1,sheet_id,paper)},
				"Divide 2改行":function(ev){divide_note(ev,2,sheet_id,paper)},
				"Line":function(ev){line(ev,sheet_id,paper)},
				"DeleteLine":function(ev){delete_line(ev,sheet_id)},
				"Up":function(ev){up(ev,sheet_id)},
				"Down":function(ev){down(ev,sheet_id)},
				"Delete":function(ev){delete_note(ev,sheet_id)},
				"New":function(ev){
					var note_id = ev.target.id.replace(/hb[0-9]/,"")
					var z = Number($("#"+note_id).css("z-index")) + 1
					new_note(ev,z,"black","white",sheet_id,paper)
				},
				"Pick":function(ev){pick_note(ev)},
				"Unite":function(ev){unite_note(ev,sheet_id)},
				"Ununite":function(ev){ununite_note(ev,sheet_id)}
			}
		});
	};
	//noteのプロパティ編集ダイアログ
		function edit_dialog(note_id,sheet_id){
			var id = 0
		
			$("#dialog").css("visibility","visible")

			$("#dialog").dialog({
				title:"編集",
				height:500,
				width:1100,
				buttons:{
					"保存":function(){
						var body = $("#note_body").val().replace(/\n/g,'<br clear="none">')
						$.post(window.location+"/edit_note",
							{
								mode:"edit",
								authenticity_token:$("#authenticity_token").text(),
								note_id:$("#note_id").val(),
								sheet_id:sheet_id,
								note_title:$("#note_title").val(),
								note_body:body,
								background_color:$("#background_color").val(),
								font_size:$("#font_size").val(),
								font_color:$("#font_color").val(),
								text_align:$("#text_align").val()
							},
							function(){
							
								$("#text"+id).html(body)
								$("#note"+$("#note_id").val()).css({
									color:$("#font_color").val(),
									"background-color":$("#background_color").val(),
									"font-size":$("#font_size").val(),
									"text-align":$("#text_align").val()
									})

								$("#dialog").dialog("close")
							}
						)
					}
				},
				open: function(e){
					
					id = note_id.replace(/note/,"")
					
					$.getJSON(window.location + "/note.json",{note_id:id,sheet_id:sheet_id},function(note){
					
						$("#note_id").val(id)
						$("#note_title").val(note.title)
						$("#note_body").val(note.body.replace(/<br clear="none">/g,"\n"))
						$("#background_color").val(note.bg_color)
						$("#font_size").val(note.font_size)
						$("#font_color").val(note.color)
						$("#text_align").val(note.text_align)
					})
			
				
					
				},
				close: function(e){
					$("#note_id").val(0)
					$("#note_title").val("")
					$("#note_body").val("") 
				} 
			})
		}
		
	function new_note(ev,z,font,bg,sheet_id,paper){
		var x = ev.pageX + $("#main").scrollLeft(),
		 	y = ev.pageY + $("#main").scrollTop();
		if($(".note:last").attr("id")){
			var last = $.map($(".note"),function(n){return Number(n.id.replace(/note/,""))}).sort(function(a, b) {
			  return (parseInt(a) > parseInt(b)) ? 1 : -1;
			}).pop()
		}else{
			var last = 1
		}
		$.post(
			window.location+"/new_note",
			{
				authenticity_token:$("#authenticity_token").text(),
				sheet_id:sheet_id,
				x:x- $("#side-menu").width(), 
				y:y- 70,
				z:z,
				font:font,
				bg:bg,
				last:last
			},	
			function(){
				var note_id = "note"+Number(last),
				 	id = Number(note_id.replace(/note/,""))+1,
					note = $("#"+note_id),
					top = y - 70,
					left = x - $("#side-menu").width();				
				$("#sheet").append('<div class="note" id="note'+id+'"><article id="text'+id+'"class="text">新しいノート</article></div>');
				$(this).setup_note("#note"+id,sheet_id,paper);
				$("#note"+id).css({
					"background-color":bg,
					"position":"absolute",
					"border":"solid",
					"z-index":z,
					"display":"block",
					"overflow":"hidden",
					"padding":"0.2em"
				});
				$("#note"+id).css({"top":top,"left":left,"height":60,"width":120});
				$(".side-note:last").after('<div class="side-note" id="side'+id+'">新しいノート</div>');
				$("#map").append('<div class="mnote" id="mnote'+id+'"></div>');
				$("#mnote"+id).css({"top":top*0.07,"left":left*0.07,"height":30*0.07,"width":100*0.07});
			}//callback end
		);//post end
	};//new note end
	
	function delete_note(ev,sheet_id){
		var note_id = ev.target.id.replace(/hb[0-9]+note/,"");
		$.post(window.location+"/delete_note",
			{authenticity_token:$("#authenticity_token").text(),sheet_id:sheet_id,note_id:note_id},
			function(){
				$("#side"+note_id).remove();
				$("#note"+note_id).remove();
				$("#mnote"+note_id).remove();
			}//callback end
		);//post end
	}; //delete note end
	
	function down(ev,sheet_id){
		var note_id = ev.target.id.replace(/hb[0-9]+note/,"");
		$.post(window.location+"/move_z_note",
		{authenticity_token:$("#authenticity_token").text(),sheet_id:sheet_id,note_id:note_id,z:"down"},
		function(){
			var index = Number($("#note"+note_id).css("z-index"))-2;
			if(index <= 0){index = 1} 
			$("#note"+note_id).css("z-index",index);
		});
	};
	
	function up(ev,sheet_id){
		var note_id = ev.target.id.replace(/hb[0-9]+note/,"");
		$.post(window.location+"/move_z_note",
		{authenticity_token:$("#authenticity_token").text(),sheet_id:sheet_id,note_id:note_id,z:"up"},
		function(){
			var index = Number($("#note"+note_id).css("z-index"));
			$("#note"+note_id).css("z-index",index +1);
		});
	};
	
	function line(ev,sheet_id,paper){
		var note_id = ev.target.id.replace(/hb[0-9]+/,""),
		 	note = $("#"+note_id), 
	 		x = Number(note.css("left").replace(/px/,"")) + Number(note.css("width").replace(/px/,""))/2,
		 	y = Number(note.css("top").replace(/px/,"")) +  Number(note.css("height").replace(/px/,""))/2,
			menu = Number($("#side-menu").css("width").replace(/px/,"")),
			header = Number($("header").css("height").replace(/px/,"")) + Number($("nav").css("height").replace(/px/,"")),
			mousex = ev.pageX +$("#main").scrollLeft() -menu -10,
			mousey = ev.pageY  +$("#main").scrollTop() - header ;
			if($("#paper-div > div:last").size() == 0){
				var line_id = "line" + 1;
			}else{
				var max = $.map($(".line"),function(l){return Number(l.id.replace(/line/,""))}).sort(function(a, b) {
				  return (parseInt(a) > parseInt(b)) ? 1 : -1;
				}).pop()
				var line_id = "line" + (max + 1);
			}
			var line = paper.line(x,y,mousex-x,mousey-y);
			$("#paper-div > div:last").attr("id",line_id);
			$("#"+line_id).addClass("line");
			$("#"+line_id).css("z-index",$(note).css("z-index"));
		// draw line between mouse and note
		$("#sheet").bind("mousemove",function(ev){
			$("#"+line_id).remove();
			var mousex2 = ev.pageX+$("#main").scrollLeft()-menu-10,
				mousey2 = ev.pageY+$("#main").scrollTop()-header,
		 		line = paper.line(x,y,mousex2-x,mousey2-y);
			$("#paper-div > div:last").attr("id",line_id);
			$("#"+line_id).addClass("line");
			$("#"+line_id).css("z-index",$(note).css("z-index"));
		})
		//clicked connect note
		$(".note").bind("click",function(e){
			$("#"+line_id).remove();
			$("#sheet").unbind("mousemove");
			$(".note").unbind("click");
			$("#sheet").unbind("click")
			var note_id2 = e.currentTarget.id,
			 	note2 = $("#"+note_id2),
				x2 = Number(note2.css("left").replace(/px/,"")) + Number(note2.css("width").replace(/px/,""))/2,
			 	y2 = Number(note2.css("top").replace(/px/,"")) +  Number(note2.css("height").replace(/px/,""))/2,
				line = paper.line(x,y,x2-x,y2-y);
				
			$("#paper-div > div:last").attr("id",line_id);
			$("#"+line_id).addClass("line");
			$("#"+line_id).css("z-index",$(note).css("z-index"));
			$.post(
				window.location+"/new_line",
				{
					authenticity_token:$("#authenticity_token").text(),
					sheet_id:sheet_id,
					line_id:line_id,note1:note_id.replace(/note/,""),
					note2:note_id2.replace(/note/,"")
				}
			);
			$("#"+note_id).addClass("connected").addClass(line_id);
			$("#"+note_id2).addClass("connected").addClass(line_id);	
		});
		//cancel line
		$("#sheet").bind("click",function(){
			$("#"+line_id).remove();
			$(".note").unbind("click")
			$("#sheet").unbind("mousemove")
			$("#sheet").unbind("click")
		})
	};
	
	function delete_line(ev,sheet_id){
		var note_id = ev.target.id.replace(/hb[0-9]+note/,"");
		$("body").append('<div class="delline"></div>');
		$(".delline").css({left:ev.pageX-25,top:ev.pageY-80});
		
		$.getJSON(window.location+"/line.json",{line_id:note_id},function(lines){
			for(i in lines){
				var id = lines[i].title
				
				if(note_id == lines[i].note_id){
					var connect_id = lines[i].connected_id
				}else{
					var connect_id = lines[i].note_id
				}
				$(".delline").append('<div id="d'+id+'" class="dline" >note'+connect_id+'</div>')
			};
			
			$(".dline").hover(
				function(){
					var color = $("#"+$(this).text()).css("background-color");
					$("#main").append("<div id='color'>"+color+"</div>");
					$("#color").hide();
					$("#"+$(this).text()).css({"background":"#1e90ff","filter":"alpha(opacity=50)"});
				},
				function(){
					var color = $("#color").text();
					$("#"+$(this).text()).css({"background":color,"filter":"alpha(opacity=0)"});
					$("#color").remove();
				}
			);
			
			$(document).one("click",function(){
				$(".delline").remove();
			});
			
			$(".dline").click(function(ev){
				var line_id = ev.target.id.replace(/d/,""),
				 	color = $("#color").css("background-color");
				$.post(
					window.location+"/delete_line",
					{
						authenticity_token:$("#authenticity_token").text(),
						sheet_id:sheet_id,
						line_id:line_id
					}
				)
				$("#"+line_id).remove();
				$("."+line_id).removeClass(line_id)
				$("#"+$(this).text()).css({"background":color,"filter":"alpha(opacity=0)"});
				$("#color").remove();
			});
		});
	};
	
	function divide_note(ev,line,sheet_id,paper){
		var note_id = ev.target.id.replace(/hb[0-9]+note/,""),
		 	z = $("#"+note_id).css("z-index") + 1,
		 	x = ev.pageX + $("#main").scrollLeft(), 
			y = ev.pageY + $("#main").scrollTop(),
			num = $(".note").size();
			var last = $.map($(".note"),function(n){return Number(n.id.replace(/note/,""))}).sort(function(a, b) {
			  return (parseInt(a) > parseInt(b)) ? 1 : -1;
			}).pop()
		$.post(
			window.location + "/divide_note",
			{
				authenticity_token:$("#authenticity_token").text(),
				sheet_id:sheet_id,
				note_id:note_id,
				x:x- $("aside").width(), 
				y:y- 70,
				z:z,
				line:line,
				last:last
			},
			function(){
				$.getJSON(
					window.location+".json",
					function(notes){
						var notes = notes.slice(num);
						for(i in notes){
							var note = '<div class="note" id="note'+notes[i].note_num+'" ><article id="text'+notes[i].note_num+'" class="text">'+notes[i].body+'</article><p class="title" >'+notes[i].title+'</p></div>'
							$("#sheet").append(note)
							$("#note"+notes[i].note_num).css({
								"background":"white",
								"position":"absolute",
								"border":"solid",
								"z-index":z,
								"display":"block",
								"overflow":"hidden",
								"padding":"0.2em"
							});
							$(this).setup_note("#note"+notes[i].note_num,sheet_id,paper);
						}//for end
						$(this).layout_sheet("#note",notes,1);
					});
			});
	};
	
	function pick_note(ev){
		var id = ev.target.id.replace(/hb[0-9]+/,"");
		if($("#"+id).attr("class").match(/picked/)){
			$("#"+id).draggable("enable");
			$("#"+id).removeClass("picked");
		}else{
			$("#"+id).draggable("disable");
			$("#"+id).addClass("picked");
		}
	};
	//noteドラッグ処理

	function drag_note(note,sheet_id,paper){	
		$(note).draggable({
			containment:"parent",
			drag:function(){
					drag_start(this,paper)
			},
			stop:function(){
				if ($(this).attr("class").match(/u-ele/)){
					var unite_note = $(".unite:has(#"+$(this).attr("id")+")").attr("id"),
						x = Number($("#"+unite_note).css("left").replace(/px/,"")),
						y = Number($("#"+unite_note).css("top").replace(/px/,""))
						drag_stop(this,x,y,sheet_id)
				}else{
						drag_stop(this,0,0,sheet_id)
				}
			}
		})
	};
	
	function drag_start(e,paper){
		var note_id = $(e).attr("id"),
			top = Number($("#"+note_id).css("top").replace(/px/,"")),
			left = Number($("#"+note_id).css("left").replace(/px/,""));
	
		if($(e).attr("class").match(/connected/)){
			
			var note = $(e),
			 	lines = $.grep(note.attr("class").split(" "),function(line){return line.match(/line/,"")});
			for(i in lines){
				var connect = $("."+lines[i]),
					note1 = connect.first(),
					pos1 = note1.position(),
					note2 = connect.last(),
					pos2 = note2.position();
				if(note1.attr("class").match(/u-ele/)){
					var pnote1 = $(".unite:has(#"+note1.attr("id")+")"),
						x = Number(pnote1.css("left").replace(/px/,"")),
						y = Number(pnote1.css("top").replace(/px/,"")),
				 		pos1x = x,pos1y = y;
				}else{var pos1x = 0,pos1y=0;}
				if(note2.attr("class").match(/u-ele/)){
					var pnote2 = $(".unite:has(#"+note2.attr("id")+")"),
						x = Number(pnote2.css("left").replace(/px/,"")),
						y = Number(pnote2.css("top").replace(/px/,"")),
				 		pos2x = x,pos2y = y;
				}else{var pos2x = 0,pos2y = 0;}
					x1 = pos1.left + pos1x + Number(note1.css("width").replace(/px/,""))/2,
				 	y1 = pos1.top  + pos1y + Number(note1.css("height").replace(/px/,""))/2,
					x2 = pos2.left + pos2x + Number(note2.css("width").replace(/px/,""))/2,
				 	y2 = pos2.top  + pos2y + Number(note2.css("height").replace(/px/,""))/2;
				$("#"+lines[i]).remove();
			 	var line = paper.line(x1,y1,x2-x1,y2-y1);
				$("#paper-div > div:last").attr("id",lines[i]);
				$("#"+lines[i]).addClass("line")
				$("#ui-draggable-dragging").remove();
				$("#"+lines[i]).css("z-index",$(connect.first()).css("z-index"));
			}//for
		}//if
		
		if($(e).attr("class").match(/u-ele/)){
			$("#m"+note_id).css({"top":(top+y)*0.07,"left":(left+x)*0.07})	
		}else{
			$("#m"+note_id).css({"top":top*0.07,"left":left*0.07})	
		}
				
		if($("#"+note_id).attr("class").match(/unite/)){
			var notes = $.grep($(".u-ele"),function(n){	
				var u_note = "#"+$(n).attr("id")
				return($(".unite:has("+u_note+")").attr("id") == note_id)
			})
			$.each(notes,function(){drag_start(this,paper)})
		}		
	}
		
	function drag_stop(e,x,y,sheet_id){
		var note_id = $(e).attr("id"),
			id   = $(e).attr("id").replace(/note/,""),
		 	left = Number($(e).css("left").replace(/px/,"")) + x,
			top  = Number($(e).css("top").replace(/px/,""))  + y;

		$.post(window.location + "/move_note",
		{
			authenticity_token:$("#authenticity_token").text(),	
			sheet_id:sheet_id,
			note_id:id,
			x:left,y:top
		})
		if($("#"+note_id).attr("class").match(/unite/)){
			var notes = $.grep($(".u-ele"),function(n){	
				var u_note = "#"+$(n).attr("id")
				return($(".unite:has("+u_note+")").attr("id") == note_id)
			})
			$.each(notes,function(){drag_stop(this,left,top,sheet_id)})
		}		
	}
	
	//noteリサイズ処理
	function resize_note(note,sheet_id){
		$(note).resizable({
			stop:function(e,ui){
				var note_id = this.id;

				var width = $("#"+note_id).width();
				var height = $("#"+note_id).height();

				if($("#"+note_id+" > .text >.image").size() >= 1){
					var img = $("#"+note_id+" > .text >.image").children()
					img.width(width)
					img.height(Number(height) - 30)
					$.post(
						window.location + "/resize_note",
						{
							authenticity_token:$("#authenticity_token").text(),
							sheet_id:sheet_id,
							note_id:note_id.replace(/note/,""),
							width:width,
							height:height,
							image:1
						},function(){$("#m"+note_id).css({"width":width*0.07,"height":height*0.07})}
					)

				}else{
					$.post(
						window.location + "/resize_note",
						{
							authenticity_token:$("#authenticity_token").text(),
							sheet_id:sheet_id,
							note_id:note_id.replace(/note/,""),
							width:width,
							height:height
						},function(){$("#m"+note_id).css({"width":width*0.07,"height":height*0.07})}
					)
				}
			}
		})
	}

	//unite
	function unite_note(ev,sheet_id){
	 	var note_id = ev.target.id.replace(/hb[0-9]+/,""),
			note = $("#"+note_id)
		if(note.attr("class").match(/u-ele/)){
			var unote = $(".unite:has(#"+note.attr("id")+")"),
				ux = Number(unote.css("left").replace(/px/,"")),
				uy = Number(unote.css("top").replace(/px/,""))
		}else{
			var ux = 0,uy =0
		}
			
		var	x = Number(note.css("left").replace(/px/,""))+ux,
		 	y = Number(note.css("top").replace(/px/,""))+uy,
		 	z = note.css("z-index"),
		 	width = Number(note.css("width").replace(/px/,"")) +x,
		 	height = Number(note.css("height").replace(/px/,""))+y 
			
		var	notes = $.grep($(".note:not(.u-ele)"),function(obj){
			var note2 = $("#"+obj.id),
			 	x2 = Number(note2.css("left").replace(/px/,"")),
			 	y2 = Number(note2.css("top").replace(/px/,"")),
				z2 = note2.css("z-index")
			return(x2 < width  && x2 > x && height > y2   && y2 > y && z2 >= z)
		})

		$.each(notes,function(){
			var u_note = $(this)
			u_note.css({
				"left":Number(u_note.css("left").replace(/px/,"")) - x,
				"top":Number(u_note.css("top").replace(/px/,"")) - y,
				"postion":"relative",
				
			})
			$(this).appendTo(note)
			$(this).addClass("u-ele")
		})
		note.addClass("unite")
		var u_notes = $.map(notes,function(n,i){return n.id.replace(/note/,"")})

		$.post(window.location+"/unite_note",
			{
				authenticity_token:$("#authenticity_token").text(),
				sheet_id:sheet_id,
				note_id:note_id.replace(/note/,""),
				u_notes:u_notes
			}
		)
	}
	
	function ununite_note(ev,sheet_id){
	 	var note_id = ev.target.id.replace(/hb[0-9]+/,""),
			note = $("#"+note_id),
		 	x = Number(note.css("left").replace(/px/,"")),
		 	y = Number(note.css("top").replace(/px/,"")),
		 	width = Number(note.css("width").replace(/px/,"")) +x,
		 	height = Number(note.css("height").replace(/px/,""))+y 
	 	
		if($("#"+note_id).attr("class").match(/unite/)){
			var notes = $.grep($(".u-ele"),function(n){	
				var u_note = "#"+$(n).attr("id")
				return($(".unite:has("+u_note+")").attr("id") == note_id)
			})
			$.each(notes,function(){
				var u_note = $(this)
				u_note.css({
					"left":Number(u_note.css("left").replace(/px/,"")) + x,
					"top":Number(u_note.css("top").replace(/px/,"")) + y,
					"postion":"absolute",

				})
				$(this).appendTo("#sheet")
				$(this).removeClass("u-ele")
				
			})
			$(note).removeClass("unite")
			$.post(window.location+"/ununite_note",
				{
					authenticity_token:$("#authenticity_token").text(),
					sheet_id:sheet_id,
					note_id:note_id.replace(/note/,"")
				}
			)
		}
	}
	//note　テキスト編集
	
	function edit_note(note,sheet_id){
		$(note).bind("dblclick",function(e){
			edit_mode(e,sheet_id)
		})
	}
	function edit_mode(e,sheet_id){
		
		var note_id = e.currentTarget.id
		var note_num = note_id.replace(/note/,"")		
		var html = $("#"+note_id).children().html().replace(/<br clear="none">/g,"\n")
		var cols = (Number($("#"+note_id).css("width").replace(/px/,"")) / 8)-5,
			rows = (Number($("#"+note_id).css("height").replace(/px/,"")) / 16 )-4; 

		$("#text"+note_num).html('<button class="'+ note_id +'">保存</button><textarea cols="'+cols+'" rows="'+rows+'" class="note_area" id="area'+note_id+'">'+html+'</textarea>');
		$(".note_area").resizable();
		$("#"+note_id).unbind("dblclick");
		$("#area"+note_id).keydown(function(e){
			if(e.keyCode == 9){
				$("#area"+note_id).selection("insert",{text:'	',mode:'before'})
				return false;
			}
			
		})
		$("."+note_id).click(function(){
			var body = $("#area"+note_id).val()
			body = body.replace(/\n/g,'<br clear="none">')
			body = body.replace(/><br clear="none">/g,'>\n')
			$.post(window.location+"/edit_note",
				{
					authenticity_token:$("#authenticity_token").text(),
					sheet_id:sheet_id,
					note_id:note_id.replace(/note/,""),
					note_body:body
				},
				function(){
					$("#text"+note_num).html(body)
					edit_note("#"+note_id,sheet_id)
				}
			)
		})
	}
})(jQuery);
