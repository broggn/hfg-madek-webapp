class My::WorkflowsController < ApplicationController
  include Concerns::My::DashboardSections

  before_action { auth_authorize(:dashboard, :logged_in?) }

  def index
    @get = Presenters::Users::DashboardSection.new(
      Presenters::Workflows::WorkflowIndex.new(current_user),
      sections_definition,
      nil)
    respond_with(@get, layout: 'app_with_sidebar')
  end

  def new
    @get = Presenters::Users::DashboardSection.new(
      Presenters::Workflows::WorkflowNew.new(Workflow.new, current_user),
      sections_definition,
      nil)
    respond_with(@get, layout: 'app_with_sidebar')
  end

  def create
    workflow = Workflow.new(workflow_params)
    workflow.user = current_user
    workflow.collections << Collection.new(creator: current_user,
                                           responsible_user: current_user,
                                           is_master: true)
    workflow.save!
    MetaDatum::Text.create!(
      collection: workflow.master_collection,
      meta_key_id: 'madek_core:title',
      created_by: current_user,
      string: workflow.name)

    redirect_to my_workflows_path, notice: 'Workflow has been created successfully.'
  end

  def edit
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    @get = Presenters::Users::DashboardSection.new(
      Presenters::Workflows::WorkflowEdit.new(workflow, current_user),
      sections_definition,
      nil)
    respond_with(@get, layout: 'app_with_sidebar')
  end

  def update
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    workflow.update!(workflow_params)

    redirect_to my_workflows_path, notice: 'Workflow has been updated successfully.'
  end

  def finish
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    if WorkflowLocker.new(workflow).call
      redirect_to edit_my_workflow_path(workflow), notice: 'Workflow has been finished!'
    end
  end

  private

  def workflow_params
    params.require(:workflow).permit(:name)
  end
end
