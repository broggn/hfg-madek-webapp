Model = require('ampersand-model')
defaults = require('lodash/object/defaults')
getRailsCSRFToken = require('../../lib/rails-csrf-token.coffee')

# Base class for Restful Application Resources
module.exports = Model.extend
  type: 'AppResourceBase'
  idAttribute: 'url'
  typeAttribute: 'type' # see presenter{.rb,s/shared/app_resource.rb}
  props:
    url: 'string'
    uuid: 'string'

  ajaxConfig:
    headers:
      'Accept': 'application/json'
      'X-CSRF-Token': getRailsCSRFToken()

  save: (config)->
    Model::save.call @, {}, defaults({}, config, wait: true)

  # shortcut, like presenter:
  dump: () -> Model::serialize.call(@, arguments)