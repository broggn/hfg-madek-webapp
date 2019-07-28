class WorkflowLocker
  def initialize(object_or_id)
    @workflow = if object_or_id.is_a?(ApplicationRecord)
                  object_or_id
                else
                  Workflow.find(object_or_id)
                end
  end

  def call
    return false unless @workflow.is_active

    ActiveRecord::Base.transaction do
      @workflow.update!(is_active: false)
      apply_common_permissions
      apply_common_meta_data
      # raise ActiveRecord::Rollback
    end

    true
  end

  private

  def configuration
    @workflow.configuration
  end

  def resource_permissions(resource, type)
    raise ArgumentError, 'type must be a Symbol' unless type.is_a?(Symbol)

    available_permissions =
      case resource
      when Collection
        %i(get_metadata_and_previews edit_metadata_and_relations edit_permissions)
      when MediaEntry
        %i(get_metadata_and_previews get_full_size edit_metadata edit_permissions)
      end

    index =
      case resource
      when Collection then 0
      when MediaEntry then 1
      end

    number_of_applicable_permissions = { # [_if_collection_, _if_media_entry_]
      user: [2, 3],
      group: [2, 3],
      api_client: [1, 1]
    }.fetch(type)[index]

    {}.tap do |result|
      available_permissions.first(number_of_applicable_permissions).map do |perm_name|
        result[perm_name] = true
      end
    end
  end

  def user_permissions_params(resource)
    [
      { user_id: configuration['common_permissions']['responsible'] }
        .merge(resource_permissions(resource, :user))
    ]
  end

  def update_user_permissions!(resource) # key: responsible
    resource.user_permissions.destroy_all
    user_permissions_params(resource)
      .each { |p| resource.user_permissions.create! p }
  end

  def group_permissions_params(resource)
    configuration['common_permissions']['write'].map do |group_id|
      { group_id: group_id }
        .merge(resource_permissions(resource, :group))
    end
  end

  def update_group_permissions!(resource) # key: responsible
    resource.group_permissions.destroy_all
    group_permissions_params(resource)
      .each { |p| resource.group_permissions.create! p }
  end

  def api_client_permissions_params(resource)
    configuration['common_permissions']['read'].map do |api_client_id|
      { api_client_id: api_client_id }
        .merge(resource_permissions(resource, :api_client))
    end
  end

  def update_api_client_permissions!(resource) # key: responsible
    resource.api_client_permissions.destroy_all
    api_client_permissions_params(resource)
      .each { |p| resource.api_client_permissions.create! p }
  end

  def update_public_permissions!(resource)
    value = configuration['common_permissions']['read_public']

    case resource
    when Collection
      resource.update!(get_metadata_and_previews: value)
    when MediaEntry
      resource
        .reload # to get access to 'get_full_size' attr
        .update!(get_metadata_and_previews: value, get_full_size: value)
    end
  end

  def nested_resources
    @workflow.master_collection.child_media_resources
  end

  def apply_common_permissions
    update_user_permissions!(@workflow.master_collection)
    update_group_permissions!(@workflow.master_collection)
    update_api_client_permissions!(@workflow.master_collection)
    update_public_permissions!(@workflow.master_collection)
    nested_resources.each do |resource|
      update_user_permissions!(resource.cast_to_type)
      update_group_permissions!(resource.cast_to_type)
      update_api_client_permissions!(resource.cast_to_type)
      update_public_permissions!(resource.cast_to_type)
    end
  end

  def create_meta_datum!(resource, meta_key_id, value)
    meta_datum_klass = \
      MetaKey.find(meta_key_id).meta_datum_object_type.constantize

    meta_datum_klass.find_by(
      meta_key_id: meta_key_id,
      resource.class.name.foreign_key => resource.id
    ).try(:destroy)

    meta_datum_klass.create_with_user!(@workflow.user, {
      meta_key_id: meta_key_id,
      created_by: @workflow.user,
      value: \
        (if [MetaDatum::Text, MetaDatum::TextDate].include?(meta_datum_klass)
           value
         elsif MetaDatum::Keywords == meta_datum_klass
           [Keyword.find_by!(term: value).id]
         end)
    }.merge(resource.class.name.foreign_key => resource.id))
  end

  def apply_common_meta_data
    configuration['common_meta_data'].each do |meta_data|
      next unless meta_data['meta_key_id'].present?
      create_meta_datum!(@workflow.master_collection, meta_data['meta_key_id'], meta_data['value'])
      nested_resources.each do |resource|
        create_meta_datum!(resource.cast_to_type, meta_data['meta_key_id'], meta_data['value'])
      end
    end
  end
end
