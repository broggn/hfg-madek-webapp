module Modules
  module MediaEntries
    module Embedded
      extend ActiveSupport::Concern

      EMBED_SUPPORTED_MEDIA = Madek::Constants::Webapp::EMBED_SUPPORTED_MEDIA
      EMBED_INTERNAL_HOST_WHITELIST = Madek::Constants::Webapp::EMBED_INTERNAL_HOST_WHITELIST

      included do
        layout false, only: [:embedded]
      end

      def embedded
        media_entry = MediaEntry.find(id_param)
        authorize(media_entry)
        media_type = media_entry.try(:media_file).try(:media_type)

        # non-public entries can only be embedded from whitelisted hosts
        unless is_whitelisted || media_entry.get_metadata_and_previews
          return redirect_to(media_entry_path(media_entry))
        end
        # TODO: only whitelisted hosts can request 'no title' option
        is_internal = params.keys.include? 'internalEmbed'

        # errors
        unless EMBED_SUPPORTED_MEDIA.include?(media_type)
          raise ActionController::NotImplemented, "media: #{EMBED_SUPPORTED_MEDIA}"
        end

        unless media_entry.try(:media_file).try(:previews).try(:any?)
          raise ActionController::NotFound, 'no media!'
        end

        conf = params.permit(:width, :height).merge(isInternal: is_internal)

        # allow this to be displayed inside an <iframe>
        response.headers.delete('X-Frame-Options')

        @get = Presenters::MediaEntries::MediaEntryEmbedded.new(media_entry, conf)
          .dump.merge(authToken: nil)
      end

      private

      def is_whitelisted
        from_origin = request.env['HTTP_REFERER']
        return false unless from_origin
        EMBED_INTERNAL_HOST_WHITELIST
          .any? { |h| URI.join(h, '/') == URI.join(from_origin, '/') }
      end

    end
  end
end
