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

      def role_presenter(value)
        md_role = MetaDatum::Role.new(
          person: Person.find_by(id: value['uuid']),
          role: Role.find_by(id: value['role'])
        )
        Presenters::People::PersonIndexForRoles.new(md_role)
      end

      def meta_data_value(value, meta_key)
        return [] unless value.present?
        type = meta_key.meta_datum_object_type
        value.map do |val|
          return '' if val.is_a?(Hash) && val.empty?
          if val.is_a?(String)
            { string: val }
          elsif !val.key?('uuid') && val['role'].present?
            val['role'] = Presenters::Roles::RoleIndex.new(
              Role.find(val['role'])
            )
            val
          elsif UUIDTools::UUID_REGEXP =~ val['uuid']
            klass = type.split('::').last
            if klass == 'Roles'
              role_presenter(val)
            else
              "Presenters::#{klass}::#{klass.singularize}Index"
                .constantize
                .new("#{klass.singularize}".constantize.find(val['uuid']))
            end
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
            meta_key = MetaKey.find(md['meta_key_id'])
            mk = Presenters::MetaKeys::MetaKeyEdit.new(meta_key)
          rescue ActiveRecord::RecordNotFound
            next
          end

          { meta_key: mk, value: meta_data_value(md['value'], meta_key) }
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
