module Presenters
  module Collections
    class CollectionTemporaryUrls < Presenters::Shared::AppResourceWithUser

      def list
        @app_resource.temporary_urls.map do |tu|
          Presenters::Collections::CollectionTemporaryUrlIndex.new(tu, @user)
        end
      end

      def resource
        Presenters::Collections::CollectionIndex.new(@app_resource, @user)
      end

      def actions
        {
          new: {
            url: prepend_url_context(
              new_temporary_url_collection_path(@app_resource))
          },
          go_back: {
            url: prepend_url_context(
              collection_path(@app_resource)
            )
          }
        }
      end

    end
  end
end
