
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link2 } from 'lucide-react';

const StatsCard = () => {
  return (
    <Card className="w-full max-w-lg rounded-2xl shadow-card border-none overflow-hidden transition-all duration-300 hover:shadow-elevated">
      <CardContent className="p-8">
        <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-civilink-blue text-white">
          <Link2 className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-semibold mb-6">CiviLink Platform</h3>
        
        <div className="space-y-6">
          <StatItem label="Issues Reported" value="345" />
          <StatItem label="In Progress" value="78" />
          <StatItem label="Resolved" value="267" />
        </div>
      </CardContent>
    </Card>
  );
};

const StatItem = ({ label, value }: { label: string, value: string }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-civilink-text-secondary">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
};

export default StatsCard;
