import React from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import BoxTitlebarRender from './BoxTitlebarRender.jsx'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import boxSetUrlParams from './BoxSetUrlParams.jsx'
import setsFallbackUrl from '../../lib/sets-fallback-url.coffee'
import Preloader from '../ui-components/Preloader.cjsx'
import ActionsDropdown from './resourcesbox/ActionsDropdown.cjsx'
import ResourceThumbnail from './ResourceThumbnail.cjsx'

class BoxRenderResource extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')

    console.log('is equal = ' + !(!l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)))
    console.log('is equal state = ' + l.isEqual(this.state, nextState))
    console.log('is equal props = ' + l.isEqual(this.props, nextProps))
    if(!l.isEqual(this.props, nextProps)) {
      l.each(
        this.props,
        (p, k) => {
          if(!l.isEqual(p, nextProps[k])) {
            console.log('not equal prop = ' + k)


            l.each(
              p,
              (cp, ck) => {
                if(!l.isEqual(cp, nextProps[k][ck])) {
                  console.log('not equal child prop = ' + ck)

                }
              }

            )



          }
        }
      )
    }

    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  onSelect(event) {

    this.props.onSelectResource(this.props.resourceState.data.resource, event)
  }


  render() {

    var itemState = this.props.resourceState
    var selectedResources = this.props.selectedResources
    var actionsDropdownParameters = this.props.actionsDropdownParameters
    var isClient = this.props.isClient
    var onSelectResource = this.props.onSelectResource
    var config = this.props.config
    var hoverMenuId = this.props.hoverMenuId
    var fetchRelations = this.props.fetchRelations
    var authToken = this.props.authToken

    var item = itemState.data.resource

    if(!item.uuid) {
      // should not be the case anymore after uploader is not using this box anymore
      throw new Error('no uuid')
    }

    var key = item.uuid // or item.cid

    var style = null
    var selection = selectedResources
    // selection defined means selection is enabled
    var showActions = ActionsDropdown.showActionsConfig(actionsDropdownParameters)
    if(isClient && selection && f.any(f.values(showActions))) {
      var isSelected = selectedResources.contains(item)
      var onSelect = (e) => this.onSelect(e)
      // if in selection mode, intercept clicks as 'select toggle'
      var onClick = null
      if(config.layout == 'miniature' && !selection.empty()) {
        onClick = onSelect
      }

      //  when hightlighting editables, we just dim everything else:
      if(ActionsDropdown.isResourceNotInScope(item, isSelected, hoverMenuId)) {
        style = {opacity: 0.35}
      }

    }


    // TODO: get={model}
    return (
      <ResourceThumbnail elm='div'
        style={style}
        get={item}
        resourceState={itemState}
        isClient={isClient} fetchRelations={(this.props.onBatchEditApply ? null : fetchRelations)}
        isSelected={isSelected} onSelect={(e) => onSelect(e)} onClick={onClick}
        authToken={authToken} key={key}
        pinThumb={config.layout == 'tiles'}
        listThumb={config.layout == 'list'}
        list_meta_data={itemState.data.listMetaData}
        onBatchEditApply={this.props.onBatchEditApply}
      />
    )
  }
}

module.exports = BoxRenderResource
