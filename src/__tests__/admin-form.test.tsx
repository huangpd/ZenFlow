import { render, screen, fireEvent } from '@testing-library/react';
import DynamicForm from '@/components/admin/DynamicForm';
import '@testing-library/jest-dom';

jest.mock('@/actions/admin-data', () => ({
  fetchRelatedList: jest.fn().mockResolvedValue([]),
}));

describe('DynamicForm', () => {
  const fields = [
    { name: 'name', type: 'String', kind: 'scalar', isId: false, isUnique: false, isRequired: true, isList: false, hasDefaultValue: false },
    { name: 'age', type: 'Int', kind: 'scalar', isId: false, isUnique: false, isRequired: false, isList: false, hasDefaultValue: false },
  ];

  it('renders inputs for fields', () => {
    render(<DynamicForm fields={fields as any} onSubmit={jest.fn()} modelName="User" />);
    expect(screen.getByLabelText('name')).toBeInTheDocument();
    expect(screen.getByLabelText('age')).toBeInTheDocument();
  });

  it('submits data', () => {
    const handleSubmit = jest.fn();
    render(<DynamicForm fields={fields as any} onSubmit={handleSubmit} modelName="User" />);
    
    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('age'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Alice',
      age: 30,
    }));
  });
});