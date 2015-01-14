# -*- encoding : utf-8 -*-

Then /^there is "(.*?)" in my imports$/ do |file_name|
  expect(find("#mei_filelist li", text: file_name)).to be
end

Then (/^There is an element with the data\-context\-id "(.*?)" in the ui\-resource\-body$/) do |name|
  expect(find(".ui-resource-body *[data-context-id='#{name}']")).to be
end

Then(/^There is not an element with the data\-context\-id "(.*?)" in the ui\-resource\-body$/) do |name|
  expect(all(".ui-resource-body *[data-context-id='#{name}']").size).to be== 0
end

Then /^There is a link to content assigned to me$/ do
  expect(find "#user_entrusted_resources_block a[href*='/my/entrusted_media_resources']").to be
end

Then /^There is a link to my favorites$/ do
  expect(find "#user_favorite_resources_block a[href*='/my/favorites']").to be
end

Then /^There is a link to my keywords$/ do
  expect(find "#user_keywords_block a[href*='/my/keywords']").to be
end

Then /^There is a link to my groups$/ do
  expect(find "#my_groups_block a[href*='/my/groups']").to be
end

Then /^There is a link to my resources$/ do
  expect(find "#latest_user_resources_block a[href*='/my/media_resources']").to be
end

Then /^There is a link to the "(.*?)" path$/ do |path|
  expect("a[href='#{path}']").to be
end

Then /^There is a link with the id "(.*?)"$/ do |id|
  expect(find "a##{id}" ).to be
end

Then /^There is a link with class "(.*?)" in the list with class "(.*?)"$/ do |link_class, list_class|
  expect{ find("ul.#{list_class} a.#{link_class}") }.not_to raise_error
end

Then (/^There is a movie with previews and public viewing\-permission$/) do
  System.execute_cmd! "tar xf #{Rails.root.join "features/data/media_files_with_movie.tar.gz"} -C #{Rails.root.join  "db/media_files/", Rails.env}"
  @movie = MediaFile.find_by(guid: "66b1ef50186645438c047179f54ec6e6").media_entry
end

Then /^There is no link with class "(.*?)" in the list with class "(.*?)"$/ do |link_class, list_class|
  expect{ find("ul.#{list_class} a.#{link_class}") }.to raise_error
end

Then /^there is a new set "(.*?)" that includes those new media\-entries$/ do |title|
  @new_media_entries = MediaEntry.all - @previous_media_entries
  expect(@new_set = MediaSet.find_by_title(title)).to be
  expect((@new_set.child_media_resources and @new_media_entries).to_a).to eq @new_media_entries
end

Then /^there is a entry with the title "(.*?)" in the new media_entries$/ do |title|
  @new_media_entries = MediaEntry.all - @previous_media_entries
  expect(@new_media_entries.map(&:title)).to include title
end

Then /^There is a table with following meta key definitions:$/ do |table|
  table.hashes.each_with_index do |row, index|
    expect(all("table tbody tr")[index]).to have_content(row[:meta_key])
  end
end

Then /^There is exactly one media\-entry with a filename matching "(.*?)"$/ do |name|
  expect(MediaEntry.all.select{|me| me.media_file.filename =~ /#{name}/}.size).to eq 1
end

Then /^There is no incomplete media\-entry with a filename matching "(.*?)"$/ do |fn_match|
  MediaEntryIncomplete.all.select{|me| me.media_file.filename =~ /berlin/}.each(&:destroy)
end

Then /^There is no media\-entry with a filename matching "(.*?)"$/ do |fn_match|
  MediaEntry.all.select{|me| me.media_file.filename =~ /berlin/}.each(&:destroy)
end

Then /^There is no media\-entry incomplete with a filename matching "(.*?)"$/ do |name|
  expect(MediaEntryIncomplete.all.select{|me| me.media_file.filename =~ /#{name}/}.size).to eq 0
end

Then /^There is "(.*?)" sorting option selected$/ do |option_text|
  within "select[name='sort_by']" do
    expect(find("option", text: option_text)[:selected]).to eq("selected")
  end
end

Then /^There is "(.*?)" filtering option selected$/ do |option_text|
  within "select[name='filter_by']" do
    expect(find("option", text: option_text)[:selected]).to eq("selected")
  end
end

Then /^There is no filtering option selected$/ do
  all("select[name='filter_by'] option").each do |option|
    expect(option[:selected]).to be_false
  end
end

Then /^There is no option selected in "(.*?)" select$/ do |name|
  all("select[name='#{name}'] option").each do |option|
    expect(option[:selected]).to be_false
  end
end

Then /^There is one less delete link$/ do
  expect(all('table tr a', text: "Delete").size).to be== @delete_links_count - 1
end

Then /^There is "(.*?)" group type option selected$/ do |option|
  within "select[name='type']" do
    expect(find("option[value='#{option}']")[:selected]).to eq("selected")
  end
end

Then /^There is "(.*?)" option selected in "(.*?)" select$/ do |option, name|
  within "select[name='#{name}']" do
    expect(find("option", text: option)[:selected]).to eq("selected")
  end
end

Then /^There is "(.*?)" at the top of the list$/ do |last_name|
  row = all("table tbody tr").first
  expect(row).to have_content(last_name)
end

Then /^There is only one "(.*?)" meta term on the list$/ do |term|
  expect(all("ul.meta-terms input[value='#{term}']").size).to eq 1
end

Then /^There is the input with name "(.*?)" set to "(.*?)"$/ do |name, value|
  expect(find("input[name='#{name}']").value).to eq(value)
end