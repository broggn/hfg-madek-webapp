import React from 'react'
// import videojs from 'video.js' // FIXME: crashes server, required on mount!
import cx from 'classnames'
import omit from 'lodash/omit'
import merge from 'lodash/merge'
import endsWith from 'lodash/endsWith'

// const fake = (
//   <div
//     className="vjs-titlebar"
//     style="position: absolute; top: 0px; width: 100%; background: rgba(0, 0, 0, 0.5) none repeat scroll 0% 0%; font-size: 5vh; padding: 3vh;height: 16vh;">
//     <div
//       className="vjs-titlebar-logo"
//       style="width: 10vh;height: 10vh;position: absolute;font-family: &quot;Helvetica Neue&quot;;font-weight: 900;font-size: 8vh;line-height: 9vh;text-align: center;">
//       Z
//     </div>
//     <div
//       className="vjs-titlebar-title"
//       style="display: inline-block;padding-left: 13vh;position: relative;">
//       {'"Athena", Sonia Tao, Fabian Keller'}
//     </div>
//     <div
//       className="vjs-titlebar-subtitle"
//       style="position: absolute;padding-left: 13vh;font-size: 0.67em;line-height: 1.45;">
//       {'Sonia Tao, Fabian Keller, Andreas Kohli, Andreas Hofer'}
//     </div>
//   </div>
// )

function titleBarPlugin({ logo, title, subtitle }) {
  const Dom = document.createElement.bind(document)
  const player = this
  const overlay = {
    el: Dom('div'),
    logo: Dom('div'),
    caption: Dom('div'),
    title: Dom('div'),
    subtitle: Dom('div')
  }
  overlay.el.className = 'vjs-titlebar'
  overlay.caption.className = 'vjs-titlebar-caption'
  overlay.title.className = 'vjs-titlebar-title'
  overlay.subtitle.className = 'vjs-titlebar-subtitle'
  if (logo) {
    overlay.logo.className = 'vjs-titlebar-logo'
  }

  overlay.title.textContent = title
  overlay.subtitle.textContent = subtitle

  overlay.caption.appendChild(overlay.title)
  overlay.caption.appendChild(overlay.subtitle)

  overlay.el.appendChild(overlay.caption)
  overlay.el.appendChild(overlay.logo)

  player.el().appendChild(overlay.el)
  // TODO: hide on play, like control bar
}

const DEFAULT_OPTIONS = {
  fluid: true,
  controlBar: {
    children: [
      'playToggle',
      'currentTimeDisplay',
      'timeDivider',
      'durationDisplay',
      'progressControl',
      'liveDisplay',
      'remainingTimeDisplay',
      'customControlSpacer',
      'muteToggle',
      'volumeControl',
      'playbackRateMenuButton',
      'chaptersButton',
      'descriptionsButton',
      'subtitlesButton',
      'captionsButton',
      'audioTrackButton',
      'fullscreenToggle'
    ]
  }
}

const sourceLabel = ({ profile }) => (endsWith(profile, '_HD') ? 'HD' : 'SD')

class VideoJS extends React.Component {
  componentDidMount() {
    // eslint-disable-next-line react/no-string-refs
    const videoTag = this.refs.video
    if (!videoTag) throw new Error('no video tag!')

    const playerOptions = merge(DEFAULT_OPTIONS, this.props.options, {
      // NOTE: new source list because it must include config for HD-toggle
      sources: this.props.sources.map(source => ({
        src: source.url,
        type: source.content_type,
        label: sourceLabel(source),
        res: source.height
      })),
      plugins: {
        videoJsResolutionSwitcher: { default: 'low', dynamicLabel: true },
        titleBar: {
          title: this.props.captionText[0],
          subtitle: this.props.captionText[1],
          logo: 'Z'
        }
      }
    })

    // init:
    const videojs = require('video.js')
    window.videojs = videojs
    require('videojs-resolution-switcher')
    videojs.plugin('titleBar', titleBarPlugin)
    this.player = videojs(videoTag, playerOptions)
  }

  render({ props } = this) {
    const { sources, ...restProps } = props
    const videoProps = omit(restProps, 'options', 'caption')

    const classes = cx(
      this.props.className,
      'videojs',
      'video-js',
      'video-fluid',
      'vjs-default-skin',
      'vjs-16-9'
    )

    const playerContent = ( // eslint-disable-next-line react/no-string-refs
      <video ref="video" {...videoProps} className={classes}>
        {sources.map(source => (
          <source
            src={source.url}
            type={source.content_type}
            key={`${source.url}${source.content_type}`}
          />
        ))}
      </video>
    )

    // wrap the player in a div with a `data-vjs-player` attribute
    // so videojs won't create additional wrapper in the DOM
    // see https://github.com/videojs/video.js/pull/3856
    return (
      <div>
        <div data-vjs-player>{playerContent}</div>
      </div>
    )
  }
}

VideoJS.defaultProps = { controls: true, preload: 'auto' }

export default VideoJS
