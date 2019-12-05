#!/usr/bin/env RAILS_LOG_LEVEL=error bundle exec rails runner

USAGE = '$ ./bin/metadata-schema-import my-schema.json'

# imports everthing from a JSON file that is exported by `bin/metadata-schema-import` script.

input_filename = ARGV[0]
fail "No input file given! usage: #{USAGE}" unless input_filename.present?
input_file = File.read(input_filename)
fail 'Input is empty!' unless input_file.present?
input_data = JSON.parse(input_file)
fail 'Input JSON is empty!' unless input_data.present?
data = input_data.deep_symbolize_keys

def do_import(data)
  ActiveRecord::Base.transaction do
    begin
      import_user = get_or_make_import_user

      data[:vocabularies].map do |voc|
        next if voc[:id] == 'madek_core' # immutable and always present, dont try to import

        create_or_update(Vocabulary, voc.without(:meta_keys))
        voc[:meta_keys].map { |mk| create_or_update(MetaKey, mk.merge(vocabulary_id: voc[:id])) }
      end

      data[:contexts].map do |ctx|
        create_or_update(Context, ctx.without(:context_keys))
        ctx[:context_keys].map { |ck| create_or_update(ContextKey, ck.merge(context_id: ctx[:id])) }
      end

      data[:rdf_classes].map { |attrs| create_or_update(RdfClass, attrs) }

      data[:keywords].map do |attrs|
        attrs.merge!(creator_id: import_user.id) unless Person.find_by(id: attrs[:creator_id])
        create_or_update(Keyword, attrs)
      end

      data[:people].map do |attrs|
        attrs.merge!(creator_id: import_user.id) unless Person.find_by(id: attrs[:creator_id])
        create_or_update(Person, attrs)
      end

      data[:roles].map do |attrs|
        attrs.merge!(creator_id: import_user.id) unless Person.find_by(id: attrs[:creator_id])
        create_or_update(Role, attrs)
      end
    rescue => e
      # binding.pry
      raise e
      # exit 1
      # raise ActiveRecord.Rollback 'Something went wrong!'
    end
  end
end

private

def create_or_update(kls, attr)
  obj = kls.find_or_initialize_by(id: attr[:id])
  obj.update_attributes!(attr)
  obj
end

# User account to be used as a "creator" for things that have this relation
# (because Users are not imported, we have to make sure foreign key constraints are adhered to).
def get_or_make_import_user
  p = create_or_update(Person, last_name: 'Madek Sys Import', subtype: 'Person')
  create_or_update(User, login: 'sys_import_user', email: 'import@madek.ch', person: p)
end

# do it
do_import(data)
