class WorkflowLocker
  class ValidationError < StandardError; end

  def initialize(object_or_id)
    @workflow = if object_or_id.is_a?(ApplicationRecord)
                  object_or_id
                else
                  Workflow.find(object_or_id)
                end
    @errors = {}
  end

  def call
    return false unless @workflow.is_active

    ActiveRecord::Base.transaction do
      @workflow.update!(is_active: false)
      apply_common_permissions
      apply_common_meta_data
      validate_and_publish!
      # raise ActiveRecord::Rollback
    end

    true
  rescue ValidationError
    @errors
  end

  private

  def configuration
    @workflow.configuration
  end

  def resource_permissions(resource, scope)
    raise ArgumentError, 'scope must be a Symbol' unless scope.is_a?(Symbol)

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
      responsible: [2, 3],
      write: [2, 3],
      read: [1, 1]
    }.fetch(scope)[index]

    {}.tap do |result|
      available_permissions.first(number_of_applicable_permissions).map do |perm_name|
        result[perm_name] = true
      end
    end
  end

  def user_permissions_params(resource, scope)
    configuration['common_permissions'][scope.to_s]
      .select { |o| o['type'] == 'User' }
      .map do |u|
        { user_id: u.is_a?(Hash) ? u.fetch('uuid') : u }
          .merge(resource_permissions(resource, scope))
    end
  end

  def update_responsible!(resource)
    if user = User.find_by(id: configuration['common_permissions']['responsible'])
      resource.update!(responsible_user_id: user.id)
    end
  end

  def group_permissions_params(resource, scope)
    configuration['common_permissions'][scope.to_s]
      .select { |o| ['Group', 'InstitutionalGroup'].include?(o['type']) }
      .map do |g|
        { group_id: g.fetch('uuid') }
          .merge(resource_permissions(resource, scope))
    end
  end

  def update_write_permissions!(resource, scope = :write)
    user_permissions_params(resource, scope)
      .each { |p| resource.user_permissions.create! p }
    group_permissions_params(resource, scope)
      .each { |p| resource.group_permissions.create! p }
  end

  def api_client_permissions_params(resource)
    configuration['common_permissions']['read']
      .select { |o| o['type'] == 'ApiClient' }
      .map do |api_client|
        { api_client_id: api_client.fetch('uuid') }
          .merge(resource_permissions(resource, :read))
    end
  end

  def update_read_permissions!(resource)
    update_write_permissions!(resource, :read)

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

  def destroy_all_permissions(resource)
    resource.user_permissions.destroy_all
    resource.group_permissions.destroy_all
    resource.api_client_permissions.destroy_all
  end

  def required_context_keys
    @required_context_keys ||= (
      app_settings = AppSetting.first
      context = app_settings.contexts_for_entry_validation.first
      context.context_keys.where(is_required: true)
    )
  end

  def validate_and_publish!
    nested_resources.each do |nested_resource|
      resource = nested_resource.cast_to_type.reload
      has_errors = false
      required_context_keys.each do |rck|
        unless resource.meta_data.find_by(meta_key_id: rck.meta_key_id)
          has_errors = true
          @errors[resource.title] ||= []
          @errors[resource.title] << "#{rck.meta_key.labels['de']} is missing"
        end
      end

      if resource.is_a?(MediaEntry) && !has_errors
        resource.update!(is_published: true)
      end
    end

    unless @errors.blank?
      raise ValidationError
    end
  end

  def nested_resources
    @workflow.master_collection.child_media_resources
  end

  def apply_common_permissions
    destroy_all_permissions(@workflow.master_collection)
    update_responsible!(@workflow.master_collection)
    update_write_permissions!(@workflow.master_collection)
    update_read_permissions!(@workflow.master_collection)
    update_public_permissions!(@workflow.master_collection)

    nested_resources.each do |resource|
      destroy_all_permissions(resource.cast_to_type)
      update_responsible!(resource.cast_to_type)
      update_write_permissions!(resource.cast_to_type)
      update_read_permissions!(resource.cast_to_type)
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

    meta_datum_klass.create_with_user!(@workflow.creator, {
      meta_key_id: meta_key_id,
      created_by: @workflow.creator,
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