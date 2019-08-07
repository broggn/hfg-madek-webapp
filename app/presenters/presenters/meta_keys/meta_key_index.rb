module Presenters
  module MetaKeys
    class MetaKeyIndex < Presenters::MetaKeys::MetaKeyCommon
      def autocomplete_label
        voc = @app_resource.vocabulary
        "#{self.label} [#{voc.label}]"
      end
    end
  end
end
