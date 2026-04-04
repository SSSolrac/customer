import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { MENU } from "../data/menuData";
import { getMenuCatalog } from "../services/dailyMenuService";
import "./OrderCategory.css";

export default function OrderCategory() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [remoteItems, setRemoteItems] = useState([]);

  useEffect(() => {
    getMenuCatalog().then(setRemoteItems).catch(() => setRemoteItems([]));
  }, []);

  const data = MENU[category];

  const items = useMemo(() => {
    if (!remoteItems.length || !data) return data?.items || [];
    const mapped = remoteItems
      .filter((item) => String(item.categoryId || "").toLowerCase() === String(category || "").toLowerCase())
      .map((item) => {
        const basePrice = Number(item.price || 0);
        const discount = Number(item.discount || 0);
        const discounted = discount > 0 ? Math.max(basePrice - discount, 0) : basePrice;
        return {
          id: item.id,
          name: `${item.code || ""} ${item.name || ""}`.trim(),
          image: item.imageUrl || data?.items?.[0]?.image,
          price: discounted,
          originalPrice: basePrice,
          isAvailable: item.isAvailable !== false,
          discountAmount: discount
        };
      });
    return mapped.length ? mapped : (data?.items || []);
  }, [remoteItems, data, category]);

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

          <div />
        </div>
      </div>

      <p className="ordercat-subtitle">Pick an item and add it to your basket.</p>

      <div className="ordercat-grid">
        {items.map((item) => (
          <div className="item-card" key={item.id}>
            <div className="item-imgWrap">
              <img className="item-img" src={item.image} alt={item.name} />
            </div>

            <div className="item-body">
              <div className="item-top">
                <h3 className="item-name">{item.name}</h3>
                <span className="price">₱{item.price}</span>
              </div>
              {item.discountAmount ? <p className="item-discount-badge">Discount: ₱{item.discountAmount}</p> : null}
              {item.originalPrice && item.originalPrice !== item.price ? <p className="item-discount-badge">Was ₱{item.originalPrice}</p> : null}

              <button className="add-btn" disabled={item.isAvailable === false} onClick={() => addItem(item)}>
                {item.isAvailable === false ? "Unavailable" : "Add to Basket"}
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
