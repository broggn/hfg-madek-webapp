module Presenters
  module Shared
    class AppResource < Presenter
      def initialize(app_resource)
        @app_resource = app_resource
      end

      def uuid
        @app_resource.id
      end
    end
  end
end