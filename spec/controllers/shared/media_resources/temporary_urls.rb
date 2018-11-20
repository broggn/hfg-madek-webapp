RSpec.configure do |c|
  c.alias_it_should_behave_like_to :it_handles_properly, 'it handles properly'
end

shared_examples 'temporary urls' do
  include ActiveSupport::Testing::TimeHelpers

  describe 'action: show_by_temporary_url' do
    it 'renders template' do
      temporary_url = create :temporary_url, user: @user, resource: resource

      get :show_by_temporary_url, id: resource.id, token: temporary_url.token

      expect(response).to be_success
      expect(response).to render_template('show_by_temporary_url')
    end

    context 'when token is revoked' do
      it 'raises not found error' do
        temporary_url = create :temporary_url, user: @user, resource: resource,
                                               revoked: true

        expect do
          get(:show_by_temporary_url, id: resource.id, token: temporary_url.token)
        end
          .to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when token has expired' do
      it 'raises not found error' do
        temporary_url = create(:temporary_url,
                               user: @user,
                               resource: resource,
                               expires_at: 1.year.from_now)
        temporary_url.reload

        travel(1.year + 1.second) do
          expect do
            get :show_by_temporary_url, id: resource.id, token: temporary_url.token
          end
            .to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end

  describe 'action: temporary_urls' do
    before do
      if resource.respond_to?(:is_published)
        resource.update_column(:is_published, true)
      end
    end

    context 'when resource is published' do
      context 'when user is an owner' do
        it 'renders template' do
          get :temporary_urls, { id: resource.id }, user_id: @user.id

          expect(response).to be_success
          expect(response).to render_template :temporary_urls
        end
      end

      context 'when logged in user is not an owner' do
        it 'raises forbidden error' do
          resource.update_column(:responsible_user_id, create(:user).id)

          expect { get :temporary_urls, { id: resource.id }, user_id: @user.id }
            .to raise_error Errors::ForbiddenError
        end
      end
    end
  end
end
