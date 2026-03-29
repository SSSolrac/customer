import "./LoyaltyCard.css";

function LoyaltyCard({ loyaltyData }) {
  const { stampCount, stampsRequired, rewardAvailable, customerName } = loyaltyData;

  const earnedStamps = Math.min(stampCount, stampsRequired);
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
        <p>Buy 8 drinks, get 1 free</p>
      </div>

      {customerName ? (
        <p className="loyalty-card__customer">Hi {customerName}, keep collecting stamps!</p>
      ) : null}

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
        {rewardAvailable ? <strong className="loyalty-card__reward">🎉 Free drink unlocked!</strong> : null}
      </div>
    </section>
  );
}

export default LoyaltyCard;
