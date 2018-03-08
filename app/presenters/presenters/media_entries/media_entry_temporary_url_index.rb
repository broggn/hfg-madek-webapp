module Presenters
  module MediaEntries
    class MediaEntryTemporaryUrlIndex < \
      Presenters::Shared::MediaResource::MediaResourceTemporaryUrlIndex

      def actions
        {
          revoke: policy_for(@user).update? && {
            url: prepend_url_context(
              update_temporary_url_media_entry_path(
                @app_resource.resource,
                temporary_url_id: @app_resource.id
              )
            ),
            method: 'PATCH'
          }
        }
      end

    end
  end
end
