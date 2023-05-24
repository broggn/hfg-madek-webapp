module Presenters
  module Explore
    module Modules
      module NewestEntryWithImage

        private

        def newest_media_entry_with_image_file_for_keyword_and_user(
          keyword_id, user)

          base =
            auth_policy_scope(user, MediaEntry)
            .joins(:media_file)
            .joins('INNER JOIN previews ON previews.media_file_id = media_files.id')
            .joins(:meta_data)
            .joins('INNER JOIN meta_data_keywords ' \
                   'ON meta_data.id = meta_data_keywords.meta_datum_id')
            .where(meta_data: { type: 'MetaDatum::Keywords' })
            .where(meta_data_keywords: { keyword_id: keyword_id })
            .where(previews: { media_type: 'image' })
            .reorder(nil)

          MediaEntry
          .where("media_entries.id in (#{base.select('id').to_sql})")
          .reorder('media_entries.created_at DESC')
          .limit(24)
        end

        def newest_media_entry_with_image_file_for_person_and_user(
          person_id, user)

          base =
            auth_policy_scope(user, MediaEntry)
            .joins(:media_file)
            .joins('INNER JOIN previews ON previews.media_file_id = media_files.id')
            .joins(:meta_data)
            .joins('INNER JOIN meta_data_people ' \
                   'ON meta_data.id = meta_data_people.meta_datum_id')
            .where(meta_data_people: { person_id: person_id })
            .where(previews: { media_type: 'image' })
            .reorder(nil)

          MediaEntry
            .where("media_entries.id in (#{base.select('id').to_sql})")
            .reorder('media_entries.created_at DESC')
            .limit(24)
        end

        def catalog_key_thumb_keyword(meta_key, user, limit)
          Keyword
            .for_meta_key_and_used_in_visible_entries_with_previews(meta_key, user, limit)
            .sample
        end

        def catalog_key_thumb_person(meta_key, user, limit)
          Person
            .for_meta_key_and_used_in_visible_entries_with_previews(meta_key, user, limit)
            .sample
        end

        def catalog_key_thumb_entry(context_key, user, limit)
          meta_key = context_key.meta_key

          case meta_key.meta_datum_object_type
          when 'MetaDatum::Keywords'
            keyword = catalog_key_thumb_keyword(meta_key, user, limit)
            newest_media_entry_with_image_file_for_keyword_and_user(keyword.id, user).sample
          when 'MetaDatum::People'
            person = catalog_key_thumb_person(meta_key, user, limit)
            newest_media_entry_with_image_file_for_person_and_user(person.id, user).sample
          end
        end
      end
    end
  end
end
