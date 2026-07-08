import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/api/axiosInstance";

export default function ApplyLeave() {
  const navigate = useNavigate();
  
  // Form State
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  
  // Feedback State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!leaveType || !startDate || !endDate || !reason) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("leaves", {
        leaveType,
        startDate,
        endDate,
        reason,
      });

      const data = response.data;

      if (response.status < 200 || response.status >= 300) {
        throw new Error(data.error || "Something went wrong while applying.");
      }

      setSuccess(true);
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      
      setTimeout(() => {
        navigate("/employee/dashboard");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ma-w-5xl mx-auto w-full  space-y-6 pt-2 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
        <p className="text-muted-foreground">
          Submit a new request to your manager for approval.
        </p>
      </div>

      <div className="grid grid-cols-1 p-6 lg:grid-cols-3 gap-6 items-start">
        
        <Card className="lg:col-span-3 ">
          <CardHeader>
            <CardTitle>Leave Application Details</CardTitle>
            <CardDescription>
              Provide the context details regarding your time off.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription>
                    Leave applied successfully! Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={leaveType || null}
                  onValueChange={(val: string | null) => setLeaveType(val ?? "")}
                >
                  <SelectTrigger id="leaveType" className="w-full">
                    <SelectValue placeholder="Select type of leave" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASUAL">Casual Leave</SelectItem>
                    <SelectItem value="EARNED">Earned Leave</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="PAID">Paid Leave</SelectItem>

                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  placeholder="Brief description of why you need this time off..."
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/employee/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-6">
                  {loading ? "Submitting Request..." : "Submit Leave"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}