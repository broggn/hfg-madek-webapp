import React from 'react'
import ReactDOM from 'react-dom'
import xhr from 'xhr'
import url from 'url'
import qs from 'qs'
import l from 'lodash'
import Scrolling from './Scrolling.js'
import cx from 'classnames/dedupe'

class SuperBoxRenderBox extends React.Component {

  constructor(props) {
    super(props)
  }

  boxClasses(config) {
    return cx(
      {
        'ui-container': true,
        'midtone': true,
        'bordered': true
      },
      config.mods,
      'ui-polybox'
    )
  }

  listHolderClasses(config)  {
    return cx(
      'ui-resources-holder',
      {
        pam: true
      }
    )
  }

  renderContent() {
    return this.props.content
  }

  render() {

    var mods = this.props.mods

    return (
      <div data-test-id='resources-box' className={this.boxClasses({mods: mods})}>
        <div className={this.listHolderClasses({})}>
          <div className='ui-container table auto'>
            <div className='ui-container table-cell table-substance'>
              {this.renderContent()}
            </div>
          </div>
        </div>
      </div>
    )

  }
}

module.exports = SuperBoxRenderBox
