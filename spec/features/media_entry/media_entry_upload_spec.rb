require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

feature 'Resource: MediaEntry' do
  given(:user) { create(:user, password: 'password') }

  background do
    sign_in_as user.login
  end

  describe 'Action: create (upload/import)' do

    scenario 'upload and publish an image (no Javascript)',
             browser: :firefox_nojs do

      # go to dashboard and import button
      visit my_dashboard_path
      within('.ui-body-title-actions') do
        find('a', text: I18n.t('dashboard_create_media_entry_btn')).click
      end

      expect(current_path).to eq new_media_entry_path
      select_file_and_submit('images', 'grumpy_cat_new.jpg')
      expect(page).to have_content 'Media entry wurde erstellt.'
    end

    scenario 'upload and publish an video (no Javascript)',
             browser: :firefox_nojs do
      # go to dashboard and import button
      visit my_dashboard_path
      within('.ui-body-title-actions') do
        find('a', text: I18n.t('dashboard_create_media_entry_btn')).click
      end
      expect(current_path).to eq new_media_entry_path

      select_file_and_submit('images', 'grumpy_cat_new.jpg')

      expect(page).to have_content 'Media entry wurde erstellt.'

    end

    scenario 'upload a single jpg image' do
      # go to dashboard and import button
      visit my_dashboard_path
      within('.ui-body-title-actions') do
        find('a', text: I18n.t('dashboard_create_media_entry_btn')).click
      end
      expect(current_path).to eq new_media_entry_path
      attach_file('media_entry[media_file][]', Rails.root.join('spec', 'data', 'sample.jpg'), make_visible: true)
      expect(page).to have_css('img[title="sample.jpg"]')

      expect(page).to have_no_css('a.disabled', text: 'Medieneinträge vervollständigen')
    end

    scenario 'upload a single tiff image' do
      # go to dashboard and import button
      visit my_dashboard_path
      within('.ui-body-title-actions') do
        find('a', text: I18n.t('dashboard_create_media_entry_btn')).click
      end
      expect(current_path).to eq new_media_entry_path
      attach_file('media_entry[media_file][]', Rails.root.join('spec', 'data', 'sample.tif'), make_visible: true)
      expect(page).to have_css('img[title="sample.tif"]')

      expect(page).to have_no_css('a.disabled', text: 'Medieneinträge vervollständigen')
    end

    scenario 'upload a too large image' do
      # go to dashboard and import button
      visit my_dashboard_path
      within('.ui-body-title-actions') do
        find('a', text: I18n.t('dashboard_create_media_entry_btn')).click
      end
      expect(current_path).to eq new_media_entry_path

      attach_file('media_entry[media_file][]', Rails.root.join('spec', 'data', '17k-test.jpg'), make_visible: true)
      expect(page).to_not have_css('img[title="17k-test.jpg"]')
      expect(page).to have_content('17k-test.jpg überschreitet maximale Grösse von 16000 Pixel')
      expect(page).to have_no_css('a.disabled', text: 'Medieneinträge vervollständigen')
    end

    scenario 'upload a single pdf' do
      # go to dashboard and import button
      visit my_dashboard_path
      within('.ui-body-title-actions') do
        find('a', text: I18n.t('dashboard_create_media_entry_btn')).click
      end
      expect(current_path).to eq new_media_entry_path

      attach_file('media_entry[media_file][]', Rails.root.join('spec', 'data', 'sample.pdf'), make_visible: true)
      expect(page).to have_css('img[title="sample.pdf"]')

      expect(page).to have_no_css('a.disabled', text: 'Medieneinträge vervollständigen')
    end

    scenario 'upload multiple files' do
      # go to dashboard and import button
      visit my_dashboard_path
      within('.ui-body-title-actions') do
        find('a', text: I18n.t('dashboard_create_media_entry_btn')).click
      end
      expect(current_path).to eq new_media_entry_path

      attach_file('media_entry[media_file][]', 
        [
          Rails.root.join('spec', 'data', 'sample.jpg'),
          Rails.root.join('spec', 'data', 'sample.pdf'),
          Rails.root.join('spec', 'data', '17k-test.jpg')
        ], make_visible: true)
    
      expect(page).to have_css('img[title="sample.jpg"]')
      expect(page).to have_css('img[title="sample.pdf"]')

      expect(page).to_not have_css('img[title="17k-test.jpg"]')
      expect(page).to have_content('17k-test.jpg überschreitet maximale Grösse von 16000 Pixel')
      expect(page).to have_no_css('a.disabled', text: 'Medieneinträge vervollständigen')
    end


    scenario 'Default License and Usage are applied on upload as configured',
             browser: false do
      settings = AppSetting.first

      visit new_media_entry_path
      select_file_and_submit('images', 'grumpy_cat_new.jpg')
      media_entry = user.unpublished_media_entries.first

      md_license = media_entry.meta_data
        .find_by_meta_key_id(settings.media_entry_default_license_meta_key)

      md_usage = media_entry.meta_data
        .find_by_meta_key_id(settings.media_entry_default_license_usage_meta_key)

      expect(md_usage.string).to eq settings.media_entry_default_license_usage_text

      expect(md_license.keywords.first.id)
        .to eq settings.media_entry_default_license_id
    end

    scenario 'File metadata is extracted and mapped via IoMappings to MetaData',
             browser: false do

      unless MetaKey.where(id: 'madek_core:title').exists?
        FactoryBot.create(:meta_key_text, id: 'madek_core:title')
      end
      IoInterface.find_or_create_by(id: 'default')
      IoMapping.create(io_interface_id: 'default',
                       meta_key_id: 'madek_core:title',
                       key_map: 'Filename')
      IoMapping.create(io_interface_id: 'default',
                       meta_key_id: 'media_object:creator',
                       key_map: 'XMP-dc:Creator')
      IoMapping.where(io_interface_id: 'default', key_map: 'XMP-dc:Title').destroy_all

      visit new_media_entry_path
      select_file_and_submit('images', 'grumpy_cat_new.jpg')
      media_entry = user.unpublished_media_entries.first

      # media file #############################################################
      media_file = media_entry.media_file
      expect(media_file).to be
      extractor = MetadataExtractor
        .new(media_file.original_store_location).to_hash.transform_values do |val|
          begin; val.to_json; rescue; next '(Binary or unknown data)'; end
          val
        end

      expect(only_relevant_metadata(media_file.meta_data))
        .to eq only_relevant_metadata(extractor)
      expect(media_file.width).to be == 480
      expect(media_file.height).to be == 360

      # file and previews ######################################################
      original_dir = Madek::Constants::FILE_STORAGE_DIR.join(media_file.guid.first)
      expect(File.exist? original_dir.join(media_file.guid)).to be true

      thumbnails_dir = Madek::Constants::THUMBNAIL_STORAGE_DIR \
        .join(media_file.guid.first)
      Madek::Constants::THUMBNAILS.keys.each do |thumb_size|
        next if thumb_size == :maximum
        expect(File.exist? \
                 thumbnails_dir.join("#{media_file.guid}_#{thumb_size}.jpg")) \
        .to be true
      end
      expect(media_file.previews.size).to be == Madek::Constants::THUMBNAILS.size

      # meta data for media entry ##############################################

      expect(media_entry.meta_data.find_by_meta_key_id('madek_core:title')).to be
      expect(media_entry.meta_data.find_by_meta_key_id('madek_core:title').string).to eq('grumpy_cat_new.jpg')
      expect(media_entry.meta_data.find_by_meta_key_id('media_object:creator')).to be
    end

  end

  describe 'Copying meta datum from another media entry' do
    given(:media_entry) { create(:media_entry_with_image_media_file) }

    context 'when user has no relation with media entry' do
      scenario 'the user is not allowed to make a copy' do
        visit new_media_entry_path('copy-md-from-id': media_entry.id)

        expect(page).to have_selector('#app-client-error', text: I18n.t(:error_403_title))
      end
    end

    context 'when user is a responsible for media entry' do
      given!(:media_entry) { create(:media_entry_with_image_media_file, responsible_user: user) }

      scenario 'Display header with configuration options', browser: false do
        visit new_media_entry_path('copy-md-from-id': media_entry.id)

        select_file_and_submit('images', 'grumpy_cat_new.jpg')
      end
    end
  end
end

private

def only_relevant_metadata(hash)
  ignored = ['System:FileAccessDate']
  hash.except(*ignored)
end
