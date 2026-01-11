import { render, screen } from '@testing-library/react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import '@testing-library/jest-dom';

describe('AdminSidebar', () => {
  const mockModels = [
    { name: 'User', fields: [] },
    { name: 'Post', fields: [] },
  ];

  it('renders model links', () => {
    render(<AdminSidebar models={mockModels as any} />);
    
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
    
    const userLink = screen.getByRole('link', { name: 'User' });
    expect(userLink).toHaveAttribute('href', '/admin/data/User');
  });
});
