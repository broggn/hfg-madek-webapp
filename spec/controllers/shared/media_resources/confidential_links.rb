RSpec.configure do |c|
  c.alias_it_should_behave_like_to :it_handles_properly, 'it handles properly'
end

shared_examples 'confidential urls' do
  include ActiveSupport::Testing::TimeHelpers

  describe 'action: show_by_confidential_link' do
    it 'renders template' do
      cf_link = create :confidential_link, user: @user, resource: resource

      get :show_by_confidential_link, id: resource.id, token: cf_link.token

      expect(response).to be_success
      expect(response).to render_template('show_by_confidential_link')
    end

    context 'when token is revoked' do
      it 'raises unauthorized error' do
        cf_link = create :confidential_link, user: @user, resource: resource,
                                             revoked: true

        expect do
          get(:show_by_confidential_link, id: resource.id, token: cf_link.token)
        end
          .to raise_error(Errors::UnauthorizedError)
      end
    end

    context 'when token has expired' do
      it 'raiunauthorized error' do
        cf_link = create(:confidential_link,
                         user: @user,
                         resource: resource,
                         expires_at: 1.year.from_now)
        cf_link.reload

        travel(1.year + 1.second) do
          expect do
            get(:show_by_confidential_link, id: resource.id, token: cf_link.token)
          end
            .to raise_error(Errors::UnauthorizedError)
        end
      end
    end
  end

  describe 'action: confidential_links' do
    before do
      if resource.respond_to?(:is_published)
        resource.update_column(:is_published, true)
      end
    end

    context 'when resource is published' do
      context 'when user is an owner' do
        it 'renders template' do
          get :confidential_links, { id: resource.id }, user_id: @user.id

          expect(response).to be_success
          expect(response).to render_template :confidential_links
        end
      end

      context 'when logged in user is not an owner' do
        it 'raises forbidden error' do
          resource.update_column(:responsible_user_id, create(:user).id)

          expect do
            get :confidential_links, { id: resource.id }, user_id: @user.id
          end.to raise_error Errors::ForbiddenError
        end
      end
    end
  end
end
