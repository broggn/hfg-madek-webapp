import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'

class BoxBatchEditFormKeyBubbles extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  renderKey(k) {
    return (
      <div
        key={k.metaKeyId}
        style={{cursor: 'pointer', display: 'inline-block', backgroundColor: 'white', borderRadius: '5px', padding: '0px 10px', marginRight: '5px', marginBottom: '5px'}}
        onClick={(e) => this.props.onClickKey(e, k.metaKeyId)}
      >
        {k.metaKey.label}
      </div>
    )
  }

  renderKeys() {
    return l.map(
      this.props.metaKeysWithTypes,
      (k) => this.renderKey(k)
    )
  }

  render() {
    return (
      <div>
        {this.renderKeys()}
      </div>
    )
  }
}

module.exports = BoxBatchEditFormKeyBubbles
