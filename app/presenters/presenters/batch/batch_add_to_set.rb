module Presenters
  module Batch
    class BatchAddToSet < Presenter

      attr_accessor :resource_ids
      attr_accessor :search_term
      attr_accessor :return_to

      def initialize(initial_values)
        @user = initial_values[:user]
        @resource_ids = initial_values[:resource_ids]
        @search_results = []
        @search_term = initial_values[:search_term]
        @return_to = initial_values[:return_to]
      end

      def search_results
        @search_results = []
        if @search_term.presence
          @search_results = search_collections(@user, @search_term)
            .map do |collection|
              Presenters::Collections::CollectionIndex.new(
                collection, @user
              )
            end
        end
        @search_results
      end

      def batch_count
        @resource_ids.length
      end

      def batch_select_add_to_set_url
        batch_select_add_to_set_path
      end

      def batch_add_to_set_url
        batch_add_to_set_path
      end

      private

      def search_collections(user, search_term)
        result = Collection.editable_by_user(user)
          .joins(:meta_data)
          .where(meta_data: { meta_key_id: 'madek_core:title' })
          .where('meta_data.string ILIKE :term', term: "%#{search_term}%")
          .reorder('meta_data.string ASC')

        if result.length > 10
          result = result.slice(0, 10)
        end
        result
      end

    end
  end
end