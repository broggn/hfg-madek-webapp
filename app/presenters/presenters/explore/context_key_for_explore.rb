module Presenters
  module Explore
    class ContextKeyForExplore < Presenters::Shared::AppResource

      include Presenters::Explore::Modules::NewestEntryWithImage

      def initialize(app_resource, user)
        super(app_resource)
        @meta_key = @app_resource.meta_key
        @user = user
        @limit = 24
        @size = :medium
        @entry = catalog_key_thumb_entry(@app_resource, @user, @limit)
      end

      def label
        @app_resource.label.presence || @meta_key.label
      end

      def examples
        Presenters::Explore::KeywordsForExplore.new(@user, @meta_key)
      end

      def usage_count
        MetaDatum
          .where(media_entry_id: auth_policy_scope(@user, MediaEntry).reorder(nil))
          .where(meta_key: @meta_key)
          .count
      end

      def url
        media_entry_path(@entry)
      end

      def description
        @app_resource.description
      end

      def image_url
        imgs =
          Presenters::MediaFiles::MediaFile.new(@entry, @user)
          .try(:previews)
          .try(:[], :images)
        img = imgs.try(:fetch, @size, nil) || imgs.try(:values).try(:first)
        img.url
      end
    end
  end
end
