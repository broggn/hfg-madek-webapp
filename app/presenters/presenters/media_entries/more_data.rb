module Presenters
  module MediaEntries
    class MoreData < Presenter
      include Presenters::Shared::Resources::Modules::Responsible

      def initialize(resource)
        @resource = resource
        @media_file = @resource.media_file
      end

      def file_information
        @media_file
          .meta_data
          .to_a
          .unshift ['Filename', filename]
      end

      def importer
        @resource.media_file.uploader.person.to_s
      end

      def import_date
        @resource.media_file.created_at.strftime('%d.%m.%Y')
      end

      def activity_log
        @resource
          .edit_sessions
          .limit(5)
          .map { |es| format_edit_session(es) }
      end

      private

      def format_edit_session(es)
        "#{es.user.person} / #{es.created_at.strftime('%d.%m.%Y, %H:%M')}"
      end

      def filename
        @media_file.filename
      end
    end
  end
end