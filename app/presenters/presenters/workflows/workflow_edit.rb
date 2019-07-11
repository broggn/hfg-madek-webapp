module Presenters
  module Workflows
    class WorkflowEdit < WorkflowCommon
      attr_reader :app_resource

      def update_url
        my_workflow_path(@app_resource)
      end
    end
  end
end
