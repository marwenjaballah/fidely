export default function CustomerRewardsPage({ params }: { params: { slug: string } }) {
  // Mock rewards
  const rewards = [
    { id: 1, name: 'Free Espresso', points: 300 },
    { id: 2, name: 'Free Pastry', points: 500 },
    { id: 3, name: 'Free Large Latte', points: 800 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md mt-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Available Rewards</h1>
          <p className="text-slate-500 mt-2">Spend your points here</p>
        </div>

        <div className="space-y-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center">
              <span className="font-medium text-slate-800">{reward.name}</span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                {reward.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
