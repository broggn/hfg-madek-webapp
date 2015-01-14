require 'cucumber/rails'
require 'rubygems'

require 'simplecov'
SimpleCov.start 'rails'
Dir[Rails.root.join('app/**/*.rb')].each { |f| require f }

ActionController::Base.allow_rescue = false

FileUtils.rm_rf("#{Rails.root}/tmp/dropbox")
FileUtils.mkdir("#{Rails.root}/tmp/dropbox")
at_exit do
  # remove dropbox 
  FileUtils.rm_rf("#{Rails.root}/tmp/dropbox")
end

Before do 
  # close any alert message to not disturb following tests
  page.driver.browser.switch_to.alert.accept rescue nil 
end

# TODO remove this when 'fixed'
require 'multi_test' 
MultiTest.disable_autorun

