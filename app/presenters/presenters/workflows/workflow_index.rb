module Presenters
  module Workflows
    class WorkflowIndex < Presenter
      def initialize(user)
        @user = user
      end

      def list
        @user.workflows.map { |w| Presenters::Workflows::WorkflowShow.new(w, @user) }
      end
    end
  end
end
