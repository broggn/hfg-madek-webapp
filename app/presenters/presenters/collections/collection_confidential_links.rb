module Presenters
  module Collections
    class CollectionConfidentialLinks < Presenters::Shared::AppResourceWithUser

      def list
        @app_resource.confidential_links.map do |tu|
          Presenters::Collections::CollectionConfidentialLinkIndex.new(tu, @user)
        end
      end

      def resource
        Presenters::Collections::CollectionIndex.new(@app_resource, @user)
      end

      def actions
        {
          new: {
            url: prepend_url_context(
              new_confidential_link_collection_path(@app_resource))
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
