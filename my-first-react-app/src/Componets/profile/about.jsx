import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function About() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError("");
    
        async function fetchUser() {
            try {
              const response = await fetch(`https://fanhub-server.onrender.com/api/users/${id}`, {
                method: "GET",
                credentials: "include",
              });
                
              const data = await response.json();
              console.log("mmmm", data);
            //   console.log("uuuuuuu", user);
      
              if (!response.ok) {
                  setError(data.message || "Something is wrong. Try again!");
                  return;
              }
              
              setUser(data.user);
              
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    return (
        <div>
            {error && <p>{error}</p>}
            {loading && <p>Loading... please wait!</p>}
          <main>
            <div>
                <p></p>
                {user?.img && <img src={user?.img} style={{height: "100px", width: "100px"}}/>}
                Bio: {user?.bio} <br />
                Instagram: {user?.instagram || "No link yet"} <br />
                Facebook: {user?.facebook || "No link yet"} <br />
                Twitter: {user?.twitter || "No link yet"} <br />
                Discord: {user?.discord || "No link yet"} <br />
            </div>
            <div>
                Gender: {user?.gender} <br /> Country: { user?.country} <br /> Role: { user?.role}
            </div>
    
            <div>
                <p><b>Social Point</b></p>
                Comment Point: {user?.social[0].commentpoint} <br />
                Review Point: {user?.social[0].reviewpoint} <br />
                Like Point:   {user?.social[0].likepoint} <br />
                Reading Point: {user?.social[0].readingpoint} <br />
                Writing Point: {user?.social[0].writingpoint}
            </div>
    
            <div>
                <p><b>Streak</b></p>
                Writing Streak: { user?.writestreak} <br />
                Reading Streak: {user?.readstreak}
            </div>
          </main>
        </div>
    );
}


export default About;