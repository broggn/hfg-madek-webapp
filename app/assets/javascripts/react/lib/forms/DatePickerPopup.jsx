import React from 'react';
import ReactDOM from 'react-dom';

class DatePickerPopup extends React.Component {

  constructor(props) {
    super(props)
    this._boundHandleClickOutside = this._handleClickOutside.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mousedown', this._boundHandleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this._boundHandleClickOutside);
  }

  _handleClickOutside(event) {
    if (!this.reference.contains(event.target)) {
      this.props.onClose()
    }
  }

  render () {
    return (
      <div ref={(ref) => this.reference = ref} style={{
          clear: 'both',
          position: 'absolute',
          zIndex: '1000',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '5px',
          top: '60px'
      }}>
        {this.props.children}
      </div>
    )
  }
}

module.exports = DatePickerPopup
