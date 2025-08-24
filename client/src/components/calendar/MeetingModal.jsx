import React, { useState } from 'react';
import { X, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const MeetingModal = ({ meeting, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/meetings/${meeting._id}/checkin`);
      onUpdate(response.data);
      toast.success('Check-in successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const isAttendee = meeting.attendees?.some(attendee => attendee._id === user?.id);
  const hasCheckedIn = meeting.attendanceLogs?.some(log => log.userId._id === user?.id);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Meeting Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">{meeting.title}</h4>
            {meeting.description && (
              <p className="text-gray-600 text-sm">{meeting.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(meeting.datetime).toLocaleDateString()} at {new Date(meeting.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-500">{meeting.duration} minutes</p>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Attendees</span>
            </div>
            <div className="space-y-1">
              {meeting.attendees?.map((attendee) => {
                const hasCheckedIn = meeting.attendanceLogs?.some(log => log.userId._id === attendee._id);
                return (
                  <div key={attendee._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{attendee.name}</span>
                    {hasCheckedIn && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isAttendee && !hasCheckedIn && (
            <button
              onClick={handleCheckin}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Checking in...' : 'Check In'}
            </button>
          )}

          {hasCheckedIn && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">You've checked in!</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Created by {meeting.createdBy?.name} on {new Date(meeting.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;
