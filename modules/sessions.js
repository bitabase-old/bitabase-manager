module.exports = async (db, request) => {
  if (!request.headers['x-session-id']) {
    return null;
  }

  const session = await db.get(
    'SELECT * FROM sessions WHERE id = ? AND secret = ?',
    [request.headers['x-session-id'], request.headers['x-session-secret']]
  );

  if (!session) {
    return null;
  }

  const user = await db.get(
    'SELECT * FROM users WHERE id = ? ',
    [session.user_id]
  );

  delete user.password;

  return {
    session,
    user
  };
};
