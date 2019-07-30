require 'spec_helper'

describe My::WorkflowsController do
  let(:user) { create :user }

  describe 'action: index' do
    context 'when user is not logged in' do
      it 'raises error' do
        expect { get(:index) }.to raise_error(Errors::UnauthorizedError)
      end
    end

    context 'when user is logged in' do
      before { get(:index, session: { user_id: user.id }) }

      it 'renders template' do
        expect(response).to render_template('workflows/index')
      end

      it 'assigns a presenter to @get' do
        expect(assigns(:get)).to be_instance_of(Presenters::Users::DashboardSection)
      end
    end
  end

  describe 'action: new' do
    context 'when user is not logged in' do
      it 'raises error' do
        expect { get(:new, session: {}) }.to raise_error(Errors::UnauthorizedError)
      end
    end

    context 'when user is logged in' do
      it 'renders template' do
        get(:new, session: { user_id: user.id })

        expect(response).to render_template('workflows/new')
      end

      it 'assigns a presenter to @get' do
        get(:new, session: { user_id: user.id })

        expect(assigns[:get]).to be_instance_of(Presenters::Users::DashboardSection)
      end
    end
  end

  describe 'action: create' do
    let(:workflow) { build :workflow }

    context 'when user is not logged in' do
      it 'raises error' do
        expect { post(:create, params: { workflow: { name: workflow.name } }) }.to raise_error(
          Errors::UnauthorizedError
        )
      end
    end

    context 'when user is logged in' do
      it 'creates a workflow' do
        expect {
          post(
            :create,
            params: { workflow: { name: workflow.name } }, session: { user_id: user.id }
          )
        }.to change { Workflow.count }.by(1)
      end

      it 'creates a collection' do
        expect {
          post(
            :create,
            params: { workflow: { name: workflow.name } }, session: { user_id: user.id }
          )
        }.to change { Collection.count }.by(1)
      end

      it 'creates a collection with the same name' do
        post(
          :create,
          params: { workflow: { name: workflow.name } }, session: { user_id: user.id }
        )

        expect(Workflow.first.master_collection.title).to eq(workflow.name)
      end
    end
  end

  describe 'action: edit' do
    context 'when user is not logged in' do
      it 'raises error' do
        workflow = create :workflow

        expect { get(:edit, params: { id: workflow.id }) }.to raise_error(Errors::UnauthorizedError)
      end
    end

    context 'when user is not an owner' do
      it 'raises error' do
        workflow = create :workflow

        expect {
          get(:edit, params: { id: workflow.id }, session: { user_id: user.id })
        }.to raise_error(Errors::ForbiddenError)
      end
    end

    context 'when user is an owner' do
      it 'renders template' do
        workflow = create :workflow, user: user

        get(:edit, params: { id: workflow.id }, session: { user_id: workflow.user.id })

        expect(response).to render_template('workflows/edit')
      end

      it 'assigns a presenter to @get' do
        workflow = create :workflow, user: user

        get(:edit, params: { id: workflow.id }, session: { user_id: workflow.user.id })

        expect(assigns[:get]).to be_instance_of(Presenters::Users::DashboardSection)
        expect(assigns[:get].section_content).to be_instance_of(Presenters::Workflows::WorkflowEdit)
      end
    end
  end

  describe 'action: update' do
    context 'when user is not logged in' do
      it 'raises error' do
        workflow = create :workflow

        expect {
          patch(:update, params: { id: workflow.id, workflow: { name: 'new name' } })
        }.to raise_error(Errors::UnauthorizedError)
      end
    end

    context 'when user is not an owner' do
      it 'raises error' do
        workflow = create :workflow

        expect {
          patch(
            :update,
            params: { id: workflow.id, workflow: { name: 'new name' } },
            session: { user_id: user.id }
          )
        }.to raise_error(Errors::ForbiddenError)
      end
    end

    context 'when user is an owner' do
      it 'updates the workflow' do
        workflow = create :workflow, user: user

        patch(
          :update,
          params: { id: workflow.id, workflow: { name: 'new name' } }, session: { user_id: user.id }
        )

        workflow.reload
        expect(workflow.name).to eq('new name')
      end
    end
  end
end
