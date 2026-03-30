import "./LoyaltyCard.css";

function LoyaltyCard({ loyaltyData }) {
  const {
    totalStamps = 10,
    currentStampCount = 0,
    rewardMilestones = [],
    rewardsUnlocked = [],
    customerName,
    recentActivity = []
  } = loyaltyData;

  const earnedStamps = Math.min(currentStampCount, totalStamps);
  const stampSlots = Array.from({ length: totalStamps }, (_, index) => {
    const slotNumber = index + 1;
    const milestone = rewardMilestones.find((item) => item.stamp === slotNumber);

    return {
      key: `stamp-slot-${slotNumber}`,
      slotNumber,
      isFilled: slotNumber <= earnedStamps,
      milestone
    };
  });

  const nextMilestone = rewardMilestones.find(({ stamp }) => earnedStamps < stamp);
  const stampsToNextReward = nextMilestone ? nextMilestone.stamp - earnedStamps : 0;

  return (
    <section className="loyalty-card" aria-label="Customer loyalty card">
      <div className="loyalty-card__header">
        <h2>Paws & Perks Loyalty Card</h2>
        <p>Earn 1 stamp per completed order.</p>
      </div>

      {customerName ? <p className="loyalty-card__customer">Hi {customerName}, welcome back.</p> : null}

      <div className="loyalty-card__progress-row">
        <p className="loyalty-card__progress">{earnedStamps} / {totalStamps} stamps</p>
        <p className="loyalty-card__remaining">
          {nextMilestone
            ? `${stampsToNextReward} stamp${stampsToNextReward === 1 ? "" : "s"} to unlock ${nextMilestone.reward}`
            : "All loyalty rewards unlocked 🎉"}
        </p>
      </div>

      <div className="loyalty-card__grid" role="list" aria-label="Loyalty stamp progress">
        {stampSlots.map(({ key, slotNumber, isFilled, milestone }) => {
          const rewardUnlocked = milestone ? rewardsUnlocked.includes(milestone.reward) : false;

          return (
            <div
              key={key}
              className={`stamp-slot ${isFilled ? "stamp-slot--filled" : ""} ${milestone ? "stamp-slot--milestone" : ""}`}
              role="listitem"
              aria-label={`Stamp ${slotNumber}${milestone ? ` milestone for ${milestone.reward}` : ""} ${isFilled ? "earned" : "not earned"}`}
            >
              <span className="stamp-slot__icon">{isFilled ? "🐾" : slotNumber}</span>
              {milestone ? (
                <div className={`stamp-slot__reward ${rewardUnlocked ? "stamp-slot__reward--unlocked" : ""}`}>
                  <span>{milestone.reward}</span>
                  {rewardUnlocked ? <strong>Unlocked</strong> : <small>at stamp {milestone.stamp}</small>}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="loyalty-card__milestones" aria-label="Reward milestones">
        <p>Free Latte unlocked at 6 stamps.</p>
        <p>Free Groom unlocked at 10 stamps.</p>
      </div>

      <div className="loyalty-card__meta">
        {recentActivity.length ? (
          <ul>
            {recentActivity.map((entry, index) => (
              <li key={entry.id || entry.orderId || index}>{(entry.id || entry.orderId || "Activity")} • {new Date(entry.earnedAt).toLocaleDateString()} • {entry.status} • +{entry.stampDelta} stamp</li>
            ))}
          </ul>
        ) : (
          <p>Your recent loyalty activity will appear here.</p>
        )}
      </div>
    </section>
  );
}

export default LoyaltyCard;
