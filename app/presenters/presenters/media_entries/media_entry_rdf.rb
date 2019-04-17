# DOCS:
# * https://w3c.github.io/json-ld-syntax/
# * http://ruby-rdf.github.io/json-ld/
# * https://www.rubydoc.info/github/ruby-rdf/rdf/frames
#
# TOOLS:
# * https://json-ld.org/playground/

# TODO:
# - add keywords to graph!

module Presenters
  module MediaEntries
    class MediaEntryRdf < Presenters::Shared::AppResourceWithUser
      include Presenters::Shared::Modules::VocabularyConfig

      def json_ld
        # JSON::LD::API.compact(graph, graph["@context"])
        json_ld_graph.as_json
      end

      def rdf_turtle
        rdf_graph = RDF::Graph.new << JSON::LD::API.toRdf(json_ld_graph.as_json)
        rdf_graph.dump(
          :ttl,
          prefixes: {}.merge(hardcoded_prefixes).merge(vocabularies_map).as_json)
      end

      def rdf_xml
        rdf_graph = RDF::Graph.new << JSON::LD::API.toRdf(json_ld_graph.as_json)
        rdf_graph.dump(
          :rdfxml,
          prefixes: {}.merge(hardcoded_prefixes).merge(vocabularies_map).as_json)
      end

      private

      def json_ld_graph
        md_graph = meta_data_graph
        @_graph ||= \
        {
          '@context': {
            '@base': full_url('/')
          }.merge(hardcoded_prefixes)
            .merge(vocabularies_map),
          '@id': full_url("/entries/#{@app_resource.id}"),
          '@type': 'madek:MediaEntry'
        }.merge(md_graph)
      end

      def meta_data_graph
        @_meta_data_graph ||= meta_data.map do |md|
          value =
            case md.class.name
            when 'MetaDatum::Text'
              md.string
            when 'MetaDatum::TextDate'
              md.string
            when 'MetaDatum::Keywords'
              md.keywords.map do |k|
                {
                  '@id': full_url("/vocabulary/keyword/#{k.id}"),
                  '@type': 'madek:Keyword',
                  _label: k.to_s,
                  _rdf_class: k.rdf_class,
                  _sameAs: k.external_uris.presence
                }
              end
            when 'MetaDatum::People'
              md.people.map do |p|
                {
                  '@id': full_url("/people/#{p.id}"),
                  '@type': 'madek:Person',
                  _label: p.to_s,
                  _sameAs: p.external_uris.presence
                }
              end
            else
              fail 'not implemented! md type: ' + md.class
            end
          { md.meta_key_id => value }
        end.reduce({}, &:merge)
      end

      def vocabularies_map
        @_vocabularies_map ||= meta_data
          .uniq(:vocabulary_id).group_by(&:vocabulary).map(&:first)
          .sort_by(&:position)
          .map do |v|
            { v.id => full_url("/#{v.id}:") }
          end.reduce({}, &:merge)
      end

      def hardcoded_prefixes
        { madek: full_url('/ns#') }
      end

      # temp
      def full_url(path)
        'https://medienarchiv.zhdk.ch' + path
      end

      def meta_data
        @_meta_data ||= fetch_visible_meta_data
      end

      # NOTE: helpers below from Presenters::MetaData::MetaDataShow et. al.

      def fetch_visible_meta_data
        # NOTE: don't filter by enabled to no hide existing data!
        #       .where(is_enabled_for_media_entries: true)
        @app_resource
          .meta_data
          .joins(:vocabulary)
          .where(vocabularies: { id: visible_vocabularies_for_user.map(&:id) })
      end

      def visible_vocabularies_for_user
        @visible_vocabularies_for_user ||=
          auth_policy_scope(@user, Vocabulary.all)
            .sort_by
      end
    end
  end
end
