#!/usr/bin/env bundle exec rails runner

USAGE = '$ ./bin/metadata-schema-export my-schema.json'

# exports to JSON file:
# * Vocabularies with MetaKeys
# * Keywords, People, Roles
# * Contexts with ContextKeys

output_file = ARGV[0]
fail "No output file given! usage: #{USAGE}" unless output_file.present?

res = {
  vocabularies:
    Vocabulary.all.map { |voc| voc.as_json.merge(meta_keys: voc.meta_keys.map(&:as_json)) },
  contexts:
    Context.all.map { |ctx| ctx.as_json.merge(context_keys: ctx.context_keys.map(&:as_json)) },
  rdf_classes: RdfClass.all.map(&:as_json),
  keywords: Keyword.all.map(&:as_json),
  people: Person.all.map(&:as_json),
  roles: Role.all.map(&:as_json)
}

File.write(output_file, res.to_json)
