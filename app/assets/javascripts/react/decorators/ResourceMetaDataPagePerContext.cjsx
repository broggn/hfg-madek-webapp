React = require('react')
f = require('active-lodash')
t = require('../../lib/string-translation.js')('de')
ResourceMetaDataFormPerContext = require('./ResourceMetaDataFormPerContext.cjsx')
PageContent = require('../views/PageContent.cjsx')
PageContentHeader = require('../views/PageContentHeader.cjsx')
TabContent = require('../views/TabContent.cjsx')
Tabs = require('../views/Tabs.cjsx')
Tab = require('../views/Tab.cjsx')
HeaderButton = require('../views/HeaderButton.cjsx')
ResourceThumbnail = require('./ResourceThumbnail.cjsx')
Thumbnail = require('../ui-components/Thumbnail.cjsx')

module.exports = React.createClass
  displayName: 'ResourceMetaDataPage'

  _onTabClick: (context_id, event) ->
    event.preventDefault()
    @setState({currentContextId: context_id})
    return false

  getInitialState: () -> {
    mounted: false
    currentContextId: null
    models: {}
  }

  _modelForMetaKey: (meta_key) ->
    {
      multiple: not (meta_key.value_type == "MetaDatum::Text" or meta_key.value_type == "MetaDatum::TextDate")
      meta_key: meta_key
      values: []
      originalValues: []
    }

  componentWillMount: () ->

    currentContextId = @props.get.context_id
    if currentContextId == null
      currentContextId = @props.get.meta_data.context_ids[0]

    @setState({currentContextId: currentContextId})

    models = f.mapValues @props.get.meta_data.meta_key_by_meta_key_id, (meta_key) =>
      @_modelForMetaKey(meta_key)

    f.each @props.get.meta_data.existing_meta_data_by_meta_key_id, (data, meta_key_id) ->
      models[meta_key_id].values = data.values

    f.each models, (model) ->
      model.originalValues = f.map model.values, (value) ->
        value


    @setState({models: models})


  _validModel: (model) ->
    if model.multiple
      model.values.length > 0
    else
      if model.values[0]
        model.values[0].trim().length > 0
      else
        false

  _validityForContext: (context_id) ->
    hasMandatory = false
    hasInvalid = false
    data = @props.get.meta_data
    f.each data.mandatory_by_meta_key_id, (mandatory) =>

      if context_id and (f.includes data.meta_key_ids_by_context_id[context_id], mandatory.meta_key_id) or not context_id
        hasMandatory = true
        model = @state.models[mandatory.meta_key_id]
        # Note: The model can be unknown, because you can get more mandatory
        # fields than keys (some are not visible for the user).
        if model and not @_validModel(model)
          hasInvalid = true

    if not hasMandatory
      'not_mandatory'
    else if hasInvalid
      'invalid'
    else
      'valid'

  _changesPerContext: (context_id) ->
    hasChanges = false
    f.each @state.models, (model, meta_key_id) =>
      if context_id and (f.includes @props.get.meta_data.meta_key_ids_by_context_id[context_id], meta_key_id) or not context_id
        unless model.multiple == false and model.originalValues.length == 0 and model.values.length == 1 and model.values[0].trim() == ''
          if not f.isEqual(model.values, model.originalValues)
            hasChanges = true

    hasChanges

  _changesForAll: () ->
    @_changesPerContext(null)

  _validityForAll: () ->
    @_validityForContext(null)

  _onChangeForm: (meta_key_id, values) ->
    models = @state.models
    models[meta_key_id].values = values
    @setState({models: models})

  render: ({get, authToken} = @props) ->

    currentContextId = @state.currentContextId

    if currentContextId
      currentContext = get.meta_data.contexts_by_context_id[currentContextId]

    className = if get.resource_index.type == 'Collection' then 'media-set ui-thumbnail' else 'image media-entry ui-thumbnail'


    <PageContent>
      <PageContentHeader icon='pen' title={t('media_entry_meta_data_header_prefix') + get.title}>
        <HeaderButton
          icon={'arrow-down'} title={'TODO'} name={'TODO'}
          href={get.url + '/meta_data/edit'} method={'get'} authToken={authToken}/>
      </PageContentHeader>
      <Tabs>
        {f.map get.meta_data.context_ids, (context_id) =>
          context = get.meta_data.contexts_by_context_id[context_id]
          if not f.isEmpty(get.meta_data.meta_key_ids_by_context_id[context_id])
            <Tab
              hasChanges={@_changesPerContext(context_id)}
              validity={@_validityForContext(context_id)}
              privacyStatus={'public'}
              key={context.uuid}
              iconType={null}
              onClick={@_onTabClick.bind(@, context.uuid)}
              href={get.url + '/meta_data/edit_context/' + context.uuid}
              label={context.label}
              active={context.uuid == currentContextId} />
        }
      </Tabs>
      <TabContent>
        <div className="bright pal rounded-bottom rounded-top-right ui-container">
          <div className='ui-container table'>

            <div className="app-body-sidebar table-cell ui-container table-side">
              <ul className="ui-resources grid">
                <li className="ui-resource mrl">


                  <div className={className}>
                    <div className="ui-thumbnail-privacy">
                      <i className="icon-privacy-private" title="Diese Inhalte sind nur für Sie zugänglich"></i>
                    </div>
                    <div className="ui-thumbnail-image-wrapper">
                      <div className="ui-has-magnifier">
                        <div className="ui-thumbnail-image-holder">
                          <div className="ui-thumbnail-table-image-holder">
                            <div className="ui-thumbnail-cell-image-holder">
                              <div className="ui-thumbnail-inner-image-holder">
                                <img className="ui-thumbnail-image" src={get.resource_index.image_url}></img>
                              </div>
                            </div>
                          </div>
                        </div>
                        {
                          if get.image_url
                            <a className="ui-magnifier" href={get.image_url} id="ui-image-zoom" target="_blank">
                              <div className="icon-magnifier bright"></div>
                            </a>
                        }
                      </div>
                    </div>
                    <div className="ui-thumbnail-meta">
                      <h3 className="ui-thumbnail-meta-title">{get.resource_index.title}</h3>
                      <h4 className="ui-thumbnail-meta-subtitle">{get.resource_index.subtitle}</h4>
                    </div>


                  </div>
                </li>
              </ul>
            </div>

            <div className="app-body-content table-cell ui-container table-substance ui-container">
              <div className="active">
                <ResourceMetaDataFormPerContext hasAnyChanges={@_changesForAll()} validityForAll={@_validityForAll()}
                  onChange={@_onChangeForm} get={get} models={@state.models} authToken={authToken} context={currentContext} />
              </div>
            </div>
          </div>
        </div>
      </TabContent>
    </PageContent>