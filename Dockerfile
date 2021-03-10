###############################################################################
# Run Madek-webapp in a docker container.
# MADE FOR DEVELOPMENT! NOT FOR PRODUCTION!
#
# * no DB included (use docker-compose or local DB)
# * optimized for local development: code, ruby gems, node_modules are all
#   stored on the host and mounted into the container which is just a runtime
#
###############################################################################

# NOTE: based on debian:buster-slim
FROM ruby:2.7.2-slim

RUN DEBIAN_FRONTEND=noninteractive \
    apt-get update -qq \
    && echo "for compiling native gems etc" \
    && apt-get install -y build-essential \
    && echo "for nokogiri" \
    && apt-get install -y libxml2-dev libxslt1-dev \
    && echo "for postgres" \
    && apt-get install -y libpq-dev postgresql-client \
    && echo "for development" \
    && apt-get install -y git vim-tiny

# NODEJS 12
RUN DEBIAN_FRONTEND=noninteractive \
    apt-get update -qq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash \
    && apt-get install nodejs -yq

# RUBYGEMS
# set bundler config (as ENV vars to not interfere with the general project config in `./.bundle/config`)
ENV BUNDLE_PATH=./vendor/bundle/
# install the right bundler version (referenced in the Gemfile.lock, so needs to be temporarly copied into the container
COPY Gemfile.lock .
RUN bundler_version="$(grep -A1 --color=no 'BUNDLED WITH' Gemfile.lock | tail -1 | sed -e 's/ //g')" \
    && gem install "bundler:${bundler_version}" \
    && rm Gemfile.lock

# app
ENV APP_HOME /madek/server/webapp
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

EXPOSE 3000
CMD ["rails", "server", "-p", "3000", "-b", "0.0.0.0"]