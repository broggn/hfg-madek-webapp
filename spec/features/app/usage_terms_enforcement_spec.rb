require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

feature 'App: UserMenu' do

  # If a user has not accepted the latest usage terms and is logged in,
  # every action result in an Error prompting to accept those terms.
  let(:user) { FactoryGirl.create :user }
  let(:latest_usage_terms) { FactoryGirl.create :usage_terms }

  describe 'App: enforcing acceptance of latest usage terms for logged in users' do

    example 'enforce after login and accept' do
      expect(latest_usage_terms).to be
      ensure_user_has_not_accepted_latest_terms(user)
      sign_in_as(user.login, user.password)
      modal = usage_terms_modal
      expect_correct_modal_content(modal)
      within(modal) { submit_form }

      # expect that the normal login flow goes on, with redirect and flash:
      expect(current_path).to eq my_dashboard_path
      expect(find('.ui-alert.success'))
        .to have_content 'Sie haben sich angemeldet.'

      expect(user.reload.accepted_usage_terms_id).to eq latest_usage_terms.id
    end

    it 'is enforced on any action' do
      expect(latest_usage_terms).to be
      ensure_user_has_not_accepted_latest_terms(user)

      sign_in_as(user.login, user.password)
      expect_correct_modal_content(usage_terms_modal)

      visit my_dashboard_path
      expect_correct_modal_content(usage_terms_modal)

      visit explore_path
      expect_correct_modal_content(usage_terms_modal)
    end

  end

end

# helpers

def ensure_user_has_not_accepted_latest_terms(user)
  expect(user).to be_a User
  user.accepted_usage_terms_id = nil
  user.save!
end

def usage_terms_modal
  find(".app .modal form[action='#{accepted_usage_terms_user_path}']")
end

def expect_correct_modal_content(modal)
  expect(modal).to be

  modal_head = modal.find('.ui-modal-head')
  expect(modal_head).to have_content latest_usage_terms.title
  expect(modal_head).to have_content latest_usage_terms.version

  expect(modal.find('.ui-modal-toolbar')).to have_content latest_usage_terms.intro
  expect(modal.find('.ui-modal-toolbar')).to have_content latest_usage_terms.intro
  expect(modal.find('.ui-modal-body')).to have_content latest_usage_terms.body
end