import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchEditForm extends React.Component {

  constructor(props) {
    super(props)
  }

  allMetaKeyIds() {
    var metaMetaData = this.props.stateBatch.metaMetaData


    return l.uniq(l.flatten(l.map(
      metaMetaData,
      (mmd) => l.keys(mmd.data.meta_key_by_meta_key_id)
    )))

  }

  allMetaKeysById() {
    var metaMetaData = this.props.stateBatch.metaMetaData

    return l.reduce(
      metaMetaData,
      (memo, mmd) => {
        return l.merge(
          memo,
          mmd.data.meta_key_by_meta_key_id
        )
      },
      {}
    )
  }

  metaKeysWithTypes() {
    var metaMetaData = this.props.stateBatch.metaMetaData

    return l.map(
      this.allMetaKeyIds(),
      (k) => {
        return {
          metaKeyId: k,
          types: l.map(
            l.filter(
              metaMetaData,
              (mmd) => {
                return l.has(mmd.data.meta_key_by_meta_key_id, k)
              }
            ),
            (m) => m.type
          ),
          metaKey: this.allMetaKeysById()[k]
        }
      }
    )
  }

  renderKey(k) {
    return (
      <div key={k.metaKeyId} style={{display: 'inline-block', backgroundColor: 'white', borderRadius: '5px', padding: '0px 10px', marginRight: '5px', marginBottom: '5px'}}>
        {k.metaKey.label}
      </div>
    )
  }

  renderKeys() {
    return l.map(
      this.metaKeysWithTypes(),
      (k) => this.renderKey(k)
    )
  }

  render() {

    var stateBatch = this.props.stateBatch

    if(!stateBatch.open) {
      return null
    } else {
      return (
        <div className='ui-resources-holder pam'>
          {this.renderKeys()}
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm
