module Modules
  module Resources
    module ResourceTemporaryUrls
      extend ActiveSupport::Concern

      included do
        skip_before_action :check_and_redirect_with_custom_url,
                           only: :show_by_temporary_url
      end
    end
  end
end
