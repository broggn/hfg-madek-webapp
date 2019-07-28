class WorkflowPolicy < DefaultPolicy
  def edit?
    record.user_id == user.id
  end

  def update?
    edit? && record.is_active
  end

  alias_method :add_resource?, :update?
  alias_method :finish?, :update?
end
