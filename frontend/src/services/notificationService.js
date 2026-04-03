import { getScopedStorageKey, getSessionCustomerId } from "./sessionService";
import { getOrderHistory } from "./orderService";
import { MENU } from "../data/menuData";
import { canonicalStatusToLabel } from "../constants/canonical";

const NOTIFICATION_STORE_KEY = "happyTailsCustomerNotifications_v1";

const ORDER_STATUS_NOTIFICATION_MAP = {
  pending: "order_created",
  confirmed: "order_confirmed",
  preparing: "order_preparing",
  ready: "order_ready",
  completed: "order_completed",
  delivered: "order_completed",
  cancelled: "order_cancelled"
};

function getNotificationKey(customerId = getSessionCustomerId()) {
  return getScopedStorageKey(NOTIFICATION_STORE_KEY, customerId);
}

function readStore(customerId = getSessionCustomerId()) {
  try {
    return JSON.parse(localStorage.getItem(getNotificationKey(customerId)) || "[]");
  } catch {
    return [];
  }
}

function writeStore(items, customerId = getSessionCustomerId()) {
  localStorage.setItem(getNotificationKey(customerId), JSON.stringify(items));
}

function sortByDateDesc(notifications) {
  return [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function mapStatusToMessage(type, orderNumber, statusLabel) {
  const shortOrder = orderNumber || "your order";
  switch (type) {
    case "order_created":
      return {
        title: "Order received",
        message: `We received ${shortOrder}. The kitchen will review it shortly.`
      };
    case "order_confirmed":
      return {
        title: "Order confirmed",
        message: `${shortOrder} has been confirmed by the café team.`
      };
    case "order_preparing":
      return {
        title: "Now preparing",
        message: `${shortOrder} is now being prepared.`
      };
    case "order_ready":
      return {
        title: "Ready for pickup",
        message: `${shortOrder} is ready.`
      };
    case "order_completed":
      return {
        title: "Order completed",
        message: `${shortOrder} has been completed. Enjoy and thank you!`
      };
    case "order_cancelled":
      return {
        title: "Order cancelled",
        message: `${shortOrder} was cancelled.`
      };
    default:
      return {
        title: `Order ${statusLabel}`,
        message: `${shortOrder} is now ${statusLabel.toLowerCase()}.`
      };
  }
}

function buildOrderNotifications(orders) {
  const notifications = [];

  orders.forEach((order) => {
    const timeline = Array.isArray(order.statusTimeline) && order.statusTimeline.length
      ? order.statusTimeline
      : [{ status: order.status, at: order.updatedAt || order.createdAt }];

    timeline.forEach((entry) => {
      const normalizedStatus = String(entry.status || "").toLowerCase();
      const type = ORDER_STATUS_NOTIFICATION_MAP[normalizedStatus];
      if (!type) return;

      const createdAt = entry.at || order.updatedAt || order.createdAt;
      const statusLabel = canonicalStatusToLabel(normalizedStatus);
      const copy = mapStatusToMessage(type, order.orderNumber || order.id, statusLabel);

      notifications.push({
        id: `order:${order.id}:${normalizedStatus}:${createdAt}`,
        type,
        title: copy.title,
        message: copy.message,
        createdAt,
        isRead: false,
        orderId: order.id
      });
    });
  });

  return notifications;
}

function getPromoSource() {
  return Object.values(MENU)
    .flatMap((category) => (category.items || []).map((item) => ({ categoryTitle: category.title, ...item })))
    .filter((item) => Number(item.discountPercent || 0) > 0)
    .map((item) => ({
      id: `promo:item:${item.id}:${item.discountPercent}`,
      type: item.flashSale ? "promo_flash_sale" : "promo_discount",
      title: item.flashSale ? "Flash sale live" : "Item discount available",
      message: `${item.name} is ${item.discountPercent}% off${item.discountEndsAt ? ` until ${new Date(item.discountEndsAt).toLocaleString()}` : ""}. (${item.categoryTitle})`,
      createdAt: item.discountCreatedAt || new Date().toISOString(),
      isRead: false
    }));
}

export async function syncCustomerNotifications() {
  const customerId = getSessionCustomerId();
  const current = readStore(customerId);
  const byId = new Map(current.map((item) => [item.id, item]));

  const orders = await getOrderHistory();
  const derivedOrderNotifications = buildOrderNotifications(orders);
  const promoNotifications = getPromoSource();

  [...derivedOrderNotifications, ...promoNotifications].forEach((notification) => {
    const existing = byId.get(notification.id);
    byId.set(notification.id, {
      ...notification,
      isRead: existing?.isRead ?? false
    });
  });

  const merged = sortByDateDesc(Array.from(byId.values()));
  writeStore(merged, customerId);
  return merged;
}

export function getCustomerNotifications() {
  return sortByDateDesc(readStore());
}

export function getUnreadNotificationCount() {
  return readStore().filter((item) => !item.isRead).length;
}

export function markNotificationRead(notificationId) {
  if (!notificationId) return;
  const items = readStore();
  const next = items.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item));
  writeStore(next);
}

export function markAllNotificationsRead() {
  const items = readStore();
  const next = items.map((item) => ({ ...item, isRead: true }));
  writeStore(next);
}
