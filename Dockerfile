###############################################################################
# Run Madek-webapp in a docker container.
# MADE FOR DEVELOPMENT! NOT FOR PRODUCTION!
#
# * no DB included (use docker-compose or local DB)
# * optimized for fast local development:
#   * caching of rubygems and node_modules
#   * caching of precompiled assets
#
###############################################################################

# NOTE: should be same version as in .ruby-version file
FROM ruby:2.7.2

RUN DEBIAN_FRONTEND=noninteractive \
    apt-get update -qq \
    && echo "for compiling native gems etc" \
    && apt-get install -y build-essential \
    && echo "for nokogiri" \
    && apt-get install -y libxml2-dev libxslt1-dev \
    && echo "for postgres" \
    && apt-get install -y libpq-dev postgresql-client

# nodejs - TODO: include in base image
RUN DEBIAN_FRONTEND=noninteractive \
    apt-get update -qq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash \
    && apt-get install nodejs -yq

ENV APP_HOME /madek/server/webapp
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

# ruby gems
COPY Gemfile* ./
COPY datalayer/Gemfile* ./datalayer/
COPY zhdk-integration ./zhdk-integration/

# https://github.com/rubyjs/mini_racer#troubleshooting
RUN gem update --system
RUN bundle install

# npm packages
COPY package*.json ./
RUN npm ci

# application code and all the rest
COPY . $APP_HOME

# # precompile assets
# RUN bundle exec rails assets:precompile

# NOTE: we dont start the server, this is handled from the
# Dockerfile consumer (like docker-compose). Example command:
# EXPOSE 3000
# CMD ["rails", "server", "-p", "3000", "-b", "0.0.0.0"]