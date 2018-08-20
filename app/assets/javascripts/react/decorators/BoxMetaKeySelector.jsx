import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchEditMetaKeyForm from './BoxBatchEditMetaKeyForm.jsx'
import BoxBatchEditFormKeyBubbles from './BoxBatchEditFormKeyBubbles.jsx'

class BoxMetaKeySelector extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  findMetaKeysWithTypes(metaKeyIds) {
    var metaKeysWithTypes = this.props.loadMetaMetaData.data.metaKeysWithTypes
    return l.map(
      metaKeyIds,
      (k) => l.find(metaKeysWithTypes, (mkt) => mkt.metaKeyId == k)
    )
  }

  renderMandatories() {
    var metaKeyIds = l.uniq(
      l.flatten(
        l.map(
          this.props.loadMetaMetaData.data.metaMetaData,
          (mmd) => l.keys(mmd.data.mandatory_by_meta_key_id)
        )
      )
    )

    return (
      <div>
        {t('resources_box_batch_mandatory_fields')}
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

    var metaMetaDataForTypes = this.props.loadMetaMetaData.data.metaMetaData

    var vocabularies = l.reduce(
      metaMetaDataForTypes,
      (memo, mmd) => {
        l.each(
          mmd.data.vocabularies_by_vocabulary_id,
          (v, k) => memo[k] = v
        )
        return memo
      },
      {}
    )

    var vocabMetaKeys = l.reduce(
      l.map(metaMetaDataForTypes, (mmd) => mmd.data.meta_key_ids_by_vocabulary_id),
      (memo, vocab2Key) => {
        l.each(
          vocab2Key,
          (v, k) => memo[k] = l.uniq(l.concat((memo[k] ? memo[k] : []), v))
        )
        return memo
      },
      {}
    )

    var metaKeysWithTypes = this.props.loadMetaMetaData.data.metaKeysWithTypes

    return l.map(
      vocabularies,
      (v, k) => {

        var isSelected = () => {
          return this.props.loadMetaMetaData.data.selectedVocabulary == k
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
                  <span className={(isSelected() ? 'open' : null)} style={{cursor: 'pointer'}} onClick={(e) => this.props.trigger(this.props.loadMetaMetaData, {action: 'select-vocabulary', vocabulary: k})}>
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

  render() {
    return (
      <div>
        {this.renderMandatories()}
        {this.renderVocabularies()}
      </div>
    )

  }
}

module.exports = BoxMetaKeySelector
