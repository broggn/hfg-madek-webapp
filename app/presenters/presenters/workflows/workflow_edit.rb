FAKE_DATA = {
  responsible_people: %w[52658ca5-70bf-4086-b278-29119f3d60c9 d48e4387-b80d-45de-9077-5d88c331fa6a],
  archive_user: '965177d8-1ed0-480f-acc5-f1743983873c',
  archive_group: '0729879a-b4ef-45c9-a340-af1670a8bb57',
  socospa_api_client: '6dbaf29e-a8f0-4885-a3b0-6c8855265a45'
}

module Presenters
  module Workflows
    class WorkflowEdit < WorkflowCommon
      def responsible_people
        FAKE_DATA[:responsible_people].map { |id| User.find(id) }.map do |u|
          Presenters::People::PersonIndex.new(u.person)
        end
      end

      def common_settings
        { permissions: common_permissons, meta_data: common_meta_data }
      end

      def actions
        {
          upload: {
            url: new_media_entry_path(workflow_id: @app_resource.id)
          },
          index: {
            url: my_workflows_path
          }
        }.merge(super)
      end

      private

      def common_permissons
        {
          responsible: presenterify(User.find(FAKE_DATA[:archive_user])),
          write: presenterify([FAKE_DATA[:archive_group]].map { |id| Group.find(id) }),
          read: presenterify([FAKE_DATA[:socospa_api_client]].map { |id| ApiClient.find(id) }),
          read_public: true
        }
      end

      def common_meta_data
        [
          {
            key: 'Beschreibungstext',
            value:
              'Material zur Verfügung gestellt im Rahmen des Forschungsprojekts «Sound Colour Space»'
          },
          { key: 'Rechtsschutz', value: 'CC-By-SA-CH: Attribution Share Alike' },
          { key: 'ArkID', value: 'http://pid.zhdk.ch/ark:99999/x9t38rk45c' }
        ]
      end

      def presenterify(obj)
        return obj.map { |item| presenterify(item) } if obj.is_a?(Array)

        case true
        when obj.is_a?(User)
          Presenters::People::PersonIndex.new(obj.person)
        when obj.is_a?(Group)
          Presenters::Groups::GroupIndex.new(obj)
        when obj.is_a?(ApiClient)
          Presenters::ApiClients::ApiClientIndex.new(obj)
        else
          binding.pry
          fail 'Unknown type?' + obj.to_s
        end
      end
    end
  end
end
