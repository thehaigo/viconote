class SheetsController < ApplicationController
  before_action :set_sheet, only: [:show,:edit,:update, :destroy,:detail]

  respond_to :html

  before_filter :authenticate_user!

    # GET /sheets
    # GET /sheets.json
    def index
      @sheets = current_user.sheets.all
      if @sheets.empty?
        first_sheet
        @sheets = current_user.sheets.all
      end
      respond_to do |format|
        format.html # index.html.erb
        format.json { render :json => @sheets }
      end
    end
    # GET /sheets/1
    # GET /sheets/1.json
    def show

      if @sheet.user_id == current_user.id or current_user.id == 1
        @notes = @sheet.notes.sort_by{|n|n.note_num}
        @notes.map{|note|
          note.body.gsub(/<\/*div>/,"")
          note.body.gsub(/<br clear="none">/,"/n")
        }

        respond_to do |format|
          format.html # show.html.erb
          format.json { render :json  => @notes }

        end
      else
        redirect_to sheets_path,:alert => "access denied"
      end
    end

    def detail
      @notes = @sheet.notes
      respond_to do |format|
        format.html 
        format.json { render :json  => @notes }
      end
    end
    # GET /sheets/new
    # GET /sheets/new.json
    def new
      @sheet = Sheet.new

      respond_to do |format|
        format.html # new.html.erb
        format.json { render :json  => @sheet }
      end
    end

    # GET /sheets/1/edit

    def edit

    end

    # POST /sheets
    # POST /sheets.json
    def create
      @sheet = Sheet.new(sheet_params)
      user = User.find(current_user)

      respond_to do |format|
        if user.sheets << @sheet
          log = Log.new(:text => "create sheet #{@sheet.title}")
          @sheet.logs << log
          format.html { redirect_to @sheet}
          format.json { render :json => @sheet, :status => :created, :location => @sheet }
        else
          format.html { render :action => "new" }
          format.json { render :json => @sheet.errors, :status => :unprocessable_entity }
        end
      end
    end

    # PUT /sheets/1
    # PUT /sheets/1.json
    def update
       if @sheet.user_id = current_user.id
        respond_to do |format|
          if @sheet.update(sheet_params)
            format.html { redirect_to @sheet, :notice => 'Sheet was successfully updated.' }
            format.json { head :ok }
          else
            format.html { render :action => "edit" }
            format.json { render :json =>  @sheet.errors, :status => :unprocessable_entity }
          end
        end
      else
        redirect_to sheets_path,:alert => "access denied"
      end
    end

    # DELETE /sheets/1
    # DELETE /sheets/1.json
    def destroy
      if @sheet.user_id == current_user.id
        @sheet.destroy

        respond_to do |format|
          format.html { redirect_to sheets_url }
          format.json { head :ok }
        end
      else
        redirect_to sheets_path,:alert => "access denied"
      end

    end


    def notes 
      @sheet = Sheet.find(params[:sheet_id])
      @notes = @sheet.notes
      respond_to do |format|
        format.json { render :json  => @notes }
       end
    end

    def note
      @note = Note.where(:sheet_id => params[:sheet_id].to_i).where(:note_num => params[:note_id].to_i).first
      respond_to do |format|
       format.json { render :json  => @note }
      end
    end

    def new_note
      @sheet = Sheet.find(params[:id])
            @note = Note.new({
              :title    => "新しいノート",
              :note_num => params[:last].to_i + 1,
              :body     => "新しいノート",
              :height   => 70,
              :x        => params[:x],
              :y        => params[:y],
              :color    => params[:font],
              :bg_color => params[:bg]
              })
      log = Log.new({
        :text => "create note #{@note.note_num},title:#{@note.title},body:#{@note.body},x:#{@note.x},y:#{@note.y},color:#{@note.color},bg_color:#{@note.bg_color}"
      })
      @sheet.logs << log
      @sheet.notes << @note
      @sheet.save
      head(200)
    end

    def new_line
      @sheet = Sheet.find(params[:id])
      line = Line.new({
        :title => params[:line_id],
        :note_id => params[:note1].to_i,
        :connected_id => params[:note2].to_i
      })
      log = Log.new({:text => "create line #{line.id},note_id:#{line.note_id},connected_id:#{line.connected_id}"})
      @sheet.logs << log
      @sheet.lines << line

      head(200)

    end

    def lines
      @sheet = Sheet.find(params[:id])
      @lines = @sheet.lines
      respond_to  do |format|
        format.json {render :json => @lines}
      end
    end

    def line
      id = params[:line_id].to_i
      @lines = Line.where("note_id = ? or connected_id = ?",id,id)
      respond_to do |format|
        format.json{render :json => @lines}
      end
    end

    def delete_line
      @line = Line.where({:sheet_id => params[:sheet_id],:title => params[:line_id]}).first
      @sheet = Sheet.find(params[:sheet_id])
      log = Log.new({:text => "delete line #{@line.id}"})
      @sheet.logs << log
      @line.destroy
      head(200)
    end

    def divide_note
      @sheet = Sheet.find(params[:sheet_id])
      @note = Note.where(:sheet_id => params[:sheet_id].to_i).where(:note_num => params[:note_id].to_i).first
      log = Log.new({:text => "divide note #{@note.id}"})
      @sheet.logs << log
      det = '<br clear="none">' * params[:line].to_i
      notes = @note.body.split(det)
      i = 1
      notes.each do |note|
        @sheet.notes << Note.new({
            :title => @note.title+i.to_s,
            :note_num => params[:last].to_i + i,
            :body => note,
            :x => params[:x].to_i + i*10,
            :y => params[:y].to_i + i*10,
            :z => params[:z].to_i + 5
        })
        i +=1
      end
     @sheet.save
     head(200)
    end

    def move_note
      sheet = Sheet.find(params[:sheet_id].to_i)
      note = Note.where(:sheet_id => params[:sheet_id].to_i).where(:note_num => params[:note_id].to_i).first

      log = Log.new({:text => "move notea #{note.id},from #{note.x},#{note.y},to #{params["x"]},#{params["y"]}"})
      sheet.logs << log
      note.update_attributes({
        :x => params["x"].to_i,
        :y => params["y"].to_i
        }
      )
      head(200)
    end

    def move_z_note
      sheet = Sheet.find(params[:sheet_id].to_i)
      note = Note.where(:sheet_id => params[:sheet_id].to_i).where(:note_num => params[:note_id].to_i).first
      if params["z"] == "up"
        note.z = note.z+1
      elsif params["z"] == "down"
        note.z = note.z-1 unless note.z == 0
      end
      log = Log.new({:text => "note #{note.id} #{params["z"]}"})
      sheet.logs << log
      note.save
      head(200)
    end

    def resize_note
      sheet = Sheet.find(params[:sheet_id].to_i)
      note = Note.where(:sheet_id => params[:sheet_id].to_i).where(:note_num => params[:note_id].to_i).first
      log = Log.new({:text => "resize note #{note.id},from #{note.width} #{note.height},to #{params[:width]} #{params[:height]}" })
      sheet.logs << log
      if params[:image]
        body = Nokogiri::HTML(note.body).children.children.children
        body.css("img").attribute("width").value = "#{params[:width]}"
        body.css("img").attribute("height").value = "#{params[:height].to_i - 30}"
        note.update_attributes({
          :width => params["width"],
          :height => params["height"],
          :body => body.to_html
          }
        )

      else  
        note.update_attributes({
          :width => params["width"],
          :height => params["height"]
          }
        )
      end
      head(200)
    end

    def edit_note
      @sheet = Sheet.find(params[:sheet_id])
      @note = Note.where(:sheet_id => params[:sheet_id].to_i).where(:note_num => params[:note_id].to_i).first
      if(params[:mode] == "edit")
        @note.update_attributes(
          {
            :title => params[:note_title],
            :body => params[:note_body],
            :color => params[:font_color],
            :bg_color => params[:background_color],
            :font_size => params[:font_size],
            :text_align => params[:text_align]
          }
        )
        log = Log.new({
          :text => "edit note #{@note.id},title:#{@note.title},body:#{@note.body},x:#{@note.x},y:#{@note.y},color:#{@note.color},bg_color:#{@note.bg_color}"
        })
        @sheet.logs << log

        head(200)
      else
        @note.update_attributes(:body => params[:note_body])
        log = Log.new({
          :text => "edit note #{@note.id},title:#{@note.title},body:#{@note.body},x:#{@note.x},y:#{@note.y},color:#{@note.color},bg_color:#{@note.bg_color}"
        })
        @sheet.logs << log
        head(200)
      end 
    end

    def delete_note
      sheet = Sheet.find(params[:sheet_id])
      id = params[:note_id]
      note = Note.where(:sheet_id => params[:sheet_id]).where(:note_num => params[:note_id].to_i).first
      log = Log.new({:text => "delete note #{note.id}"})
      sheet.logs << log
      line = Line.where("note_id = ? or connected_id = ?",id,id)
      line.each{|l|l.destroy}
      note.destroy
      head(200)
    end

    def unite_note
      sheet = Sheet.find(params[:sheet_id])
      note = Note.where(:sheet_id => params[:sheet_id],:note_num => params[:note_id]).first
      params[:u_notes].each do |note_id|
        unote  = Note.where(:sheet_id => params[:sheet_id],:note_num => note_id).update_all(:united_num => note.note_num)
      end
      note.update_attribute(:unite_flag,true)
      head(200)
    end

    def ununite_note
      sheet = Sheet.find(params[:sheet_id])
      note = Note.where(:sheet_id => params[:sheet_id],:note_num => params[:note_id]).first
      note.update_attribute(:unite_flag,false)
      unote  = Note.where(:sheet_id => params[:sheet_id],:united_num => note.note_num).update_all(:united_num => 0)
      head(200)
    end

    def add_sheet
      @sheet = Sheet.find(params[:sheet_id])
      log = Log.new({:text => "add sheet #{@sheet.id}"})
      @sheet.logs << log
      ad_sheet = Sheet.find(params[:add_id])
      @notes = ad_sheet.notes
      @lines = ad_sheet.lines
      logs = Array.new
      i = 1
      @lines.each do |line| 
        add_line = Line.new({:note_id => line.note_id,:connected_id => line.connected_id})
        @sheet.lines << add_line 
      end

      @notes.each do |note|
        number = params[:last].to_i + i
        @sheet.notes << Note.new({
            :note_num => number,
            :title => note.title,
            :body => note.body,
            :x => note.x ,
            :y => note.y,
            :z => note.z,
            :width => note.width,
            :height => note.height,
            :bg_color => note.bg_color,
            :color => note.color,
            :font_size => note.font_size,
            :text_align => note.text_align
        })
        #lineをやっておく
        @sheet.lines.each do |line|
          if line.note_id == note.note_num 
            line.note_id = number
            line.save
          elsif line.connected_id == note.note_num
            line.connected_id = number
            line.save
          end
        end
        @sheet.logs << Log.new({:text => "create copy note#{note.note_num}"})
        i +=1
      end

      @sheet.save
      head(200)
    end

    def json_upload
      content = params[:f].content_type
      if content == "application/json"
        data = params[:f].read
        jsons = JSON.parse(data)
        sheet = Sheet.find(params[:sheet_id])
        jsons.each do |json| 
          enote = Note.new(json)
          sheet.notes << enote
        end
        sheet.save
        redirect_to sheet_path(params[:id])
      else
        redirect_to(sheet_path(params[:id]),:error =>'JSONファイルではありません')
      end

    end
    def json_download
      sheet = Sheet.find(params[:id])
      send_data(sheet.notes.to_json,:filename => "#{sheet.title}.json",:content_type => "application/json")

    end

    def get_image
      if params[:type] == "note"
        image = Enote.find(params[:id])      
        send_data(image.thumbnail,:filename => image.title,:content_type => "jpg",:dispostion => "inline")
      elsif params[:type] == "res"
        image = Resource.find(params[:id])
        send_data(image.data,:filename => image.filename,:content_type => image.mime,:dispostion => "inline")
      end

    end

    def new_image
      @sheet = Sheet.find(params[:sheet_id])
      resource = Resource.find(params[:note_id])
      @sheet.notes_attributes = {"new"=>
        {
          :note_num => params[:last].to_i + 1,
          :title => resource.filename,
          :x => params[:x],
          :y => params[:y],
          :width => (resource.width ),
          :height => (resource.height ),
          :body => "<span class='image' id='image#{resource.id}'><img src='#{url_for(:controller=>'sheets',:action => 'get_image',:id => resource.id,:type => "res")}' width=#{resource.width}  height=#{resource.height}></span>"
        } 
      }
      @sheet.save
      head(200)
    end

    def logs
      require 'csv'
      sheet = Sheet.find(params[:sheet_id])
      logs = sheet.logs.sort_by{|log|log.text.split[0]}
  #    logs = logs.select{|log| log.text.split[0] == params[:type]}
      data = CSV.generate do |csv|
    	  csv << ["log", "date"]
      	logs.each do |log|
      	  csv << [log.id,"#{log.text}", log.created_at]
      	end
      end
      send_data(data, type: 'text/csv', filename: "#{sheet.title}_#{params[:type]}.csv")

    end

    def first_sheet
        @user = User.find(current_user.id)
        @sheet =  Sheet.new({:title => "Welcome to ViCoNote"})
        @user.sheets << @sheet
    end
 
  private
    def set_sheet
      @sheet = Sheet.find(params[:id])
    end

    def sheet_params
      params.require(:sheet).permit(:title)
    end
end
