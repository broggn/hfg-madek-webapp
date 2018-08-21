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
    this.props.trigger(this.props.metaKeyForm, {action: 'close'})
  }

  onOptionAdd(event) {
    this.props.trigger(this.props.metaKeyForm, {action: 'option-add'})
  }

  onOptionReplace(event) {
    this.props.trigger(this.props.metaKeyForm, {action: 'option-replace'})
  }

  onOptionRemove(event) {
    this.props.trigger(this.props.metaKeyForm, {action: 'option-remove'})
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

    var renderOptions = () => {
      if(!this.props.showOptions) {
        return null
      }

      var className = (option) => {
        if(this.props.metaKeyForm.data.option == option) {
          return 'button active'
        } else {
          return 'button'
        }
      }

      // <button className={className('remove')} onClick={(e) => this.onOptionRemove(e)}>Entfernen</button>
      return (
        <div className='button-group small' style={{marginTop: '10px'}}>
          <button className={className('add')} onClick={(e) => this.onOptionAdd(e)}>Hinzufügen</button>
          <button className={className('replace')} onClick={(e) => this.onOptionReplace(e)}>Ersetzen</button>
        </div>
      )
    }

    return (
      <div
        style={{
          display: 'inline-block',
          width: '30%',
          verticalAlign: 'top',
          color: (this.props.metaKeyForm.props.invalid ? '#f00' : null)
        }}
      >
        <div>
          {this.renderCross()}
          {this.props.metaKeyForm.props.metaKey.label}
        </div>
        {renderOptions()}
      </div>

    )
  }
}

module.exports = BoxRenderLabel
