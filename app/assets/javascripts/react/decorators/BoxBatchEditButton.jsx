import React from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchEditButton extends React.Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var l = require('lodash')
    return !l.isEqual(this.state, nextState) || !l.isEqual(this.props, nextProps)
  }

  render() {

    let {components, data, props, trigger} = this.props.stateBatch

    if(components.loadMetaMetaData.data.metaMetaData.length != 2) {
      return (
        <a className={cx('link button dropdown-toggle btn btn-default ui-link active')}>
          Loading...
        </a>
      )
    } else {
      return (
        <a className={cx('link button dropdown-toggle btn btn-default ui-link', {active: data.open})} onClick={(e) => this.props.onBatchButton(e)}>
          <i className='small icon-pen'></i>
          {' '}
          Quck Edit
        </a>
      )
    }
  }
}

module.exports = BoxBatchEditButton
