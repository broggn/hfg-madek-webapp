require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

feature 'Collection - Managing Temporary URLs' do
  background do
    @user = User.find_by(login: 'normin')
    @collection = create :collection,
                         creator: @user, responsible_user: @user
  end

  scenario 'Listing Temporary URLs' do
    temporary_urls = 3.times.map do
      create(:temporary_url, user: @user, resource: @collection)
    end

    sign_in_as @user.login
    visit collection_path(@collection)

    within find '.ui-body-title-actions .ui-dropdown' do
      find('a', text: I18n.t(:resource_action_more_actions)).click
      find('a', text: I18n.t(:resource_action_collection_manage_temporary_urls))
        .click
    end

    data_table = temporary_urls.map do |tu|
      [
        tu.token,
        tu.description,
        I18n.t(:temporary_urls_list_no_expiry),
        'Show URL',
        'icon: fa fa-ban'
      ]
    end.reverse

    expect(displayed_ui).to eq(data_table)
  end

  scenario 'Adding a new Temporary URL valid forever' do
    description = Faker::Hipster.sentence

    sign_in_as @user.login
    visit collection_path(@collection)

    within find '.ui-body-title-actions .ui-dropdown' do
      find('a', text: I18n.t(:resource_action_more_actions)).click
      find('a', text: I18n.t(:resource_action_collection_manage_temporary_urls))
        .click
    end

    click_link I18n.t(:temporary_urls_list_new_button)

    fill_in 'temporary_url[description]', with: description
    expect { submit_form }.to change { TemporaryUrl.count }.by 1

    check_secret_url
    expect(displayed_details).to include(description)
    expect(displayed_details).to include(I18n.t(:temporary_urls_list_no_expiry))
  end

  scenario 'Adding a new Temporary URL valid for 30 days without description' do
    sign_in_as @user.login
    visit collection_path(@collection)

    within find '.ui-body-title-actions .ui-dropdown' do
      find('a', text: I18n.t(:resource_action_more_actions)).click
      find('a', text: I18n.t(:resource_action_collection_manage_temporary_urls))
        .click
    end

    click_link I18n.t(:temporary_urls_list_new_button)

    check I18n.t(:temporary_urls_create_set_expiration_date)
    expect { submit_form }.to change { TemporaryUrl.count }.by 1

    check_secret_url
    expect(displayed_details).to include(
      I18n.t(:temporary_urls_list_no_description))
    expect(displayed_details).to include('in einem Monat')
  end

  scenario 'Canceling adding process' do
    sign_in_as @user.login
    visit temporary_urls_collection_path(@collection)

    click_link I18n.t(:temporary_urls_list_new_button)
    click_link I18n.t(:temporary_urls_create_cancel)

    expect(current_path).to eq temporary_urls_collection_path(@collection)
  end

  scenario 'Revoking' do
    temporary_url = create :temporary_url, user: @user, resource: @collection

    sign_in_as @user.login
    visit temporary_urls_collection_path(@collection)

    row = find('.ui-resources-holder table tr', text: temporary_url.token)

    accept_confirm do
      within(row) { submit_form }
    end

    expect(current_path).to eq temporary_urls_collection_path(@collection)
    temporary_url.reload
    expect(temporary_url.revoked).to be true

    expect(displayed_ui(revoked: true)).to eq [
      [
        temporary_url.token,
        temporary_url.description,
        I18n.t(:temporary_urls_list_no_expiry),
        'Show URL',
        ''
      ]
    ]
  end

end

private

def displayed_ui(revoked: false)
  table_index = revoked ? 1 : 0
  table = all('.ui-resources-holder table')[table_index]
  table.all('tbody tr').map do |tr|
    fields = tr.all('td')
    btn_icon = revoked ? '' : "icon: #{fields.last.find('button i')[:class]}"
    # NOTE: ignore the created timestamp, we cant know the UI text!
    [
      fields[0].text, fields[1].text, fields[3].text,
      fields[4].text, btn_icon
    ]
  end
end

def displayed_details
  within('[data-react-class="UI.Views.Shared.TemporaryUrlShow"]') do
    all('table tbody tr').last.all('td').map(&:text).reject(&:blank?)
  end
end

def check_secret_url
  within('[data-react-class="UI.Views.Shared.TemporaryUrlShow"]') do
    secret_url = find('samp.code').text
    token = secret_url.split('/').last

    expect(secret_url.split('/').last.length).to be_between(31, 32)
    expect(secret_url).to end_with(
      show_by_temporary_url_collections_path(token))
    expect(secret_url).to start_with 'http://'
  end
end
