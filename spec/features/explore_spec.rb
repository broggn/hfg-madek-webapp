require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

feature 'Explore#index' do

  it 'is rendered for public' do
    visit explore_path
  end

  it 'is rendered for normin' do
    @user = User.find_by(login: 'normin')
    sign_in_as @user.login
    visit explore_path
  end

end