module Presenters
  module MediaEntries
    class MediaEntryTemporaryUrls < Presenters::Shared::AppResourceWithUser

      def list
        @app_resource.temporary_urls.map do |tu|
          Presenters::MediaEntries::MediaEntryTemporaryUrlIndex.new(tu, @user)
        end
      end

      def actions
        {
          new: {
            url: prepend_url_context(
              new_temporary_url_media_entry_path(@app_resource))
          }
        }
      end

    end
  end
end
