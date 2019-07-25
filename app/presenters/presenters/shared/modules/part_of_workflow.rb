module Presenters
  module Shared
    module Modules
      module PartOfWorkflow
        def part_of_workflow?
          !@app_resource.workflow.nil?
        end

        def workflow
          if part_of_workflow?
            Presenters::Workflows::WorkflowCommon.new(@app_resource.workflow,
                                                      @user)
          end
        end
      end
    end
  end
end
