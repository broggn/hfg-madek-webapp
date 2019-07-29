FAKE_DATA = {
  workflow_owners: %w[52658ca5-70bf-4086-b278-29119f3d60c9 d48e4387-b80d-45de-9077-5d88c331fa6a],
  workflow_owners_logins: %w[karen petra],
  archive_user: '965177d8-1ed0-480f-acc5-f1743983873c',
  archive_group: '0729879a-b4ef-45c9-a340-af1670a8bb57',
  socospa_api_client: '6dbaf29e-a8f0-4885-a3b0-6c8855265a45'
}

module Presenters
  module Workflows
    class WorkflowEdit < WorkflowCommon
      def workflow_owners
        User
          .where('login SIMILAR TO ?',
                 "(#{FAKE_DATA[:workflow_owners_logins].join('|')})%")
          .or(User.where(id: FAKE_DATA[:workflow_owners]))
          .map do |u|
            Presenters::People::PersonIndex.new(u.person)
          end
      end

      def common_settings
        {
          permissions: common_permissions,
          meta_data: common_meta_data
        }
      end

      def actions
        {
          upload: {
            url: new_media_entry_path(workflow_id: @app_resource.id)
          },
          index: {
            url: my_workflows_path
          },
          finish: {
            url: finish_my_workflow_path(@app_resource),
            method: 'PATCH'
          }
        }.merge(super)
      end

      private

      delegate_to_app_resource :configuration

      def common_permissions
        configuration['common_permissions'].map do |permission, value|
          [
            permission,
            case permission
            when 'responsible'
              presenterify(User.find(value))
            when 'write'
              presenterify(Group.where(id: value).to_a)
            when 'read'
              presenterify(ApiClient.where(id: value).to_a)
            when 'read_public'
              value
            end
          ]
        end.to_h
      end

      def common_meta_data
        configuration['common_meta_data']
      end

      def presenterify(obj)
        return obj.map { |item| presenterify(item) } if obj.is_a?(Array)

        case obj
        when User
          Presenters::People::PersonIndex.new(obj.person)
        when Group
          Presenters::Groups::GroupIndex.new(obj)
        when ApiClient
          Presenters::ApiClients::ApiClientIndex.new(obj)
        else
          binding.pry
          fail 'Unknown type?' + obj.to_s
        end
      end
    end
  end
end
