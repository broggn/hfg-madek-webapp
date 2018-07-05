import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxPopup from './BoxPopup.jsx'



class BoxBatchDatumPeople extends React.Component {

  constructor(props) {
    super(props)
    this.debouncedOnChange = l.debounce(this.onChange)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  onChange(text) {
    this.props.metaKeyForm.trigger({action: 'change-text', text: text})
  }

  onClose(event) {
    this.props.metaKeyForm.trigger({action: 'close'})
  }

  removeKeyword(k) {

    var event = () => {
      return {
        action: 'remove-keyword-by-id',
        id: k.id
      }
    }
    this.props.metaKeyForm.trigger(event())
  }

  renderKeyword(k, i) {
    return (
      <span key={i} style={{fontStyle: 'normal'}}>
        <span onClick={(e) => this.removeKeyword(k)} style={{cursor: 'pointer'}}>[x]</span>
        {k.label}
      </span>
    )
  }

  renderKeywords() {
    return l.map(
      this.props.metaKeyForm.data.keywords,
      (k, i) => this.renderKeyword(k, i)
    )
  }

  onKeywordSelect(event, keywordId, keywordLabel) {
    this.props.metaKeyForm.trigger({action: 'select-keyword', keywordId: keywordId, keywordLabel: keywordLabel})
  }

  onFocus(event) {
    this.props.metaKeyForm.trigger({action: 'input-focus'})
  }

  onCloseProposals() {
    this.props.metaKeyForm.trigger({action: 'close-proposals'})
  }

  renderKeywordProposal(k) {
    return (
      <div key={k.uuid} style={{cursor: 'pointer'}} onClick={(e) => this.onKeywordSelect(e, k.uuid, k.label)}>
        {k.label}
      </div>
    )

  }

  renderKeywordProposals() {
    if(!this.props.metaKeyForm.data.showProposals) {
      return null
    }
    else if(!this.props.metaKeyForm.data.keywordProposals) {
      return 'Loading...'
    }
    else {
      return l.map(
        this.props.metaKeyForm.data.keywordProposals,
        (k) => this.renderKeywordProposal(k)
      )
    }
  }

  render() {
    var metaKeyForm = this.props.metaKeyForm

    return (
      <div>
        <span onClick={(e) => this.onClose(e)}>[x]</span>
        {metaKeyForm.props.metaKey.label + ' (' + metaKeyForm.props.metaKeyId + ')'}
        <div>
          <input value={metaKeyForm.data.text} onFocus={(e) => this.onFocus(e)} onChange={(e) => this.debouncedOnChange(e.target.value)}/>
          {this.renderKeywords()}
          <div style={{position: 'relative'}}>
            <BoxPopup
              onClose={() => this.onCloseProposals()}
              style={{
                position: 'absolute',
                zIndex: '10000',
                backgroundColor: '#fff',
                borderRadius: '5px',
                padding: '0px 10px',
                marginRight: '5px',
                marginBottom: '5px',
                WebkitBoxShadow: '0px 0px 3px 0px rgba(0,0,0,0.5)',
                MozBoxShadow: '0px 0px 3px 0px rgba(0,0,0,0.5)',
                boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.5)',
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {this.renderKeywordProposals()}
            </BoxPopup>
          </div>
        </div>

      </div>
    )
  }
}

module.exports = BoxBatchDatumPeople
