module Modules
  module Batch
    module BatchAddToSet
      extend ActiveSupport::Concern

      include Modules::Batch::BatchAuthorization

      def batch_select_add_to_set
        return_to = params.require(:return_to)

        authorize MediaEntry, :logged_in?

        media_entry_ids = params.require(:media_entry_id)
        media_entries = MediaEntry.unscoped.where(id: media_entry_ids)
        authorize_media_entries_for_view!(current_user, media_entries)

        search_term = params[:clear] ? '' : params[:search_term]

        @get = Presenters::Batch::BatchAddToSet.new(
          current_user,
          media_entry_ids,
          media_entries,
          search_term,
          return_to
        )

        respond_with(@get, template: 'batch/batch_select_add_to_set')
      end

      def batch_add_to_set
        return_to = params.require(:return_to)

        authorize MediaEntry, :logged_in?

        collection_id = params.require(:collection_id)
        collection = Collection.find(collection_id)
        authorize collection

        media_entry_ids = params.require(:media_entry_id)
        media_entries = MediaEntry.unscoped.where(id: media_entry_ids)
        authorize_media_entries_for_view!(current_user, media_entries)

        existing = collection.media_entries
        no_duplicates = media_entries.reject do |media_entry|
          existing.include? media_entry
        end

        ActiveRecord::Base.transaction do
          collection.media_entries << no_duplicates
        end

        redirect_to(return_to)
      end

    end
  end
end