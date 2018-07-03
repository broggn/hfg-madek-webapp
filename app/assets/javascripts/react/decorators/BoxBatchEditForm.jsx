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

    let {components} = this.props.stateBatch

    this.state = {
      cachedMetaKeysWithTypes: metaKeysWithTypes(components.loadMetaMetaData.data.metaMetaData)
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    var lastMetaMetaData = this.props.stateBatch.components.loadMetaMetaData.data.metaMetaData
    var nextMetaMetaData = prevProps.stateBatch.components.loadMetaMetaData.data.metaMetaData

    if(!l.isEqual(lastMetaMetaData, nextMetaMetaData)) {
      this.setState({
        cachedMetaKeysWithTypes: metaKeysWithTypes(nextMetaMetaData)
      })
    }
  }

  renderMetaKeyForm(metaKeyForm) {
    return (
      <div key={metaKeyForm.props.metaKeyId}>
        <BoxBatchEditMetaKeyForm metaKeyForm={metaKeyForm} />
      </div>
    )
  }

  renderKeyForms() {
    let {components} = this.props.stateBatch

    return l.map(
      components.metaKeyForms,
      (metaKeyForm) => this.renderMetaKeyForm(metaKeyForm)
    )
  }

  render() {

    let {data} = this.props.stateBatch

    if(!data.open) {
      return null
    } else {
      return (
        <div className='ui-resources-holder pam'>
          <BoxBatchEditFormKeyBubbles
            metaKeysWithTypes={this.state.cachedMetaKeysWithTypes}
            onClickKey={this.props.onClickKey}
          />
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
