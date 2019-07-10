require 'spec_helper'

describe WorkflowsController do
  let(:user) { create :user }

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
    end
  end 
end
