module Presenters
  module Collections
    class CollectionTemporaryUrlShow < \
      Presenters::Shared::MediaResource::MediaResourceTemporaryUrlCommon

      def initialize(resource, user, base_url)
        super(resource, user)
        @base_url = base_url
      end

      # NOTE: only available on new instances, e.g. in response to creation action
      def secret_url
        @base_url + prepend_url_context(
          show_by_temporary_url_collections_path(@app_resource.token)
        )
      end

      def actions
        {
          index: {
            url: prepend_url_context(
              temporary_urls_collection_path(@app_resource.resource))
          }
        }
      end
    end
  end
end
