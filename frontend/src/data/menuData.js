// Default Category Images
import sandwiches from "../assets/sandwiches.png";
import rice from "../assets/ricemeal.png";
import iced from "../assets/coffee.png";
import hot from "../assets/hot.png";
import noncafe from "../assets/soda.png";
import frappe from "../assets/frappe.png";

// Specific Item Images (Updated to .jpg based on your folder!)
import grilledCheese from "../assets/Grilled Cheese Sandwich.jpg";
import hungarianSandwich from "../assets/Toasted Cheesy Hungarian Sandwich.jpg";
import chickenPoppers from "../assets/Chicken Poppers with Rice.jpg";
import americanoIced from "../assets/Americano (Iced).jpg";
import americanoHot from "../assets/Americano (Hot).jpg";
import fourSeasons from "../assets/Four Seasons.jpg";
import hotChoco from "../assets/Hot Chocolate.jpg";
import icedChoco from "../assets/Iced Choco Milk.jpg";
import strawberryMilk from "../assets/Strawberry Milk.jpg";
import blueberrySoda from "../assets/Blueberry Soda.jpg";
import appleSoda from "../assets/Green Apple Soda.jpg";
import strawberrySoda from "../assets/Strawberry Soda.jpg";
import caramelFrappe from "../assets/Caramel Macchiato Frappe.jpg";
import chocoJavaFrappe from "../assets/Choco Java Chip Frappe.jpg";
import matchaFrappe from "../assets/Matcha Frappe.jpg";
import strawberryFrappe from "../assets/Strawberry Frappe.jpg";


export const MENU = {
  "pasta-snacks": {
    title: "Pasta & Sandwiches",
    image: sandwiches,
    items: [
      { id: "ps-1", name: "Baked Macaroni", price: 190, image: sandwiches },
      { id: "ps-2", name: "Chicken Alfredo Pasta", price: 190, image: sandwiches },
      { id: "ps-3", name: "Chicken Macaroni Salad", price: 120, image: sandwiches },
      { id: "ps-4", name: "Cheesy Beef Burger", price: 150, image: sandwiches },
      { id: "ps-5", name: "Chicken Popcorn", price: 120, image: sandwiches },
      { id: "ps-6", name: "Fish & Fries (good for sharing)", price: 200, image: sandwiches },
      { id: "ps-7", name: "Grilled Cheese Sandwich", price: 70, image: grilledCheese },
      { id: "ps-8", name: "Homemade Pork Siomai (4pcs)", price: 60, image: sandwiches },
      { id: "ps-9", name: "Toasted Cheesy Hungarian Sandwich", price: 90, image: hungarianSandwich },
      { id: "ps-10", name: "Toasted Tuna Sandwich", price: 90, image: sandwiches },
    ],
  },

  "rice-meals": {
    title: "Rice Meals",
    image: rice,
    items: [
      { id: "rm-1", name: "Breaded Fish Fillet with Rice", price: 140, image: rice },
      { id: "rm-2", name: "Burger Steak with Rice", price: 160, image: rice },
      { id: "rm-3", name: "Chicken Cordon Bleu with Rice", price: 180, image: rice },
      { id: "rm-4", name: "Chicken Poppers with Rice", price: 140, image: chickenPoppers },
      { id: "rm-5", name: "Homemade Pork Embotido with Rice", price: 150, image: rice },
      { id: "rm-6", name: "Homemade Pork Siomai (4pcs) with Rice", price: 80, image: rice },
      { id: "rm-7", name: "Hungarian Sausage with Rice", price: 120, image: rice },
    ],
  },

  "iced-coffee": {
    title: "Iced Coffee (16oz)",
    image: iced,
    items: [
      { id: "ic-1", name: "Americano", price: 100, image: americanoIced },
      { id: "ic-2", name: "Cafe Latte", price: 120, image: iced },
      { id: "ic-3", name: "Caramel Macchiato", price: 145, image: iced },
      { id: "ic-4", name: "Cloud Americano", price: 120, image: iced },
      { id: "ic-5", name: "Iced Caramel Latte", price: 135, image: iced },
      { id: "ic-6", name: "Iced Cocoa Tiramisu", price: 160, image: iced },
      { id: "ic-7", name: "Iced Coconut Latte", price: 145, image: iced },
      { id: "ic-8", name: "Iced Hazelnut Latte", price: 135, image: iced },
      { id: "ic-9", name: "Iced Matcha Latte", price: 135, image: iced },
      { id: "ic-10", name: "Iced Mocha Latte", price: 135, image: iced },
      { id: "ic-11", name: "Iced Vanilla Latte", price: 135, image: iced },
      { id: "ic-12", name: "Spanish Latte", price: 140, image: iced },
    ],
  },

  "hot-coffee": {
    title: "Hot Coffee (8oz)",
    image: hot,
    items: [
      { id: "hc-1", name: "Americano", price: 90, image: americanoHot },
      { id: "hc-2", name: "Cafe Latte", price: 110, image: hot },
      { id: "hc-3", name: "Caramel Macchiato", price: 130, image: hot },
      { id: "hc-4", name: "Matcha Latte", price: 110, image: hot },
      { id: "hc-5", name: "Spanish Latte", price: 120, image: hot },
    ],
  },

  "non-caffeinated": {
    title: "Non-Caffeinated",
    image: noncafe,
    items: [
      { id: "nc-1", name: "Four Seasons", price: 90, image: fourSeasons },
      { id: "nc-2", name: "Hot Chocolate", price: 110, image: hotChoco },
      { id: "nc-3", name: "Iced Choco Milk", price: 120, image: icedChoco },
      { id: "nc-4", name: "Strawberry Milk", price: 120, image: strawberryMilk },
      { id: "nc-5", name: "Blueberry Soda", price: 90, image: blueberrySoda },
      { id: "nc-6", name: "Green Apple Soda", price: 90, image: appleSoda },
      { id: "nc-7", name: "Strawberry Soda", price: 90, image: strawberrySoda },
    ],
  },

  frappuccino: {
    title: "Frappuccino (16oz)",
    image: frappe,
    items: [
      { id: "fr-1", name: "Caramel Macchiato Frappe", price: 170, image: caramelFrappe },
      { id: "fr-2", name: "Choco Java Chip Frappe", price: 170, image: chocoJavaFrappe },
      { id: "fr-3", name: "Matcha Frappe", price: 170, image: matchaFrappe },
      { id: "fr-4", name: "Peanut Butter Choco Frappe", price: 175, image: frappe },
      { id: "fr-5", name: "Strawberry Frappe", price: 170, image: strawberryFrappe },
    ],
  },
};