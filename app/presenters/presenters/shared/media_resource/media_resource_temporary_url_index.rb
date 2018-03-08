module Presenters
  module Shared
    module MediaResource
      class MediaResourceTemporaryUrlIndex < \
        Presenters::Shared::AppResourceWithUser

        delegate_to_app_resource :revoked, :description, :expires_at

        def label # first 5 letters of secret (to make it easier to manage)
          @app_resource.token_part
        end
      end
    end
  end
end
