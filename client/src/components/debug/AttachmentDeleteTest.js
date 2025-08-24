import React, { useState } from 'react';
import axios from 'axios';

const AttachmentDeleteTest = () => {
  const [taskId, setTaskId] = useState('');
  const [testResult, setTestResult] = useState('');
  const [attachments, setAttachments] = useState([]);

  const testTaskAccess = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/test-delete`);
      
      setTestResult(JSON.stringify(response.data, null, 2));
      setAttachments(response.data.attachments || []);
    } catch (error) {
      setTestResult(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const testDeleteAttachment = async (attachmentId) => {
    try {
      const response = await axios.delete(`/api/tasks/${taskId}/attachments/${attachmentId}`);
      
      setTestResult(`Delete Success: ${response.data.message}`);
      // Refresh the test data
      testTaskAccess();
    } catch (error) {
      setTestResult(`Delete Error: ${error.response?.data?.message || error.message}`);
      console.error('Full error:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Attachment Delete Test</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          placeholder="Enter Task ID"
          className="border px-3 py-2 mr-2 rounded"
        />
        <button
          onClick={testTaskAccess}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Task Access
        </button>
      </div>

      {testResult && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Test Result:</h3>
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">Available Attachments:</h3>
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 border mb-2 rounded">
              <span>{attachment.name}</span>
              <button
                onClick={() => testDeleteAttachment(attachment.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h3 className="font-bold mb-2">How to use:</h3>
        <ol className="list-decimal list-inside text-sm">
          <li>Get a task ID from your database (look in the tasks collection)</li>
          <li>Paste the ID above and click "Test Task Access"</li>
          <li>If attachments are shown, try deleting them</li>
          <li>Check the console for detailed error logs</li>
        </ol>
      </div>
    </div>
  );
};

export default AttachmentDeleteTest;
