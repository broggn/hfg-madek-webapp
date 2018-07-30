import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxPopup from './BoxPopup.jsx'



class BoxBatchDatumKeywords extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  onChange(text) {
    this.props.metaKeyForm.trigger({action: 'change-text', text: text})
  }

  onKeyDown(event) {
    if(!this.props.metaKeyForm.props.metaKey.is_extensible) {
      return null
    }

    if(event.keyCode == 13) {
      this.props.metaKeyForm.trigger({action: 'new-keyword'})
    }
  }

  onClose(event) {
    this.props.metaKeyForm.trigger({action: 'close'})
  }

  removeKeyword(k) {

    var event = () => {
      if(k.id) {
        return {
          action: 'remove-keyword-by-id',
          id: k.id
        }
      } else {
        return {
          action: 'remove-keyword-by-label',
          label: k.label
        }
      }
    }
    this.props.metaKeyForm.trigger(event())
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
    )
  }

  render() {
    var metaKeyForm = this.props.metaKeyForm

    return (
      <div>
        <div
          style={{
            display: 'inline-block',
            width: '30%',
            verticalAlign: 'top',
            color: (this.props.metaKeyForm.props.invalid ? '#f00' : null)
          }}
        >
          <span style={{cursor: 'pointer'}} onClick={(e) => this.onClose(e)}>
            <i
              className='icon-close'
              style={{
                display: 'inline-block',
                width: '20px',
                position: 'relative',
                top: '2px'
              }}
            />
            {' '}
          </span>
          {metaKeyForm.props.metaKey.label}
        </div>
        <div
          style={{
            display: 'inline-block',
            width: '70%',
            verticalAlign: 'top'
          }}
        >
          {this.renderKeywords()}
          <input
            style={{
              borderRadius: '5px',
              border: '1px solid #ddd',
              padding: '5px',
              boxSizing: 'border-box',
              width: '100%',
              height: '30px',
              fontSize: '12px'
            }}
            value={metaKeyForm.data.text}
            onFocus={(e) => this.onFocus(e)}
            onKeyDown={(e) => this.onKeyDown(e)}
            onChange={(e) => this.onChange(e.target.value)}
          />
          {' '}
          {this.renderPopup()}
        </div>
      </div>
    )
  }
}

module.exports = BoxBatchDatumKeywords
