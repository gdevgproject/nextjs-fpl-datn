"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchUsers, updateUser } from "@/lib/mockData"
import type { User } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"
import { Eye, FileDown, Edit, Lock, Unlock } from "lucide-react"
import debounce from "lodash/debounce"
import { format } from "date-fns"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  })
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: "asc" | "desc" }>({
    key: "registered_at",
    direction: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedUsers = await fetchUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      setError("Failed to fetch users. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSort = (key: keyof User) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleStatusChange = async (userId: string, newStatus: User["status"]) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedUser = await updateUser(userId, { status: newStatus })
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)))
      toast({
        title: "User status updated",
        description: `User ${userId} status changed to ${newStatus}.`,
      })
    } catch (err) {
      setError("Failed to update user status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedUser = await updateUser(userId, { role: newRole })
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)))
      toast({
        title: "User role updated",
        description: `User ${userId} role changed to ${newRole}.`,
      })
    } catch (err) {
      setError("Failed to update user role. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filters.role === "" || user.role === filters.role
      const matchesStatus = filters.status === "" || user.status === filters.status
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

  const paginatedUsers = filteredAndSortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)

  const handleExport = () => {
    // Implement CSV export logic here
    toast({ title: "Export", description: "CSV export functionality to be implemented." })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push("/admin/users/new")}>Add User</Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search by name, email, user code..." onChange={handleSearchChange} className="w-full" />
            <Select onValueChange={(value) => handleFilterChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("user_code")}>
                  User Code {sortConfig.key === "user_code" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                  Email {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("totalOrders")}>
                  Total Orders {sortConfig.key === "totalOrders" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("totalSpent")}>
                  Total Spent {sortConfig.key === "totalSpent" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("registered_at")}>
                  Registered At {sortConfig.key === "registered_at" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.user_code}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as User["role"])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Change role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "success" : user.status === "inactive" ? "warning" : "destructive"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.totalOrders}</TableCell>
                  <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(user.registered_at), "PPpp")}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${user.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, user.status === "blocked" ? "active" : "blocked")}
                      >
                        {user.status === "blocked" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>items per page</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

