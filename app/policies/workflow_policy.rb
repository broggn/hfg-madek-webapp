class WorkflowPolicy < DefaultPolicy
  def edit?
    record.creator_id == user.id
  end

  def update?
    edit? && record.is_active
  end

  def update_owners?
    update?
  end

  alias_method :add_resource?, :update?
  alias_method :finish?, :update?
end
