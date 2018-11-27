module Presenters
  module Contexts
    class ContextAsFilter < Presenters::Contexts::ContextCommon

      def initialize(app_resource, values, position)
        super(app_resource)
        @values = values
        @position = position
      end

      attr_reader :position

      def filter_type
        :meta_data
      end

      def children(values = @values)
        # binding.pry
        values
          .group_by { |v| v['context_key_id'] }
          .map.with_index do |bundle, index|
            context_key_id, values = bundle
            context_key = Presenters::ContextKeys::ContextKeyCommon.new(
              ContextKey.find(context_key_id))
            {
              type: :MetaKey,
              uuid: context_key.meta_key_id,
              position: context_key.position,
              label: context_key.label || context_key.id,
              children: values.map { |v| v.slice('uuid', 'count', 'label', 'type') }
            }
          end
          .sort { |x, y| x[:position] <=> y[:position] }
      end

      def childrenX(values = @values)
        types_with_bundle = values
                              .group_by { |v| v['context_key_id'] }
                              .values
                              .flatten
                              .group_by { |v| v['type'] }

        # binding.pry

        _children = []

        types_with_bundle
          .map do |type, bundle|
            # type, bundle = type_with_bundle
            # context_key_id, values = bundle
            context_key_id = bundle.first['context_key_id']
            context_key = Presenters::ContextKeys::ContextKeyCommon.new(
              ContextKey.find(context_key_id))
            label_suffix = if types_with_bundle.keys.size > 1
              " (#{type})"
            else
              ''
            end

            # binding.pry

            # uuid = if types_with_bundle.keys.size > 1
            #   context_key.meta_key_id + "_#{type}"
            # else
            #   context_key.meta_key_id
            # end

            {
              type: :MetaKey,
              uuid: context_key.meta_key_id,
              position: context_key.position,
              label: (context_key.label || context_key.id) + label_suffix,
              children: bundle.map { |v| v.slice('uuid', 'count', 'label') }
            }
          end
          .flatten
          .sort { |x, y| x[:position] <=> y[:position] }
      end

      def childrenY(values = @values)
        types_with_bundle = values
                              .group_by { |v| v['type'] }

        # binding.pry

        context_key_id = types_with_bundle.values.flatten.first['context_key_id']
        context_key = Presenters::ContextKeys::ContextKeyCommon.new(
          ContextKey.find(context_key_id))

        types_with_bundle
          .map do |type, bundle|
            # binding.pry
            {
              type: :MetaKey,
              uuid: context_key.meta_key_id,
              position: context_key.position,
              label: context_key.label || context_key.id,
              children: bundle#.map do |type, bundle|
                # bundle.slice('uuid', 'count', 'label')
              # end
            }
          end
      end

    end
  end
end
