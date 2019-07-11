module Presenters
  module Workflows
    class WorkflowShow < WorkflowCommon
      def collections
        @app_resource.collections.map do |c|
          Presenters::Collections::CollectionIndex.new(c, @user)
        end
      end

      def status
        @app_resource.is_active ? 'in progress' : 'finished'
      end

      def edit_url
        edit_my_workflow_path(@app_resource)
      end
    end
  end
end
