React = require('react')
f = require('active-lodash')
t = require('../../lib/string-translation.js')('de')
PageContent = require('../views/PageContent.cjsx')
PageContentHeader = require('../views/PageContentHeader.cjsx')
TabContent = require('../views/TabContent.cjsx')
Tabs = require('../views/Tabs.cjsx')
Tab = require('../views/Tab.cjsx')
ResourceThumbnail = require('./ResourceThumbnail.cjsx')
Thumbnail = require('../ui-components/Thumbnail.cjsx')
batchDiff = require('../../lib/batch-diff.coffee')
BatchHintBox = require('./BatchHintBox.cjsx')
ResourcesBatchBox = require('./ResourcesBatchBox.cjsx')

BatchAddToSet = require('./BatchAddToSet.cjsx')
AsyncModal = require('../views/Collection/AsyncModal.cjsx')
setUrlParams = require('../../lib/set-params-for-url.coffee')


module.exports = React.createClass
  displayName: 'BatchAddToSet'

  getInitialState: () -> {
    mounted: false
  }

  componentWillMount: () ->

  _contentForGet: (get) ->
    <BatchAddToSet returnTo={@props.returnTo}
      get={get} async={true} authToken={@props.authToken} onClose={@props.onClose} />

  _extractGet: (json) ->
    json

  render: ({authToken, get} = @props) ->
    getUrl = setUrlParams('/batch_select_add_to_set', {
      search_term: '',
      media_entry_id: @props.mediaEntryIds
      return_to: @props.returnTo
    })
    <AsyncModal get={get} getUrl={getUrl}
      contentForGet={@_contentForGet} extractGet={@_extractGet} />