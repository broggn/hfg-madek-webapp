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

  renderTemplates() {

    return l.map(
      this.prepareContexts(),
      (pc) => {

        let {type, context, contextKeys} = pc

        var isSelected = () => {
          return this.props.loadMetaMetaData.data.selectedTemplate == context.uuid
        }

        var renderBubbles = () => {
          if(!isSelected()) {
            return null
          }
          return (
            <BoxBatchEditFormKeyBubbles
              metaKeys={l.map(contextKeys, (ck) => ck.meta_key)}
              onClickKey={this.props.onClickKey}
            />
          )
        }

        return (
          <div key={context.uuid}>
            <div>
              <div style={{marginBottom: (isSelected() ? '10px' : '0px')}}>
                <div>
                  <span className={(isSelected() ? 'open' : null)} style={{cursor: 'pointer'}} onClick={(e) => this.props.trigger(this.props.loadMetaMetaData, {action: 'select-template', template: context.uuid})}>
                    <i
                      className={'ui-side-filter-lvl1-marker'}
                      style={{
                        position: 'static',
                        float: 'left',
                        width: '20px',
                        marginTop: '4px'
                      }}
                    />
                    {context.label}
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
              metaKeys={l.map(this.findMetaKeysWithTypes(vocabMetaKeys[k]), (mkt) => mkt.metaKey)}
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

  prepareContexts() {

    var metaMetaDataForTypes = this.props.loadMetaMetaData.data.metaMetaData

    var contextsWithType = () => {
      return l.flatten(
        l.map(
          metaMetaDataForTypes,
          (mdft) => {
            return l.map(
              mdft.data.meta_data_edit_context_ids,
              (cid) => {
                return {
                  type: mdft.type,
                  context: mdft.data.contexts_by_context_id[cid],
                  contextKeys: l.uniqBy(
                    l.map(
                      mdft.data.context_key_ids_by_context_id[cid],
                      (ckid) => mdft.data.context_key_by_context_key_id[ckid]
                    ),
                    (ck) => ck.meta_key_id
                  )
                }
              }
            )
          }
        )
      )
    }

    return l.filter(
      l.uniqBy(
        contextsWithType(),
        (ct) => ct.context.uuid
      ),
      (ct) => ct.contextKeys.length > 0
    )
  }

  renderContextTabs() {

    var renderTab = (tab, label) => {

      var className = () => {
        if(tab == this.props.loadMetaMetaData.data.selectedTab) {
          return 'active ui-tabs-item'
        } else {
          return 'ui-tabs-item'
        }
      }

      var onClick = (e) => {
        this.props.trigger(this.props.loadMetaMetaData, {action: 'select-tab', selectedTab: tab})
      }

      return (
        <li className={className()}>
          <a onClick={(e) => onClick(e)}>
            {label}
          </a>
        </li>
      )
    }

    var renderTabContent = () => {
      if(this.props.loadMetaMetaData.data.selectedTab == 'templates') {
        return this.renderTemplates()
      } else {
        return this.renderVocabularies()
      }
    }

    return (
      <div>
        <ul className='ui-tabs'>
          {renderTab('templates', 'Templates')}
          {renderTab('all_data', 'Alle Daten')}
        </ul>
        <div className='ui-container tab-content bordered bright rounded-right rounded-bottom'>
          <div className='phs pts'>
            {renderTabContent()}
          </div>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderContextTabs()}
      </div>
    )

  }
}

module.exports = BoxMetaKeySelector
