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

  render() {

    var resources = this.props.resources

    return (
      <li className='ui-resources-page'>
        <ul className='ui-resources-page-items'>
          {this.renderResources({resources: resources})}
        </ul>
      </li>
    )
  }
}

module.exports = SuperBoxRenderPage
