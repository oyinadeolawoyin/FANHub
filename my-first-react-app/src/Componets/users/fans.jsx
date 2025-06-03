import { useUsers } from "./usersContext";

function Fans() {
    const { users, loading, error } = useUsers();

  if (loading) {
    return <div>Loading, please wait...</div>;
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {users && users.length > 0 ? (
            <ul>
            {users.map((user) => (
                <li key={user.id}>{user.username}</li>
            ))}
          </ul>
        ) : (
        <p>No fans found.</p>
      )}
    </div>
  );
}

export default Fans;