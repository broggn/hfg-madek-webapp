require 'spec_helper'

describe TemporaryUrlsController do
  let(:user) { create :user }

  describe 'action: new' do
    context 'when resource is a media entry' do
      context 'when logged in user is an owner' do
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'renders template' do
          get :new, { id: resource.id }, user_id: user.id

          expect(response).to be_success
          expect(response).to render_template 'media_entries/new_temporary_url'
        end

        it 'assigns presenter' do
          get :new, { id: resource.id }, user_id: user.id

          expect(assigns[:get]).to be_instance_of(
            Presenters::MediaEntries::MediaEntryTemporaryUrlNew)
        end

        context 'when resource is not publised' do
          it 'raises not found error' do
            resource.update_column(:is_published, false)

            expect { get :new, { id: resource.id }, user_id: user.id }
              .to raise_error ActiveRecord::RecordNotFound
          end
        end
      end

      context 'when logged in user is not an owner' do
        let(:not_owner) { create :user }
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'raises forbidden error' do
          expect { get :new, { id: resource.id }, user_id: not_owner.id }
            .to raise_error Errors::ForbiddenError
        end
      end

      context 'when no user is not logged in' do
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'raises unauthorized error' do
          expect { get :new, id: resource.id }
            .to raise_error Errors::UnauthorizedError
        end
      end
    end

    context 'when resource is a collection' do
      before { @request.path = '/sets/' }

      context 'when logged in user is an owner' do
        let(:resource) do
          create :collection,
                 creator: user, responsible_user: user
        end

        it 'renders template' do
          get :new, { id: resource.id }, user_id: user.id

          expect(response).to be_success
          expect(response).to render_template 'collections/new_temporary_url'
        end

        it 'assigns presenter' do
          get :new, { id: resource.id }, user_id: user.id

          expect(assigns[:get]).to be_instance_of(
            Presenters::Collections::CollectionTemporaryUrlNew)
        end
      end

      context 'when logged in user is not an owner' do
        let(:not_owner) { create :user }
        let(:resource) do
          create :collection,
                 creator: user, responsible_user: user
        end

        it 'raises forbidden error' do
          expect { get :new, { id: resource.id }, user_id: not_owner.id }
            .to raise_error Errors::ForbiddenError
        end
      end

      context 'when no user is not logged in' do
        let(:resource) do
          create :collection,
                 creator: user, responsible_user: user
        end

        it 'raises unauthorized error' do
          expect { get :new, id: resource.id }
            .to raise_error Errors::UnauthorizedError
        end
      end
    end
  end

  describe 'action: create' do
    context 'when resource is a media entry' do
      context 'when logged in user is an owner' do
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'redirects to temporary urls show action' do
          post :create, { id: resource.id }, user_id: user.id

          expect(response).to have_http_status(302)
          expect(response).to redirect_to temporary_url_media_entry_path(
            resource,
            resource.temporary_urls.first,
            just_created: true
          )
        end

        context 'when resource is not publised' do
          it 'raises not found error' do
            resource.update_column(:is_published, false)

            expect { post :create, { id: resource.id }, user_id: user.id }
              .to raise_error ActiveRecord::RecordNotFound
          end
        end
      end

      context 'when logged in user is not an owner' do
        let(:not_owner) { create :user }
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'raises forbidden error' do
          expect { post :create, { id: resource.id }, user_id: not_owner.id }
            .to raise_error Errors::ForbiddenError
        end
      end

      context 'when no user is not logged in' do
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'raises unauthorized error' do
          expect { post :create, id: resource.id }
            .to raise_error Errors::UnauthorizedError
        end
      end
    end

    context 'when resource is a collection' do
      before { @request.path = '/sets/' }

      context 'when logged in user is an owner' do
        let(:resource) do
          create :collection, creator: user, responsible_user: user
        end

        it 'redirects to temporary urls show action' do
          post :create, { id: resource.id }, user_id: user.id

          expect(response).to have_http_status(302)
          expect(response).to redirect_to temporary_url_collection_path(
            resource,
            resource.temporary_urls.first,
            just_created: true
          )
        end
      end

      context 'when logged in user is not an owner' do
        let(:not_owner) { create :user }
        let(:resource) do
          create :collection, creator: user, responsible_user: user
        end

        it 'raises forbidden error' do
          expect { post :create, { id: resource.id }, user_id: not_owner.id }
            .to raise_error Errors::ForbiddenError
        end
      end

      context 'when no user is not logged in' do
        let(:resource) do
          create :collection, creator: user, responsible_user: user
        end

        it 'raises unauthorized error' do
          expect { post :create, id: resource.id }
            .to raise_error Errors::UnauthorizedError
        end
      end
    end
  end

  describe 'action: update' do
    context 'when resource is a media entry' do
      let(:temporary_url) do
        create :temporary_url, user: user, resource: resource
      end

      context 'when logged in user is an owner' do
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'redirects to template urls list' do
          patch :update,
                { id: resource.id, temporary_url_id: temporary_url.id },
                user_id: user.id

          expect(response).to redirect_to temporary_urls_media_entry_path(resource)
        end

        context 'when resource is not publised' do
          it 'raises not found error' do
            resource.update_column(:is_published, false)

            expect do
              patch :update,
                    { id: resource.id, temporary_url_id: temporary_url.id },
                    user_id: user.id
            end.to raise_error ActiveRecord::RecordNotFound
          end
        end
      end

      context 'when logged in user is not an owner' do
        let(:not_owner) { create :user }
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'raises forbidden error' do
          expect do
            patch :update,
                  { id: resource.id, temporary_url_id: temporary_url.id },
                  user_id: not_owner.id
          end.to raise_error Errors::ForbiddenError
        end
      end

      context 'when no user is not logged in' do
        let(:resource) do
          create :media_entry_with_image_media_file,
                 creator: user, responsible_user: user
        end

        it 'raises unauthorized error' do
          expect do
            patch :update, id: resource.id, temporary_url_id: temporary_url.id
          end.to raise_error Errors::UnauthorizedError
        end
      end
    end

    context 'when resource is a collection' do
      let(:temporary_url) do
        create :temporary_url, user: user, resource: resource
      end
      before { @request.path = '/sets/' }

      context 'when logged in user is an owner' do
        let(:resource) do
          create :collection, creator: user, responsible_user: user
        end

        it 'redirects to template urls list' do
          patch :update,
                { id: resource.id, temporary_url_id: temporary_url.id },
                user_id: user.id

          expect(response).to redirect_to temporary_urls_collection_path(resource)
        end
      end

      context 'when logged in user is not an owner' do
        let(:not_owner) { create :user }
        let(:resource) do
          create :collection, creator: user, responsible_user: user
        end

        it 'raises forbidden error' do
          expect do
            patch :update,
                  { id: resource.id, temporary_url_id: temporary_url.id },
                  user_id: not_owner.id
          end.to raise_error Errors::ForbiddenError
        end
      end

      context 'when no user is not logged in' do
        let(:resource) do
          create :collection, creator: user, responsible_user: user
        end

        it 'raises unauthorized error' do
          expect do
            patch :update, id: resource.id, temporary_url_id: temporary_url.id
          end.to raise_error Errors::UnauthorizedError
        end
      end
    end
  end
end
