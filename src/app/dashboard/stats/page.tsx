"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatsView from "@/components/dashboard/StatsView";
import { Loader2 } from "lucide-react";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [readings, setReadings] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchReadings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('plan_readings')
        .select(`*, plans!inner(user_id)`)
        .eq('plans.user_id', user.id);

      if (data) setReadings(data);
      setLoading(false);
    };
    fetchReadings();
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">閱讀統計</h1>
      <StatsView readings={readings} />
    </div>
  );
}