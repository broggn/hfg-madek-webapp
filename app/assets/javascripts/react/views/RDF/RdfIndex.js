import React from 'react'
import f from 'lodash'

import PageHeader from '../../ui-components/PageHeader'
import PageContent from '../PageContent.cjsx'

// import VocabTitleLink from '../../ui-components/VocabTitleLink.cjsx'
//
// const COLS = 2

const RDFIndex = React.createClass({
  displayName: 'RDFIndex',

  render () {
    const rdfTypes = this.props.get
    // const {title, resources} = this.props.get
    // const vocabularies = sortBy(resources, 'position')
    //   .map(({vocabulary, meta_keys}) => ({...vocabulary, meta_keys}))
    // const vocabularyRows = chunk(vocabularies, COLS)

    return <PageContent>

      <PageHeader title={'RDF'} icon='tags' />

      <div className='bright ui-container pal bordered rounded-bottom rounded-right'>
        {rdfTypes.map(({name, keys, parents}) =>
          <div key={name}>

            <h1 className='title-l'>{name}</h1>

            {parents &&
              <h4 className='title-lm'>
                <span className='breadcrumbs'>
                  {parents.map((p) => <span><a href={`/rdf/${p}`}>{p}</a> &gt; </span>)}
                  <a href='/rdf/MediaEntry'>{name}</a>
                </span>
              </h4>
            }

            <p className='mtm mbs'>
              {'Madek Application Resource, the "entry" for a specific uploaded file.'}
            </p>

            <table className='block' style={{maxWidth: '64em'}}>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Expected Type</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                <tr className='supertype'>
                  <th className='supertype-name' colSpan='3'>Properties from <a href='/rdf/MediaEntry'>MediaEntry</a></th>
                </tr>
              </tbody>

              <tbody className='supertype'>
                {false && keys.map((key) =>
                  <tr>
                    <th className='prop-nam' scope='row'>
                      <code data-rdf-property='rdfs:label'><a href='/about'>about</a></code>
                    </th>
                    <td className='prop-ect'>
                      <link data-rdf-property='rangeIncludes' href='http://schema.org/Thing' /><a href='/Thing'>Thing</a>&nbsp;
                      <link data-rdf-property='domainIncludes' href='http://schema.org/CommunicateAction' />
                      <link data-rdf-property='domainIncludes' href='http://schema.org/CreativeWork' />
                    </td>
                    <td className='prop-desc' data-rdf-property='rdfs:comment'>The subject matter of the content.</td>
                  </tr>
                )}

                {/* first parent header? */}
                {false && parents && tableHeader(parents[0])}

              </tbody>

              {parents && parents.map((p, i) => {
                const parent = f.find(rdfTypes, {name: p})

                return (<tbody className='supertype'>

                  {parent.keys.map((id, label, description) =>
                    <tr>
                      <th className='prop-nam' scope='row'>
                        <code><a href={`/rdf/${id}`}>{id}</a></code>
                      </th>

                      <td className='prop-ect'><a href='/Text'>Text</a>&nbsp;</td>

                      <td className='prop-desc'><b>{label}</b><br />{description}</td>

                    </tr>
                  )}

                  {/* next parent header? */}
                  {false && parents[i + 1] && tableHeader(parents[i + 1])}

                </tbody>)
              })}

            </table>
          </div>
        )}

        {/* <p className='version'><b>Schema Version 3.1</b></p> */}

      </div>
    </PageContent>
  }
})

module.exports = RDFIndex

const tableHeader = (p) =>
  <tr className='supertype'>
    <th className='supertype-name' colSpan='3'>Properties from <a href={`/${p}`}>{p}</a></th>
  </tr>
