import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  User, 
  AlertCircle,
  Clock,
  CheckCircle,
  Circle
} from 'lucide-react';
import axios from 'axios';
import TaskModal from './TaskModal';
import CreateTaskModal from './CreateTaskModal';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState([]);
  const { on, off } = useSocket();
  

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'bg-gray-100' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'Review', title: 'Review', color: 'bg-yellow-100' },
    { id: 'Done', title: 'Done', color: 'bg-green-100' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    // Socket event listeners
    on('taskCreated', handleTaskCreated);
    on('taskUpdated', handleTaskUpdated);
    on('taskMoved', handleTaskMoved);
    on('taskDeleted', handleTaskDeleted);

    return () => {
      off('taskCreated', handleTaskCreated);
      off('taskUpdated', handleTaskUpdated);
      off('taskMoved', handleTaskMoved);
      off('taskDeleted', handleTaskDeleted);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/reports/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [...prev, newTask]);
    toast.success('New task created!');
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
    toast.success('Task updated!');
  };

  const handleTaskMoved = (movedTask) => {
    setTasks(prev => prev.map(task => task._id === movedTask._id ? movedTask : task));
    toast.success('Task moved!');
  };

  const handleTaskDeleted = ({ id }) => {
    setTasks(prev => prev.filter(task => task._id !== id));
    toast.success('Task deleted!');
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const column = tasks.filter(task => task.status === source.droppableId);
      const reorderedColumn = Array.from(column);
      const [removed] = reorderedColumn.splice(source.index, 1);
      reorderedColumn.splice(destination.index, 0, removed);

      setTasks(prev => [
        ...prev.filter(task => task.status !== source.droppableId),
        ...reorderedColumn
      ]);
    } else {
      // Move to different column
      try {
        await axios.put(`/api/tasks/${draggableId}/move`, {
          status: destination.droppableId
        });
      } catch (error) {
        toast.error('Failed to move task');
        fetchTasks(); // Refresh to revert changes
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
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
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize and track your project tasks
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-500">
                  {tasks.filter(task => task.status === column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
                    }`}
                  >
                    {tasks
                      .filter(task => task.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskModal(true);
                              }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {task.title}
                                </h4>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>

                              {task.description && (
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <User className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    {task.assignee?.name}
                                  </span>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>

                              {task.deadline && (
                                <div className="flex items-center mt-2">
                                  <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                  <span className={`text-xs ${isOverdue(task.deadline) ? 'text-red-600' : 'text-gray-500'}`}>
                                    {formatDate(task.deadline)}
                                    {isOverdue(task.deadline) && ' (Overdue)'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          users={users}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdate={(updatedTask) => {
            setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
          }}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          users={users}
          onClose={() => setShowCreateModal(false)}
          onCreate={(newTask) => {
            setTasks(prev => [...prev, newTask]);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
