import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchDatumText from './BoxBatchDatumText.jsx'

class BoxBatchEditMetaKeyForm extends React.Component {

  constructor(props) {
    super(props)
  }

  // renderText() {
  //   return (
  //     <BoxBatchDatumText metaKeyForm={this.props.metaKeyForm} />
  //   )
  // }
  //
  // renderers() {
  //   return {
  //     'MetaDatum::Text': () => this.renderText()
  //   }
  // }
  //
  // renderForm() {
  //   var type = this.props.metaKeyForm.metaKey.value_type
  //   var renderer = this.renderers()[type]
  //   if(!renderer) throw 'not implemented for ' + type
  //   return renderer()
  // }
  //
  // render() {
  //
  //   return (
  //     <div>
  //       {this.renderForm()}
  //     </div>
  //   )
  // }

  render() {
    return <div>todo</div>
  }
}

module.exports = BoxBatchEditMetaKeyForm
