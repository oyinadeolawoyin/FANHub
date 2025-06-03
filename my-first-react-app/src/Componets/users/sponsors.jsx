import { useUsers } from "./usersContext";

function Sponsors() {
    const { users, loading, error } = useUsers();
    if (loading) {
        return <div>Loading, please wait...</div>;
    }

    const sponsors = users?.filter((user) => user.role === "SPONSOR");
  
    return (
        <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {sponsors && sponsors.length > 0 ? (
        <ul>
            {sponsors.map((sponsor) => (
            <li key={sponsor.id}>{sponsor.username}</li>
            ))}
        </ul>
        ) : (
        <p>No sponsors found.</p>
        )}
        </div>
    );
}

export default Sponsors;