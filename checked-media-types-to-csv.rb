#!/usr/bin/env ruby
require 'csv'
require 'json'
require 'pry'

def to_csv(_data, list, filename)
  keys = list.first.keys
  CSV.open(filename, 'wb') do |csv|
    csv << keys
    list.each { |r| csv << keys.map { |k| r[k] } }
  end
end

data = JSON.parse(File.read('./check-media-types.json'))

to_csv(data, data['all'], './check-media-types-all.csv')
to_csv(data, data['type_mismatch_groups'].values.flatten, './check-media-types-mismatch.csv')
to_csv(
  data,
  data['type_major_mismatch_groups'].values.flatten,
  './check-media-types-major-mismatch.csv'
)
