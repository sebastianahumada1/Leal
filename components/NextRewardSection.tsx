interface NextRewardSectionProps {
  reward: {
    id: string;
    name: string;
    description: string | null;
    required_stamps: number;
    icon: string | null;
  };
  currentStamps: number;
}

export default function NextRewardSection({
  reward,
  currentStamps,
}: NextRewardSectionProps) {
  const isUnlocked = currentStamps >= reward.required_stamps;
  const icon = reward.icon || 'local_bar';

  return (
    <div className="flex items-center gap-4 p-4 rustic-border bg-forest/50">
      <div className="size-12 flex items-center justify-center text-primary border border-primary/40">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="header-text text-primary font-bold text-sm">
          {reward.name}
        </p>
        <p className="text-primary/60 text-[10px] uppercase tracking-widest font-sans">
          Desbloquea con {reward.required_stamps} sellos
        </p>
      </div>
      {isUnlocked ? (
        <span className="material-symbols-outlined text-primary text-lg">
          check_circle
        </span>
      ) : (
        <span className="material-symbols-outlined text-primary/40 text-lg">
          lock
        </span>
      )}
    </div>
  );
}
