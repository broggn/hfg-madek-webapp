require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

feature 'Resource: MediaEntry' do

  describe 'Action: index' do

    it 'is rendered for public' do
      visit media_entries_path
      expect(page.status_code).to eq 200
    end

    it 'is rendered for a logged in user' do
      @user = User.find_by(login: 'normin')
      sign_in_as @user.login
      visit media_entries_path
      expect(page.status_code).to eq 200
    end

  end

  describe 'Action: favor' do

    it 'favorite button on thumbnail (JS)', browser: :firefox do

      @user = User.find_by(login: 'normin')
      sign_in_as @user.login

      visit media_entries_path

      @entry_id = URI(all('.ui-thumbnail-image-wrapper')[0][:href]).path[9..-1]
      @entry = MediaEntry.find @entry_id

      expect(@entry.favored?(@user)).to eq false

      link = '/entries/' + @entry_id

      clickable = find_button(link, false)
      clickable.click
      pending = find_button(link, true).find(:xpath, './..')

      expect(pending['data-pending']).to eq 'false'

      expect(@entry.favored?(@user)).to eq true

    end

  end

  describe 'Client: Resource selection' do

    it 'resources selection for batch-edit (JS)', browser: :firefox do
      @user = sign_in_as 'normin'
      visit media_entries_path
      box = page.find('.ui-polybox')
      thumbs = box.all('.ui-resource')
      thumbs_to_select = [thumbs.first, thumbs.last]
      entry_ids = thumbs_to_select.map { |t| t.find('a')['href'].split('/').last }

      # click selector on each thumbnail
      thumbs_to_select.each do |thumb|
        thumb.hover
        actions = thumb.find('.ui-thumbnail-actions')
        actions.hover
        checkbox = thumb.find('.ui-thumbnail-action-checkbox')
        checkbox.hover
        checkbox.click
      end

      # the thumbs should now have selected state in UI
      thumbs_to_select.each do |thumb|
        expect(thumb['class']).to include 'ui-selected'
      end

      # click the 'batch edit' button
      box.find('.ui-toolbar')
        .find('.button i[title="Auswahl bearbeiten"]')
        .click

      # confirm we are in the right place:
      expect(current_path_with_query)
        .to eq batch_edit_meta_data_media_entries_path(id: entry_ids)
    end
  end

  private

  def find_button(link, favored)
    thumbnail = find(:xpath, "//a[@href='" + link + "']") # <- just the link
                  .find(:xpath, './..[contains(@class, "ui-thumbnail")]')
    thumbnail.hover
    actions = thumbnail.find('.ui-thumbnail-actions')
    actions.hover
    favorite = actions.find(
      favored ? '.icon-star' : '.icon-star-empty')
    favorite.hover
    favorite
  end

end