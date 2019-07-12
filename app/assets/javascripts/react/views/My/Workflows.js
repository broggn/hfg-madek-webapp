import React from 'react'
import Link from '../../ui-components/Link.cjsx'
import ResourceThumbnail from '../../decorators/ResourceThumbnail.cjsx'
// import f from 'lodash'
// import setUrlParams from '../../../lib/set-params-for-url.coffee'
// import AppRequest from '../../../lib/app-request.coffee'
// import asyncWhile from 'async/whilst'
// import { parse as parseUrl } from 'url'
// import { parse as parseQuery } from 'qs'
// import Moment from 'moment'
// import currentLocale from '../../../lib/current-locale'

class MyWorkflows extends React.Component {
  render({ props } = this) {
    const workflows = props.get.list
    const labelStyle = {
      backgroundColor: '#666',
      color: '#fff',
      display: 'inline-block',
      borderRadius: '3px'
    }

    return (
      <div className="ui-resources-holder pal">
        {workflows.map((workflow, i) => (
          <div key={i}>
            <div className="ui-resources-header">
              <h1 className="title-l ui-resources-title">{workflow.name}</h1>
              <label style={labelStyle} className="phs mls">
                {workflow.status}
              </label>
              <Link href={workflow.edit_url} mods="strong">
                Edit
              </Link>
            </div>
            <ul className="grid ui-resources">
              {workflow.collections.map((collection, ci) => (
                <div key={ci}>
                  <ResourceThumbnail get={collection} />
                </div>
              ))}
            </ul>
            <hr className="separator mbm" />
          </div>
        ))}
      </div>
    )
  }
}

module.exports = MyWorkflows
