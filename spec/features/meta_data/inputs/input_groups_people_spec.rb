require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

require_relative './_shared'
include MetaDatumInputsHelper

feature 'Resource: MetaDatum' do
  background do
    @user = User.find_by(login: 'normin')
    @media_entry = FactoryBot.create :media_entry_with_image_media_file,
                                      creator: @user, responsible_user: @user

  end

  context 'MetaDatumPeople' do
    background do
      @vocabulary = FactoryBot.create(:vocabulary)
      @meta_key = FactoryBot.create(:meta_key_people)
      @context_key = FactoryBot.create(:context_key, meta_key: @meta_key)
      configure_as_only_input(@context_key)
    end

    context 'With existing data' do
      background do
        FactoryBot.create(
          :meta_datum_people,
          meta_key: @meta_key,
          media_entry: @media_entry)
      end

      example 'add new Person' do
        edit_in_meta_data_form_and_save(@context_key) do
          add_new_person_to_field 'Street', 'Artist', 'Banksy'
        end

        expect_meta_datum_on_detail_view('Street Artist (Banksy)', key: @context_key)
      end

      example 'add new PeopleGroup' do
        edit_in_meta_data_form_and_save(@context_key) do
          add_new_peoplegroup_to_field 'Saalschutz'
        end

        expect_meta_datum_on_detail_view('Saalschutz', key: @context_key)
      end

      example 'add new Person and PeopleGroup' do
        edit_in_meta_data_form_and_save(@context_key) do
          add_new_person_to_field 'Street', 'Artist', 'Banksy'
          add_new_peoplegroup_to_field 'Saalschutz'
        end

        expect_meta_datum_on_detail_view('Street Artist (Banksy)', key: @context_key)
        expect_meta_datum_on_detail_view('Saalschutz', key: @context_key)
      end

      example 'add PeopleInstitutionalGroup' do
        @group_person = FactoryBot.create(:people_instgroup)
        group_label = @group_person.last_name

        @meta_key = FactoryBot.create(:meta_key_people_instgroup)
        @context_key = FactoryBot.create(:context_key, meta_key: @meta_key)
        configure_as_only_input(@context_key)

        FactoryBot.create(
          :meta_datum_people,
          meta_key: @meta_key, media_entry: @media_entry)

        edit_in_meta_data_form_and_save(@context_key) do
          autocomplete_and_choose_first(page, group_label)
          group_tag = find('.multi-select-tag', text: group_label)
          expect(group_tag.text).to eq(group_label)
        end

        expect_meta_datum_on_detail_view(group_label, key: @context_key)
      end
    end

    example 'People sort order' do
      edit_in_meta_data_form_and_save(@context_key) do
        add_new_person_to_field 'Otto', 'Omega', nil
        add_new_person_to_field 'Anna', 'Alpha', nil
      end
      expect(all('.ui-tag-cloud-item').map(&:text)).to eq ['Otto Omega', 'Anna Alpha']
    end
  end
end

private

def add_new_person_to_field(first_name, last_name, pseudonym)
  find('.form-widget-toggle').click
  person_form = find(
    "#media_entry_meta_data_#{@meta_key.id}_new_person-pane-Person"
      .tr(':', '_'))
  within(person_form) do
    fill_in 'first_name', with: first_name
    fill_in 'last_name', with: last_name
    fill_in 'pseudonym', with: pseudonym
    click_on I18n.t(:meta_data_input_new_person_add)
  end

  within('.multi-select-holder') do
    expect(find('.multi-select-tag', text: "#{first_name} #{last_name}#{" (#{pseudonym})" if pseudonym}")).to be
  end
end

def add_new_peoplegroup_to_field(name)
  find('.form-widget-toggle').click
  base_id = "#media_entry_meta_data_#{@meta_key.id}".tr(':', '_')
  peoplegroup_toggle = find("#{base_id}_new_person-tab-PeopleGroup")
  peoplegroup_toggle.click
  peoplegroup_form = find("#{base_id}_new_person-pane-PeopleGroup")
  within(peoplegroup_form) do
    fill_in 'first_name', with: name
    click_on I18n.t(:meta_data_input_new_group_add)
  end

  within('.multi-select-holder') do
    expect(find('.multi-select-tag', text: name)).to be
  end
end
