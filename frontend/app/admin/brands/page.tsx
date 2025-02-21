"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { fetchBrands, deleteBrand } from "@/lib/mockData"
import type { Brand } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"
import { Pencil, Trash, Plus, Search, ChevronUp, ChevronDown } from "lucide-react"
import { format } from "date-fns"

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Brand>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; brandId: string | null }>({
    isOpen: false,
    brandId: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const router = useRouter()

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedBrands = await fetchBrands()
      setBrands(fetchedBrands)
    } catch (err) {
      setError("Failed to fetch brands. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBrand = (brandId: string) => {
    setDeleteConfirmation({ isOpen: true, brandId })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.brandId) {
      setIsLoading(true)
      setError(null)
      try {
        await deleteBrand(deleteConfirmation.brandId)
        setBrands(brands.filter((brand) => brand.id !== deleteConfirmation.brandId))
        toast({
          title: "Brand deleted",
          description: "The brand has been successfully deleted.",
        })
      } catch (err) {
        setError("Failed to delete brand. Please try again.")
      } finally {
        setIsLoading(false)
        setDeleteConfirmation({ isOpen: false, brandId: null })
      }
    }
  }

  const handleSort = (column: keyof Brand) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedBrands = [...brands].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const filteredBrands = sortedBrands.filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Brand Management</h2>
        <Button onClick={() => router.push("/admin/brands/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Brand
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Name{" "}
                  {sortColumn === "name" &&
                    (sortDirection === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer">
                  Created At{" "}
                  {sortColumn === "created_at" &&
                    (sortDirection === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead onClick={() => handleSort("updated_at")} className="cursor-pointer">
                  Updated At{" "}
                  {sortColumn === "updated_at" &&
                    (sortDirection === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>
                    {brand.description.length > 50 ? `${brand.description.substring(0, 50)}...` : brand.description}
                  </TableCell>
                  <TableCell>
                    <img src={brand.logo || "/placeholder.svg"} alt={brand.name} className="w-10 h-10 object-contain" />
                  </TableCell>
                  <TableCell>{format(new Date(brand.created_at), "PPP")}</TableCell>
                  <TableCell>{format(new Date(brand.updated_at), "PPP")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => router.push(`/admin/brands/${brand.id}/edit`)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => handleDeleteBrand(brand.id)}>
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBrands.length === 0 && (
            <div className="text-center py-4">
              <p>No brands found.</p>
            </div>
          )}

          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(filteredBrands.length / itemsPerPage) }, (_, i) => (
              <Button
                key={i}
                onClick={() => paginate(i + 1)}
                variant={currentPage === i + 1 ? "default" : "outline"}
                className="mx-1"
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, brandId: null })}
        onConfirm={confirmDelete}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? This action cannot be undone."
      />
    </div>
  )
}

