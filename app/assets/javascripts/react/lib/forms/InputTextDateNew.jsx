import React from 'react'
import l from 'lodash'
import CustomDatePicker from './CustomDatePicker.jsx'
import DatePickerPopup from './DatePickerPopup.jsx'
import t from '../../../lib/i18n-translate.js'
import moment from 'moment'

// Just import (although not used here) since it sets some global stuff for
// locales which are used in other components (tests failed).
// Remove it and check the failing tests.
import DatePicker from '../../ui-components/DatePicker.js'

class InputTextDateNew extends React.Component {
  constructor (props) {
    super(props)
    var date = new Date()

    var createPickerState = () => {
      return {
        year: date.getFullYear(),
        month: date.getMonth()
      }
    }

    this.state = {
      text: (this.props.values.length > 0 ? this.props.values[0] : ''),
      showAt: false,
      showFromTo: false,
      stateAt: createPickerState(),
      stateFrom: createPickerState(),
      stateTo: createPickerState(),
      selectedFrom: null,
      selectedTo: null
    }
  }

  setMonthAt(d) {
    this.setState({
      stateAt: d
    })
  }

  setMonthFrom(d) {
    this.setState({
      stateFrom: d
    })
  }

  setMonthTo(d) {
    this.setState({
      stateTo: d
    })
  }

  setText(event) {
    var text = event.target.value
    this.setState({
      text: text
    })
  }

  showAt() {
    this.setState({
      showAt: true,
      showFromTo: false
    })
  }

  showFromTo() {
    this.setState({
      showFromTo: true,
      showAt: false,
      selectedFrom: null,
      selectedTo: null
    })
  }

  closeAt() {
    this.setState({
      showAt: false
    })
  }

  closeFromTo() {
    this.setState({
      showFromTo: false
    })
  }

  dateTripleToString(d) {
    return moment().date(d.day + 1).month(d.month).year(d.year).format('DD.MM.YYYY')
  }

  selectAt(d) {
    this.setState({
      showAt: false,
      text: this.dateTripleToString(d)
    })
  }

  selectFrom(d) {
    if(this.state.selectedTo) {
      this.setState({
        text: this.dateTripleToString(d) + ' - ' + this.dateTripleToString(this.state.selectedTo),
        showFromTo: false
      })
    } else {
      this.setState({
        selectedFrom: d
      })
    }
  }

  selectTo(d) {
    if(this.state.selectedFrom) {
      this.setState({
        text: this.dateTripleToString(this.state.selectedFrom) + ' - ' + this.dateTripleToString(d),
        showFromTo: false
      })
    } else {
      this.setState({
        selectedTo: d
      })
    }
  }

  renderFrom() {
    if(this.state.selectedFrom) {
      return (
        <div style={{
            float: 'left',
            width: '252px',
            textAlign: 'center',
            verticalAlign: 'middle',
            marginTop: '53px',
            border: 'solid #ddd 1px',
            height: '196px',
            borderRadius: '10px',
            paddingTop: '80px'
        }}>
          {this.dateTripleToString(this.state.selectedFrom)}
        </div>
      )
    } else {
      return (
        <div style={{float: 'left'}}>
          <CustomDatePicker
            passedState={this.state.stateFrom}
            monthCallback={(d) => this.setMonthFrom(d)}
            callback={(d) => this.selectFrom(d)}
          />
        </div>
      )
    }
  }

  renderTo() {
    if(this.state.selectedTo) {
      return (
        <div style={{
            float: 'left',
            width: '252px',
            textAlign: 'center',
            verticalAlign: 'middle',
            marginTop: '53px',
            border: 'solid #ddd 1px',
            height: '196px',
            borderRadius: '10px',
            paddingTop: '80px'
        }}>
          {this.dateTripleToString(this.state.selectedTo)}
        </div>
      )
    } else {
      return (
        <div style={{float: 'left'}}>
          <CustomDatePicker
            passedState={this.state.stateTo}
            monthCallback={(d) => this.setMonthTo(d)}
            callback={(d) => this.selectTo(d)}
          />
        </div>
      )
    }
  }

  renderDatePickers() {
    if(this.state.showAt) {
      return (
        <DatePickerPopup onClose={() => this.closeAt()}>
          <CustomDatePicker
            passedState={this.state.stateAt}
            monthCallback={(d) => this.setMonthAt(d)}
            callback={(d) => this.selectAt(d)}
          />
        </DatePickerPopup>
      )
    } else if(this.state.showFromTo) {
      return (
        <DatePickerPopup onClose={() => this.closeFromTo()}>
          {this.renderFrom()}
          <div style={{float: 'left', padding: '150px 30px 0px 30px', fontSize: '30px'}}>-</div>
          {this.renderTo()}
        </DatePickerPopup>
      )
    }
  }

  render () {
    return (
      <div className='form-item'>
        <div>
          <div className='col1of3'>
            <div style={{marginRight: '30px'}}>
              <input onChange={(e) => this.setText(e)} type='text' name={this.props.name} value={this.state.text} style={{width: '100%'}}/>
            </div>
          </div>
          <div className='col2of3'>
            <div onClick={(e) => this.showAt()} className='button' style={{marginLeft: '10px', marginTop: '2px', display: 'inline-block'}}>
              <i className='fa fa-calendar'></i>
            </div>
            <div onClick={(e) => this.showFromTo()} className='button' style={{marginLeft: '10px', marginTop: '2px', display: 'inline-block'}}>
              <i className='fa fa-calendar'></i>
              {' - '}
              <i className='fa fa-calendar'></i>
            </div>
          </div>
        </div>
        {this.renderDatePickers()}
      </div>
    )
    // <input type='text' value={this.state.text} />

    // <CustomDatePicker
    //   passedState={this.state.datePickerState}
    //   monthCallback={(d) => this.setMonth(d)}
    //   callback={(d) => {}}
    //   onClose={() => {}}
    // />

  }
}

module.exports = InputTextDateNew
