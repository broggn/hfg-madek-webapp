require 'spec_helper'
require 'spec_helper_feature'
require 'spec_helper_feature_shared'

require_relative './_shared'
include MetaDatumInputsHelper

feature 'Resource: MetaDatum' do
  background do
    @user = User.find_by(login: 'normin')
    sign_in_as @user.login
    @media_entry = FactoryGirl.create :media_entry_with_image_media_file,
                                      creator: @user, responsible_user: @user

  end

  context 'Keywords' do

    example 'autocomplete shows empty results message' do
      meta_key = create_meta_key_keywords
      in_the_edit_field(meta_key.label) do
        fill_autocomplete('xxxxxxxxxxxxxxxxxxx')
        expect(
          find(
            '.tt-dataset-KeywordsSearch div',
            text: I18n.t('app_autocomplete_no_results'))
        ).to be
      end
    end

    example 'autocomplete prefills values' do
      meta_key = create_meta_key_keywords(is_extensible_list: false)
      existing_terms = 24.times
        .map { FactoryGirl.create(:keyword, meta_key: meta_key) }

      in_the_edit_field(meta_key.label) do
        find('input')
          .click
        expect(
          find('.ui-autocomplete.tt-open').all('.tt-selectable').map(&:text)
        ).to eq existing_terms.map(&:term).sort
      end
    end

    example 'autocomplete styles existing values' do
      meta_key = create_meta_key_keywords
      100.times { FactoryGirl.create(:keyword, meta_key: meta_key) }
      meta_datum = FactoryGirl.create(
        :meta_datum_keywords, meta_key: meta_key, media_entry: @media_entry)
      existing_term = meta_datum.keywords.sample.term

      in_the_edit_field(meta_key.label) do
        fill_autocomplete(existing_term)
        expect(
          find('.ui-autocomplete-disabled', text: existing_term)
        ).to be
      end
    end

    example 'autocomplete (prefilled) styles existing values' do
      meta_key = create_meta_key_keywords(is_extensible_list: false)
      24.times.map { FactoryGirl.create(:keyword, meta_key: meta_key) }
      meta_datum = FactoryGirl.create(
        :meta_datum_keywords, meta_key: meta_key, media_entry: @media_entry)
      existing_term = meta_datum.keywords.sample.term

      in_the_edit_field(meta_key.label) do
        fill_autocomplete(existing_term)
        expect(
          find('.ui-autocomplete-disabled', text: existing_term)
        ).to be
      end
    end

  end

  private

  # create a metakey and set it as the only input field:
  def create_meta_key_keywords(attrs = {})
    meta_key = FactoryGirl.create(:meta_key_keywords, **attrs)
    context_key = FactoryGirl.create(:context_key, meta_key: meta_key, label: nil)
    configure_as_only_input(context_key)
    meta_key
  end

  def in_the_edit_field(label, &block)
    visit edit_context_meta_data_media_entry_path(@media_entry)
    within('form .ui-form-group', text: label, &block)
  end

  def fill_autocomplete(text)
    input = find('input')
    input.click
    input.set(text)
    input.click
  end

end