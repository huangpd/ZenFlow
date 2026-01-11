import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '@/components/TaskCard';
import { updateTask } from '@/actions/tasks';
import '@testing-library/jest-dom';

jest.mock('@/actions/tasks', () => ({
  updateTaskProgress: jest.fn().mockResolvedValue({ success: true }),
  updateTask: jest.fn().mockResolvedValue({ success: true }),
}));

describe('TaskCard Toggle', () => {
  const mockTask = {
    id: '1',
    text: 'Test Task',
    current: 0,
    target: 10,
    isDaily: false,
    type: 'normal',
  };

  it('renders toggle button', () => {
    render(<TaskCard task={mockTask} onRead={jest.fn()} onProgress={jest.fn()} />);
    expect(screen.getByLabelText(/Set as Daily/i)).toBeInTheDocument();
  });

  it('toggles isDaily when clicked', async () => {
    render(<TaskCard task={mockTask} onRead={jest.fn()} onProgress={jest.fn()} />);
    const toggle = screen.getByLabelText(/Set as Daily/i);
    
    fireEvent.click(toggle);
    
    expect(updateTask).toHaveBeenCalledWith('1', { isDaily: true });
  });
});
