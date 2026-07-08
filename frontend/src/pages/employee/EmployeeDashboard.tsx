import { useEffect, useState } from "react";
import { LeaveTable, type LeaveRequest } from "@/components/employee/LeaveTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, FileCheck2, Hourglass } from "lucide-react";
import api from "@/api/axiosInstance";

export default function EmployeeDashboard() {
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

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const totalDaysTaken = leaves
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + l.totalDays, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground animate-pulse">
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your leave metrics and current status.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Hourglass className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting manager approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <FileCheck2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Approved requests this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days Taken</CardTitle>
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDaysTaken} Days</div>
            <p className="text-xs text-muted-foreground">Sum of active approved leave lengths</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests Table Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Recent Leave History</h2>
        <LeaveTable leaves={leaves} />
      </div>
    </div>
  );
}