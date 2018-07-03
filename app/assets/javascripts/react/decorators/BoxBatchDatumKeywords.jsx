import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchDatumKeywords extends React.Component {

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

  onKeyDown(event) {
    if(event.keyCode == 13) {
      this.props.metaKeyForm.trigger({action: 'new-keyword'})
    }
  }

  onClose(event) {
    this.props.metaKeyForm.trigger({action: 'close'})
  }

  renderKeywords() {
    return l.join(l.map(
      this.props.metaKeyForm.data.keywords,
      (k) => {
        if(k.id) {
          return k.label
        } else {
          return k.label + '*'
        }
      }
    ), ', ')
  }

  onKeywordSelect(event, keywordId, keywordLabel) {
    this.props.metaKeyForm.trigger({action: 'select-keyword', keywordId: keywordId, keywordLabel})
  }

  renderKeywordProposal(k) {
    return (
      <div key={k.uuid} onClick={(e) => this.onKeywordSelect(e, k.uuid, k.label)}>
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
        <span onClick={(e) => this.onClose(e)}>close</span>
        {metaKeyForm.props.metaKey.label + ' (' + metaKeyForm.props.metaKeyId + ')'}
        <input value={metaKeyForm.data.text} onKeyDown={(e) => this.onKeyDown(e)} onChange={(e) => this.debouncedOnChange(e.target.value)}/>
        {this.renderKeywords()}
        <div>
          {this.renderKeywordProposals()}
        </div>
      </div>
    )
  }
}

module.exports = BoxBatchDatumKeywords
