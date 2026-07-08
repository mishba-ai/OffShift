import { useEffect, useState } from "react"
import { LeaveTable,type LeaveRequest } from "@/components/employee/LeaveTable.tsx"
import api from "@/api/axiosInstance"
export default function LeaveHistory() {
const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const fetchLeaves = async () => {
    try {
      const resp = await api.get<{ leaves: LeaveRequest[] }>('leaves');
      
      const leavesData = resp.data?.leaves || [];
      setLeaves(leavesData);
      
    } catch (error) {
      console.error('Failed to load leaves', error);
      setLeaves([]); 
    } finally {
      setLoading(false);
    }
  };

  void fetchLeaves();
  }, []);

  return (
    <div className="space-y-4 w-full ">
      <h1 className="text-2xl font-bold tracking-tight">Your Leave History</h1>
      <div className="w-full p-6">
      <LeaveTable leaves={leaves} /></div>
    </div>
  )
}