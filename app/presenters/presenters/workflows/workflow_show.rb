module Presenters
  module Workflows
    class WorkflowShow < WorkflowCommon
      def collections
        @app_resource.collections.map do |c|
          Presenters::Collections::CollectionIndex.new(c, @user)
        end
      end
    end
  end
end
