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

  toApplyCount() {
    return l.filter(
      this.stateBox().components.resources,
      (r) => r.data.applyPending || r.data.applyingMetaData
    ).length
  }

  totalCount() {
    return this.stateBox().components.resources.length
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
        onClick={(this.toApplyCount() > 0 ? null : this.props.onClickApplyAll)}
        style={{
          display: 'inline-block',
          borderRadius: '5px',
          backgroundColor: (this.toApplyCount() > 0 ? '#d2d2d2' : '#000'),
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

  renderCancel() {

    if(this.toApplyCount() == 0) {
      return null
    }

    return (
      <div
        onClick={this.props.onClickCancel}
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
        Abbrechen
      </div>
    )
  }


  renderProgress() {
    var total = this.totalCount()
    var toApply = this.toApplyCount()

    if(toApply == 0) {
      return null
    }

    return (
      <div style={{backgroundColor: '#bfda80', borderRadius: '5px', color: '#fff', textAlign: 'center', fontSize: '16px'}}>
        {this.toApplyCount()}
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
          {this.renderProgress()}
          {this.renderCancel()}
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm
