import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import mountain from '/mountain.webp'
import api from "@/api/axiosInstance"
import type { ChangeEvent, SubmitEvent } from "react"


function Login() {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    department: ""
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = isSignup ? "auth/register" : "auth/login"
      const body = isSignup
        ? { ...form, department: form.department || undefined }
        : { email: form.email, password: form.password }

      const res = await api.post(endpoint, body)
      const data = res.data

      if (isSignup) {
        setIsSignup(false)
        setForm({ ...form, password: "" })
        setError("")
      } else {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", data.role)

        navigate(data.role === "MANAGER" ? "/manager/dashboard" : "/employee/dashboard")
      }
    } catch (err: any) {
      console.error("LOGIN ERROR:", err.response?.status, err.response?.data)
      setError(err.response?.data?.error || "Unable to reach server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-screen h-screen flex justify-around items-center bg-black overflow-hidden">

      <img
        src={mountain}
        alt="Mountain Background"
        className="absolute inset-0 w-full h-full object-fill z-0"
      />

      <div className="w-96 z-10">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{isSignup ? "Create an account" : "Login to your account"}</CardTitle>
            <CardDescription>
              {isSignup
                ? "Enter your details below to create an account"
                : "Enter your email below to login to your account"}
            </CardDescription>
            <CardAction>
              <Button
                variant="link"
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError("")
                }}
              >
                {isSignup ? "Login" : "Sign Up"}
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">

                {isSignup && (
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {!isSignup && (
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {isSignup && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department (optional)</Label>
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="Engineering"
                        value={form.department}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="border rounded-md h-9 px-3 bg-transparent text-sm"
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
              <CardFooter className="flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  onSubmit={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>


        </Card>
      </div>

    </div>
  )
}

export default Login