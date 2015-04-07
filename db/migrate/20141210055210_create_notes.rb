class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.integer :note_num,:default => 1
      t.string :title
      t.text :body
      t.integer :width,:default => 100
      t.integer :height,:default => 50
      t.string  :color,:default => "black"
      t.string  :font_size,:default => "14px"
      t.string  :bg_color,:default => "white"
      t.string  :text_align,:default => "left"
      t.integer :x,:default => 1000
      t.integer :y,:default => 800
      t.integer :z,:default => 5
      
      t.boolean :unite_flag,:default => false
      t.integer :united_num,:default => 0
      t.references :sheet


      t.timestamps
    end
  end
end
