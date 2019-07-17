import React from 'react'
// import f from 'lodash'
// import setUrlParams from '../../../lib/set-params-for-url.coffee'
// import AppRequest from '../../../lib/app-request.coffee'
// import asyncWhile from 'async/whilst'
// import { parse as parseUrl } from 'url'
// import { parse as parseQuery } from 'qs'
// import Moment from 'moment'
// import currentLocale from '../../../lib/current-locale'
const UI = require('../../ui-components/index.coffee')
import SubSection from '../../ui-components/SubSection'
// import ui from '../../lib/ui.coffee'
// const t = ui.t

const UI_TXT = {
  feature_title: 'Prozess',

  associated_collections_title: 'Set mit Inhalten',
  associated_collections_explain: `
    In diesem Set enthaltene Inhalte können vor dem Abschluss nur als Teil dieses Prozesses
    bearbeitet werden.
  `,
  associated_collections_upload: 'Medien hinzufügen',

  responsible_people_title: 'Beteiligte Personen',

  common_settings_title: 'Gemeinsamer Datensatz',
  common_settings_explain: `
    Diese Daten und Einstellungen gelten für alle enthaltenen Inhalte und werden bei
    Prozessabschluss permanent angewendet.
  `,
  common_settings_permissions_title: 'Berechtigungen',
  common_settings_permissions_responsible: 'Verantwortlich',
  common_settings_permissions_write: 'Schreib- und Leserechte',
  common_settings_permissions_read: 'Nur Leserechte',
  common_settings_permissions_read_public: 'Öffentlicher Zugriff',
  common_settings_metadata_title: 'MetaDaten',

  actions_back: 'Zurück',
  actions_validate: 'Prüfen',
  actions_finish: 'Abschliessen…'
}

const WORKFLOW_STATES = { IN_PROGRESS: 'IN_PROGRESS', FINISHED: 'FINISHED' }

const WorkflowEdit = ({ get }) => {
  const { name, status, responsible_people, common_settings } = get
  return (
    <section className="ui-container bright bordered rounded mas pam">
      <header>
        <span style={{ textTransform: 'uppercase', fontSize: '85%', letterSpacing: '0.15em' }}>
          {UI_TXT['feature_title']}
        </span>
        <h1 className="title-l" style={{ lineHeight: '1.34' }}>
          {name}
        </h1>
      </header>

      <div>
        <SubSection>
          <SubSection.Title tag="h2" className="title-m mts">
            {UI_TXT['associated_collections_title']}
          </SubSection.Title>

          <Explainer>{UI_TXT['associated_collections_explain']}</Explainer>

          <div>
            <div className="ui-resources miniature" style={{ margin: 0 }}>
              <DummySetThumb />
            </div>

            <div className="button-group small mas">
              <a className="tertiary-button" href="#/my/upload">
                <span>
                  <i className="icon-upload"></i>
                </span>{' '}
                {UI_TXT['associated_collections_upload']}
              </a>
            </div>
          </div>
        </SubSection>

        <SubSection>
          <SubSection.Title tag="h2" className="title-m mts">
            {UI_TXT['responsible_people_title']}
          </SubSection.Title>
          <UI.TagCloud mod="person" mods="small" list={UI.labelize(responsible_people)} />
        </SubSection>

        <SubSection>
          <SubSection.Title tag="h2" className="title-m mts">
            {UI_TXT['common_settings_title']}
          </SubSection.Title>

          <Explainer>{UI_TXT['common_settings_explain']}</Explainer>

          <SubSection open>
            <SubSection.Title tag="h3" className="title-s mts">
              {UI_TXT['common_settings_permissions_title']}
              {'  '}
              <small>
                <a href="#edit-permissions">
                  <i className="icon-pen" />
                </a>
              </small>
            </SubSection.Title>

            <ul>
              <li>
                <span className="title-s">
                  {UI_TXT['common_settings_permissions_responsible']}:{' '}
                </span>
                <UI.TagCloud
                  mod="person"
                  mods="small inline"
                  list={UI.labelize([common_settings.permissions.responsible])}
                />
              </li>
              <li>
                <span className="title-s">
                  {UI_TXT['common_settings_permissions_write']}
                  {': '}
                </span>
                <UI.TagCloud
                  mod="person"
                  mods="small inline"
                  list={UI.labelize(common_settings.permissions.write)}
                />
              </li>
              <li>
                <span className="title-s">
                  {UI_TXT['common_settings_permissions_read']}
                  {': '}
                </span>
                <UI.TagCloud
                  mod="person"
                  mods="small inline"
                  list={UI.labelize(common_settings.permissions.read)}
                />
              </li>
              <li>
                <span className="title-s">
                  {UI_TXT['common_settings_permissions_read_public']}
                  {': '}
                </span>
                {common_settings.permissions.read_public ? (
                  <i className="icon-checkmark" title="Ja" />
                ) : (
                  <i className="icon-close" title="Nein" />
                )}
              </li>
            </ul>
          </SubSection>

          <SubSection open>
            <SubSection.Title tag="h3" className="title-s mts">
              {UI_TXT['common_settings_metadata_title']}
              {'  '}
              <small>
                <a href="#edit-metadata">
                  <i className="icon-pen" />
                </a>
              </small>
            </SubSection.Title>

            <ul>
              {common_settings.meta_data.map(({ key, value }) => (
                <li key={key}>
                  <b>{key}:</b> {value}
                </li>
              ))}
            </ul>
          </SubSection>
        </SubSection>
      </div>

      <div className="ui-actions phl pbl mtl">
        <a className="link weak" href="/my/workflows">
          {UI_TXT['actions_back']}
        </a>
        {/*
        <button className="tertiary-button large" type="button">
          {UI_TXT['actions_validate']}
        </button>
        */}
        {status === WORKFLOW_STATES.IN_PROGRESS && (
          <button className="primary-button large" type="button">
            {UI_TXT['actions_finish']}
          </button>
        )}
      </div>
      <hr />
      {/* <pre>{JSON.stringify(get, 0, 2)}</pre> */}
    </section>
  )
}

module.exports = WorkflowEdit

const DummySetThumb = () => (
  <div className="ui-resource">
    <div className="ui-resource-body">
      <div className="media-set ui-thumbnail">
        <div className="ui-thumbnail-privacy">
          <i title="private" className="icon-privacy-private" />
        </div>
        <a
          className="link ui-thumbnail-image-wrapper ui-link"
          href="#/sets/d0ca4caf-2ae0-4481-b322-79ae4a53d93e"
          target="_blank"
          title="socospa-1">
          <div className="ui-thumbnail-image-holder">
            <div className="ui-thumbnail-table-image-holder">
              <div className="ui-thumbnail-cell-image-holder">
                <div className="ui-thumbnail-inner-image-holder">
                  <img
                    src="/media/d029c4b2-7796-41c6-9044-5b1e286ef7c6"
                    alt="Bild:  socospa-1"
                    className="ui-thumbnail-image ui_picture"
                    title="socospa-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </a>
        <div className="ui-thumbnail-meta">
          <h3 className="ui-thumbnail-meta-title">socospa-1</h3>
          <h4 className="ui-thumbnail-meta-subtitle" />
        </div>
        <div className="ui-thumbnail-actions">
          <ul className="left by-left">
            <li className="ui-thumbnail-action">
              <span className="js-only">
                <a className="link ui-thumbnail-action-checkbox ui-link" title="auswählen">
                  <i className="icon-checkbox" />
                </a>
              </span>
            </li>
            <li className="ui-thumbnail-action">
              <a className="ui-thumbnail-action-favorite" data-pending="false">
                <i className="icon-star" />
              </a>
            </li>
          </ul>
          <ul className="right by-right">
            <li className="ui-thumbnail-action">
              <a
                className="ui-thumbnail-action-favorite"
                href="#/sets/d0ca4caf-2ae0-4481-b322-79ae4a53d93e/meta_data/edit/by_context">
                <i className="icon-pen" />
              </a>
            </li>
            <li className="ui-thumbnail-action">
              <a className="ui-thumbnail-action-favorite">
                <i className="icon-trash" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

const Explainer = ({ children }) => (
  <p className="paragraph-s mts measure-wide" style={{ fontStyle: 'italic' }}>
    {children}
  </p>
)
