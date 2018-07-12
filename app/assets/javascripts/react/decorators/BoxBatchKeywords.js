import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = ({event, data, initial, trigger, nextProps}) => {

  var next = () => {

    if(event.action == 'change-text' || event.action == 'input-focus' && nextProps.metaKey.show_checkboxes) {
      loadKeywords()
    }

    if(initial) {
      return {
        data: {
          text: '',
          keywords: [],
          showProposals: false,
          keywordProposals: null
        }
      }
    } else {
      return {
        data: {
          text: nextText(),
          keywords: nextKeywords(),
          showProposals: nextShowProposals(),
          keywordProposals: nextKeywordProposals()
        }
      }
    }
  }

  var nextText = () => {
    if(event.action == 'new-keyword') {
      return ''
    }
    else if(event.action == 'change-text') {
      return event.text
    }
    else {
      return data.text
    }
  }

  var nextKeywords = () => {
    if(event.action == 'remove-keyword-by-label') {
      return l.filter(
        data.keywords,
        (k) => k.label != event.label
      )
    }
    else if(event.action == 'remove-keyword-by-id') {
      return l.filter(
        data.keywords,
        (k) => k.id != event.id
      )
    }
    else if(event.action == 'new-keyword'){
      return data.keywords.concat({
        label: data.text
      })
    }
    else if(event.action == 'select-keyword') {
      return data.keywords.concat({
        id: event.keywordId,
        label: event.keywordLabel
      })
    }
    else {
      return data.keywords
    }
  }

  var nextShowProposals = () => {
    if(event.action == 'change-text' || event.action == 'keywords-loaded' || (event.action == 'input-focus' && data.keywordProposals)) {
      return true
    }
    else if(event.action == 'close-proposals') {
      return false
    }
    else {
      return data.showProposals
    }
  }

  var nextKeywordProposals = () => {
    if(event.action == 'change-text') {
      return null
    }
    else if(event.action == 'keywords-loaded') {
      return event.keywords
    }
    else {
      return data.keywordProposals
    }
  }

  var loadKeywords = () => {
    var url = '/keywords?search_term=' + encodeURIComponent(nextText()) + '&meta_key_id=' + encodeURIComponent(nextProps.metaKeyId)
    xhr(
      {
        url: url,
        method: 'GET',
        json: true,
        headers: {
          'Accept': 'application/json',
          'X-CSRF-Token': getRailsCSRFToken()
        }
      },
      (err, res, json) => {
        if(err) {
          return
        } else {
          trigger({
            action: 'keywords-loaded',
            keywords: json
          })
        }
      }
    )

  }

  return next()
}
