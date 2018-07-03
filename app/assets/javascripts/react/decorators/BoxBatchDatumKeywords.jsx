import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchDatumKeywords extends React.Component {

  constructor(props) {
    super(props)
    this.debouncedOnChange = l.debounce(this.onChange)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  onChange(text) {
    this.props.metaKeyForm.trigger({action: 'new-text', text: text})
  }

  onKeyDown(event) {
    if(event.keyCode == 13) {
      this.props.metaKeyForm.trigger({action: 'new-keyword'})
    }
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
        <input value={metaKeyForm.data.text} onKeyDown={(e) => this.onKeyDown(e)} onChange={(e) => this.debouncedOnChange(e.target.value)}/>
        {
          l.join(l.map(
            metaKeyForm.data.keywords,
            (k) => {
              if(k.id) {
                return k.label
              } else {
                return k.label + '*'
              }
            }
          ), ', ')
        }
      </div>
    )
  }
}

module.exports = BoxBatchDatumKeywords
