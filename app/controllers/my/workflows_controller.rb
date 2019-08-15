class My::WorkflowsController < ApplicationController
  include Concerns::My::DashboardSections

  before_action { auth_authorize(:dashboard, :logged_in?) }

  def index
    @get =
      Presenters::Users::DashboardSection.new(
        Presenters::Workflows::WorkflowIndex.new(current_user),
        sections_definition,
        nil
      )
    respond_with(@get, layout: 'app_with_sidebar')
  end

  def new
    @get =
      Presenters::Users::DashboardSection.new(
        Presenters::Workflows::WorkflowNew.new(Workflow.new, current_user),
        sections_definition,
        nil
      )
    respond_with(@get, layout: 'app_with_sidebar')
  end

  def create
    WorkflowCreator.new(workflow_params, current_user).call

    redirect_to my_workflows_path, notice: 'Workflow has been created successfully.'
  end

  def edit
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    @get =
      Presenters::Users::DashboardSection.new(
        workflow_edit_data(workflow),
        sections_definition,
        nil
      )
    respond_with(@get, layout: 'app_with_sidebar')
  end

  def update
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    workflow.update!(workflow_params)
    respond_with(workflow_edit_data(workflow.reload))
  end

  def update_owners
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    users_or_people_ids = params.require(:workflow).fetch(:owners, [])
    workflow.owners = User.where(id: users_or_people_ids)
    respond_with(workflow_edit_data(workflow))
  end

  def finish
    workflow = Workflow.find(params[:id])
    auth_authorize workflow
    if WorkflowLocker.new(workflow).call
      redirect_to edit_my_workflow_path(workflow), notice: 'Workflow has been finished!'
    end
  end

  private

  def workflow_edit_data(workflow)
    Presenters::Workflows::WorkflowEdit.new(workflow, current_user)
  end

  def workflow_params
    params.require(:workflow).permit(
      :name,
      { owner_ids: [] },
      common_permissions: [:responsible, { write: [:uuid, :type] }, { read: [:uuid, :type] }, :read_public],
      common_meta_data: [:meta_key_id, { value: [] }]
    )
  end
end
