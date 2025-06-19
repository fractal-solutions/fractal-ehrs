import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import PatientStepperDialog from "@/pages/patients/patient-stepper-dialog" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const PATIENTS_STORAGE_KEY = "fractal-ehrs-patients"

function getStoredPatients() {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function savePatients(patients) {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients))
}

export default function PatientManagement() {
  const [patients, setPatients] = useState(getStoredPatients())
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)

  useEffect(() => {
    setPatients(getStoredPatients())
  }, [])

  function handlePatientAdded(newPatient) {
    const updated = [...patients, newPatient]
    setPatients(updated)
    savePatients(updated)
  }

  const filteredPatients = patients.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.condition && p.condition.toLowerCase().includes(search.toLowerCase()))
  )

  const activeCount = patients.filter(p => p.status === "Active").length
  const inactiveCount = patients.filter(p => p.status === "Inactive").length

    const [anamnesis, setAnamnesis] = useState("")
    const [billing, setBilling] = useState([])

    useEffect(() => {
        if (selectedPatient) {
            setAnamnesis(selectedPatient.anamnesis || "")
            setBilling(selectedPatient.billing || [])
        }
    }, [selectedPatient])

    function handleSaveAnamnesis() {
        if (!selectedPatient) return
        const updated = patients.map(p =>
            p.id === selectedPatient.id ? { ...p, anamnesis } : p
        )
        setPatients(updated)
        savePatients(updated)
    }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="mx-2 scroll-m-20 text-2xl font-semibold tracking-tight">Patient Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inactive Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <PatientTable
            patients={filteredPatients}
            search={search}
            setSearch={setSearch}
            onAdd={() => setDialogOpen(true)}
              onRowClick={p => {
                    setSelectedPatient(p)
                    setInfoDialogOpen(true)
                }}
          />
        </TabsContent>
        <TabsContent value="active">
          <PatientTable
            patients={filteredPatients.filter(p => p.status === "Active")}
            search={search}
            setSearch={setSearch}
            onAdd={() => setDialogOpen(true)}
            onRowClick={p => {
                setSelectedPatient(p)
                setInfoDialogOpen(true)
            }}
          />
        </TabsContent>
        <TabsContent value="inactive">
          <PatientTable
            patients={filteredPatients.filter(p => p.status === "Inactive")}
            search={search}
            setSearch={setSearch}
            onAdd={() => setDialogOpen(true)}
            onRowClick={p => {
                setSelectedPatient(p)
                setInfoDialogOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Multi-step Add Patient Dialog (shared with SidebarRight) */}
      <PatientStepperDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPatientAdded={handlePatientAdded}
      />
        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>Patient Information</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                <div><b>Name:</b> {selectedPatient.name}</div>
                <div><b>Age:</b> {selectedPatient.age}</div>
                <div><b>Sex:</b> {selectedPatient.sex || selectedPatient.gender}</div>
                <div><b>Mobile:</b> {selectedPatient.mobile}</div>
                <div><b>Place of Work:</b> {selectedPatient.placeOfWork}</div>
                <div><b>Occupation:</b> {selectedPatient.occupation}</div>
                <div><b>Condition:</b> {selectedPatient.condition}</div>
                <div><b>Status:</b> {selectedPatient.status}</div>
                <div><b>Last Visit:</b> {selectedPatient.lastVisit}</div>
                </div>
                <div className="flex-1 space-y-4">
                <div>
                    <b>Anamnesis / Doctor Notes</b>
                    <Textarea
                    className="mt-1"
                    rows={5}
                    value={anamnesis}
                    onChange={e => setAnamnesis(e.target.value)}
                    placeholder="Enter notes here..."
                    />
                    <Button className="mt-2" size="sm" onClick={handleSaveAnamnesis}>
                    Save Notes
                    </Button>
                </div>
                <div>
                    <b>Billing History</b>
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Procedure</TableHead>
                            <TableHead>Charges</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {billing.length === 0 ? (
                            <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No billing records.
                            </TableCell>
                            </TableRow>
                        ) : (
                            billing.map((b, i) => (
                            <TableRow key={i}>
                                <TableCell>{b.date}</TableCell>
                                <TableCell>{b.procedure}</TableCell>
                                <TableCell>{b.charges}</TableCell>
                                <TableCell>{b.paid}</TableCell>
                                <TableCell>{b.balance}</TableCell>
                            </TableRow>
                            ))
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </div>
                </div>
            </div>
            )}
            <DialogFooter>
            <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>
                Close
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    </div>
  )
}

function PatientTable({ patients, search, setSearch, onAdd, onRowClick }) {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Patients</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48"
          />
          <Button onClick={onAdd}>Add Patient</Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Condition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {patients.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No patients found.
                    </TableCell>
                </TableRow>
                ) : (
                patients.map(p => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onRowClick(p)}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.sex || p.gender}</TableCell>
                    <TableCell>
                        <Badge variant={p.status === "Active" ? "success" : "secondary"}>
                        {p.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{p.lastVisit}</TableCell>
                    <TableCell>{p.condition}</TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
