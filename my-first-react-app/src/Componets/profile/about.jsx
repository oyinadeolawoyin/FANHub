import { useUser } from "./usersContext";
function About() {
    const { user } = useUser();
    return (
        <div>
          <main>
            <div>
                <p></p>
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