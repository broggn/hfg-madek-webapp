module Presenters
  module MediaEntries
    class MediaEntryTemporaryUrlShow < \
      Presenters::Shared::MediaResource::MediaResourceTemporaryUrlCommon

      def initialize(resource, user, base_url)
        super(resource, user)
        @base_url = base_url
      end

      # NOTE: only available on new instances, e.g. in response to creation action
      def secret_url
        @base_url + prepend_url_context(
          show_by_temporary_url_media_entries_path(@app_resource.token)
        )
      end

      def actions
        {
          index: {
            url: prepend_url_context(
              temporary_urls_media_entry_path(@app_resource.resource))
          }
        }
      end
    end
  end
end
