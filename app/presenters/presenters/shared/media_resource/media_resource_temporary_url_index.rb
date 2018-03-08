module Presenters
  module Shared
    module MediaResource
      class MediaResourceTemporaryUrlIndex < \
        Presenters::Shared::AppResourceWithUser

        delegate_to_app_resource :revoked, :description, :expires_at

        def label
          @app_resource.token
        end
      end
    end
  end
end
