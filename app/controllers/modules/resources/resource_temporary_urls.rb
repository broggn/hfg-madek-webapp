module Modules
  module Resources
    module ResourceTemporaryUrls
      extend ActiveSupport::Concern

      included do
        skip_before_action :check_and_redirect_with_custom_url,
                           only: :show_by_temporary_url
      end

      def temporary_urls
        resource = resource_class.find(id_param)
        auth_authorize(resource)

        @get = temporary_url_presenter.new(
          resource,
          current_user
        )

        respond_with(@get)
      end

      private

      def resource_class
        controller_name
          .camelize
          .singularize
          .constantize
      end

      def temporary_url_presenter
        [
          'Presenters',
          controller_name.camelize,
          "#{resource_class.name}TemporaryUrls"
        ]
          .join('::')
          .constantize
      end
    end
  end
end
