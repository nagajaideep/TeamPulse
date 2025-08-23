import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { Plus, Users, Clock } from 'lucide-react';
import axios from 'axios';
import CreateMeetingModal from './CreateMeetingModal';
import MeetingModal from './MeetingModal';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const { on, off } = useSocket();

  useEffect(() => {
    fetchData();

    // Socket event listeners
    on('meetingScheduled', handleMeetingScheduled);
    on('meetingCheckin', handleMeetingCheckin);

    return () => {
      off('meetingScheduled', handleMeetingScheduled);
      off('meetingCheckin', handleMeetingCheckin);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [meetingsResponse, tasksResponse] = await Promise.all([
        axios.get('/api/meetings'),
        axios.get('/api/tasks')
      ]);

      setMeetings(meetingsResponse.data);
      setTasks(tasksResponse.data);
      updateEvents(meetingsResponse.data, tasksResponse.data);
    } catch (error) {
      toast.error('Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  const updateEvents = (meetingsData, tasksData) => {
    const meetingEvents = meetingsData.map(meeting => ({
      id: meeting._id,
      title: meeting.title,
      start: new Date(meeting.datetime),
      end: new Date(new Date(meeting.datetime).getTime() + (meeting.duration || 60) * 60000),
      type: 'meeting',
      data: meeting
    }));

    const taskEvents = tasksData
      .filter(task => task.deadline)
      .map(task => ({
        id: task._id,
        title: `📋 ${task.title}`,
        start: new Date(task.deadline),
        end: new Date(task.deadline),
        type: 'task',
        data: task,
        allDay: true
      }));

    setEvents([...meetingEvents, ...taskEvents]);
  };

  const handleMeetingScheduled = (newMeeting) => {
    setMeetings(prev => [...prev, newMeeting]);
    updateEvents([...meetings, newMeeting], tasks);
    toast.success('New meeting scheduled!');
  };

  const handleMeetingCheckin = (updatedMeeting) => {
    setMeetings(prev => prev.map(m => m._id === updatedMeeting._id ? updatedMeeting : m));
    toast.success('Meeting check-in recorded!');
  };

  const handleSelectEvent = (event) => {
    if (event.type === 'meeting') {
      setSelectedMeeting(event.data);
      setShowMeetingModal(true);
    }
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#3b82f6',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    if (event.type === 'task') {
      style.backgroundColor = '#f59e0b';
    }

    return {
      style
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            View meetings and task deadlines
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Meetings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Task Deadlines</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
            selectable
            popup
            tooltipAccessor={(event) => {
              if (event.type === 'meeting') {
                return `${event.title}\n${event.data.description || ''}\nAttendees: ${event.data.attendees?.map(a => a.name).join(', ')}`;
              }
              return event.title;
            }}
          />
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Meetings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings
            .filter(meeting => new Date(meeting.datetime) > new Date())
            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
            .slice(0, 6)
            .map(meeting => (
              <div
                key={meeting._id}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer"
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setShowMeetingModal(true);
                }}
              >
                <h3 className="font-medium text-gray-900 mb-2">{meeting.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(meeting.datetime).toLocaleDateString()} at {new Date(meeting.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {meeting.attendees?.length || 0} attendees
                </div>
              </div>
            ))}
        </div>
      </div>

      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(newMeeting) => {
            setMeetings(prev => [...prev, newMeeting]);
            updateEvents([...meetings, newMeeting], tasks);
          }}
        />
      )}

      {showMeetingModal && selectedMeeting && (
        <MeetingModal
          meeting={selectedMeeting}
          onClose={() => {
            setShowMeetingModal(false);
            setSelectedMeeting(null);
          }}
          onUpdate={(updatedMeeting) => {
            setMeetings(prev => prev.map(m => m._id === updatedMeeting._id ? updatedMeeting : m));
            updateEvents(meetings.map(m => m._id === updatedMeeting._id ? updatedMeeting : m), tasks);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;
