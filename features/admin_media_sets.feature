Feature: Managing Media-Sets

  As a MAdeK admin

  Background: 
    Given I am signed-in as "Adam"

  Scenario: Showing media sets
    When I visit "/app_admin"
    And I click on the link "Media Resources"
    And I click on the link "Media Sets"
    Then I am on the "/app_admin/media_sets" page

  Scenario: Showing details of a media set
    When I visit "/app_admin/media_sets"
    And I click on the link "Details"
    Then I am on a "/app_admin/media_sets/" page

  @jsbrowser
  Scenario: Delete a Set with all children
    Given The media_resource with the previous_id "6" exists
    When I visit "/app_admin/media_sets/38"
    And I click on the link "Delete with all children" 
    Then The media_resource with the previous_id "38" doesn't exist
    Then The media_resource with the previous_id "6" doesn't exist

  @jsbrowser
  Scenario: Delete a Set without all children
    Given The media_resource with the previous_id "6" exists
    When I visit "/app_admin/media_sets/38"
    And I click on the link "Delete without children" 
    Then The media_resource with the previous_id "38" doesn't exist
    Then The media_resource with the previous_id "6" exists

  @jsbrowser
  Scenario: Manage individual context
  When I visit "/app_admin/media_sets/2"
  And I click on the link "Manage individual contexts"
  Then The context "Zett" is included in the individual_contexts
  When I click on the link "Remove" of the individual_context "Zett"
  Then The context "Zett" is not included in the individual_contexts
  When I click on the link "Add" of the context "Zett"
  Then The context "Zett" is included in the individual_contexts
  When I visit "/app_admin/media_sets/3"
  And I click on the link "Manage individual contexts"
  Then The context "Zett" is included in the individual_contexts