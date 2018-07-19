import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchDatumText from './BoxBatchDatumText.jsx'
import BoxBatchDatumKeywords from './BoxBatchDatumKeywords.jsx'
import BoxBatchDatumPeople from './BoxBatchDatumPeople.jsx'

class BoxBatchEditMetaKeyForm extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  renderText() {
    return (
      <BoxBatchDatumText metaKeyForm={this.props.metaKeyForm} />
    )
  }

  renderKeywords() {
    return (
      <BoxBatchDatumKeywords metaKeyForm={this.props.metaKeyForm} />
    )
  }

  renderPeople() {
    return (
      <BoxBatchDatumPeople metaKeyForm={this.props.metaKeyForm} />
    )
  }

  renderers() {
    return {
      'MetaDatum::Text': () => this.renderText(),
      'MetaDatum::TextDate': () => this.renderText(),
      'MetaDatum::Keywords': () => this.renderKeywords(),
      'MetaDatum::People': () => this.renderPeople()
    }
  }

  renderForm() {
    var type = this.props.metaKeyForm.props.metaKey.value_type
    var renderer = this.renderers()[type]
    if(!renderer) throw 'not implemented for ' + type
    return renderer()
  }

  renderMandatory() {

    var mandatoryForTypes = this.props.metaKeyForm.props.mandatoryForTypes

    if(mandatoryForTypes.length == 0) {
      return null
    }

    var mandatoryText = () => {
      if(mandatoryForTypes.length == 1 && mandatoryForTypes[0] == 'MediaEntry') {
        return 'Pflichtfeld für Medien Einträge'
      }
      return 'Pflichtfeld'
    }

    return (
      <div style={{marginBottom: '10px', color: '#5982a7', textAlign: 'right'}}>
        <i
          className='icon-bang'
          style={{
            display: 'inline-block',
            width: '20px',
            position: 'relative',
            top: '2px'
          }}
        />
        {' '}
        {mandatoryText()}
      </div>
    )
  }

  renderScope() {
    var metaKey = this.props.metaKeyForm.props.metaKey

    if(l.size(metaKey.scope) > 1) {
      return null
    }

    var scopeText = () => {
      if(l.includes(metaKey.scope, 'Entries')) {
        return 'Dieser Wert wird nur auf Medien Einträge angewendet'
      } else if(l.includes(metaKey.scope, 'Sets')) {
        return 'Dieser Wert wird nur auf Sets angewendet'
      } else {
        return null
      }
    }

    return (
      <div style={{marginBottom: '10px', color: '#b59d6e', textAlign: 'right'}}>
        <i
          className='icon-bang'
          style={{
            display: 'inline-block',
            width: '20px',
            position: 'relative',
            top: '2px'
          }}
        />
        {' '}
        {scopeText()}
      </div>
    )
  }


  render() {

    return (
      <div>
        {this.renderMandatory()}
        {this.renderScope()}
        {this.renderForm()}
      </div>
    )
  }
}

module.exports = BoxBatchEditMetaKeyForm
