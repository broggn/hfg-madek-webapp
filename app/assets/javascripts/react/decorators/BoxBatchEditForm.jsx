import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchEditMetaKeyForm from './BoxBatchEditMetaKeyForm.jsx'

class BoxBatchEditForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      cachedMetaKeysWithTypes: metaKeysWithTypes(props.stateBatch.data.metaMetaData)
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(!l.isEqual(this.props.stateBatch.data.metaMetaData, prevProps.stateBatch.data.metaMetaData)) {
      this.setState({
        cachedMetaKeysWithTypes: metaKeysWithTypes(this.props.stateBatch.data.metaMetaData)
      })
    }
  }


  renderKey(k) {
    return (
      <div
        key={k.metaKeyId}
        style={{cursor: 'pointer', display: 'inline-block', backgroundColor: 'white', borderRadius: '5px', padding: '0px 10px', marginRight: '5px', marginBottom: '5px'}}
        onClick={(e) => this.props.onClickKey(e, k.metaKeyId)}
      >
        {k.metaKey.label}
      </div>
    )
  }

  renderKeys() {
    return l.map(
      this.state.cachedMetaKeysWithTypes,
      (k) => this.renderKey(k)
    )
  }

  renderMetaKeyForm(metaKeyForm) {
    return (
      <div key={metaKeyForm.props.metaKeyId}>
        <BoxBatchEditMetaKeyForm metaKeyForm={metaKeyForm} />
      </div>
    )
  }

  renderKeyForms() {
    return l.map(
      this.props.stateBatch.components.metaKeyForms,
      (metaKeyForm) => this.renderMetaKeyForm(metaKeyForm)
    )
  }

  render() {

    var stateBatch = this.props.stateBatch

    if(!stateBatch.data.open) {
      return null
    } else {
      return (
        <div className='ui-resources-holder pam'>
          <div>
            {this.renderKeys()}
          </div>
          <div>
            {this.renderKeyForms()}
          </div>
        </div>
      )
    }
  }
}

module.exports = BoxBatchEditForm


var metaKeysWithTypes = (metaMetaData) => {

  var allMetaKeyIds = () => {
    return l.uniq(l.flatten(l.map(
      metaMetaData,
      (mmd) => l.keys(mmd.data.meta_key_by_meta_key_id)
    )))

  }

  var allMetaKeysById = () => {
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

  return l.map(
    allMetaKeyIds(),
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
        metaKey: allMetaKeysById()[k]
      }
    }
  )
}
