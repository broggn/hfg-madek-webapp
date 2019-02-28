import React from 'react'
// import f from 'lodash'
// import setUrlParams from '../../../lib/set-params-for-url.coffee'
// import AppRequest from '../../../lib/app-request.coffee'
// import asyncWhile from 'async/whilst'
// import { parse as parseUrl } from 'url'
// import { parse as parseQuery } from 'qs'
// import Moment from 'moment'
// import currentLocale from '../../../lib/current-locale'
// const UI = require('../../ui-components/index.coffee')
// import ui from '../../lib/ui.coffee'
// const t = ui.t

// function MyWorkflows(props) {
//   return <pre>{JSON.stringify(props, 0, 2)}</pre>
// }
//
// module.exports = MyWorkflows

class WorkflowShow extends React.Component {
  render(props = this.props) {
    const { get } = props

    const { name } = get

    return (
      <div className="ui-resources-holder pal">
        <div className="ui-container pbl">
          <div className="ui-resources-header">
            <h2 className="title-l ui-resources-title">{name}</h2>
          </div>
          <pre>{JSON.stringify(get, 0, 2)}</pre>
        </div>
      </div>
    )
  }
}

module.exports = WorkflowShow
