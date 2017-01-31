import React from 'react'
import chunk from 'lodash/chunk'
import last from 'lodash/last'
import sortBy from 'lodash/sortBy'

import PageHeader from '../../ui-components/PageHeader'
import PageContent from '../PageContent.cjsx'

import VocabTitleLink from '../../ui-components/VocabTitleLink.cjsx'

const COLS = 2

module.exports = React.createClass({
  displayName: 'VocabulariesIndex',

  render () {
    const {title, resources} = this.props.get
    const vocabularies = sortBy(resources, 'position')
      .map(({vocabulary, meta_keys}) => ({...vocabulary, meta_keys}))
    const vocabularyRows = chunk(vocabularies, COLS)

    return <PageContent>

      <PageHeader title={title} icon='tags' />

      <div className='bright ui-container pal bordered rounded-bottom rounded-right'>
        {vocabularyRows.map((row, i) =>
          <div className='row' key={i}>

            {row.map(({uuid, label, description, meta_keys, url}) =>
              <div className={`col1of${COLS}`} key={url}>
                <div className='prm mbl'>
                  <VocabTitleLink hi='h2' text={label} href={url}
                    className='title-l separated light mbm' />
                  <p>{description || '(Keine Beschreibung)'}</p>
                  <p className='mts'>
                    <ol className='inline'>
                      {meta_keys.map(({uuid, label, description, url}, i, a) =>
                        <li key={uuid}>
                          <a href={url}>{label || last(uuid.split(':'))}</a>
                        </li>
                      )}
                    </ol>
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </PageContent>
  }
})
