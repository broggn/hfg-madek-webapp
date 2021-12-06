require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

feature 'Media Entry edit' do
  given(:user) { create(:user, password: 'password') }
  given(:media_entry) { create(:media_entry_with_image_media_file, responsible_user: user) }
  given(:context) { Context.find('media_object') }
  given(:api_client) { create(:api_client) }

  background do
    sign_in_as user, 'password'
    visit media_entry_path(media_entry)
  end

  describe 'Context visibility' do
    context 'when the api client permission for the context exists' do
      context 'and view permission is set to true' do
        background do
          create(:context_api_client_permission,
                 :viewable,
                 context: context,
                 api_client: api_client)
        end

        context 'and media entry has the api client permission set' do
          background do
            create(:media_entry_api_client_permission,
                   api_client: api_client,
                   media_entry: media_entry)
          end

          scenario 'Context tab is visible' do
            expect_tab(context)
          end
        end

        context 'and media entry has no api client permission' do
          scenario 'Context tab is not visible' do
            expect_no_tab(context)
          end
        end
      end

      context 'and view permission is set to false' do
        background do
          create(:context_api_client_permission,
                 :unviewable,
                 context: context,
                 api_client: api_client)
        end

        scenario 'Context tab is visible' do
          expect_tab(context)
        end
      end
    end

    context 'when no api client permission for the context exists' do
      scenario 'Context tab is visible' do
        expect_tab(context)
      end
    end
  end
end

def go_to_edit_page
  within '.ui-body-title-actions' do
    click_button I18n.t('resource_action_media_entry_edit_metadata')
  end
end

def expect_tab(context)
  go_to_edit_page
  expect(page).to have_css('.ui-tabs .ui-tabs-item a', exact_text: context.label)
end

def expect_no_tab(context)
  go_to_edit_page
  expect(page).not_to have_link(context.label)
end
