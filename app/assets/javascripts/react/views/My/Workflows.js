import React from 'react'
// import f from 'lodash'
// import setUrlParams from '../../../lib/set-params-for-url.coffee'
// import AppRequest from '../../../lib/app-request.coffee'
// import asyncWhile from 'async/whilst'
// import { parse as parseUrl } from 'url'
// import { parse as parseQuery } from 'qs'
// import Moment from 'moment'
// import currentLocale from '../../../lib/current-locale'

class MyWorkflows extends React.Component {
  render({ props } = this) {
    return <pre>{JSON.stringify(props, 0, 2)}</pre>
  }
}

module.exports = MyWorkflows
