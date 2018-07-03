import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchEditMetaKeyForm from './BoxBatchEditMetaKeyForm.jsx'
import BoxBatchEditFormKeyBubbles from './BoxBatchEditFormKeyBubbles.jsx'

class BoxBatchEditForm extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  renderMetaKeyForm(metaKeyForm) {
    return (
      <div key={metaKeyForm.props.metaKeyId}>
        <BoxBatchEditMetaKeyForm metaKeyForm={metaKeyForm} />
      </div>
    )
  }

  renderKeyForms() {
    let {components} = this.props.stateBatch

    return l.map(
      components.metaKeyForms,
      (metaKeyForm) => this.renderMetaKeyForm(metaKeyForm)
    )
  }

  render() {

    let {data, components} = this.props.stateBatch

    if(!data.open) {
      return null
    } else {
      return (
        <div className='ui-resources-holder pam'>
          <BoxBatchEditFormKeyBubbles
            metaKeysWithTypes={components.loadMetaMetaData.data.metaKeysWithTypes}
            onClickKey={this.props.onClickKey}
          />
          <div>
            {this.renderKeyForms()}
          </div>
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm
