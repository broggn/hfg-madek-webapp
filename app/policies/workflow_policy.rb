class WorkflowPolicy < DefaultPolicy
  def update?
    record.user_id == user.id
  end
end
