import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchDatumDate extends React.Component {

  constructor(props) {
    super(props)
  }

  onChange(text) {
    this.props.metaKeyForm.trigger({action: 'new-text', text: text})
  }

  onClose(event) {
    this.props.metaKeyForm.trigger({action: 'close'})
  }

  render() {
    var metaKeyForm = this.props.metaKeyForm

    return (
      <div>
        <span onClick={(e) => this.onClose(e)}>close</span>
        {metaKeyForm.props.metaKey.label + ' (' + metaKeyForm.props.metaKeyId + ')'}
        <input value={metaKeyForm.data.text} onChange={(e) => this.onChange(e.target.value)}/>
      </div>
    )
  }
}

module.exports = BoxBatchDatumDate
