import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskCard from '@/components/TaskCard';
import { updateTask } from '@/actions/tasks';
import '@testing-library/jest-dom';

jest.mock('@/actions/tasks', () => ({
  updateTaskProgress: jest.fn().mockResolvedValue({ success: true }),
  updateTask: jest.fn().mockResolvedValue({ success: true }),
}));

describe('TaskCard Toggle with Save Button', () => {
  const mockTask = {
    id: '1',
    text: 'Test Task',
    current: 10,
    target: 100,
    isDaily: false,
    type: 'normal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does NOT save immediately when toggling in edit mode', async () => {
    render(<TaskCard task={mockTask} onRead={jest.fn()} onEdit={jest.fn()} onProgress={jest.fn()} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('修改'));
    
    const toggle = screen.getByLabelText(/Set as Daily/i);
    fireEvent.click(toggle);
    
    // Verify action NOT called yet
    expect(updateTask).not.toHaveBeenCalled();
    
    // Click Save
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
        expect(updateTask).toHaveBeenCalledWith('1', expect.objectContaining({
            isDaily: true,
            current: 10
        }));
    });
  });

  it('keeps standalone toggle deactivated when NOT in edit mode', () => {
      render(<TaskCard task={mockTask} onRead={jest.fn()} onEdit={jest.fn()} onProgress={jest.fn()} />);
      const toggle = screen.getByLabelText(/Set as Daily/i);
      
      fireEvent.click(toggle);
      expect(updateTask).not.toHaveBeenCalled();
  });
});
