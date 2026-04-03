import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { itemsByCategory, categories } from "../data/menuData";
import { useCart } from "../context/CartContext";
import "./CategoryItems.css";

export default function CategoryItems() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const category = categories.find((c) => c.id === categoryId);
  const items = itemsByCategory[categoryId] || [];

  return (
    <div className="cat-page">
      <div className="cat-topbar">
        <div className="cat-left">
          <Link to="/order" className="cat-back">← Back</Link>
          <h1 className="cat-title">{category?.label || "Category"}</h1>
        </div>

        <button className="cat-cartBtn" onClick={() => navigate("/cart")}>
          Go to Cart
        </button>
      </div>

      <div className="cat-grid">
        {items.map((item) => (
          <div className="cat-card" key={item.id}>
            <div className="cat-imgWrap">
              <img className="cat-img" src={item.image} alt={item.name} />
            </div>

            <div className="cat-body">
              <div className="cat-name">{item.name}</div>

              <div className="cat-row">
                <span className="cat-tag">{category?.label}</span>
                <span className="cat-price">₱{item.price}</span>
              </div>
              {item.discountPercent ? (
                <div className="cat-discount">{item.flashSale ? "Flash sale" : "Promo"}: {item.discountPercent}% OFF</div>
              ) : null}

              <button
                className="cat-addBtn"
                onClick={() => addItem({ ...item, category: categoryId })}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
