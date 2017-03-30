require 'spec_helper'

describe BatchController do
  context 'Action: Batch Resource Destroy (Entries and Collections)' do

    before :example do
      @alice = FactoryGirl.create :user
      @bob = FactoryGirl.create :user
      @chuck = FactoryGirl.create :user
      @alice_contents = [
        100.times.map do
          entry = create(:media_entry, creator: @alice, responsible_user: @alice)
          up = entry.user_permissions.find_or_create_by!(user: @bob)
          up.update_attributes!(
            get_metadata_and_previews: true,
            get_full_size: true,
            edit_metadata: true,
            edit_permissions: true
          )
          entry
        end,
        100.times.map do
          col = create(:collection, creator: @alice, responsible_user: @alice)
          up = col.user_permissions.find_or_create_by!(user: @bob)
          up.update_attributes!(
            get_metadata_and_previews: true,
            edit_metadata_and_relations: true,
            edit_permissions: true
          )
          col
        end
      ]
    end

    it 'deletes when allowed' do
      expect { batch_delete_alice_contents_as(@alice) }
      .to change { MediaEntry.count }
      .by(-100)

      expect(response.status).to be == 200
    end

    pending 'does not delete when not allowed (but shared)' do
      expect { batch_delete_alice_contents_as(@bob) }
      .to change { MediaEntry.count }
      .by(0)
      .and \
        raise_error Errors::ForbiddenError, 'Not allowed to destroy all resources!'
    end

    pending 'does not delete when not allowed' do
      expect { batch_delete_alice_contents_as(@chuck) }
      .to change { MediaEntry.count }
      .by(0)
      .and \
        raise_error Errors::ForbiddenError, 'Not allowed to destroy all resources!'
    end

  end

  private

  def batch_delete_alice_contents_as(user)
    update_data = \
      {
        resource_id: @alice_contents.flatten.map do |r|
          { uuid: r.id, type: r.class.to_s }
        end
      }

    put :batch_destroy_resources,
        update_data.merge(format: :json, return_to: '/my'),
        user_id: user.id
  end

end
