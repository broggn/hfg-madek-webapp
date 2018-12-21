module Modules
  module Resources
    module ResourceConfidentialLinks
      extend ActiveSupport::Concern

      included do
        skip_before_action :check_and_redirect_with_custom_url,
                           only: :show_by_confidential_link
      end

      def confidential_links
        resource = resource_class.find(id_param)
        auth_authorize(resource)
        respond_with(
          @get = confidential_link_presenter.new(resource, current_user))
      end

      private

      def resource_class
        controller_name
          .camelize
          .singularize
          .constantize
      end

      def confidential_link_presenter
        [
          'Presenters',
          controller_name.camelize,
          "#{resource_class.name}ConfidentialLinks"
        ]
          .join('::')
          .constantize
      end
    end
  end
end
