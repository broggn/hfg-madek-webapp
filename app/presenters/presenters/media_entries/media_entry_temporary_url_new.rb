module Presenters
  module MediaEntries
    class MediaEntryTemporaryUrlNew < Presenters::Shared::AppResourceWithUser

      def actions
        {
          create: {
            url: prepend_url_context(
              create_temporary_url_media_entry_path(@app_resource)),
            method: 'POST'
          }
        }
      end
    end
  end
end
