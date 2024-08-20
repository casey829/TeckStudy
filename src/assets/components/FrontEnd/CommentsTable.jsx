import React from 'react';

function CommentsTable({ comments, onDeleteComment }) {
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const thStyle = {
    backgroundColor: '#f2f2f2',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  };

  const tdStyle = {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Futura, sans-serif', fontSize: '24px', marginBottom: '20px' }}>Comments</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Content ID</th>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Comment</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <tr key={comment.id}>
                <td style={tdStyle}>{comment.id}</td>
                <td style={tdStyle}>{comment.content_id}</td>
                <td style={tdStyle}>{comment.user_id}</td>
                <td style={tdStyle}>{comment.text}</td>
                <td style={tdStyle}>{new Date(comment.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>
                
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    aria-label={`Delete Comment ${comment.id}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No comments available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CommentsTable;
