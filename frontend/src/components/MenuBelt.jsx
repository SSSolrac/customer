import "./MenuBelt.css";

// Default category images
import coffee from "../assets/coffee.png";
import hot from "../assets/hot.png";
import sandwiches from "../assets/sandwiches.png";
import rice from "../assets/ricemeal.png"; 

// Specific item images (.jpg based on your folder)
import chocoJavaFrappe from "../assets/Choco Java Chip Frappe.jpg";
import blueberrySoda from "../assets/Blueberry Soda.jpg";

const items = [
  { name: "Cloud Americano", tagLeft: "Iced Coffee", tagRight: "₱120", img: coffee },
  { name: "Choco Java Chip Frappe", tagLeft: "Frappuccino", tagRight: "₱170", img: chocoJavaFrappe }, 
  { name: "Chicken Cordon Bleu", tagLeft: "Rice Meal", tagRight: "₱180", img: rice },
  { name: "Spanish Latte", tagLeft: "Hot Coffee", tagRight: "₱120", img: hot },
  { name: "Blueberry Soda", tagLeft: "Non-Caff", tagRight: "₱90", img: blueberrySoda }, 
  { name: "Chicken Alfredo Pasta", tagLeft: "Pasta", tagRight: "₱190", img: sandwiches },
  { name: "Iced Cocoa Tiramisu", tagLeft: "Iced Coffee", tagRight: "₱160", img: coffee },
  { name: "Burger Steak", tagLeft: "Rice Meal", tagRight: "₱160", img: rice },
];

export default function MenuBelt() {
    const beltItems = [...items, ...items];

  return (
    <section className="belt-section">
      <h2 className="belt-title">Cafe Favorites</h2>
      <p className="belt-subtitle">
        Quick picks from our menu — scroll & discover your next order.
      </p>

      <div className="belt-viewport">
        <div className="belt-track">
          {beltItems.map((it, idx) => (
            <article className="belt-card" key={`${it.name}-${idx}`}>
              <div className="belt-imgWrap">
                <img src={it.img} alt={it.name} className="belt-img" />
              </div>

              <h3 className="belt-name">{it.name}</h3>

              <div className="belt-tags">
                <span className="tag-category">{it.tagLeft}</span>
                <span className="tag-price">{it.tagRight}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="belt-ctaRow">
        <a className="belt-ctaBtn" href="/order">Order Now</a>
      </div>
    </section>
  );
}