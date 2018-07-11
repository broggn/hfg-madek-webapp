import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchEditMetaKeyForm from './BoxBatchEditMetaKeyForm.jsx'
import BoxBatchEditFormKeyBubbles from './BoxBatchEditFormKeyBubbles.jsx'

class BoxBatchEditForm extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  renderMetaKeyForm(metaKeyForm) {
    return (
      <div key={metaKeyForm.props.metaKeyId}>
        <BoxBatchEditMetaKeyForm metaKeyForm={metaKeyForm} />
      </div>
    )
  }

  stateBox() {
    return this.props.stateBox
  }

  stateBatch() {
    return this.stateBox().components.batch
  }

  renderKeyForms() {
    let {components} = this.stateBatch()

    return l.map(
      components.metaKeyForms,
      (metaKeyForm) => this.renderMetaKeyForm(metaKeyForm)
    )
  }

  renderHint() {
    if(this.stateBatch().components.metaKeyForms.length == 0) {
      return null
    }

    if(this.props.allLoaded) {
      return ''
    } else {
      return 'Note: loading pages, not all will be updated'
    }
  }

  renderApplyAll() {

    if(this.stateBatch().components.metaKeyForms.length == 0) {
      return null
    }
    return (
      <div
        onClick={this.props.onClickApplyAll}
        style={{
          display: 'inline-block',
          borderRadius: '5px',
          backgroundColor: '#000',
          color: '#fff',
          padding: '0px 10px',
          marginRight: '5px',
          marginBottom: '5px',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        Auf alle anwenden
      </div>
    )
  }

  render() {

    let {data, components} = this.stateBatch()

    if(!data.open) {
      return null
    } else {
      return (
        <div className='ui-resources-holder pam'>
          <BoxBatchEditFormKeyBubbles
            metaKeysWithTypes={components.loadMetaMetaData.data.metaKeysWithTypes}
            onClickKey={this.props.onClickKey}
          />
          <div>
            {this.renderKeyForms()}
          </div>
          <div>
            {this.renderApplyAll()}
            {this.renderHint()}
          </div>
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm
