/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react'
import createReactClass from 'create-react-class'
import f from 'active-lodash'
import Dropdown, { MenuItem } from '../../ui-components/Dropdown.jsx'

module.exports = createReactClass({
  displayName: 'SortDropdown',

  _onItemClick(event, itemKey) {
    // event.preventDefault()
    if (this.props.onItemClick) {
      return this.props.onItemClick(event, itemKey)
    }
  },

  render() {
    let { selectedKey } = this.props
    let selectedItem = f.find(this.props.items, { key: selectedKey })
    if (!selectedItem) {
      selectedKey = this.props.items[0].key
      selectedItem = f.find(this.props.items, { key: selectedKey })
    }

    return (
      <Dropdown mods="stick-right" toggle={selectedItem.label}>
        <Dropdown.Menu className="ui-drop-menu">
          {f.map(this.props.items, item => {
            if (item.key === selectedKey) {
              return
            }
            return (
              <MenuItem
                key={item.key}
                onClick={event => this._onItemClick(event, item.key)}
                href={item.href}>
                {item.label}
              </MenuItem>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
})
