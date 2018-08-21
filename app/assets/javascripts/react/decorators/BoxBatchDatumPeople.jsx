import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxPopup from './BoxPopup.jsx'
import BoxRenderLabel from './BoxRenderLabel.jsx'



class BoxBatchDatumPeople extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  onChange(text) {
    this.props.trigger(this.props.metaKeyForm, {action: 'change-text', text: text})
  }

  onClose(event) {
    this.props.trigger(this.props.metaKeyForm, {action: 'close'})
  }

  removeKeyword(k) {

    var event = () => {
      return {
        action: 'remove-keyword-by-id',
        id: k.id
      }
    }
    this.props.trigger(this.props.metaKeyForm, event())
  }

  renderKeyword(k, i) {
    return (
      <span key={i} style={{fontStyle: (!k.id ? 'italic' : 'normal'), marginRight: '10px', color: (!k.id ? '#aaa' : '#000')}}>

        <span onClick={(e) => this.removeKeyword(k)} style={{cursor: 'pointer'}}>
          <i className='icon-close' style={{position: 'relative', top: '1px', marginRight: '0px', fontSize: '12px'}}></i>
          {' '}
        </span>
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
    this.props.trigger(this.props.metaKeyForm, {action: 'select-keyword', keywordId: keywordId, keywordLabel: keywordLabel})
  }

  onFocus(event) {
    this.props.trigger(this.props.metaKeyForm, {action: 'input-focus'})
  }

  onCloseProposals() {
    this.props.trigger(this.props.metaKeyForm, {action: 'close-proposals'})
  }

  renderKeywordProposal(k) {
    return (
      <div key={k.uuid} style={{cursor: 'pointer', borderBottom: '1px solid #eee'}} onClick={(e) => this.onKeywordSelect(e, k.uuid, k.label)}>
        {k.label}
      </div>
    )

  }

  renderKeywordProposals() {
    // if(!this.props.metaKeyForm.data.showProposals) {
    //   return null
    // }
    // else
    if(!this.props.metaKeyForm.data.keywordProposals) {
      return 'Loading...'
    }
    else {
      return l.map(
        this.props.metaKeyForm.data.keywordProposals,
        (k) => this.renderKeywordProposal(k)
      )
    }
  }

  renderPopup() {

    if(!this.props.metaKeyForm.data.showProposals) {
      return null
    }

    return (
      <div style={{position: 'relative'}}>
        <BoxPopup
          onClose={() => this.onCloseProposals()}
          style={{
            position: 'absolute',
            zIndex: '1000',
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
    )
  }

  renderValue() {

    if(!this.props.editable) {
      return (
        <div
          style={{
            display: 'inline-block',
            width: '70%',
            verticalAlign: 'top'
          }}
        >
          {
            l.join(l.map(
              this.props.metaKeyForm.data.keywords,
              (k, i) => k.label
            ), ', ')
          }
        </div>
      )
    }

    return (
      <div
        style={{
          display: 'inline-block',
          width: '70%',
          verticalAlign: 'top'
        }}
      >
        {this.renderKeywords()}
        <input
          placeholder={'Search...'}
          style={{
            borderRadius: '5px',
            border: '1px solid #ddd',
            padding: '5px',
            boxSizing: 'border-box',
            width: '100%',
            height: '30px',
            fontSize: '12px'
          }}
          value={this.props.metaKeyForm.data.text}
          onFocus={(e) => this.onFocus(e)}
          onChange={(e) => this.onChange(e.target.value)}
        />
        {' '}
        {this.renderPopup()}
      </div>
    )
  }

  render() {

    var metaKeyForm = this.props.metaKeyForm

    return (
      <div>
        <BoxRenderLabel
          trigger={this.props.trigger}
          metaKeyForm={this.props.metaKeyForm}
          editable={this.props.editable}
        />
        {this.renderValue()}
      </div>
    )
  }
}

module.exports = BoxBatchDatumPeople
