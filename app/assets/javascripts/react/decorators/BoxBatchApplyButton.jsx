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

  isBig() {
    return this.props.layout == 'tiles'
  }

  renderApply() {

    var width = () => {
      if(this.props.layout == 'tiles') {
        return '100px'
      } else if(this.props.layout == 'miniature') {
        return '44px'
      } else {
        return '60px'
      }
    }

    var padding = () => {
      if(this.props.layout == 'tiles') {
        return '0px 10px'
      } else if(this.props.layout == 'miniature') {
        return '0px 0px'
      } else {
        return null
      }
    }

    var renderLabel = (text) => {
      return (
        <span
          className='primary-button'
          disabled='disabled'
          style={{
            display: 'inline-block',
            padding: padding(),
            fontSize: (this.isBig() ? null : '10px'),
            cursor: 'pointer',
            minHeight: (this.isBig() ? null : 'inherit'),
            lineHeight: (this.isBig() ? null : 'inherit'),
            width: width()
            // backgroundImage: 'linear-gradient(#8a8a8a, #b7b7b7)',
            // border: '1px solid #696969',
            // color: '#dadada'
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
            padding: padding(),
            fontSize: (this.isBig() ? null : '10px'),
            cursor: 'pointer',
            minHeight: (this.isBig() ? null : 'inherit'),
            lineHeight: (this.isBig() ? null : 'inherit'),
            width: width()
          }}
          onClick={(e) => onClick(e)}
        >
          {text}
        </span>
      )
    }

    var data = this.props.resourceState.data
    var components = this.props.resourceState.components
    if(components.resourceBatch.data.applyError && !components.resourceBatch.data.applyingMetaData) {
      return (
        <span
          className='primary-button'
          style={{
            display: 'inline-block',
            padding: padding(),
            fontSize: (this.isBig() ? null : '10px'),
            cursor: 'pointer',
            minHeight: (this.isBig() ? null : 'inherit'),
            lineHeight: (this.isBig() ? null : 'inherit'),
            backgroundImage: 'linear-gradient(#F44336, #c53434)',
            border: '1px solid #6f0d0d',
            width: width()
          }}
          onClick={(e) => this.onRetry(e)}
        >
          {'retry'}
        </span>
      )
    } else if(components.resourceBatch.data.applyingMetaData) {
      return renderLabel('applying')
    } else if(components.resourceBatch.data.applyDone) {
      return renderLabel('done')
    } else if(components.resourceBatch.data.applyPending) {
      return renderLabel('waiting')
    } else if(components.resourceBatch.data.applyCancelled) {
      return renderLabel('cancelled')
    } else if(this.props.showBatchButtons.editMode && !data.sleep){
      return renderButton('apply', (e) => this.onApply(e))
    } else {
      return null
    }
  }

  render() {

    var top = () => {
      if(this.props.layout == 'tiles') {
        return '9px'
      } else if(this.props.layout == 'grid') {
        return '16px'
      } else if(this.props.layout == 'list') {
        return '7px'
      } else if(this.props.layout == 'miniature') {
        return '-5px'
      } else {
        return null
      }
    }

    var padding = () => {
      if(this.props.layout == 'tiles') {
        return '2px'
      } else {
        return null
      }
    }

    var left = () => {
      if(this.props.layout == 'list') {
        return '30px'
      } else {
        return '0px'
      }
    }

    var right = () => {
      if(this.props.layout == 'list') {
        return null
      } else {
        return '0px'
      }
    }

    return (
      <div style={{position: 'relative', zIndex: '1000'}}>
        <div style={{
          display: 'block',
          position: 'absolute',
          top: top(),
          left: left(),
          right: right(),
          marginLeft: 'auto',
          marginRight: 'auto',
          zIndex: '10',
          textAlign: 'center',
          padding: padding()
        }}>
          <div>
            {this.renderApply()}
          </div>
        </div>
      </div>
    )
  }
}

module.exports = BoxBatchApplyButton
