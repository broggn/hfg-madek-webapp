class Admin::VocabulariesController < AdminController
  def index
    @vocabularies = Vocabulary.page(params[:page]).per(16).with_meta_keys_count

    if (search_term = params[:search_term]).present?
      @vocabularies = @vocabularies.filter_by(search_term)
    end
  end

  def show
    @vocabulary = Vocabulary.find(params[:id])
  end

  def edit
    @vocabulary = Vocabulary.find(params[:id])
  end

  def update
    @vocabulary = Vocabulary.find(params[:id])
    @vocabulary.update(update_vocabulary_params)

    redirect_to admin_vocabulary_path(@vocabulary)
  end

  def new
    @vocabulary = Vocabulary.new
  end

  def create
    @vocabulary = Vocabulary.new(new_vocabulary_params)
    @vocabulary.save

    redirect_to admin_vocabularies_path, flash: {
      success: 'The vocabulary has been created.'
    }
  rescue => e
    flash.now[:error] = e.to_s
    render 'new'
  end

  def destroy
    @vocabulary = Vocabulary.find(params[:id])
    @vocabulary.destroy!

    redirect_to admin_vocabularies_path, flash: {
      success: 'The vocabulary has been deleted.'
    }
  rescue => e
    redirect_to admin_vocabularies_path, flash: {
      error: e.to_s
    }
  end

  private

  def new_vocabulary_params
    params.require(:vocabulary).permit!
  end

  def update_vocabulary_params
    params.require(:vocabulary).permit(:label, :description)
  end
end