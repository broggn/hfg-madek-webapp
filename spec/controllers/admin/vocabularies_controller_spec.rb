require 'spec_helper'

describe Admin::VocabulariesController do
  let(:admin_user) { create :admin_user }

  describe '#index' do
    before { get :index, nil, user_id: admin_user.id }

    it 'responds with HTTP 200 status code' do
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

    it 'assigns @vocabularies correctly' do
      expect(assigns[:vocabularies]).to match_array(Vocabulary.all)
    end

    describe 'filtering' do
      context 'by id' do
        it 'returns a proper vocabulary' do
          vocabulary = create :vocabulary, id: 'sample_id'

          get :index, { search_term: 'sample_id' }, user_id: admin_user.id

          expect(assigns[:vocabularies]).to eq [vocabulary]
        end
      end

      context 'by label' do
        it "returns vocabularies containing 'aaa' in labels" do
          first_vocabulary = create :vocabulary, label: 'saaample label'
          second_vocabulary = create :vocabulary, label: 'sample laaabel'

          get :index, { search_term: 'aaa' }, user_id: admin_user.id

          expect(assigns[:vocabularies]).to \
            match_array([first_vocabulary, second_vocabulary])
        end
      end
    end
  end

  describe '#show' do
    let(:vocabulary) { create :vocabulary }
    before { get :show, { id: vocabulary.id }, user_id: admin_user.id }

    it 'responds with HTTP 200 status code' do
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

    it 'assigns @vocabulary correctly' do
      expect(assigns[:vocabulary]).to eq vocabulary
    end
  end

  describe '#edit' do
    let(:vocabulary) { create :vocabulary }
    before { get :edit, { id: vocabulary.id }, user_id: admin_user.id }

    it 'assigns @vocabulary correctly' do
      expect(assigns[:vocabulary]).to eq vocabulary
      expect(response).to render_template :edit
    end
  end

  describe '#update' do
    let(:vocabulary) { create :vocabulary }

    it "updates the vocabulary's label and description" do
      params = {
        id: vocabulary.id,
        vocabulary: {
          label: 'updated label',
          description: 'updated description'
        }
      }

      put :update, params, user_id: admin_user.id

      expect(vocabulary.reload.label).to eq 'updated label'
      expect(vocabulary.reload.description).to eq 'updated description'
    end

    it 'does not update the id' do
      remember_id = vocabulary.id

      put(
        :update,
        {
          id: vocabulary.id,
          vocabulary: { id: Faker::Internet.slug }
        },
        user_id: admin_user.id
      )

      expect(vocabulary.reload.id).to eq remember_id
    end
  end

  describe '#new' do
    before { get :new, nil, user_id: admin_user.id }

    it 'assigns @vocabulary correctly' do
      expect(assigns[:vocabulary]).to be_an_instance_of(Vocabulary)
      expect(assigns[:vocabulary]).to be_new_record
    end

    it 'renders new template' do
      expect(response).to render_template :new
    end
  end

  describe '#create' do
    let(:vocabulary_params) { attributes_for :vocabulary }

    it 'creates a new vocabulary' do
      expect do
        post :create, { vocabulary: vocabulary_params }, user_id: admin_user.id
      end.to change { Vocabulary.count }.by(1)
    end

    it 'redirects to admin vocabularies path' do
      post :create, { vocabulary: vocabulary_params }, user_id: admin_user.id

      expect(response).to have_http_status(302)
      expect(response).to redirect_to(admin_vocabularies_path)
      expect(flash[:success]).not_to be_empty
    end

    context 'when vocabulary with ID exists' do
      let!(:vocabulary) { create :vocabulary, id: vocabulary_params[:id] }

      it 'renders new template with error message' do
        post :create, { vocabulary: vocabulary_params }, user_id: admin_user.id

        expect(response).to render_template :new
        vocabulary_params.each_pair do |key, value|
          expect(assigns[:vocabulary].send(key)).to eq value
        end
        expect(flash[:error]).to be_present
      end
    end
  end

  describe '#destroy' do
    let!(:vocabulary) { create :vocabulary }

    it 'destroys the vocabulary' do
      expect { delete :destroy, { id: vocabulary.id }, user_id: admin_user.id }
        .to change { Vocabulary.count }.by(-1)
    end

    context 'when delete was successful' do
      before { delete :destroy, { id: vocabulary.id }, user_id: admin_user.id }

      it 'redirects to admin vocabularies path' do
        expect(response).to have_http_status(302)
        expect(response).to redirect_to(admin_vocabularies_path)
      end

      it 'displays success message' do
        expect(flash[:success]).to be_present
      end
    end

    context "when delete wasn't successful" do
      before do
        allow_any_instance_of(Vocabulary).to receive(:destroy!).and_raise('error')
        delete :destroy, { id: vocabulary.id }, user_id: admin_user.id
      end

      it 'redirects to admin vocabularies path' do
        expect(response).to have_http_status(302)
        expect(response).to redirect_to(admin_vocabularies_path)
      end

      it 'displays error message' do
        expect(flash[:success]).not_to be_present
        expect(flash[:error]).to eq 'error'
      end
    end
  end
end