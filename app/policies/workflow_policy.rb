class WorkflowPolicy < DefaultPolicy
  def update?
    record.user_id == user.id
  end

  alias_method :add_resource?, :update?
end
