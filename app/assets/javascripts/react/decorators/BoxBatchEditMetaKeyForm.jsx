import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchDatumText from './BoxBatchDatumText.jsx'
import BoxBatchDatumDate from './BoxBatchDatumDate.jsx'
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

  render() {

    return (
      <div>
        {this.renderForm()}
      </div>
    )
  }
}

module.exports = BoxBatchEditMetaKeyForm
