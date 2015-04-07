class Sheet < ActiveRecord::Base
  belongs_to :user
  has_many :notes,:dependent => :destroy
  has_many :lines,:dependent => :destroy
  has_many :logs,:dependent => :destroy
  accepts_nested_attributes_for :notes

end
