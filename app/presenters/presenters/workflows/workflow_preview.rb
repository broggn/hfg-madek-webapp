module Presenters
  module Workflows
    class WorkflowPreview < WorkflowCommon
      def child_resources
        arr = [ @app_resource.master_collection ] + @app_resource.master_collection.child_media_resources.to_a
        arr.map do |resource|
          presenterify(resource)
        end
      end

      def actions
        {
          finish: { url: finish_my_workflow_path(@app_resource), method: 'PATCH' },
        }.merge(super)
      end

      private

      # def presenterify(resource)
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

      def presenterify(resource)
        Presenters::MetaData::EditContextMetaData.new(resource, @user, nil, true)
      end
    end
  end
end
