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
      <div key={metaKeyForm.props.metaKeyId} style={{backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ddd', padding: '10px', marginBottom: '5px'}}>
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
    return null

    // if(this.stateBatch().components.metaKeyForms.length == 0) {
    //   return null
    // }
    //
    // if(this.props.allLoaded) {
    //   return ''
    // } else {
    //   return 'Note: loading pages, not all will be updated'
    // }
  }

  renderApplySelected() {

    if(this.toApplyCount() > 0) {
      return null
    }
    if(this.stateBatch().components.metaKeyForms.length == 0) {
      return null
    }

    var selectedCount = () => {
      return this.stateBox().data.selectedResources.length
    }

    if(selectedCount() == 0) {
      return null
    }


    var renderText = () => {
      return 'Auf ' + selectedCount() + ' selektierte anwenden'
    }

    return (
      <div
        onClick={this.props.onClickApplySelected}
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
        {renderText()}
      </div>
    )

  }

  renderApplyAll() {

    if(this.toApplyCount() > 0) {
      return null
    }
    if(this.stateBatch().components.metaKeyForms.length == 0) {
      return null
    }


    var renderText = () => {

      var totalCount = () => {
        return this.props.totalCount
      }

      var loadedCount = () => {
        return this.stateBox().components.resources.length
      }

      if(loadedCount() == totalCount()) {
        return 'Auf alle anwenden'
      } else {
        return 'Auf ' + loadedCount() + ' anwenden (' + (totalCount() - loadedCount()) + ' ungeladen)'
      }

      // Auf alle anwenden
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
        {renderText()}
      </div>
    )
  }

  // renderCancel() {
  //
  //   if(this.toApplyCount() == 0) {
  //     return null
  //   }
  //
  //   return (
  //     <div
  //       onClick={this.props.onClickCancel}
  //       style={{
  //         display: 'inline-block',
  //         borderRadius: '5px',
  //         backgroundColor: '#000',
  //         color: '#fff',
  //         padding: '0px 10px',
  //         marginRight: '5px',
  //         marginBottom: '5px',
  //         fontSize: '14px',
  //         cursor: 'pointer'
  //       }}
  //     >
  //       Abbrechen
  //     </div>
  //   )
  // }


  renderProgress() {
    var total = this.totalCount()
    var toApply = this.toApplyCount()

    if(toApply == 0) {
      return null
    }

    var pendingCount = () => {
      return l.filter(
        this.stateBox().components.resources,
        (r) => r.data.applyPending
      ).length
    }

    var applyingCount = () => {
      return l.filter(
        this.stateBox().components.resources,
        (r) => r.data.applyingMetaData
      ).length
    }

    var doneCount = () => {
      return l.filter(
        this.stateBox().components.resources,
        (r) => r.data.applyDone
      ).length
    }


    return (
      <div style={{backgroundColor: '#bfda80', borderRadius: '5px', color: '#fff', textAlign: 'center', fontSize: '16px', padding: '3px'}}>
        {applyingCount() + ' are saving, ' + pendingCount() + ' are waiting, ' + doneCount() + ' are done'}
        <div
          style={{
            display: 'inline-block',
            borderRadius: '5px',
            backgroundColor: '#3c3c3c',
            color: '#fff',
            padding: '0px 10px',
            fontSize: '14px',
            cursor: 'pointer',
            float: 'right',
            marginTop: '1px'
          }}
          onClick={this.props.onClickCancel}
        >
          wartende abbrechen
        </div>
      </div>
    )
  }

  findMetaKeysWithTypes(metaKeyIds) {
    var metaKeysWithTypes = this.stateBatch().components.loadMetaMetaData.data.metaKeysWithTypes
    return l.map(
      metaKeyIds,
      (k) => l.find(metaKeysWithTypes, (mkt) => mkt.metaKeyId == k)
    )
  }

  renderMandatories() {
    var metaKeyIds = l.uniq(
      l.flatten(
        l.map(
          this.stateBatch().components.loadMetaMetaData.data.metaMetaData,
          (mmd) => l.keys(mmd.data.mandatory_by_meta_key_id)
        )
      )
    )

    return (
      <div>
        {'Pflichtfelder:'}
        {' '}
        <div
          style={{
            display: 'inline-block',
            marginLeft: '10px',
            marginBottom: '20px'
          }}
        >
          <BoxBatchEditFormKeyBubbles
            metaKeysWithTypes={this.findMetaKeysWithTypes(metaKeyIds)}
            onClickKey={this.props.onClickKey}
          />
        </div>
      </div>
    )
  }

  renderVocabularies() {

    var metaMetaData = this.stateBox().components.batch.components.loadMetaMetaData.data.metaMetaData[0].data
    var vocabularies = metaMetaData.vocabularies_by_vocabulary_id
    var vocabMetaKeys = metaMetaData.meta_key_ids_by_vocabulary_id

    var metaKeysWithTypes = this.stateBatch().components.loadMetaMetaData.data.metaKeysWithTypes

    return l.map(
      vocabularies,
      (v, k) => {

        var isSelected = () => {
          return this.stateBatch().data.selectedVocabulary == k
        }

        var renderBubbles = () => {
          if(!isSelected()) {
            return null
          }
          return (
            <BoxBatchEditFormKeyBubbles
              metaKeysWithTypes={this.findMetaKeysWithTypes(vocabMetaKeys[k])}
              onClickKey={this.props.onClickKey}
            />
          )
        }

        return (
          <div key={k}>
            <div>
              <div style={{marginBottom: (isSelected() ? '10px' : '0px')}}>
                <div>
                  <span className={(isSelected() ? 'open' : null)} style={{cursor: 'pointer'}} onClick={(e) => this.stateBatch().trigger({action: 'select-vocabulary', vocabulary: k})}>
                    <i
                      className={'ui-side-filter-lvl1-marker'}
                      style={{
                        position: 'static',
                        float: 'left',
                        width: '20px',
                        marginTop: '4px'
                      }}
                    />
                    {v.label}
                  </span>
                </div>
                <div style={{marginLeft: '20px', marginTop: '5px'}}>
                  {renderBubbles()}
                </div>
              </div>
            </div>
          </div>
        )
      }
    )
  }

  renderInvalidMessage() {

    if(l.isEmpty(this.props.stateBox.components.batch.data.invalidMetaKeyUuids)) {
      return null
    }

    return (
      <div style={{color: '#f00'}}>
        Bitte alle Felder ausfüllen oder leere entfernen.
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
          <div style={{width: '50%', float: 'left'}}>
            {this.renderMandatories()}
            {this.renderVocabularies()}
          </div>
          <div style={{width: '50%', float: 'right'}}>
            {this.renderInvalidMessage()}
            {this.renderKeyForms()}

            <div style={{marginTop: '20px'}}>
              {this.renderApplyAll()}
              {this.renderApplySelected()}
              {this.renderHint()}
            </div>
            {this.renderProgress()}
          </div>
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm
