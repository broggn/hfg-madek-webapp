class WorkflowLocker
  # include Modules::Resources::PermissionsHelpers

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
  end

  private

  def configuration
    @workflow.configuration
  end

  def resource_permissions(resource, type)#first_n_rights = nil)
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

    number_of_applicable_permissions = {
      user: [3, 4],
      group: [2, 3],
      api_client: [1, 1]
    }.fetch(type)[index]

    # permissions = if first_n_rights.is_a?(Integer)
    #   available_permissions.first(first_n_rights)
    # else
    #   available_permissions
    # end

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

  def apply_common_permissions
    update_user_permissions!(@workflow.master_collection)
    update_group_permissions!(@workflow.master_collection)
    update_api_client_permissions!(@workflow.master_collection)
    @workflow.master_collection.child_media_resources.each do |resource|
      update_user_permissions!(resource.cast_to_type)
      update_group_permissions!(resource.cast_to_type)
      update_api_client_permissions!(resource.cast_to_type)
    end
  end

  def apply_common_meta_data
  end
end
