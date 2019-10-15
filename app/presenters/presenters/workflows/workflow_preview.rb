module Presenters
  module Workflows
    class WorkflowPreview < WorkflowCommon
      def child_resources
        arr = [ @app_resource.master_collection ] + @app_resource.master_collection.child_media_resources.to_a
        arr.map do |resource|
          presenterify_resource(resource)
        end
      end

      def actions
        {
          save_and_not_finish: { url: save_and_not_finish_my_workflow_path(@app_resource), method: 'PATCH' },
          finish: { url: finish_my_workflow_path(@app_resource), method: 'PATCH' },
        }.merge(super)
      end

      def common_settings
        { permissions: common_permissions }
      end

      private

      # def presenterify_resource(resource)
      #   resource = resource.cast_to_type rescue resource
      #   p =
      #     case resource.class.name
      #     when 'MediaEntry'
      #       Presenters::MediaEntries::MediaEntryIndex.new(resource, @user)
      #     when 'Collection'
      #       Presenters::Collections::CollectionIndex.new(resource, @user)
      #     end

      #   p.define_singleton_method(:meta_data) do
      #     Presenters::MetaData::MetaDataShow.new(@app_resource, @user)
      #   end

      #   p
      # end

      def presenterify_resource(resource)
        Presenters::MetaData::EditContextMetaData.new(resource, @user, nil, true)
      end
    end
  end
end
