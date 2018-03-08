class TemporaryUrlsController < ApplicationController

  before_action :set_resource
  before_action do
    auth_authorize @resource, :temporary_urls?
  end

  def new
    @get = generate_presenter(action_name).new(@resource, current_user)
    respond_with(@get, layout: 'application', template: template_name)
  end

  def create
    attrs = temporary_url_params(:description)
    temporary_url = @resource.temporary_urls.create(user: current_user)
    temporary_url.update_attributes!(attrs) && temporary_url.reload

    # NOTE: don't use `respond_with`! we render content in reponse to POST,
    #       which goes against the convention (normally a redirect to GET)
    @get = generate_presenter(:show)
             .new(temporary_url, current_user, request.base_url)
    respond_to do |format|
      format.html do
        render(status: 201, layout: 'application', template: template_name)
      end
      format.json { render status: 201, json: @get.as_json }
    end
  end

  def update
    props = [:revoked]
    attrs = params.permit(temporary_url: props).fetch(:temporary_url, {})
    temporary_url = TemporaryUrl.find(params.require(:temporary_url_id))
    auth_authorize temporary_url
    temporary_url.update_attributes!(attrs) && temporary_url.reload

    respond_with(@resource, location: temporary_urls_path(@resource))
  end

  private

  def temporary_url_params(props)
    params.permit(temporary_url: props).fetch(:temporary_url, {})
      .map { |k, v| [k, v.presence] }.to_h
  end

  def resource_type
    @_resource_type ||=
      case request.path
      when %r{\A\/entries\/}
        MediaEntry
      when %r{\A\/sets\/}
        Collection
      end
  end

  def template_name
    "#{resource_type.name.tableize}/#{action_name}_temporary_url"
  end

  def set_resource
    @resource = resource_type.find(params[:id])
  end

  def generate_presenter(action)
    [
      'Presenters',
      resource_type.name.pluralize,
      "#{resource_type.name}TemporaryUrl#{action.capitalize}"
    ]
      .join('::')
      .constantize
  end

  def temporary_urls_path(resource)
    send("temporary_urls_#{resource_type.name.underscore}_path", resource)
  end
end
