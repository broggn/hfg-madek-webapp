module Presenters
  module Collections
    class CollectionConfidentialLinkNew < \
      Presenters::Shared::AppResourceWithUser

      def actions
        {
          create: {
            url: prepend_url_context(
              create_confidential_link_collection_path(@app_resource)),
            method: 'POST'
          }
        }
      end

    end
  end
end
