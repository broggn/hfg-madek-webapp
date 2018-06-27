import React from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchEditButton extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {

    var stateBatch = this.props.stateBatch

    if(stateBatch.metaMetaData.length != 2) {
      return (
        <a className={cx('link button dropdown-toggle btn btn-default ui-link active')}>
          Loading...
        </a>
      )
    } else {
      return (
        <a className={cx('link button dropdown-toggle btn btn-default ui-link', {active: stateBatch.open})} onClick={(e) => this.props.onBatchButton(e)}>
          <i className='small icon-pen'></i>
          {' '}
          Batch Edit
        </a>
      )
    }
  }
}

module.exports = BoxBatchEditButton
