class CreateSheets < ActiveRecord::Migration
  def change
    create_table :sheets do |t|
      t.string :title
      t.references :user
      t.timestamps
    end
  end
end
