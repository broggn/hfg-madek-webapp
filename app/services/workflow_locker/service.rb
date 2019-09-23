module WorkflowLocker
  class Service
    include Validation
    include CommonPermissions
    include CommonMetaData

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

    def nested_resources
      @workflow.master_collection.child_media_resources
    end
  end
end
