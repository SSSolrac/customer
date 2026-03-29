import "./LoyaltyCard.css";

function LoyaltyCard({ loyaltyData }) {
  const {
    stampCount,
    stampsRequired,
    rewardAvailable,
    rewardsRedeemable = 0,
    customerName,
    recentActivity = [],
    totalEligibleOrders = 0,
    completedOrdersCount = 0,
    progressMessage = ""
  } = loyaltyData;

  const earnedStamps = Math.min(stampCount, stampsRequired);
  const stampsToGo = Math.max(stampsRequired - earnedStamps, 0);
  const stampSlots = Array.from({ length: stampsRequired }, (_, index) => {
    const isFilled = index < earnedStamps;

    return {
      key: `stamp-slot-${index + 1}`,
      slotNumber: index + 1,
      isFilled
    };
  });

  return (
    <section className="loyalty-card" aria-label="Customer loyalty card">
      <div className="loyalty-card__header">
        <h2>Loyalty Card</h2>
        <p>Every completed coffee-based order adds 1 stamp.</p>
      </div>

      {customerName ? <p className="loyalty-card__customer">Hi {customerName}, welcome back.</p> : null}

      <div className="loyalty-card__grid" role="list" aria-label="Loyalty stamp progress">
        {stampSlots.map(({ key, slotNumber, isFilled }) => (
          <div
            key={key}
            className={`stamp-slot ${isFilled ? "stamp-slot--filled" : ""}`}
            role="listitem"
            aria-label={`Stamp ${slotNumber} ${isFilled ? "earned" : "not earned"}`}
          >
            <span>{isFilled ? "☕" : slotNumber}</span>
          </div>
        ))}
      </div>

      <div className="loyalty-card__footer">
        <p>{earnedStamps} / {stampsRequired} stamps</p>
        <p>{progressMessage}</p>
        {rewardAvailable ? (
          <strong className="loyalty-card__reward">🎉 {rewardsRedeemable} free drink reward{rewardsRedeemable > 1 ? "s" : ""} ready at checkout.</strong>
        ) : (
          <span>{stampsToGo} more completed coffee orders to unlock a free drink.</span>
        )}
      </div>

      <div className="loyalty-card__meta">
        <p>{completedOrdersCount} completed orders • {totalEligibleOrders} coffee-eligible</p>
        {recentActivity.length ? (
          <ul>
            {recentActivity.map((entry) => (
              <li key={entry.id}>{entry.id} • {new Date(entry.earnedAt).toLocaleDateString()} • {entry.status} • +{entry.points} stamp</li>
            ))}
          </ul>
        ) : (
          <p>Your completed coffee orders will appear here.</p>
        )}
      </div>
    </section>
  );
}

export default LoyaltyCard;
