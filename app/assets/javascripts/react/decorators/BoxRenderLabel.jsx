import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxRenderLabel extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  onClose(event) {
    this.props.metaKeyForm.trigger(this.props.metaKeyForm, {action: 'close'})
  }

  renderCross() {

    if(!this.props.editable) {
      return null
    }

    return (
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
    )
  }

  render() {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '30%',
          verticalAlign: 'top',
          color: (this.props.metaKeyForm.props.invalid ? '#f00' : null)
        }}
      >
        {this.renderCross()}
        {this.props.metaKeyForm.props.metaKey.label}
      </div>

    )
  }
}

module.exports = BoxRenderLabel
