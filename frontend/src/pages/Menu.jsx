import { Link } from "react-router-dom";
import menu1 from "../assets/menu1.JPG";
import menu2 from "../assets/menu2.JPG";
import MenuOfTheDay from "../components/dailyMenu/MenuOfTheDay";
import { MENU } from "../data/menuData";
import { getCurrentDailyMenu } from "../services/dailyMenuService";
import { useEffect, useMemo, useState } from "react";
import "./Menu.css";

const FEATURED_KEYWORDS = ["Caramel", "Matcha", "Hungarian", "Four Seasons", "Americano"];

function Menu() {
  const [dailyMenu, setDailyMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getCurrentDailyMenu();
        setDailyMenu(data);
      } catch {
        setError("Could not load today's featured menu right now.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const featuredItems = useMemo(() => {
    const allItems = Object.values(MENU).flatMap((category) => category.items);

    const matched = allItems.filter((item) => FEATURED_KEYWORDS.some((keyword) => item.name.includes(keyword)));
    const fallback = allItems.filter((item) => item.price >= 130 && item.price <= 170);

    return (matched.length ? matched : fallback).slice(0, 6).map((item) => ({
      ...item,
      availability: item.price > 175 ? "Limited" : "Available"
    }));
  }, []);

  return (
    <div className="menu-page">
      <h1 className="menu-title">Our Café Menu</h1>

      {isLoading ? <p className="menu-loading">Loading menu of the day...</p> : null}
      {!isLoading && error ? <p className="menu-loading">{error}</p> : null}
      {!isLoading && !error ? <MenuOfTheDay menuData={dailyMenu} /> : null}

      <section className="featured-grid">
        {featuredItems.map((item) => (
          <article key={item.id} className="featured-card">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>₱{item.price}</p>
            <span className={item.availability === "Available" ? "available" : "sold-out"}>{item.availability}</span>
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
