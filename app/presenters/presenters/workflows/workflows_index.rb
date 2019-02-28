module Presenters
  module Workflows
    class WorkflowsIndex < Presenter

      def initialize(user)
        @user = user
      end

      def list
        [Presenters::Workflows::WorkflowShow.new(@user)]
      end

      def actions
        {
          new: '/xxx'
        }
      end

    end
  end
end
