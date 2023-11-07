import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import omit from 'lodash/omit'
import isFunction from 'lodash/isFunction'
import titleBarPlugin from '../../lib/videojs-title-bar-plugin/videojs-title-bar-plugin'

// FIXME: crashes server, required on mount!
let videojs = null

// NOTE: this is used from Video- and AudioPlayer. `props.mode=audio|video`
// mode needs to be known because of conditional registering of plugins etc
const defaultProps = {
  mode: 'video',
  controls: true,
  preload: 'none',
  onMount: () => ({}),
  onReady: () => ({})
}

const propTypes = {
  options: PropTypes.shape({
    fluid: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    ratio: PropTypes.string,
    controlBar: PropTypes.shape({
      children: PropTypes.arrayOf(PropTypes.string)
    })
  }),
  captionConf: PropTypes.any,
  isInternal: PropTypes.bool,
  mode: PropTypes.oneOf(['audio', 'video']),
  onReady: PropTypes.func,
  onMount: PropTypes.func,
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      src: PropTypes.string,
      type: PropTypes.string
    })
  ),
  type: PropTypes.oneOf(['audio', 'video']),
  /** e.g. "500px" */
  width: PropTypes.string,
  /** e.g. "200px" */
  height: PropTypes.string,
  /** URL of a poster image */
  poster: PropTypes.string,
  preload: PropTypes.string,
  controls: PropTypes.bool,
  className: PropTypes.string
}

class VideoJS extends Component {
  constructor() {
    super()
    this.state = { active: !!(window && window.document) }
    this.toCallOnUnmount = []
  }

  componentDidMount() {
    const { options, captionConf, isInternal, mode, onReady } = this.props
    const { fluid = true, ratio: aspectRatio = '16:9', width, height } = options
    const { title, logoTitle, subtitle, link } = captionConf
    const plugins = isInternal
      ? {}
      : {
          plugins: {
            titleBar: {
              hideOnPlay: mode === 'video',
              title,
              logoTitle,
              subtitle,
              link,
              logo: 'Z'
            }
          }
        }
    const playerOptions = { fluid, aspectRatio, width, height, ...plugins }

    // eslint-disable-next-line react/no-string-refs
    const videoTag = this.refs.videojs
    if (!videoTag) throw new Error('no videojs tag!')

    videojs = require('video.js')

    // make library available to our plugins and other extensions:
    window.videojs = videojs

    // init/start
    videojs.registerPlugin('titleBar', titleBarPlugin)
    const player = videojs(videoTag, playerOptions)
    window.player = player
    this.toCallOnUnmount.push(player.destroy)

    // parent callbacks
    player.ready(() => onReady(player))
  }

  componentWillUnmount() {
    this.toCallOnUnmount && this.toCallOnUnmount.forEach(f => isFunction(f) && f())
  }
  render() {
    const { sources, mode, options, ...restProps } = this.props
    const { type, width, height, poster, preload, controls, className } = restProps
    if (!sources) throw new TypeError()
    DEBUG_CHECK(restProps)

    const MediaTag = mode // "audio" or "video"
    const mediaProps = { type, width, height, poster, preload, controls }
    const classes = cx(className, 'videojs', 'video-js', 'video-fluid', 'vjs-default-skin')
    const playerContent = (
      <MediaTag // eslint-disable-next-line react/no-string-refs
        ref="videojs"
        {...mediaProps}
        height={options.height}
        width={options.width}
        className={classes}>
        {sources.map(src => (
          <source key={src.key} {...omit(src, 'res')} data-resolution={src.res} />
        ))}
      </MediaTag>
    )

    // wrap the player in a div with a `data-vjs-player` attribute
    // so videojs won't create additional wrapper in the DOM
    // see https://github.com/videojs/video.js/pull/3856
    return <div data-vjs-player>{playerContent}</div>
  }
}

// TODO: remove when stable UVB 7.11.2023
function DEBUG_CHECK(restProps) {
  const check = omit(
    restProps,
    'captionConf',
    'isInternal',
    'getUrl',
    'onMount',
    'onReady',
    'doInit',
    'type',
    'width',
    'height',
    'poster',
    'preload',
    'controls',
    'className'
  )
  if (Object.keys(check).length > 0) {
    console.error(
      'found unknown prop(s) which used to be passed to the <audio> or <video> tag',
      check
    )
  }
}

VideoJS.propTypes = propTypes
VideoJS.defaultProps = defaultProps
export default VideoJS
