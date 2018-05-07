# rubocop:disable Metrics/MethodLength
# rubocop:disable Metrics/LineLength
module EmbedHelper
  extend ActiveSupport::Concern

  UI_DEFAULT_WIDTH  = Madek::Constants::Webapp::EMBED_UI_DEFAULT_WIDTH.to_i
  UI_DEFAULT_HEIGHT = Madek::Constants::Webapp::EMBED_UI_DEFAULT_HEIGHT.to_i
  UI_MIN_WIDTH = Madek::Constants::Webapp::EMBED_UI_MIN_WIDTH.to_i
  UI_MIN_HEIGHT = Madek::Constants::Webapp::EMBED_UI_MIN_HEIGHT.to_i
  UI_DEFAULT_RATIO = UI_DEFAULT_WIDTH.to_f / UI_DEFAULT_HEIGHT.to_f

  def scale_preview_sizes(
    entry,
    maxwidth: nil, maxheight: nil, ratio: nil
  )
    ratio ||= UI_DEFAULT_RATIO

    # if no params, just the defaults
    if maxwidth.nil? and maxheight.nil?
      return { width: UI_DEFAULT_WIDTH, height: UI_DEFAULT_HEIGHT }
    end

    # # use optional params, don't enlarge unless requested.
    # width = maxwidth.nil? ? UI_DEFAULT_WIDTH : maxwidth.to_i
    # height = maxheight.nil? ? UI_DEFAULT_HEIGHT : maxheight.to_i

    max_width = maxwidth.to_i
    max_height = maxheight.to_i

    # dont go smaller than the UI supports
    width = [max_width, UI_MIN_WIDTH].max
    height = [max_height, UI_MIN_HEIGHT].max

    # binding.pry

    # enforce ratio, scale by height or width depending which result is smaller
    if max_height * ratio <= max_width / ratio
      {
        width: width,
        height: width / ratio
      }
    else
      {
        width: height * ratio,
        height: height
      }
    end

  end

end
