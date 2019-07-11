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
                                           responsible_user: current_user)
    workflow.save!

    redirect_to my_workflows_path, notice: 'Workflow has been created successfully.'
  end

  def edit
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    @get = Presenters::Workflows::WorkflowEdit.new(workflow, current_user)
    respond_with(@get, layout: 'application')
  end

  def update
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    workflow.update!(workflow_params)

    redirect_to my_workflows_path, notice: 'Workflow has been update successfully.'
  end

  private

    def workflow_params
      params.require(:workflow).permit(:name)
    end
end
