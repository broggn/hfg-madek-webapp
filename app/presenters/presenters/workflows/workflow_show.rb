module Presenters
  module Workflows
    class WorkflowShow < Presenter
    # class WorkflowShow < Presenters::Shared::AppResourceWithUser


      def initialize(user)
        @user = user
      end

      def name
        "Mein Forschungsprojekt"
      end

      def state
        ["PREPARING", "RUNNING", "FINISHED"][1]
      end

      def responsible_users
        fake_user_list(['malbrech'])
      end

      def collaborating_users
        fake_user_list(['mkmit', 'tschank', 'poettli', 'scheiber', 'rwolfens'])
      end

      def contained_sets
        newest_set = Collection
          .where(creator: @user).reorder(created_at: 'DESC').first
        [newest_set].map {|c| Presenters::Collections::CollectionIndex.new(c, @user) }
      end

      def url
        '/my/projects/1'
      end

      private

      def fake_user_list(list)
        list
          .map {|l| User.find_by!(login: l)}
          .map {|u| Presenters::Users::UserIndex.new(u) }
      end

    end
  end
end
