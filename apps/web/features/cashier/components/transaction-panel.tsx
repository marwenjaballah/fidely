'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface TransactionPanelProps {
  onProcess: (type: 'issue' | 'redeem', amount: number, rewardId?: string) => void;
}

export function TransactionPanel({ onProcess }: TransactionPanelProps) {
  const [spendAmount, setSpendAmount] = useState('');
  const [rewardId, setRewardId] = useState('');

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendAmount || isNaN(Number(spendAmount))) return;
    onProcess('issue', Number(spendAmount));
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardId) return;
    onProcess('redeem', 0, rewardId);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <Tabs defaultValue="issue" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="issue">Issue Points</TabsTrigger>
          <TabsTrigger value="redeem">Redeem</TabsTrigger>
        </TabsList>
        
        <TabsContent value="issue">
          <form onSubmit={handleIssue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spend">TND Spent</Label>
              <Input
                id="spend"
                type="number"
                step="0.1"
                placeholder="0.00"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                className="text-lg py-6"
                required
              />
            </div>
            <Button type="submit" className="w-full py-6 text-lg rounded-xl">
              Ready to Scan
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="redeem">
          <form onSubmit={handleRedeem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward ID</Label>
              <Input
                id="reward"
                type="text"
                placeholder="Enter Reward ID"
                value={rewardId}
                onChange={(e) => setRewardId(e.target.value)}
                className="text-lg py-6"
                required
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full py-6 text-lg rounded-xl">
              Ready to Scan
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
