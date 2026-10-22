import { useState, useEffect } from 'react';
import { Table, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/app/providers/auth/AuthContext';
import { adminApi } from '@/modules/admin/api/admin.api';
import UserFormModal from '@/modules/admin/components/UserFormModal';

export default function AccountsPage() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    adminApi
      .getUsers()
      .then((data) => active && setUsers(data || []))
      .catch((err) => active && setError(err.message || 'Không thể tải danh sách tài khoản.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Statistics
  const stats = {
    total: users.length,
    managers: users.filter((u) => u.roles?.includes('MANAGER')).length,
    staff: users.filter((u) => u.roles?.includes('STAFF')).length,
    customers: users.filter((u) => u.roles?.includes('CUSTOMER')).length,
    inactive: users.filter((u) => u.isActive === false).length,
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      search.trim() === '' ||
      String(u.fullName).toLowerCase().includes(search.toLowerCase()) ||
      String(u.email).toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === 'ALL' || (Array.isArray(u.roles) && u.roles.includes(roleFilter));

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.isActive !== false) ||
      (statusFilter === 'INACTIVE' && u.isActive === false);

    return matchSearch && matchRole && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const handleCreate = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (u) => {
    setSelectedUser(u);
    setShowModal(true);
  };

  const handleSaveUser = async (formData) => {
    if (selectedUser) {
      await adminApi.updateUser(selectedUser.id, formData);
      setNotice(`Đã cập nhật thành công tài khoản: ${formData.email}`);
    } else {
      await adminApi.createUser(formData);
      setNotice(`Đã tạo mới thành công tài khoản: ${formData.email}`);
    }
    await loadUsers();
  };

  const roleBadge = (roles = []) => {
    const role = roles[0];
    const config = {
      ADMIN: { bg: 'danger', label: 'Quản trị viên (ADMIN)' },
      MANAGER: { bg: 'primary', label: 'Quản lý (MANAGER)' },
      STAFF: { bg: 'info', label: 'Nhân viên (STAFF)' },
      CUSTOMER: { bg: 'secondary', label: 'Khách hàng (CUSTOMER)' },
    }[role] || { bg: 'light', label: role };

    return <Badge bg={config.bg}>{config.label}</Badge>;
  };

  // Inline styles container
  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '4px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '16px 20px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    },
    statNum: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#1e293b',
      lineHeight: 1.2,
    },
    statLabel: {
      fontSize: '13px',
      color: '#64748b',
      marginTop: '4px',
    },
    filterCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '18px 20px',
      marginBottom: '20px',
    },
    tableCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
  };

  return (
    <div>
      {/* Title & Actions */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý tài khoản người dùng</h1>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          style={{
            backgroundColor: '#2563eb',
            borderColor: '#2563eb',
            padding: '10px 18px',
            fontWeight: 600,
          }}
        >
          + Thêm người dùng mới
        </Button>
      </div>

      {/* Alerts */}
      {notice && (
        <Alert variant="success" dismissible onClose={() => setNotice('')} className="mb-4">
          {notice}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{stats.total}</div>
          <div style={styles.statLabel}>Tổng số tài khoản</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#2563eb' }}>{stats.managers}</div>
          <div style={styles.statLabel}>Quản lý (Manager)</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#0284c7' }}>{stats.staff}</div>
          <div style={styles.statLabel}>Nhân viên (Staff)</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#475569' }}>{stats.customers}</div>
          <div style={styles.statLabel}>Khách hàng (Customer)</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#dc2626' }}>{stats.inactive}</div>
          <div style={styles.statLabel}>Tài khoản đã khóa</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterCard}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <Form.Control
              type="text"
              placeholder="Tìm theo họ tên, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-6 col-md-3">
            <Form.Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="STAFF">STAFF</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </Form.Select>
          </div>
          <div className="col-6 col-md-3">
            <Form.Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động (Active)</option>
              <option value="INACTIVE">Đã khóa (Inactive)</option>
            </Form.Select>
          </div>
          <div className="col-12 col-md-1 text-end">
            <Button
              variant="outline-secondary"
              onClick={loadUsers}
              title="Tải lại danh sách"
              className="w-100"
            >
              🔄
            </Button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div className="p-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang tải danh sách tài khoản...</p>
          </div>
        ) : (
          <>
            <Table responsive hover className="mb-0 align-middle">
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th
                    style={{
                      padding: '14px 18px',
                      width: '70px',
                      color: '#475569',
                      fontSize: '13px',
                    }}
                  >
                    ID
                  </th>
                  <th style={{ padding: '14px 18px', color: '#475569', fontSize: '13px' }}>
                    Họ và tên
                  </th>
                  <th style={{ padding: '14px 18px', color: '#475569', fontSize: '13px' }}>
                    Email
                  </th>
                  <th style={{ padding: '14px 18px', color: '#475569', fontSize: '13px' }}>
                    Vai trò
                  </th>
                  <th style={{ padding: '14px 18px', color: '#475569', fontSize: '13px' }}>
                    Trạng thái
                  </th>
                  <th
                    style={{
                      padding: '14px 18px',
                      textAlign: 'right',
                      color: '#475569',
                      fontSize: '13px',
                    }}
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Không tìm thấy người dùng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => {
                    const isCurrent =
                      String(u.email).toLowerCase() === String(currentAdmin?.email).toLowerCase();
                    const isUserActive = u.isActive !== false;

                    return (
                      <tr key={u.id || u.email}>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#64748b' }}>
                          #{u.id || '—'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {u.fullName || '—'}
                            {isCurrent && (
                              <Badge
                                bg="warning"
                                text="dark"
                                className="ms-2"
                                style={{ fontSize: '10px' }}
                              >
                                Bạn
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#334155' }}>{u.email}</td>
                        <td style={{ padding: '14px 18px' }}>{roleBadge(u.roles)}</td>
                        <td style={{ padding: '14px 18px' }}>
                          {isUserActive ? (
                            <Badge bg="success" style={{ fontWeight: 500, padding: '6px 10px' }}>
                              ● Hoạt động
                            </Badge>
                          ) : (
                            <Badge bg="danger" style={{ fontWeight: 500, padding: '6px 10px' }}>
                              ✕ Đã khóa
                            </Badge>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div className="d-flex justify-content-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(u)}
                              style={{ fontSize: '12px', padding: '4px 12px' }}
                            >
                              Sửa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
              <div
                className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border-top"
                style={{ backgroundColor: '#f8fafc' }}
              >
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Hiển thị <strong>{startIndex + 1}</strong> -{' '}
                  <strong>{Math.min(startIndex + pageSize, filteredUsers.length)}</strong> trong
                  tổng số <strong>{filteredUsers.length}</strong> tài khoản
                </span>

                {totalPages > 1 && (
                  <div className="d-flex align-items-center gap-1">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={validPage <= 1}
                      onClick={() => setCurrentPage(validPage - 1)}
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      &laquo; Trước
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === validPage ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setCurrentPage(p)}
                        style={{
                          fontSize: '12px',
                          padding: '4px 10px',
                          backgroundColor: p === validPage ? '#2563eb' : undefined,
                          borderColor: p === validPage ? '#2563eb' : undefined,
                        }}
                      >
                        {p}
                      </Button>
                    ))}

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={validPage >= totalPages}
                      onClick={() => setCurrentPage(validPage + 1)}
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      Sau &raquo;
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal create / edit */}
      <UserFormModal
        key={`${selectedUser?.id ?? 'new'}-${showModal}`}
        show={showModal}
        onHide={() => setShowModal(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
