class CreateLines < ActiveRecord::Migration
  def change
    create_table :lines do |t|
      t.string :title
      t.integer :note_id
      t.integer :connected_id
      t.references :sheet

      t.timestamps
    end
  end
end
