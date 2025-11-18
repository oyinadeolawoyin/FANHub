import { Outlet, Link } from "react-router-dom";

function Homepage() {
  
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="homestories">Stories</Link></li>
            <li><Link to="homecollections">Collections</Link></li>
            
          </ul>
        </nav>
      </header>

      <main>
         <Outlet /> 
      </main>
    </div>
  );
};

export default Homepage;