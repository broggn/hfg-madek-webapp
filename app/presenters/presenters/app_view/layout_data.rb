module Presenters
  module AppView
    class LayoutData < Presenter

      # TODO: AppView/Layout Presenter.
      #       most views are resourceful, so they have #resource
      #       *could* be initialized from responder `AppView.new(resource: @get)`
      # def initialize(resource:)
      #   fail 'TypeError!' unless resource.is_a?(Presenters::AppResource)
      #   @resource = resource
      # end
      # attr_accessor :resource

      def initialize(user:)
        fail 'TypeError!' unless (user.nil? or user.is_a?(User))
        @user = user
      end

      # TMP: just collect all the needed data for layout…
      def user_menu
        return unless @user.present?

        admin_menu = if @user.admin?
          { url: prepend_url_context('/admin'), super_action: :not_implemented }
        end

        {
          user_name: Presenters::Users::UserIndex.new(@user).name,
          import_url: new_media_entry_path,
          my: {
            drafts_url: my_dashboard_section_path(:unpublished_entries),
            entries_url: my_dashboard_section_path(:content_media_entries),
            sets_url: my_dashboard_section_path(:content_collections),
            favorite_entries_url: my_dashboard_section_path(
              :favorite_media_entries),
            favorite_sets_url: my_dashboard_section_path(:favorite_collections),
            groups: my_dashboard_section_path(:groups)
          },
          admin: admin_menu,
          sign_out_action: { url: '/session/sign_out', method: 'POST' }
        }
      end

    end
  end
end