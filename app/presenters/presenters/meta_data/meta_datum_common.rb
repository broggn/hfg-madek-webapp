module Presenters
  module MetaData
    class MetaDatumCommon < Presenters::Shared::AppResource
      def initialize(app_resource)
        super(app_resource)
        @meta_key = \
          Presenters::MetaKeys::MetaKeyCommon.new(@app_resource.meta_key)
        @values = \
          wrap_in_array(@app_resource.value)
            .map { |v| indexify_if_necessary(v) }
        @literal_values = values.map { |v| v.is_a?(Presenter) ? v.uuid : v }
      end

      delegate_to_app_resource(:meta_key_id,
                               :type,
                               :media_entry_id,
                               :collection_id,
                               :filter_set_id)

      attr_reader :meta_key, :values, :literal_values

      def url
        meta_datum_path(@app_resource)
      end

      private

      def wrap_in_array(value)
        if value.class < ActiveRecord::Associations::CollectionProxy
          value
        else
          [value]
        end
      end

      def indexify_if_necessary(value)
        case value.class.name
        when 'Person'
          Presenters::People::PersonIndex.new(value)
        when 'User'
          Presenters::People::PersonIndex.new(value.person)
        when 'Group'
          Presenters::Groups::GroupIndex.new(value)
        when 'InstitutionalGroup'
          Presenters::Groups::GroupIndex.new(value)
        when 'License'
          Presenters::Licenses::LicenseIndex.new(value)
        when 'KeywordTerm'
          Presenters::KeywordTerms::KeywordTermIndex.new(value)
        else # all other values are "primitive/literal/unspecified":
          value
        end
      end
    end
  end
end