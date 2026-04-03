import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { MENU } from "../data/menuData";
import "./OrderCategory.css";

export default function OrderCategory() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const data = MENU[category];

  if (!data) {
    return (
      <div style={{ padding: 40 }}>
        <p>Category not found.</p>
        <button onClick={() => navigate("/order")}>Back</button>
      </div>
    );
  }

  return (
    <div className="ordercat-page">
      <div className="ordercat-header">
        <div className="ordercat-header-inner">
          <button className="ordercat-back-btn" onClick={() => navigate("/order")}>
            ← Back to Categories
          </button>

          <h1 className="ordercat-header-title">{data.title}</h1>

          {/* empty right column spacer */}
          <div />
        </div>
      </div>

      <p className="ordercat-subtitle">Pick an item and add it to your basket.</p>

      <div className="ordercat-grid">
        {data.items.map((item) => (
          <div className="item-card" key={item.id}>
            <div className="item-imgWrap">
              <img className="item-img" src={item.image} alt={item.name} />
            </div>

            <div className="item-body">
              <div className="item-top">
                <h3 className="item-name">{item.name}</h3>
                <span className="price">₱{item.price}</span>
              </div>
              {item.discountPercent ? (
                <p className="item-discount-badge">
                  {item.flashSale ? "Flash sale" : "Promo"}: {item.discountPercent}% OFF
                </p>
              ) : null}

              <button className="add-btn" onClick={() => addItem(item)}>
                Add to Basket
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="view-cart-fab" onClick={() => navigate("/cart")}>
        🧺 View Basket
      </button>
    </div>
  );
}
