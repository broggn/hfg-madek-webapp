module Presenters
  module Shared
    module MediaResource
      class MediaResourceTemporaryUrlCommon < \
        Presenters::Shared::AppResourceWithUser

        delegate_to_app_resource :description, :expires_at, :revoked

        attr_accessor :just_created
      end
    end
  end
end
