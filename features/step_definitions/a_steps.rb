# -*- encoding : utf-8 -*-

When /^A keyword has some resources associated to it$/ do
  @keyword_with_resources = KeywordTerm.with_count.order("keywords_count DESC").first
  expect{ @keyword_transfer_link = find("tr#keyword-term-#{@keyword_with_resources.id} a.transfer-resources") }.not_to raise_error
end

Then /^A new ZencoderJob has been added$/ do
  expect( all("table.zencoder-jobs tbody tr").size ).to eq (@zencoder_jobs_number + 1)
end

Then /^a person has some MetaData associated to it$/ do
  @person_with_meta_data = Person.reorder(:created_at,:id).joins(:meta_data).first
  expect{ @meta_data_transfer_link = find("tr#person_#{@person_with_meta_data.id} a.transfer_meta_data_link")}.not_to raise_error
end

Then /^a meta term has some resources associated to it$/ do
  @meta_term_with_resources = MetaTerm.reorder(:term,:id).joins(:meta_data).joins(:meta_keys).first
  expect{ @resources_transfer_link = find("tr#meta_term_#{@meta_term_with_resources.id} a.transfer-resources-link")}.not_to raise_error
end

Then /^a person does not have any MetaData neither User associated to it$/ do
  @person = @person_without_meta_data = Person.reorder(:created_at,:id)  \
    .where(%[ NOT EXISTS (SELECT true FROM users WHERE users.person_id = people.id)]).first
  ActiveRecord::Base.connection.execute "delete from meta_data_people where person_id = '#{@person_without_meta_data.id}'"
  visit(current_path)
  expect{  find("tr#person_#{@person_without_meta_data.id} .meta_data_count") }.to raise_error
end

Given /^A media_entry with file, not owned by normin, and with no permissions whatsoever$/ do
  @petra = User.find_by_login("petra")
  @resource = FactoryGirl.create :media_entry_with_image_media_file, user: @petra
  @resource.update_attributes download: false, edit: false, manage: false, view: false
  @resource.userpermissions.clear
  @resource.grouppermissions.clear
end

Given /^A resource owned by me$/ do
  @resource = @me.media_resources.first
end

Given(/^A resource owned by me with view permission explicitly set for me$/) do
  @resource = @me.media_resources.first
  (Userpermission.where(user_id: @me.id, media_resource_id: @resource.id).first or 
   Userpermission.create(user_id: @me.id, media_resource_id: @resource.id)).update_attributes!(view: true)
end

Given /^A resource, not owned by normin, and with no permissions whatsoever$/ do
  @resource = User.find_by_login("petra").media_entries.first
  @resource.update_attributes download: false, edit: false, manage: false, view: false
  @resource.userpermissions.clear
  @resource.grouppermissions.clear
end

Given /^A resource owned by me and defined userpermissions for "(.*?)"$/ do |login|
  @user_with_userpermissions = User.find_by_login login
  @resource = MediaResource.where(user_id: @me.id).joins(:userpermissions)\
    .where("userpermissions.user_id = ?", @user_with_userpermissions.id).first
end

Given /^A resource owned by me with no other permissions$/ do
  @resource = @me.media_resources.first
  @resource.userpermissions.clear
  @resource.grouppermissions.clear
  @resource.update_attributes view: false, edit: false, manage: false, download: false
end

Given(/^A resource(\d+) owned by me with no other permissions$/) do |ns|
  n = ns.to_i
  @resources ||= []
  @resources[n] = @me.media_resources[n]
  @resources[n].userpermissions.clear
  @resources[n].grouppermissions.clear
  @resources[n].update_attributes view: false, edit: false, manage: false, download: false
end

Given /^A set, not owned by normin, and with no permissions whatsoever$/ do
  @set = User.find_by_login("petra").media_sets.first
  @set.update_attributes download: false, edit: false, manage: false, view: false
  @set.userpermissions.clear
  @set.grouppermissions.clear
end


Then /^All resources that I can see have public view permission$/ do
  ids = all("li.ui-resource").map{|el| el['data-id']}
  view_permissions = MediaResource.where(id: ids).map(&:view)
  expect(view_permissions.size).to be > 0
  expect(view_permissions.all?{|p| p == true} ).to  be_true
end

Then /^all media entries contained in set A (doesnt have that context anymore|have all contexts of set A)$/ do |they_have_it|
  they_have_it = if they_have_it == "have all contexts of set A" then true else false end
  @media_set_a.child_media_resources.media_entries.accessible_by_user(@current_user,:view).each do |media_entry|
    visit contexts_media_entry_path media_entry
    @media_set_a.individual_contexts.each do |context|
      if they_have_it
        page.should have_content context.label
      else
        page.should_not have_content context.label
      end
    end
  end
end

Then /^all media entries contained in that set do not have the disconnected contexts any more$/ do
  @media_set.child_media_resources.media_entries.each do |media_entry|
    @individual_contexts.each do |context|
      expect(media_entry.individual_contexts.include? context).to be_false
    end
  end
end

Then /^all other media entries have the same meta data values$/ do
  reference_media_entry = MediaEntryIncomplete.find find(".ui-resource[data-id]")["data-id"]
  @reference_meta_data = reference_media_entry.meta_data.where(:meta_key_id => MetaKey.where(id: @meta_data.map{|x| x["meta_key"]}))
  @current_user.media_resources.where(:type => "MediaEntryIncomplete").each do |media_entry|
    find(".ui-resource[data-id='#{media_entry.id}']").click
    step 'each meta-data value should be equal to the one set previously'
    meta_data = media_entry.meta_data.where(:meta_key_id => MetaKey.where(id: @meta_data.map{|x| x["meta_key"]}))
    expect(meta_data.map(&:to_s).sort).to be == @reference_meta_data.map(&:to_s).sort
  end
end

Then /^all other media entries have the same meta data values in those fields that were empty before$/ do
  reference_media_entry = MediaEntryIncomplete.find find(".ui-resource[data-id]")["data-id"]
  @current_user.media_resources.where(:type => "MediaEntryIncomplete").each do |media_entry|
    find(".ui-resource[data-id='#{media_entry.id}']").click
    @meta_data_before_apply[media_entry.id].each do |meta_datum|
      resource_value = MediaResource.find(meta_datum[:media_resource_id]).meta_data.get(meta_datum[:meta_key_id]).to_s
      refererence_value = reference_media_entry.meta_data.get(meta_datum[:meta_key_id]).to_s
      Rails.logger.info ["meta_datum:",meta_datum, "resource_value:", resource_value, "refererence_value", refererence_value]
      if meta_datum[:value].blank?
        expect(resource_value).to eq refererence_value 
      elsif media_entry.id != reference_media_entry.id
        expect(resource_value).not_to eq refererence_value 
      end
    end
  end
end

Then /^All previews are deleted for the media_entry/ do
  @media_entry.media_file.previews.destroy_all
end

