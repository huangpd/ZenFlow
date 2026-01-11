import { render, screen } from '@testing-library/react';
import DataTable from '@/components/admin/DataTable';
import '@testing-library/jest-dom';

jest.mock('@/actions/admin-data', () => ({
  deleteRecord: jest.fn(),
}));

describe('DataTable', () => {
  const fields = [
    { name: 'id', type: 'String', kind: 'scalar', isId: true, isUnique: true, isRequired: true, isList: false, hasDefaultValue: true },
    { name: 'name', type: 'String', kind: 'scalar', isId: false, isUnique: false, isRequired: true, isList: false, hasDefaultValue: false },
  ];
  const data = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  it('renders data rows', () => {
    render(<DataTable data={data} fields={fields as any} modelName="User" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders headers', () => {
    render(<DataTable data={data} fields={fields as any} modelName="User" />);
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
  });
});