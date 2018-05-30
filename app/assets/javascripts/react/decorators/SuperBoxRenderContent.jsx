import React from 'react'
import ReactDOM from 'react-dom'
import xhr from 'xhr'
import url from 'url'
import qs from 'qs'
import l from 'lodash'
import Scrolling from './Scrolling.js'
import cx from 'classnames/dedupe'
import ResourceThumbnail from './ResourceThumbnail.cjsx'

class SuperBoxRenderContent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  listClasses(config) {
    return cx(
      config.layout,
      {
        'vertical': config.layout == 'tiles',
        'active': config.withActions
      },
      config.listMods,
      'ui-resources'
    )
  }

  renderResource(resource) {
    return (
      <ResourceThumbnail elm='div'
        style={{}}
        get={resource}
        isClient={true} fetchRelations={false}
        isSelected={false} onSelect={null} onClick={null}
        authToken={null} key={'resource_' + resource.uuid}
        pinThumb={false}
        listThumb={false}
      />
    )
  }

  renderResources(config) {
    return l.map(
      config.resources,
      (r) => {
        return this.renderResource(r)
      }
    )
  }

  renderPage(config) {
    return (
      <li className='ui-resources-page' key={'page_' + config.index}>
        <ul className='ui-resources-page-items'>
          {this.renderResources({resources: config.resources})}
        </ul>
      </li>
    )
  }

  renderPages(config) {
    var resources = config.resources
    var perPage = config.perPage

    var pages = l.chunk(resources, perPage)

    return l.map(
      pages,
      (p, i) => {
        return this.renderPage({
          resources: p,
          index: i
        })
      }
    )
  }

  render() {
    var withBox = this.props.withBox
    var mods = this.props.mods
    var listMods = this.props.listMods
    var resources = this.props.resources
    var perPage = this.props.perPage

    return (
      <ul className={this.listClasses({layout: 'grid', withActions: false, listMods: listMods})}>
        {this.renderPages({resources: resources, perPage: perPage})}
      </ul>
    )
  }
}

module.exports = SuperBoxRenderContent
