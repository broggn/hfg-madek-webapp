import React from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchEditForm extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {

    var stateBatch = this.props.stateBatch

    if(!stateBatch.open) {
      return null
    } else {
      return (
        <div className='ui-resources-holder pam'>
          form
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm
