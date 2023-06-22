require 'spec_helper'
require Rails.root.join 'spec', 'presenters', 'shared', 'thumb_api'
require Rails.root.join 'spec', 'presenters', 'shared', 'dump'

describe Presenters::Collections::CollectionIndex do
  before :each do
    AppSetting.find_or_create_by(id: 0)
  end

  describe 'can be dumped' do
    let(:presenter) do
      collection = FactoryBot.create(:collection)

      meta_key = MetaKey.find_by_id('madek_core:title')

      FactoryBot.create :meta_datum_text,
        meta_key: meta_key,
        collection: collection

      described_class.new(collection, collection.responsible_user) 
    end

    include_examples 'dumped'
  end

  it_responds_to 'privacy_status' do
    let(:resource_type) { :collection }
  end

  context 'image url' do

    it 'responds to image_url with preview image' do
      collection = FactoryBot.create(:collection)
      user = collection.responsible_user
      media_entry = FactoryBot.create(
        :media_entry_with_image_media_file,
        creator: user, responsible_user: user)
      collection.media_entries << media_entry

      presenter = described_class.new(collection, collection.responsible_user)

      expect(presenter.image_url).to be == \
        Rails.application.routes.url_helpers
          .preview_path(media_entry.media_file.preview(:medium)) + '.jpg'
    end

    it 'responds to image_url with no image' do
      collection = FactoryBot.create(:collection)
      user = collection.responsible_user
      media_entry = FactoryBot.create(
        :media_entry_with_audio_media_file,
        creator: user, responsible_user: user)
      collection.media_entries << media_entry

      presenter = described_class.new(collection, collection.responsible_user)

      expect(presenter.image_url).to be_nil
    end
  end
end
