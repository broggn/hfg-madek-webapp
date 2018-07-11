import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchDatumText extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  onChange(text) {
    this.props.metaKeyForm.trigger({action: 'change-text', text: text})
  }

  onClose(event) {
    this.props.metaKeyForm.trigger({action: 'close'})
  }

  render() {
    var metaKeyForm = this.props.metaKeyForm

    return (
      <div>
        <span style={{cursor: 'pointer'}} onClick={(e) => this.onClose(e)}>
          <i className="icon-close"></i>
          {' '}
        </span>
        {metaKeyForm.props.metaKey.label}
        {' '}
        <input value={metaKeyForm.data.text} onChange={(e) => this.onChange(e.target.value)}/>
      </div>
    )
  }
}

module.exports = BoxBatchDatumText
