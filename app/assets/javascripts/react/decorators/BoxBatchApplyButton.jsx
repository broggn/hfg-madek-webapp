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
    var resource = this.props.resourceState.data.resource
    this.props.trigger(this.props.resourceState, {action: 'apply', uuid: resource.uuid, type: resource.type})
  }

  onRetry(event) {
    var resource = this.props.resourceState.data.resource
    this.props.trigger(this.props.resourceState, {action: 'retry', uuid: resource.uuid, type: resource.type})
  }

  renderApply() {

    var renderLabel = (text) => {
      return (
        <span
          style={{
            display: 'inline-block',
            borderRadius: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            color: 'rgb(90, 90, 90)',
            padding: (this.props.big ? '0px 10px': '0px 4px'),
            fontSize: (this.props.big ? '18px' : '10px'),
          }}
        >
          {text}
        </span>
      )
    }

    var renderButton = (text, onClick) => {
      return (
        <span
          className='primary-button'
          style={{
            display: 'inline-block',
            padding: (this.props.big ? null : '0px 10px'),
            fontSize: (this.props.big ? null : '10px'),
            cursor: 'pointer',
            minHeight: (this.props.big ? null : 'inherit'),
            lineHeight: (this.props.big ? null : 'inherit')
          }}
          onClick={(e) => onClick(e)}
        >
          {text}
        </span>
      )
    }

    var data = this.props.resourceState.data
    if(data.applyError && !data.applyingMetaData) {
      return (
        <span
          className='primary-button'
          style={{
            display: 'inline-block',
            padding: (this.props.big ? null : '0px 10px'),
            fontSize: (this.props.big ? null : '10px'),
            cursor: 'pointer',
            minHeight: (this.props.big ? null : 'inherit'),
            lineHeight: (this.props.big ? null : 'inherit'),
            backgroundImage: 'linear-gradient(#F44336, #c53434)',
            border: '1px solid #6f0d0d'
          }}
          onClick={(e) => this.onRetry(e)}
        >
          {'retry'}
        </span>
      )
    } else if(data.applyingMetaData) {
      return renderLabel('applying')
    } else if(data.applyDone) {
      return renderLabel('done')
    } else if(data.applyPending) {
      return renderLabel('waiting')
    } else if(data.applyCancelled) {
      return renderLabel('cancelled')
    } else if(this.props.showBatchButtons.editMode){
      return renderButton('apply', (e) => this.onApply(e))
    } else {
      return null
    }
  }

  render() {
    return (
      <div style={{
        display: 'block',
        position: 'absolute',
        top: '16px',
        left: '0px',
        right: '0px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: '10',
        textAlign: 'center',
        width: (this.props.big ? '100px' : '60px')
      }}>
        <div>
          {this.renderApply()}
        </div>
      </div>
    )
  }
}

module.exports = BoxBatchApplyButton
