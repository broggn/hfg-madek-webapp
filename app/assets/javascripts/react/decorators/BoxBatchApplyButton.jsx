import React from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'

class BoxBatchApplyButton extends React.Component {

  constructor(props) {
    super(props)
  }

  onApply(event) {
    var get = this.props.resourceState.data.resource
    // //  this.props.onBatchEditApply(e, get.uuid, get.type)
    // debugger
    this.props.resourceState.trigger({action: 'apply', uuid: get.uuid, type: get.type})
  }

  renderApply() {
    var data = this.props.resourceState.data
    if(data.applyingMetaData) {
      return (
        <span
          style={{
            width: '80px',
            height: '20px',
            display: 'inline-block'
          }}
          className='ui-preloader small'
        />
      )
    } else {
      return (
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
          onClick={(e) => this.onApply(e)}
        >
          {'apply'}
        </span>
      )
    }
  }

  render() {

    var get = this.props.resourceState.data.resource

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
        {this.renderApply()}
      </div>
    )
  }
}

module.exports = BoxBatchApplyButton
