# bundle exec rails runner check-media-types.rb > check-media-types.json

BASE_URL = URI.parse('https://medienarchiv.zhdk.ch/')

def major_type(s)
  s.try(:split, '/').try(:first)
end

def file_url(mf)
  return unless mf && mf.id
  BASE_URL.merge("/admin/media_files/#{mf.id}")
end

def entry_url(mf)
  return unless mf && mf.media_entry_id
  BASE_URL.merge("/entries/#{mf.media_entry_id}")
end

count = MediaFile.count
STDERR.puts("MediaFiles: #{count}")

res = []
MediaFile.all.reorder('created_at ASC').each.with_index do |mf, n|
  STDERR.puts("MediaFile: #{n + 1}/#{count}") if (n % 100) === 0

  ct = mf.content_type
  mt =
    begin
      mf.meta_data['File:MIMEType']
    rescue => e
      nil
    end

  res.push(
    file_name: mf.filename,
    file_upload_date: mf.created_at.as_json,
    db_content_type: ct,
    exiftool_mime_type: mt,
    type_mismatch: (!!mt && ct != mt),
    type_major_mismatch: !!mt && major_type(ct) != major_type(mt),
    media_file: file_url(mf),
    media_entry: entry_url(mf),
    file_store_path: [mf.guid.first, mf.guid].join('/')
  )
end

puts(
  JSON.pretty_generate(
    all: res,
    nulls: res.select { |r| !r[:exiftool_mime_type] },
    type_mismatch_groups:
  res.select { |r| r[:type_mismatch] }.group_by do |r|
    "#{r[:db_content_type]}:#{r[:exiftool_mime_type]}"
  end,
    type_major_mismatch_groups:
  res.select { |r| r[:type_major_mismatch] }.group_by do |r|
    "#{r[:db_content_type]}:#{r[:exiftool_mime_type]}"
  end
  )
)
