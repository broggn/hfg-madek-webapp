import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = ({event, data, initial}) => {

  var next = () => {

    if(initial) {
      return {
        data: {
          text: '',
          keywords: []
        }
      }
    } else {
      return {
        data: {
          text: nextText(),
          keywords: nextKeywords()
        }
      }
    }
  }

  var nextText = () => {
    if(event.action == 'new-keyword') {
      return ''
    }
    else if(event.action == 'new-text') {
      return event.text
    }
    else {
      return data.text
    }
  }

  var nextKeywords = () => {
    if(event.action == 'new-keyword'){
      return data.keywords.concat({
        label: data.text
      })
    }
    else if(event.action == 'select-keyword') {
      return data.keywords
    }
    else {
      return data.keywords
    }
  }

  return next()
}
