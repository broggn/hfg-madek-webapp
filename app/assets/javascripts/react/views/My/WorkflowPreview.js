import React from 'react'
import f from 'active-lodash'
import t from '../../../lib/i18n-translate'
import cx from 'classnames'

import MetaDataByListing from '../../decorators/MetaDataByListing.cjsx'
import ResourceThumbnail from '../../decorators/ResourceThumbnail.cjsx'
import Renderer from '../../decorators/metadataedit/MetadataEditRenderer.cjsx'
import Link from '../../ui-components/Link.cjsx'
import RailsForm from '../../lib/forms/rails-form.cjsx'

class WorkflowPreview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      models: [],
      errors: [],
      bundleState: false
    }
  }

  _batchConflictByMetaKey() {

  }

  render() {
    const { get } = this.props
    const supHeadStyle = { textTransform: 'uppercase', fontSize: '85%', letterSpacing: '0.15em' }

    return (
      <section className="ui-container bright bordered rounded mas pam">
        <header>
          <span style={supHeadStyle}>{'Workflow'}</span>
        </header>
        {/*<Link href={get.actions.edit.url}>&larr; Go back to workflow</Link>*/}

        <RailsForm
          ref='form'
          name='resource_meta_data'
          action={get.actions.finish.url}
          method={get.actions.finish.method}
          authToken={this.props.authToken}
        >

          {get.child_resources.map((childResource, i) => {
            console.log('childResource', childResource)
            const { meta_data, meta_meta_data, workflow, resource, type } = childResource
            const { meta_key_by_meta_key_id, mandatory_by_meta_key_id } = meta_meta_data

            return (
              <div className='ui-container bordered pal mbs' key={i}>
                <span style={supHeadStyle}>{type}</span>
                <div className='app-body-sidebar table-cell ui-container table-side prm'>
                  {Renderer._renderThumbnail(resource, false)}
                </div>
                <div className='app-body-content table-cell ui-container table-substance ui-container'>
                  {f.map(meta_key_by_meta_key_id, (meta_key, meta_key_id) => {
                    if(f.isEmpty(meta_data.meta_datum_by_meta_key_id[meta_key_id].values) && !f.has(mandatory_by_meta_key_id, meta_key_id) && !f.includes(f.map(workflow.common_settings.meta_data, 'meta_key.uuid'), meta_key_id)) {
                      return null
                    }

                    const model = {
                      meta_key: meta_key,
                      values: meta_data.meta_datum_by_meta_key_id[meta_key_id].values || []
                    }
                    model.originalValues = model.values
                    const cssClass = cx('ui-form-group prh columned', {'error': f.has(mandatory_by_meta_key_id, meta_key_id)})
                    const fieldName = `meta_data[${type}][${resource.uuid}]`

                    return (
                      <fieldset className={cssClass} key={meta_key_id}>
                        {Renderer._renderLabelByVocabularies(meta_meta_data, meta_key_id)}
                        {Renderer._renderValueByContext((values) => console.log(meta_key_id, values), fieldName, null, meta_key, false, model, workflow)}
                      </fieldset>
                    )
                  }
                  )}
                </div>

              </div>
            )
          })}

          <div className='ui-actions pts pbs'>
            <a className='link weak' href={get.actions.edit.url}>
              {'Go back'}
            </a>
            <button type='submit' className='button primary-button large'>
              {'Finish…'}
            </button>
          </div>

        </RailsForm>
      </section>
    )
  }
}

module.exports = WorkflowPreview
