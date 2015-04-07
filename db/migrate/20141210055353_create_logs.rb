class CreateLogs < ActiveRecord::Migration
  def change
    create_table :logs do |t|
      t.text :text
      t.references :sheet

      t.timestamps
    end
  end
end
