# -*- encoding : utf-8 -*-

Then /^The "(.*?)" has the same count as the "(.*?)"$/ do |id1, id2|
  expect( find("##{id1}").text.to_i ).to be == find("##{id2}").text.to_i 
end

Then /^the "(.*?)" permission for "(.*?)" is checked$/ do |permission, user|
  expect(find("tr[data-name='#{user}'] input[name='#{permission}']")).to be_checked
end

Then /^The actual_file does exist$/  do
  expect(File.exists? @file).to be true
end

Then /^The actual_file doesn't exist anymore$/  do
  expect(File.exists? @file).to be false
end

### the c

Then /^The current_path matches "(.*?)"$/  do |regexp|
  expect(current_path).to match(Regexp.new(regexp))
end

Then /^The current_path is equal to the remembered one$/  do
  expect(current_path).to be== @the_path
end
 
Then /^The current user doesn't have a dropbox$/  do
  if _dir = @current_user.dropbox_dir
    `rm -rf #{_dir}`
  end
end

Then /^the current user has a dropbox$/ do
  step 'The dropbox settings are set-up'
  `rm -rf #{@current_user.dropbox_dir_path}`
  FileUtils.mkdir_p @current_user.dropbox_dir_path
end

### the d

Then /^The dropbox settings are set\-up$/  do
  expect(Settings.dropbox.root_dir).to be== Rails.root.join("tmp").to_s
  expect(Settings.dropbox.user).to be== ENV['USER']
end

Then /^the dropbox was created for me$/ do
  expect( @current_user.dropbox_dir_name.blank? ).to be_false
end


### the e ###########################################

Then (/^The element with the id "(.*?)" has the class "(.*?)"$/) do |id, _class|
  expect(find("##{id}.#{_class}")).to be
end

### the f ###########################################
 
Then /^The filter panel contains a search input$/ do
  wait_until{ all(".filter-panel .filter-search").size > 0}
end

Then /^The filter panel contains a top\-filter\-list$/ do
  wait_until{ all(".filter-panel ul.top-filter-list").size > 0}
end

Then /^The filter panel contains the top filter "(.*?)"$/ do |text|
  wait_until{ all(".filter-panel ul.top-filter-list", text: text).size > 0}
end


### the g
 
Then /^the group is created$/ do
  step 'I wait for the dialog to disappear'
  expect{ @current_user.groups.find_by_name("@name") }.to be
end

Then /^the group is deleted$/ do
  expect{ Group.find @group.id }.to raise_error
end

Then /^the group is not deleted$/ do
  expect{ Group.find @group.id }.not_to raise_error
end

Then /^the group name is changed$/ do
  step 'I wait for the dialog to disappear'
  expect(@group.reload.name).to eq @name
end

Then /^the group name is not changed$/ do
  expect(@group.reload.name).not_to eq @name
end

Then /^the group members are updated$/ do
  step 'I wait for the dialog to disappear'
  expect{@group.users.find(@added_user.id)}.to be
  expect{@group.users.find(@removed_user.id)}.to raise_error
end

### the h

Then /^The hidden field with name "(.*?)" should match "(.*?)"$/ do |field_name, regexp|
  input = find("input[name='#{field_name}']")
  if regexp.present?
    expect(input.value).to match(Regexp.new(regexp))
  else
    expect(input.value).to eq("")
  end
end

### the i

Then /^The input with the id "(.*?)" has the value "(.*?)"$/ do |id, value|
  expect(find("input##{id}").value).to be== value
end

Then /^The input with name "(.*?)" is empty$/ do |name|
  expect(find("input[name='#{name}']").value).to be_nil
end

### the l ##############################################
 
Then /^the label option "(.*?)" is selected$/ do |option|
  expect(find("form select.show_labels option[value='#{option}']").selected?).to be_true
end

Then (/^The link with the title "(.*?)" has the class "(.*?)"$/) do |title, _class|
  expect(find("a[title='#{title}'].#{_class}")).to be
end

Then /^The list contains links to media sets$/ do
  all("table tbody tr").each do |row|
    expect{row.find('a')}.to_not raise_error
    expect(row.find('a')[:href]).to match(/^\/sets\/.+$/)
  end
end

Then /^the list shows only resources that have any value for that key$/ do
  all(".ui-resource[data-id]").each do |element|
    media_resource = MediaResource.find element["data-id"]
    media_resource.meta_data.where(:meta_key_id => @meta_key.id).size.should > 0
  end
end

### the m ###########################################

Then (/^The media_resource does exist$/) do
  expect(MediaEntry.where(id: @media_entry.id).count).to be > 0
end

Then (/^The media_file does exist$/) do
  expect(MediaFile.where(id: @media_file.id).count).to be > 0 
end

Then (/^The media_entry doesn't exist anymore$/) do
  wait_until{MediaEntry.where(id: @media_entry.id).count == 0}
end

Then (/^The media_file doesn't exist anymore$/) do
  expect(MediaFile.where(id: @media_file.id).count).to be == 0
end

Then /^The media_resource with the previous_id "(.*?)" exists$/  do |id|
  expect(MediaResource.find_by previous_id: id).to be 
end

Then /^The media_resource with the previous_id "(.*?)" doesn't exist$/  do |id|
  expect(MediaResource.find_by previous_id: id).not_to be
end

Then /^The media_resource with the previous_id "(.*?)" has the same owner$/  do |id|
  expect((MediaResource.find_by previous_id: id).reload.user.name).to be== @user.name
end

Then /^The media_resource with the previous_id "(.*?)" has owner "(.*?)"$/  do |id, user_name|
  expect((MediaResource.find_by previous_id: id).reload.user.name).to be== user_name
end

Then /^The meta term is at the top of the list$/ do
  meta_terms = all("#sortable li[data-term]")
  expect(meta_terms.first["data-term"]).to be== @new_meta_term_value
end

Then /^The meta term is at the end of the list$/ do
  meta_terms = all("#sortable li[data-term]")
  expect(meta_terms.last["data-term"]).to be== @new_meta_term_value
end

Then /^The meta term does not exist$/ do
  expect { MetaTerm.find(@meta_term_to_delete) }.to raise_error(ActiveRecord::RecordNotFound)
end

Then /^The context "(.*?)" is included in the individual_contexts$/ do |context|
  find("table.individual_contexts tr.individual_context[data-name='#{context}']")
end

Then /^The context "(.*?)" is not included in the individual_contexts$/ do |context|
  expect(  all("table.individual_contexts tr.individual_context[data-name='#{context}']").size).to be== 0
end

Then /^The most recent zencoder_job has the state "(.*?)"$/ do |state|
  expect(ZencoderJob.reorder(created_at: :desc,id: :asc).first.state ).to eq state
end

### the n ###########################################
 
Then /^the number or resources is lower then before$/ do
  expect(find("#resources_counter").text.to_i).to be < @resources_counter
end

Then /^the number or resources is equal to the remembered filter count$/ do
  expect(find("#resources_counter").text.to_i).to eq @count
end

Then /^the number or resources is equal to the remembered number of resources$/ do
  expect(find("#resources_counter").text.to_i).to eq  @resources_counter
end

### 

Then /^The owner of the media_resource is "(.*?)"$/  do |login|
  expect(@media_resource.reload.user).to be== User.find_by_login(login.downcase)
end

Then /^The origin keyword has no resources to transfer$/ do
  expect{ find("tr#keyword-term-#{@keyword_with_resources.id} a.transfer-resources") }.to raise_error
end
 
Then /^the origin person has not meta_data to transfer$/ do
  expect{find("tr#person_#{@person_with_meta_data.id} .meta_data_count")}.to raise_error
end
 
Then /^the origin meta term has no resources to transfer$/ do
  expect{find("tr#meta_term_#{@meta_term_with_resources.id} .meta_data_count")}.to raise_error
end

Then /^the person is deleted$/ do
  expect{find "tr#person_7"}.to raise_error
end

Then /^the resource is in the children of the given set$/ do
  expect(@set.child_media_resources.reload.pluck(:id)).to include @resource.id
end

Then (/^the resource with the id "(.*?)" has doesn't belong to me and has no other permissions$/) do |id|
  resource = MediaResource.find id
  expect(resource.user).not_to eq @me
  expect(resource.userpermissions.count).to eq 0
  expect(resource.grouppermissions.count).to eq 0
end

Then (/^the resource with the id "(.*?)" has no public view permission$/) do |id|
  MediaResource.find(id).update_attributes view: false
end

Then /^The resource has the following user-permissions:$/ do |table|
  table.rows.each do |row|
    @user = User.find_by_login row[0]
    permissions = \
      @resource.userpermissions.where(user_id: @user.id).first  \
      || @resource.userpermissions.create(user: @user)
    permissions.update_attributes row[1] => row[2]
  end
end

Then /^The resource(\d+) has the following user-permissions:$/ do |ns,table|
  n = ns.to_i
  table.rows.each do |row|
    user = User.find_by_login row[0]
    permissions = \
      @resources[n].userpermissions.where(user_id: user.id).first  \
      || @resources[n].userpermissions.create(user: user)
    permissions.update_attributes row[1] => row[2]
  end
end

Then(/^The resource(\d+) has the following user\-permissions set:$/) do |ns, table|
  i = ns.to_i
  media_resource = @resources[i]
  table.rows.each do |row|
    user = User.find_by_login row[0]
    action = row[1]
    value = row[2]
    userpermission = Userpermission.where(user_id: user.id, media_resource_id: media_resource.id).first
    expect(userpermission).to be
    if value == "true"
      expect(userpermission[action]).to be== true, row.to_s
    elsif value == "false"
      expect(userpermission[action]).to be== false, row.to_s
    else
      raise "should not be here" 
    end
  end
end


### the s 

Then /^The state of the newest ZencoderJob is "(.*?)"$/ do |state|
  expect(find("table.zencoder-jobs tbody tr td.state").text).to eq  state
end

Then /^The set has no children$/ do
  @set.child_media_resources.clear
end

### the t

Then /^the textarea within the fieldset "(.*?)" is empty$/ do |meta_key|
  expect(find("fieldset[data-meta-key='#{meta_key}'] textarea").value.strip).to eq ""
end

Then /^the textarea within the fieldset "(.*?)" is not empty$/ do |meta_key|
  expect(find("fieldset[data-meta-key='#{meta_key}'] textarea").value.strip).not_to eq ""
end

### the u

Then /^the unused values are faded out$/ do
  find('[data-filter-mode="used"]')
  page.evaluate_script %Q{ Test.ContextVocabulary.all_unused_vocabulary_is_fade_out() }
end

Then /^The user with login "(.*?)" is an admin$/ do |login|
  expect(User.find_by(login: login).is_admin?).to be_true
end

Then /^The visualization test test_noupdate_positions is running$/ do
  wait_until(5){ all("#test_noupdate_positions_running").size > 0}
end


### the z

Given /^The zencoder config is configured for test$/  do
  Settings.add_source! (Rails.root.join "features","data","zencoder.yml").to_s
  Settings.reload!
end