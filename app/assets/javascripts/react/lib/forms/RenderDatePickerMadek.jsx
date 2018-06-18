import React from 'react';
import ReactDOM from 'react-dom';
import DatePickerUtil from './DatePickerUtil.jsx'

class RenderDatePickerMadek extends React.Component {

  constructor(props) {
    super(props)
  }

  getMonthText() {
    return [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember'
    ][this.props.month]

  }

  util() {
    return DatePickerUtil.createUtil(this.props.year, this.props.month)
  }

  _renderNumber(index, row, rowCount, col, colCount, isValidDay) {
    if(isValidDay) {
      return (
        <div key={'day_' + index} onClick={(event) => this.props._select(event, index)} className='DayPicker-Day' tabIndex='0' role='gridcell' aria-disabled='false' aria-selected='false'>{index + 1}</div>
      )
    } else {
      return (
        <div key={'day_' + index} role='gridcell' aria-disabled='true' className='DayPicker-Day DayPicker-Day--outside'></div>
      )
    }
  }

  renderWeekDays(week) {
    return this.util().renderWeekDays(week, (index, row, rowCount, col, colCount, isValidDay) => {
      return this._renderNumber(index, row, rowCount, col, colCount, isValidDay)
    })
  }

  renderCalendar() {
    return this.util().renderWeeks((week) => {
      return (
        <div key={'week_' + week} className='DayPicker-Week' role='gridcell'>
          {this.renderWeekDays(week)}
        </div>
      )
    })
  }

  render() {
    return (
      <div>
        <div>
          <div value='' className='DayPicker' role='application' lang='de' tabIndex='0'>
            <div className='DayPicker-NavBar'>
              <span onClick={(e) => this.props._previous(e)} role='button' className='DayPicker-NavButton DayPicker-NavButton--prev'></span>
              <span onClick={(e) => this.props._next(e)} role='button' className='DayPicker-NavButton DayPicker-NavButton--next'></span>
            </div>
            <div className='DayPicker-Month'>
              <div className='DayPicker-Caption' role='heading'>{this.getMonthText()} {this.props.year}</div>
              <div className='DayPicker-Weekdays' role='rowgroup'>
                <div className='DayPicker-WeekdaysRow' role='columnheader'>
                  <div className='DayPicker-Weekday'><abbr title='Montag'>Mo</abbr></div>
                  <div className='DayPicker-Weekday'><abbr title='Dienstag'>Di</abbr></div>
                  <div className='DayPicker-Weekday'><abbr title='Mittwoch'>Mi</abbr></div>
                  <div className='DayPicker-Weekday'><abbr title='Donnerstag'>Do</abbr></div>
                  <div className='DayPicker-Weekday'><abbr title='Freitag'>Fr</abbr></div>
                  <div className='DayPicker-Weekday'><abbr title='Samstag'>Sa</abbr></div>
                  <div className='DayPicker-Weekday'><abbr title='Sonntag'>So</abbr></div>
                </div>
              </div>
              <div className='DayPicker-Body' role='grid'>
                {this.renderCalendar()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = RenderDatePickerMadek
