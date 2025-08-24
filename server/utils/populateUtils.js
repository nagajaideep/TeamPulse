// Utility functions for common populate operations

export const populateTask = async (task) => {
  return await task
    .populate('assignee', 'name email role')
    .populate('assignedBy', 'name email role')
    .populate('createdBy', 'name email role');
};

export const populateMeeting = async (meeting) => {
  return await meeting
    .populate('attendees', 'name email')
    .populate('createdBy', 'name email')
    .populate('attendanceLogs.userId', 'name email');
};

export const populateFeedback = async (feedback) => {
  return await feedback
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .populate('taskId', 'title');
};

// Chain populate for queries
export const withTaskPopulate = (query) => {
  return query
    .populate('assignee', 'name email role')
    .populate('assignedBy', 'name email role')
    .populate('createdBy', 'name email role');
};

export const withMeetingPopulate = (query) => {
  return query
    .populate('attendees', 'name email')
    .populate('createdBy', 'name email')
    .populate('attendanceLogs.userId', 'name email');
};

export const withFeedbackPopulate = (query) => {
  return query
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .populate('taskId', 'title');
};
