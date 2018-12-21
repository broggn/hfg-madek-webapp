module Concerns
  module ControllerHelpers
    extend ActiveSupport::Concern
    include Concerns::ResourceListParams

    def id_param
      params.require(:id)
    end

    def filtered_index_path(filter)
      media_entries_path(
        list: { show_filter: true, filter: JSON.generate(filter) })
    end

    def redirect_to_filtered_index(filter)
      redirect_to(filtered_index_path(filter))
    end

    def get_authorized_resource(resource = nil)
      resource ||= model_klass.unscoped.find(id_param)
      handle_confidential_links(resource)
      auth_authorize resource, "#{action_name}?".to_sym
      resource
    end

    def model_klass
      controller_name.classify.constantize
    end

    def represent(resource = get_authorized_resource,
                  presenter = nil)
      @get = presenterify(resource, presenter)
      respond_with @get
    end

    def presenterify(resource, presenter = nil, **args)
      presenter ||= presenter_by_class(action_name)
      presenter.new(
        resource, current_user, list_conf: resource_list_by_type_param, **args)
    end

    def presenter_by_class(action)
      base_klass = model_klass.name.pluralize
      klass = if (action == 'index')
        base_klass
      else
        base_klass.singularize + action.camelize
      end
      "::Presenters::#{base_klass}::#{klass}".constantize
    end

    private

    def handle_confidential_links(resource)
      return unless resource.respond_to?(:accessed_by_confidential_link)
      if token = get_valid_access_token(resource)
        return resource.accessed_by_confidential_link = token
      end
      if preview_request_by_parent_confidential_link?(resource)
        resource.accessed_by_confidential_link = true
      end
    end

    def get_valid_access_token(resource)
      return unless resource
      return unless access_token = (
        params.fetch('token', nil) || params.fetch('accessToken', nil))
      return unless access = ConfidentialLink.find_by_token(access_token)
      return access_token if access.resource_id == resource.id
    end

    def preview_request_by_parent_confidential_link?(resource)
      return false unless resource.is_a?(Preview)
      referrer_params = Rails.application.routes
        .recognize_path(request.referrer)
      controller_name == 'previews' &&
        action_name == 'show' &&
        referrer_params[:action] == 'show_by_confidential_link' &&
        ConfidentialLink.find_by_token(referrer_params[:token])
          .try(:resource_id) == resource.media_file.media_entry_id
    rescue ActionController::RoutingError
      false
    end
  end
end
