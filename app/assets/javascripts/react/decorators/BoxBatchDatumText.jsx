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
    this.props.metaKeyForm.trigger(this.props.metaKeyForm, {action: 'change-text', text: text})
  }

  onClose(event) {
    this.props.metaKeyForm.trigger(this.props.metaKeyForm, {action: 'close'})
  }

  render() {
    var metaKeyForm = this.props.metaKeyForm

    return (
      <div>
        <div
          style={{
            display: 'inline-block',
            width: '30%',
            verticalAlign: 'top',
            color: (this.props.metaKeyForm.props.invalid ? '#f00' : null)
          }}
        >
          <span style={{cursor: 'pointer'}} onClick={(e) => this.onClose(e)}>
            <i
              className='icon-close'
              style={{
                display: 'inline-block',
                width: '20px',
                position: 'relative',
                top: '2px'
              }}
            />
            {' '}
          </span>
          {metaKeyForm.props.metaKey.label}
        </div>
        <div
          style={{
            display: 'inline-block',
            width: '70%',
            verticalAlign: 'top'
          }}
        >
          <input
            style={{
              borderRadius: '5px',
              border: '1px solid #ddd',
              padding: '5px',
              boxSizing: 'border-box',
              width: '100%',
              height: '30px',
              fontSize: '12px'
            }}
            value={metaKeyForm.data.text}
            onChange={(e) => this.onChange(e.target.value)}
          />
        </div>
      </div>
    )
  }
}

module.exports = BoxBatchDatumText
