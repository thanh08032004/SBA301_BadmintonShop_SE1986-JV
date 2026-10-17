export default function AdminFooter() {
  const footerStyle = {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '16px 24px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    marginTop: 'auto',
  };

  return (
    <footer style={footerStyle}>
      <span>
        &copy; {new Date().getFullYear()} Badminton Shop &middot; Quản Trị Hệ Thống
      </span>
    </footer>
  );
}
