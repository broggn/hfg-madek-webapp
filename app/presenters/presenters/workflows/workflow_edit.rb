module Presenters
  module Workflows
    class WorkflowEdit < WorkflowCommon
      def creator
        Presenters::Users::UserIndex.new(@app_resource.creator)
      end

      def workflow_owners
        @app_resource.owners.map do |owner|
          Presenters::Users::UserIndex.new(owner)
        end
      end

      def common_settings
        { permissions: common_permissions, meta_data: common_meta_data }
      end

      def actions
        {
          upload: { url: new_media_entry_path(workflow_id: @app_resource.id) },
          index: { url: my_workflows_path },
          finish: { url: finish_my_workflow_path(@app_resource), method: 'PATCH' },
          update_owners: { url: update_owners_my_workflow_path(@app_resource),
                           method: 'PATCH' }
        }.merge(super)
      end

      def permissions
        {
          can_edit: policy_for(@user).update?,
          can_edit_owners: policy_for(@user).update_owners?
        }
      end

      private

      def common_permissions
        @app_resource.configuration['common_permissions'].map do |permission, value|
          [
            permission,
            case permission
            when 'responsible'
              presenterify(User.find(value))
            when 'write', 'read'
              presenterify(
                value
                  .group_by { |v| v['type'] }
                  .map do |class_name, values|
                    class_name.constantize.where(id: values.map { |v| v['uuid'] } )
                  end.flatten
              )
            when 'read_public'
              value
            end
          ]
        end.to_h
      end

      def meta_data_value(value, type)
        value.map do |val|
          if UUIDTools::UUID_REGEXP =~ val
            klass = type.split('::').last
            "Presenters::#{klass}::#{klass.singularize}Index"
              .constantize
              .new("#{klass.singularize}".constantize.find(val))
            # Keyword.find(val)
          else
            val
          end
        end
      end

      def common_meta_data
        @app_resource.configuration['common_meta_data'].map do |md|
          binding.pry unless md['meta_key_id']
          # build something like MetaDatumEdit presenter, but from plain JSON
          begin
            mk = Presenters::MetaKeys::MetaKeyEdit.new(MetaKey.find(md['meta_key_id']))
          rescue ActiveRecord::RecordNotFound
            next
          end
          { meta_key: mk, value: md['value'] }
        end
      end

      def presenterify(obj)
        return obj.map { |item| presenterify(item) } if obj.is_a?(Array)

        case obj
        when User
          Presenters::Users::UserIndex.new(obj)
        when Group, InstitutionalGroup
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
