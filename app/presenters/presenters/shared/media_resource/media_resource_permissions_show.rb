module Presenters
  module Shared
    module MediaResource
      class MediaResourcePermissionsShow < Presenters::Shared::AppResource
        include Presenters::Shared::Concerns::CurrentUser
        include Presenters::Shared::MediaResource::Modules::Responsible

        def initialize(app_resource, user)
          super(app_resource)
          @user = user
        end

        def url
          send "permissions_#{@app_resource.class.model_name.singular}_path",
               id: @app_resource.id
        end

        def current_user_permissions
          if @user # not public_user
            @app_resource.permission_types_for_user(@user)
          else
            []
          end
        end

        def can_edit
          current_user_permissions.include?(:edit_permissions)
        end

        def self.define_permissions_api(app_resource_class)
          partial_const_path = \
            'Presenters::'\
            "#{app_resource_class.model_name.plural.camelize}::"\
            'Permissions::'\
            "#{app_resource_class.model_name.singular.camelize}"\

          permissions_helper('user_permission', partial_const_path)
          permissions_helper('group_permission', partial_const_path)
          permissions_helper('api_client_permission', partial_const_path)

          define_method :public_permission do
            p_class = "#{partial_const_path}PublicPermission".constantize
            p_class.new(@app_resource)
          end
        end

        ################## PRIVATE CLASS METHODS #########################

        def self.permissions_helper(perm_type, partial_const_path)
          define_method(perm_type.pluralize) do
            p_class = "#{partial_const_path}#{perm_type.camelize}".constantize
            @app_resource
              .send(perm_type.pluralize)
              .map { |p| p_class.new(p) }
          end
        end

        private_class_method :define_permissions_api,
                             :permissions_helper
      end
    end
  end
end