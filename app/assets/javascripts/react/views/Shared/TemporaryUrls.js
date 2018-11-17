import React from 'react'
import ReactDOM from 'react-dom'
import RailsForm from '../../lib/forms/rails-form.cjsx'
import PageHeader from '../../ui-components/PageHeader'
import f from 'lodash'
import Moment from 'moment'
import ui from '../../lib/ui.coffee'
import currentLocale from '../../../lib/current-locale'
import Link from '../../ui-components/Link.cjsx'
const t = ui.t

const UI = require('../../ui-components/index.coffee')

// config
const SECTIONS = [{ key: 'temporary_urls', name: 'Temporary URLs' }]

class TemporaryUrls extends React.Component {
  render() {
    const { get, authToken } = this.props
    const temporaryUrlsList = get.list
    const newAction = f.get(get, 'actions.new')
    const title = `Temporary URLs für "${get.resource.title}"`
    const backText = t('temporary_urls_back_to_' + f.kebabCase(get.type).replace('-', '_'))

    return (
      <div>
        <PageHeader icon={null} title={title} actions={null} />

        <div className='bright ui-container pal bordered rounded'>
          <div>
        <div className="ui-resources-holder pal">
          {SECTIONS.map(({ key, name }) => (
            <div className="ui-container pbl" key={key}>
              <div className="ui-resources-header">
                <h2 className="title-l ui-resources-title">{name}</h2>
              </div>
              <TemporaryUrlsList list={temporaryUrlsList} authToken={authToken} />
              {!!newAction && (
                <div className="mtl">
                  <UI.Button href={newAction.url} className="primary-button">
                    {t('temporary_urls_list_new_button')}
                  </UI.Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className='ui-actions phl pbl'>
          <a className='button' href={get.actions.go_back.url}> {backText} </a>
        </div>
      </div>
      </div>
      </div>
    )
  }
}

const TemporaryUrlsList = ({ list, authToken }) => {
  const revokedUrls = f.filter(list, 'revoked')
  const activeUrls = f.difference(list, revokedUrls)
  const allUrls = f.compact([
    [activeUrls],
    !f.isEmpty(revokedUrls) && [
      revokedUrls,
      t('temporary_urls_list_revoked_title')
    ]
  ])

  return (
    <div>
      {allUrls.map(([urls, label], i) => (
        <div key={i}>
          {!!label && <h4 className="title-s mtl mbm">{label}</h4>}
          <table className="ui-workgroups bordered block aligned">
            <thead>
              <tr>
                <td>
                  <span className="ui-resources-table-cell-content">
                    {t('temporary_urls_head_token')}
                  </span>
                </td>
                <td>
                  <span className="ui-resources-table-cell-content">
                    {t('temporary_urls_head_name')}
                  </span>
                </td>
                <td>
                  <span className="ui-resources-table-cell-content">
                    {t('temporary_urls_head_valid_since')}
                  </span>
                </td>
                <td>
                  <span className="ui-resources-table-cell-content">
                    {t('temporary_urls_head_valid_until')}
                  </span>
                </td>
                <td />
                <td />
              </tr>
            </thead>
            <tbody>
              {f.map(urls, url => (
                <TemporaryUrlRow key={url.uuid} {...url} authToken={authToken} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

const TemporaryUrlRow = ({ authToken, ...temporaryUrl }) => {
  Moment.locale(currentLocale())
  const { uuid, label, description, revoked } = temporaryUrl
  let creationDate, creationDateTitle, expirationDate, expirationDateTitle
  if (temporaryUrl.created_at) {
    creationDate = Moment(new Date(temporaryUrl.created_at)).calendar()
    creationDateTitle = t('temporary_urls_list_created_hint_pre') + temporaryUrl.created_at
  }
  if (temporaryUrl.expires_at) {
    expirationDate = Moment(new Date(temporaryUrl.expires_at)).fromNow()
    expirationDateTitle =
      t('temporary_urls_list_expires_hint_pre') + temporaryUrl.expires_at
  } else {
    expirationDate = t('temporary_urls_list_no_expiry')
    expirationDateTitle = `${t('temporary_urls_list_expires_hint_pre')}${expirationDate}`
  }
  const showAction = f.get(temporaryUrl, 'actions.show')
  const revokeAction = f.get(temporaryUrl, 'actions.revoke')
  const trStyle = !revoked ? {} : { opacity: 0.67 }

  return (
    <tr key={uuid} style={trStyle}>
      <td>{label}</td>
      <td>
        <div className="measure-narrow">
          {!f.isEmpty(description)
            ? description
            : t('temporary_urls_list_no_description')}
        </div>
      </td>
      <td>
        {!!creationDate && (
          <UI.Tooltipped text={creationDateTitle} id={`dtc.${uuid}`}>
            <span>{creationDate}</span>
          </UI.Tooltipped>
        )}
      </td>
      <td>
        {!!expirationDate && (
          <UI.Tooltipped text={expirationDateTitle} id={`dtc.${uuid}`}>
            <span>{expirationDate}</span>
          </UI.Tooltipped>
        )}
      </td>
      <td>
        {!!showAction && (
          <Link href={showAction.url}>{t('temporary_urls_list_show_url')}</Link>
        )}
      </td>
      <td className="ui-workgroup-actions">
        {!!revokeAction && (
          <RailsForm
            name={'temporary_url'}
            authToken={authToken}
            method={revokeAction.method}
            action={revokeAction.url}
          >
            <input name="temporary_url[revoked]" value="true" type="hidden" />
            <UI.Tooltipped
              text={t('temporary_urls_list_revoke_btn_hint')}
              id={`btnrv.${uuid}`}
            >
              <button
                className="button"
                type="submit"
                data-confirm={t('temporary_urls_list_revoke_confirm')}
              >
                <i className="fa fa-ban" />
              </button>
            </UI.Tooltipped>
          </RailsForm>
        )}
      </td>
    </tr>
  )
}

module.exports = TemporaryUrls
TemporaryUrls.TemporaryUrlRow = TemporaryUrlRow
