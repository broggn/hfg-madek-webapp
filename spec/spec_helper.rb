ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'

# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.check_all_pending! if defined?(ActiveRecord::Migration)

def truncate_tables
  PgTasks.truncate_tables
end

def restore_seeds
  PgTasks.data_restore Rails.root.join('datalayer', 'db', 'seeds.pgbin')
end

def with_disabled_triggers
  ActiveRecord::Base.connection.execute  \
    'SET session_replication_role = REPLICA;'
  yield
  ActiveRecord::Base.connection.execute  \
    'SET session_replication_role = DEFAULT;'
end

RSpec.configure do |config|

  # NEVER EVER use transactional_fixtures
  # among many problems it effectively disables defered trigger checks
  config.use_transactional_fixtures = false

  config.before :each do
    truncate_tables
    restore_seeds
  end

  # If true, the base class of anonymous controllers will be inferred
  # automatically. This will be the default behavior in future versions of
  # rspec-rails.
  config.infer_base_class_for_anonymous_controllers = false

  # Run specs in random order to surface order dependencies. If you find an
  # order dependency and want to debug it, you can fix the order by providing
  # the seed, which is printed after each run.
  #     --seed 1234
  config.order = 'random'

  # infer spec type from file location (like in RSpec 2.x)
  config.infer_spec_type_from_file_location!

  config.expect_with :rspec do |c|
    c.syntax = :expect
  end

  config.include FactoryBot::Syntax::Methods

  # Note: rails test provides some sort of mock for for cookies and sessions;
  # we patch the controller instance with a
  # validate_services_session_cookie_and_get_user, it extracts the user from
  # the pseudo session
  config.before :each do |example|
    if example.metadata[:type] == :controller
      @controller.instance_eval do
        def validate_services_session_cookie_and_get_user
          User.find_by id: session[:user_id]
        end
      end
    end

    require 'webmock/rspec' if example.metadata[:webmock].present?
  end

end
