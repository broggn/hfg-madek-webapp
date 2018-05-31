import React from 'react'
import ReactDOM from 'react-dom'
import xhr from 'xhr'
import url from 'url'
import qs from 'qs'
import l from 'lodash'
import Scrolling from './Scrolling.js'
import cx from 'classnames/dedupe'
import ResourceThumbnail from './ResourceThumbnail.cjsx'

class SuperBoxRenderPage extends React.Component {

  constructor(props) {
    super(props)
  }

  renderResource(config) {
    return (
      <ResourceThumbnail elm='div'
        style={{}}
        get={config.resource}
        isClient={true} fetchRelations={false}
        isSelected={false} onSelect={null} onClick={null}
        authToken={config.authToken} key={'resource_' + config.resource.uuid}
        pinThumb={false}
        listThumb={false}
      />
    )
  }

  renderResources(config) {
    return l.map(
      config.resources,
      (r) => {
        return this.renderResource({resource: r, authToken: config.authToken})
      }
    )
  }

  render() {

    var resources = this.props.resources
    var authToken = this.props.authToken

    return (
      <li className='ui-resources-page'>
        <ul className='ui-resources-page-items'>
          {this.renderResources({resources: resources, authToken: authToken})}
        </ul>
      </li>
    )
  }
}

module.exports = SuperBoxRenderPage
