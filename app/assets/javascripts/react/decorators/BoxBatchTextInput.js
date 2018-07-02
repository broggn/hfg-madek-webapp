import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = (component, trigger) => {

  var next = () => {

    if(!component.last) {
      return {
        data: {
          text: ''
        }
      }
    } else {
      return {
        data: {
          text: nextText()
        }
      }
    }
  }


  var nextText = () => {
    if(component.event && component.event.event.event == 'new-text'){
      return component.event.event.text
    } else {
      return component.last.data.text
    }
  }

  return next()
}
