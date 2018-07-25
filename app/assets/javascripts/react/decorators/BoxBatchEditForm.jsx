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

    if(this.toApplyCount() == 0) {
      return null
    }

    return (
      <div
        style={{
          textAlign: 'center',
          fontSize: '16px',
          color: '#b59d6e',
          marginBottom: '20px',
          marginTop: '40px'
        }}
      >
        <i
          className='icon-bang'
          style={{
            display: 'inline-block',
            width: '40px',
            position: 'relative',
            top: '2px',
            fontSize: '24px'
          }}
        />
        Bitte warten und die Ansicht nicht verlassen.
      </div>
    )
  }

  editableSelectedCount() {
    return l.size(
      l.filter(
        this.stateBox().data.selectedResources,
        (sr) => sr.editable
      )
    )
  }

  editableCount() {
    return l.size(
      l.filter(
        this.stateBox().components.resources,
        (rs) => rs.data.resource.editable
      )
    )
  }

  selectedCount() {
    return this.stateBox().data.selectedResources.length
  }


  renderApplySelected() {

    if(this.toApplyCount() > 0) {
      return null
    }
    if(this.stateBatch().components.metaKeyForms.length == 0) {
      return null
    }


    if(this.selectedCount() == 0) {
      return null
    }


    var renderText = () => {
      return 'Auf ' + this.editableSelectedCount() + ' selektierte anwenden'
    }

    return (
      <div
        style={{
          float: 'left',
          backgroundColor: '#fff',
          borderRadius: '5px',
          border: '1px solid rgb(221, 221, 221)',
          padding: '10px',
          marginLeft: '5px'
        }}
      >
        <div>
          <div>&nbsp;</div>
          <div>selektiert: {this.selectedCount()}</div>
          <div>davon editierbar: {this.editableSelectedCount()}</div>
        </div>
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
            cursor: 'pointer',
            marginTop: '5px'
          }}
        >
          {renderText()}
        </div>
      </div>
    )

  }

  loadedCount() {
    return this.stateBox().components.resources.length
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

      if(this.loadedCount() == totalCount()) {
        return 'Auf alle ' + this.editableCount() + ' anwenden'
      } else {
        return 'Auf alle ' + this.editableCount() + ' geladenen anwenden'
      }

      // Auf alle anwenden
    }

    return (
      <div
        style={{
          float: 'left',
          backgroundColor: '#fff',
          borderRadius: '5px',
          border: '1px solid rgb(221, 221, 221)',
          padding: '10px'
        }}
      >
        <div>
          <div>Total: {this.props.totalCount}</div>
          <div>davon geladen: {this.loadedCount()}</div>
          <div>davon editierbar: {this.editableCount()}</div>
        </div>
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
            cursor: 'pointer',
            marginTop: '5px'
          }}
        >
          {renderText()}
        </div>
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

    var errorCount = () => {
      return l.filter(
        this.stateBox().components.resources,
        (r) => r.data.applyError && !r.data.applyingMetaData
      ).length
    }

    var processingTotalCount = () => {
      return pendingCount() + applyingCount() + doneCount()
    }

    var renderCancel = () => {

      if(pendingCount() == 0) {
        return null
      }

      return (
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
      )
    }

    var renderErrors = () => {
      if(errorCount() == 0) {
        return null
      }

      return (
        <span>
          {', '}
          <span style={{color: '#f00'}}>
            {errorCount() + ' failed'}
          </span>
        </span>
      )
    }

    return (
      <div style={{backgroundColor: '#bfda80', borderRadius: '5px', color: '#fff', textAlign: 'center', fontSize: '16px', padding: '3px'}}>
        {processingTotalCount() + ' total, ' + applyingCount() + ' are saving, ' + pendingCount() + ' are waiting, ' + doneCount() + ' are done'}
        {renderErrors()}
        {renderCancel()}
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
            </div>
            <div>
              {this.renderHint()}
              {this.renderProgress()}
            </div>
          </div>
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm
