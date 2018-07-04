import React from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'

class BoxBatchApplyButton extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={{
        display: 'block',
        position: 'absolute',
        top: '16px',
        left: '0px',
        right: '0px',
        marginLeft: '16px',
        marginRight: '16px',
        zIndex: '10',
        textAlign: 'center'
      }}>
        <span
          style={{
            display: 'inline-block',
            borderRadius: '5px',
            backgroundColor: '#000',
            color: '#fff',
            padding: '0px 10px',
            marginRight: '5px',
            marginBottom: '5px',
            fontSize: (this.props.big ? '18px' : '10px'),
            cursor: 'pointer'
          }}
          onClick={(e) => this.props.onBatchEditApply(e, this.props.get.uuid, this.props.get.type)}
        >
          {'apply'}
        </span>
      </div>
    )
  }
}

module.exports = BoxBatchApplyButton
