import { useEffect, useState } from "react"
import { LeaveTable,type LeaveRequest } from "@/components/employee/LeaveTable.tsx"
import api from "@/api/axiosInstance"
export default function LeaveHistory() {
const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const resp = await api.get<LeaveRequest[]>('leaves');
        setLeaves(resp.data);
      } catch (error) {
        console.error('Failed to load leaves', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchLeaves();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Your Leave History</h1>
      <LeaveTable leaves={leaves} />
    </div>
  )
}