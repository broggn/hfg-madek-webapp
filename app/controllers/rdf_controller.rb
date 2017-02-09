class RdfController < ApplicationController

  def index
    vocabs = auth_policy_scope(current_user, Vocabulary.all)
    # @get = Presenters::Vocabularies::VocabulariesIndex
    #   .new(authorized_resources, user: current_user)

    @get = []
    @get.push(
      name: 'Thing',
      keys: vocabs.map do |v|
        v.meta_keys
        .where(
          'meta_keys.is_enabled_for_media_entries': true,
          'meta_keys.is_enabled_for_collections': true
        ).reorder(position: 'ASC')
        .flatten
      end
    )

    ['MediaEntry', 'Collection'].map do |k|
      @get.push(
        name: k,
        parents: ['Thing'],
        keys: vocabs.map do |v|
          v.meta_keys
          .where(
            'meta_keys.is_enabled_for_media_entries': k == 'MediaEntry',
            'meta_keys.is_enabled_for_collections': k == 'Collection'
          ).reorder(position: 'ASC')
          .flatten
        end
      )
    end

    respond_with(@get.as_json)
  end

end
