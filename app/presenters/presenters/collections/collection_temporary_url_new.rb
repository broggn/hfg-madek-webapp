module Presenters
  module Collections
    class CollectionTemporaryUrlNew < \
      Presenters::Shared::AppResourceWithUser

      def actions
        {
          create: {
            url: prepend_url_context(
              create_temporary_url_collection_path(@app_resource)),
            method: 'POST'
          }
        }
      end

    end
  end
end
