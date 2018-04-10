const React = require('react')
const f = require('active-lodash')
// const cx = require('classnames')
// const t = require('../../../lib/i18n-translate.js')

// const MediaPlayer = require('../../ui-components/MediaPlayer.cjsx')
const MediaEntryPreview = require('../../decorators/MediaEntryPreview.jsx')

const CAPTION_HEIGHT = 55 // absolute heigth of tile caption in pixels

// eslint-disable-next-line react/no-deprecated
module.exports = React.createClass({
  displayName: 'Views.MediaEntryEmbedded',
  propTypes: {
    // eslint-disable-next-line react/no-deprecated
    get: React.PropTypes.shape({
      // eslint-disable-next-line react/no-deprecated
      media_file: React.PropTypes.object.isRequired
    }).isRequired
  },

  render({ get } = this.props) {
    // const { image_url, caption_text, media_type, type, media_file, embed_config } = get
    const { caption_text, media_type, embed_config } = get
    if (!media_type == 'video') throw new Error('only videos supported!')
    // const { previews, original_file_url } = media_file

    // const hasPlayer = media_type == 'audio' || media_type == 'video'

    const defaultSize = {
      width: 500,
      height: media_type == 'audio' ? 200 : 500
    }

    const eWidth = embed_config.width || defaultSize.width
    const eHeight = embed_config.height || defaultSize.height

    // for tile body and footer
    // const linkProps = { href: get.url, target: '_blank' }
    // let style = {
    //   maxWidth: eWidth > 0 ? eWidth + 'px' : null,
    //   maxHeight: eHeight > 0 ? eHeight + 'px' : null,
    //   overflow: 'hidden'
    // }
    //
    // const bodyStyle = {
    //   height: eHeight > 0 ? eHeight - CAPTION_HEIGHT + 'px' : void 0,
    //   width: eWidth > 0 ? eWidth + 'px' : void 0,
    //   boxShadow: '0 0 150px #575757 inset',
    //   display: 'table-cell',
    //   verticalAlign: 'middle',
    //   textAlign: 'center'
    // }

    // // TODO: choose appropriate sizes (instad of largest)
    // const poster = f
    //   .chain(previews.images)
    //   .sortBy('heigth')
    //   .last()
    //   .get('url')
    //   .run()

    const fullsize = {
      height: eHeight - CAPTION_HEIGHT + 'px',
      width: eWidth + 'px'
    }

    let mediaProps

    switch (media_type) {
      case 'image':
      case 'document':
        // style = f.assign({}, style, {
        //   width: eWidth > 0 ? eWidth + 'px' : void 0,
        //   height: eHeight > 0 ? eHeight + 'px' : void 0
        // })
        mediaProps = {
          style: {
            maxWidth: eWidth + 'px',
            maxHeight: eHeight - 1 * CAPTION_HEIGHT + 'px',
            minWidth: '100px',
            minHeight: '100px'
          }
        }
        break
      case 'video':
        mediaProps = f.merge(fullsize, {
          options: {
            fluid: false,
            height: eHeight - CAPTION_HEIGHT,
            width: eWidth
          }
        })
        break
      default:
        mediaProps = fullsize
    }

    const mediaPreview = (
      <MediaEntryPreview get={get} mediaProps={mediaProps} captionText={caption_text} />
    )
    return mediaPreview

    // return (
    //   <div style={style}>
    //     <div className="ui-tile" style={{ display: 'block' }}>
    //       <div className="ui-tile__body" style={bodyStyle}>
    //         {hasPlayer ? mediaPreview : <a {...linkProps}>{mediaPreview}</a>}
    //       </div>
    //       <a className="ui-tile__foot" {...linkProps}>
    //         <h3 className="ui-tile__title">{caption_text[0]}</h3>
    //         <h4 className="ui-tile__meta">
    //           <span>{caption_text[1]}</span>
    //         </h4>
    //         <span className="ui-tile__flags">
    //           <i className="icon-link ui-tile__flag ui-tile__flag--type" />
    //         </span>
    //       </a>
    //     </div>
    //   </div>
    // )
  }
})
