import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import f from 'active-lodash'
import cx from 'classnames'
import url from 'url'
import jQuery from 'jquery'
import t from '../../../lib/i18n-translate'

export default class PersonFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const {
      inputField,
      props: { staticItems, onSelect }
    } = this

    const typeaheadOptions = getTypeaheadOptions(staticItems)
    const dataSet = getDataSet(staticItems)

    // eslint-disable-next-line react/no-find-dom-node
    const domNode = ReactDOM.findDOMNode(inputField)
    const jqNode = jQuery(domNode)
    require('@eins78/typeahead.js/dist/typeahead.jquery.js')
    const typeahead = jqNode.typeahead(typeaheadOptions, dataSet)

    // TODO: why is this needed?
    typeahead.on('typeahead:select typeahead:autocomplete', (event, item) => {
      event.preventDefault()
      jqNode.typeahead('val', '')
      onSelect(item)
    })
  }

  render() {
    const {
      props: { label, staticItems, className, onClear, withTitle }
    } = this

    const selection = f.filter(staticItems, 'selected')
    const clear = (selected, event) => {
      event.preventDefault()
      onClear(selected)
    }

    return (
      <ul className={className}>
        {withTitle && (
          <li key="title" className="ui-side-filter-lvl3-item ptx plm" style={{ fontSize: '12px' }}>
            <strong>{t('dynamic_filters_person_header')}</strong>
          </li>
        )}

        <li key="input" className="ui-side-filter-lvl3-item">
          <div style={{ position: 'relative' }}>
            <input
              ref={el => (this.inputField = el)}
              type="text"
              placeholder={`${t('dynamic_filters_search_for')} ${label}...`}
              className="typeahead block"
            />
          </div>
        </li>

        {f.map(selection, selected => (
          <li
            key={'uuid_' + selected.uuid}
            className={cx('ui-side-filter-lvl3-item', { active: true })}>
            <a className="link weak ui-link" onClick={event => clear(selected, event)}>
              {selected.label}
              {selected.label && <span className="ui-lvl3-item-count">{selected.count}</span>}
            </a>
          </li>
        ))}
      </ul>
    )
  }
}

// typeahead plumbing

function getTypeaheadOptions(staticItems) {
  return {
    hint: false,
    highlight: true,
    minLength: staticItems ? 0 : 1,
    classNames: {
      wrapper: 'ui-autocomplete-holder',
      input: 'ui-typeahead-input',
      hint: 'ui-autocomplete-hint',
      menu: 'ui-autocomplete ui-menu ui-autocomplete-open-width ui-autocomplete-top-margin-2',
      cursor: 'ui-autocomplete-cursor',
      suggestion: 'ui-menu-item'
    }
  }
}

function getStaticDataSource(staticItems) {
  return (term, callback) => {
    const isMatch =
      term.length === 0 ? () => true : u => u.label.toLowerCase().indexOf(term.toLowerCase()) >= 0
    const result = f.filter(staticItems, user => !user.selected && isMatch(user))
    callback(result)
  }
}

function getRemoteDataSource() {
  /* const resourceUrl = url.format({
    pathname: '/people',
    query: { meta_key_id: 'madek_core:authors', search_term: '__SEARCH_TERM__' }
  }) */
  const resourceUrl =
    document.location.href +
    '&context_key_id=8ac0a6b5-0d59-4c67-8614-58aa667a8064&search_term=__SEARCH_TERM__' +
    '&list%5Bsparse_filter%5D=true&___sparse=%7B%22dynamic_filters%22%3A%7B%22section_group_meta_data%22%3A%7B%7D%7D%7D'
  const Bloodhound = require('@eins78/typeahead.js/dist/bloodhound.js')
  const tokenizer = s => Bloodhound.tokenizers.whitespace((s || '').trim())
  return new Bloodhound({
    datumTokenizer: tokenizer,
    queryTokenizer: tokenizer,
    remote: {
      url: resourceUrl,
      wildcard: '__SEARCH_TERM__',
      transform: data => {
        const context = data.dynamic_filters.section_group_meta_data.find(
          x => x.label === 'Personen'
        ) || { children: [] }
        const contextKey = context.children[0] || { children: [] }
        return contextKey.children
      }
    }
  })
}

function getDataSet(staticItems) {
  return {
    name: 'people',
    templates: {
      pending: '<div class="ui-preloader small" style="height: 1.5em"></div>',
      notFound: '<div class="ui-autocomplete-empty">' + t('app_autocomplete_no_results') + '</div>',
      suggestion: value =>
        `<div class="ui-autocomplete-override-sidebar ui-autocomplete-override-sidebar--with-number">` +
        `<div class="ui-autocomplete-override-sidebar__label">${value.label}</div>` +
        `<div class="ui-autocomplete-override-sidebar__number">${value.count || '0'}<div>` +
        `</div>`
    },
    limit: 20,
    source: staticItems ? getStaticDataSource(staticItems) : getRemoteDataSource()
  }
}
