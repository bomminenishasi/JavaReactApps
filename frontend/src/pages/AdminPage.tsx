import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Pagination,
} from '@mui/material';
import axiosInstance from '../services/axiosInstance';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageResponse, User } from '../types';

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get<{ data: PageResponse<User> }>(`/api/admin/users?page=${page - 1}&size=20`)
      .then(({ data }) => {
        setUsers(data.data.content);
        setTotalPages(data.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AppLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Admin Panel</Typography>
        <Typography color="text.secondary">User management and system overview</Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>All Users</Typography>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Chip label={user.role} size="small" color={user.role === 'ADMIN' ? 'error' : 'default'} /></TableCell>
                    <TableCell>
                      <Chip label={user.isActive ? 'ACTIVE' : 'INACTIVE'} size="small"
                        color={user.isActive ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
            </Box>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default AdminPage;
