import { Link } from "react-router-dom";
import menu1 from "../assets/menu1.JPG";
import menu2 from "../assets/menu2.JPG";
import MenuOfTheDay from "../components/dailyMenu/MenuOfTheDay";
import { MENU } from "../data/menuData";
import { getCurrentDailyMenu } from "../services/dailyMenuService";
import { useEffect, useMemo, useState } from "react";
import "./Menu.css";

function Menu() {
  const [dailyMenu, setDailyMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getCurrentDailyMenu();
      setDailyMenu(data);
      setIsLoading(false);
    };

    load();
  }, []);

  const featuredItems = useMemo(() => {
    return Object.values(MENU)
      .flatMap((category) => category.items)
      .slice(0, 6)
      .map((item, index) => ({ ...item, soldOut: index % 4 === 0 }));
  }, []);

  return (
    <div className="menu-page">
      <h1 className="menu-title">Our Café Menu</h1>

      {isLoading ? (
        <p className="menu-loading">Loading menu of the day...</p>
      ) : (
        <MenuOfTheDay menuData={dailyMenu} />
      )}

      <section className="featured-grid">
        {featuredItems.map((item) => (
          <article key={item.id} className="featured-card">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>₱{item.price}</p>
            {item.soldOut ? <span className="sold-out">Sold Out</span> : <span className="available">Available</span>}
          </article>
        ))}
      </section>

      <section className="menu-categories">
        {Object.entries(MENU).map(([slug, category]) => (
          <Link key={slug} to={`/order/${slug}`} className="category-chip">
            {category.title}
          </Link>
        ))}
      </section>

      <div className="menu-grid">
        <div className="menu-card">
          <img src={menu1} alt="Drinks Menu" />
        </div>
        <div className="menu-card">
          <img src={menu2} alt="Food Menu" />
        </div>
      </div>

      <div className="menu-cta-wrap">
        <Link to="/order" className="menu-cta">Start Your Order</Link>
      </div>
    </div>
  );
}

export default Menu;
