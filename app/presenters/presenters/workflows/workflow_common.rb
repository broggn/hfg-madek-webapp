module Presenters
  module Workflows
    class WorkflowCommon < Presenters::Shared::AppResourceWithUser
      delegate_to_app_resource :name
    end
  end
end
