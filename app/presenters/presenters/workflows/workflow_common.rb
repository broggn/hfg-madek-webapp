WORKFLOW_STATES = { IN_PROGRESS: :IN_PROGRESS, FINISHED: :FINISHED }.freeze # NOTE: fake ruby enums

module Presenters
  module Workflows
    class WorkflowCommon < Presenters::Shared::AppResourceWithUser
      delegate_to_app_resource :name

      def status
        @app_resource.is_active ? WORKFLOW_STATES[:IN_PROGRESS] : WORKFLOW_STATES[:FINISHED]
      end

      def associated_collections
        @app_resource.collections.map do |col|
          Presenters::Collections::CollectionIndex.new(col, @user)
        end
      end

      def actions
        {
          edit: { url: edit_my_workflow_path(@app_resource) },
          update: { url: my_workflow_path(@app_resource), method: 'PATCH' }
        }
      end
    end
  end
end
