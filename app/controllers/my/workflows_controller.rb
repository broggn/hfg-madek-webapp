class My::WorkflowsController < ApplicationController
  include Concerns::ResourceListParams
  extend ActiveSupport::Concern

  before_action do
    auth_authorize :dashboard, :logged_in?
  end

  def show
  end

  private

  # def presenterify_api_token(api_token, action_name = :index, *params)
  #   "Presenters::ApiTokens::#{"ApiToken_#{action_name}".classify}"
  #     .constantize
  #     .new(api_token, current_user, *params)
  # end
  #
  # def token_params(props)
  #   params.permit(api_token: props).fetch(:api_token, {})
  #     .map { |k, v| [k, v.presence] }.to_h
  # end

end
