module Presenters
  module Shared
    module MediaResources
      module Permissions
        class MediaResourceGroupPermission < MediaResourceCommonPermission
          def group_name
            @app_resource.group.name
          end
        end
      end
    end
  end
end