module Presenters
  module Vocabularies
    class VocabularyCommon < Presenters::Shared::AppResource
      delegate_to_app_resource(:label,
                               :description,
                               :position,
                               :enabled_for_public_view,
                               :enabled_for_public_use)

      def url
        vocabulary_path(@app_resource)
      end
    end
  end
end