import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddTaskModal from '@/components/AddTaskModal';
import { updateTask, getAvailableSutras } from '@/actions/tasks';

// Mock dependencies
jest.mock('@/actions/tasks', () => ({
  createTask: jest.fn(),
  getAvailableSutras: jest.fn().mockResolvedValue([]),
  updateTask: jest.fn().mockResolvedValue({ success: true, task: {} }),
}));

jest.mock('@/constants', () => ({
  ICON_MAP: {},
}));

describe('AddTaskModal Target Input', () => {
  const mockTask = {
    id: 'task-1',
    text: 'Test Task',
    target: 1,
    isDaily: false,
  };

  it('allows clearing the target input and typing a new value', async () => {
    render(
      <AddTaskModal 
        isOpen={true} 
        onClose={jest.fn()} 
        taskToEdit={mockTask} 
        onTaskUpdated={jest.fn()}
      />
    );

    // Wait for the input to appear
    const input = await screen.findByDisplayValue('1');
    
    // Simulate user deleting the "1"
    fireEvent.change(input, { target: { value: '' } });
    
    // Expect value to be empty string (no immediate reset to 1)
    expect(input).toHaveValue(null); // type="number" with empty string might show as null or empty string in test depending on browser impl, let's check
    
    // Actually for type="number", valueAsNumber is NaN, value is ""
    // react-testing-library might need to check value attribute
    
    // Let's type "5"
    fireEvent.change(input, { target: { value: '5' } });
    expect(input).toHaveValue(5);
    
    // Check if API was called with 5
    expect(updateTask).toHaveBeenCalledWith('task-1', expect.objectContaining({ target: 5 }));
    
    // Type "0" to make it "50"
    fireEvent.change(input, { target: { value: '50' } });
    expect(input).toHaveValue(50);
    expect(updateTask).toHaveBeenCalledWith('task-1', expect.objectContaining({ target: 50 }));
  });

  it('resets invalid input on blur', async () => {
    render(
      <AddTaskModal 
        isOpen={true} 
        onClose={jest.fn()} 
        taskToEdit={mockTask} 
        onTaskUpdated={jest.fn()}
      />
    );

    const input = await screen.findByDisplayValue('1');
    
    // Clear input
    fireEvent.change(input, { target: { value: '' } });
    
    // Blur input
    fireEvent.blur(input);
    
    // Should reset to 1
    expect(input).toHaveValue(1);
    expect(updateTask).toHaveBeenCalledWith('task-1', expect.objectContaining({ target: 1 }));
  });
});
