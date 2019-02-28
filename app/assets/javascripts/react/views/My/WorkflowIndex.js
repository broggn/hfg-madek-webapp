import React from 'react'
import f from 'lodash'
// import setUrlParams from '../../../lib/set-params-for-url.coffee'
// import AppRequest from '../../../lib/app-request.coffee'
// import asyncWhile from 'async/whilst'
// import { parse as parseUrl } from 'url'
// import { parse as parseQuery } from 'qs'
// import Moment from 'moment'
// import currentLocale from '../../../lib/current-locale'
const UI = require('../../ui-components/index.coffee')
// import ui from '../../lib/ui.coffee'
// const t = ui.t

// function MyWorkflows(props) {
//   return <pre>{JSON.stringify(props, 0, 2)}</pre>
// }
//
// module.exports = MyWorkflows

class WorkflowsIndex extends React.Component {
  render(props = this.props) {
    const { get, authToken } = props

    const newAction = f.get(get, 'actions.new')

    return (
      <div className="ui-resources-holder pal">
        <div className="ui-container pbl">
          {/* <div className="ui-resources-header">
            <h2 className="title-l ui-resources-title">{'Workflows'}</h2>
          </div> */}
          <WorkflowsList list={get.list} authToken={authToken} />
          {!!newAction && (
            <div className="mtl">
              <UI.Button href={newAction.url} className="primary-button">
                {'Neues Projekt'}
              </UI.Button>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const WorkflowsList = ({ list, authToken }) => {
  return (
    <div>
      {list.map((project, i) => (
        <div key={i}>
          {/* {!!label && <h4 className="title-s mtl mbm">{label}</h4>} */}
          <table className="ui-workgroups bordered block aligned">
            <thead>
              <tr>
                <td>
                  <span className="ui-resources-table-cell-content">{'Name'}</span>
                </td>
                <td />
              </tr>
            </thead>
            <tbody>
              {f.map(list, project => (
                <WorkflowRow key={project.uuid} project={project} authToken={authToken} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

export const WorkflowRow = ({ project }) => {
  return (
    <tr key={project.id}>
      <td>
        <a href={project.url}>{project.name}</a>
      </td>
      <td className="ui-workgroup-actions" />
    </tr>
  )
}

module.exports = WorkflowsIndex
WorkflowsIndex.WorkflowRow = WorkflowRow
