import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export interface LeaveRequest {
  id: string;
  leaveType: "CASUAL" | "UNPAID"|"EARNED" | "SICK" | string; 
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt?: string;
}

interface LeaveTableProps {
  leaves: LeaveRequest[];
}

export function LeaveTable({ leaves }: LeaveTableProps) {
  
  const getStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
      case "APPROVED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-120">Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-center">Days</TableHead>
            <TableHead className="max-w-200 truncate">Reason</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No leave history found.
              </TableCell>
            </TableRow>
          ) : (
            leaves.map((leave) => (
              <TableRow key={leave.id}>
                {/* Leave Type */}
                <TableCell className="font-medium capitalize">
                  {leave.leaveType.toLowerCase().replace("_", " ")}
                </TableCell>
                
                {/* Date Ranges */}
                <TableCell>{formatDate(leave.startDate)}</TableCell>
                <TableCell>{formatDate(leave.endDate)}</TableCell>
                
                {/* Total Duration */}
                <TableCell className="text-center">{leave.totalDays}</TableCell>
                
                {/* Reason description */}
                <TableCell className="max-w-200 truncate text-muted-foreground" title={leave.reason}>
                  {leave.reason}
                </TableCell>
                
                {/* Colored Status Badge */}
                <TableCell className="text-right">
                  {getStatusBadge(leave.status)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}