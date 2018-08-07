import React from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import BoxTitlebarRender from './BoxTitlebarRender.jsx'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import boxSetUrlParams from './BoxSetUrlParams.jsx'
import setsFallbackUrl from '../../lib/sets-fallback-url.coffee'
import Preloader from '../ui-components/Preloader.cjsx'
import ActionsDropdownHelper from './resourcesbox/ActionsDropdownHelper.cjsx'
import ResourceThumbnail from './ResourceThumbnail.cjsx'
import BoxRenderResource from './BoxRenderResource.jsx'

class BoxRenderResources extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')


    // var rs1 = this.props.resources
    // var rs2 = nextProps.resources
    // l.each(
    //   rs1,
    //   (r, i) => {
    //     var r1 = rs1[i]
    //     var r2 = rs2[i]
    //     if(!l.isEqual(r1, r2)) {
    //
    //       l.each(
    //         r1,
    //         (v, k) => {
    //           if(!l.isEqual(v, r2[k])) {
    //             console.log('not equal = ' + k)
    //           }
    //         }
    //       )
    //
    //
    //     }
    //   }
    //
    // )

    // console.log('state = ' + l.isEqual(this.state, nextState) + ' props = ' + l.isEqual(this.props, nextProps))
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  render() {

    var resources = this.props.resources
    var listClasses = this.props.listClasses
    var actionsDropdownParameters = this.props.actionsDropdownParameters
    var selectedResources = this.props.selectedResources
    var isClient = this.props.isClient
    var showSelectionLimit = this.props.showSelectionLimit
    var selectionLimit = this.props.selectionLimit
    var onSelectResource = this.props.onSelectResource
    var config = this.props.config
    var hoverMenuId = this.props.hoverMenuId
    var authToken = this.props.authToken
    var withActions = this.props.withActions
    var listMods = this.props.listMods

    // fetching relations enabled by default if layout is grid + withActions + isClient
    var fetchRelations = isClient && withActions && f.includes(['grid', 'list'], config.layout)

    var renderPage = (page, i) => {

      var renderItem = (itemState) => {

        return (
          <BoxRenderResource
            resourceState={itemState}
            isClient={isClient}
            onSelectResource={onSelectResource}
            config={config}
            hoverMenuId={hoverMenuId}
            showBatchButtons={this.props.showBatchButtons}
            fetchRelations={fetchRelations}
            key={itemState.data.resource.uuid}
            trigger={this.props.trigger}
            isSelected={f.find(selectedResources, (sr) => sr.uuid == itemState.data.resource.uuid)}
            showActions={ActionsDropdownHelper.showActionsConfig(actionsDropdownParameters)}
          />
        )
      }

      var renderItems = (page) => {
        return page.map((item) => {
          return renderItem(item)
        })
      }


      var renderCounter = () => {

        var pagination = this.props.pagination
        var pageSize = this.props.perPage

        var BoxPageCounter = require('./BoxPageCounter.jsx')
        return (
          <BoxPageCounter
            showActions={ActionsDropdownHelper.showActionsConfig(actionsDropdownParameters)}
            selectedResources={selectedResources}
            isClient={isClient}
            showSelectionLimit={showSelectionLimit}
            resources={resources}
            pageResources={f.map(page, (i) => i.data.resource)}
            selectionLimit={selectionLimit}
            pagination={pagination}
            perPage={this.props.perPage}
            pageIndex={i}
            unselectResources={this.props.unselectResources}
            selectResources={this.props.selectResources}
          />
        )
      }


      return (
        <li className='ui-resources-page' key={i}>
          {renderCounter()}
          <ul className='ui-resources-page-items'>
            {renderItems(page)}
          </ul>
        </li>
      )
    }


    var renderPages = () => {
      var pagination = this.props.pagination
      var pageSize = this.props.perPage

      return f.chunk(resources, pageSize).map((page, i) => {
        return renderPage(page, i)
      })
    }

    var listClasses = () => {
      return cx(
        config.layout, // base class like "list"
        {
          'vertical': config.layout == 'tiles',
          'active': withActions
        },
        listMods,
        'ui-resources'
      )
    }

    return (
      <ul className={listClasses()}>
        {renderPages()}
      </ul>
    )
  }
}

module.exports = BoxRenderResources
