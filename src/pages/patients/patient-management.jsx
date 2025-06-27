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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const API_BASE = "http://localhost:3000"

async function fetchPatients() {
  // Fetch the latest 1000 patients (adjust as needed)
  const res = await fetch(`${API_BASE}/patients/latest/1000`)
  if (!res.ok) throw new Error("Failed to fetch patients")
  return await res.json()
}

async function fetchPatientById(id) {
  const res = await fetch(`${API_BASE}/patient/${id}`)
  if (!res.ok) throw new Error("Failed to fetch patient")
  return await res.json()
}

async function addPatient(patient) {
  const res = await fetch(`${API_BASE}/patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  })
  if (!res.ok) throw new Error("Failed to add patient")
  return await res.json()
}

async function addDoctorNote(patientId, note) {
  const res = await fetch(`${API_BASE}/patient/${patientId}/note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  })
  if (!res.ok) throw new Error("Failed to add note")
  return await res.json()
}

async function addProcedure(patientId, procedure) {
  const res = await fetch(`${API_BASE}/patient/${patientId}/procedure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(procedure),
  })
  if (!res.ok) throw new Error("Failed to add procedure")
  return await res.json()
}

export default function PatientManagement() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // For patient details dialog
  const [anamnesis, setAnamnesis] = useState("")
  const [billing, setBilling] = useState([])

  useEffect(() => {
    setLoading(true)
    fetchPatients()
      .then(setPatients)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handlePatientAdded(newPatient) {
    setLoading(true)
    setError(null)
    try {
      // Map 'mobile' to 'phone' for API compatibility
      const patientForApi = { ...newPatient, phone: newPatient.mobile || newPatient.phone }
      await addPatient(patientForApi)
      const updated = await fetchPatients()
      setPatients(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRowClick(p) {
    setLoading(true)
    setError(null)
    try {
      const fullPatient = await fetchPatientById(p.id)
      setSelectedPatient(fullPatient)
      setAnamnesis((fullPatient.doctorsNotes && fullPatient.doctorsNotes[0] && fullPatient.doctorsNotes[0].length > 0)
        ? fullPatient.doctorsNotes[0][fullPatient.doctorsNotes[0].length - 1].note
        : "")
      setBilling(fullPatient.procedures && fullPatient.procedures[0] ? fullPatient.procedures[0] : [])
      setInfoDialogOpen(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAnamnesis() {
    if (!selectedPatient) return
    setLoading(true)
    setError(null)
    try {
      await addDoctorNote(selectedPatient.id, {
        date: new Date().toISOString().slice(0, 10),
        note: anamnesis
      })
      // Refresh patient details
      const fullPatient = await fetchPatientById(selectedPatient.id)
      setSelectedPatient(fullPatient)
      setAnamnesis((fullPatient.doctorsNotes && fullPatient.doctorsNotes[0] && fullPatient.doctorsNotes[0].length > 0)
        ? fullPatient.doctorsNotes[0][fullPatient.doctorsNotes[0].length - 1].note
        : "")
      setBilling(fullPatient.procedures && fullPatient.procedures[0] ? fullPatient.procedures[0] : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.condition && p.condition.toLowerCase().includes(search.toLowerCase()))
  )

  const activeCount = patients.filter(p => p.status === "Active").length
  const inactiveCount = patients.filter(p => p.status === "Inactive").length

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

      {loading && <div className="text-center text-muted-foreground">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

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
            onRowClick={handleRowClick}
          />
        </TabsContent>
        <TabsContent value="active">
          <PatientTable
            patients={filteredPatients.filter(p => p.status === "Active")}
            search={search}
            setSearch={setSearch}
            onAdd={() => setDialogOpen(true)}
            onRowClick={handleRowClick}
          />
        </TabsContent>
        <TabsContent value="inactive">
          <PatientTable
            patients={filteredPatients.filter(p => p.status === "Inactive")}
            search={search}
            setSearch={setSearch}
            onAdd={() => setDialogOpen(true)}
            onRowClick={handleRowClick}
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
        <DialogContent className="w-[98vw] max-w-screen-2xl max-h-[90vh] p-0 overflow-x-auto">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Patient Information</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <Tabs defaultValue="info" className="w-full px-6 pb-2">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Info & Doctor Notes</TabsTrigger>
                <TabsTrigger value="billing">Billing History</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Patient Details */}
                  <Card className="flex-1 min-w-[280px] max-w-md bg-muted/60 border border-muted-foreground/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg tracking-tight">Patient Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <dt className="font-semibold text-muted-foreground">Name:</dt>
                        <dd>{selectedPatient.name}</dd>
                        <dt className="font-semibold text-muted-foreground">Age:</dt>
                        <dd>{selectedPatient.age}</dd>
                        <dt className="font-semibold text-muted-foreground">Sex:</dt>
                        <dd>{selectedPatient.sex || selectedPatient.gender}</dd>
                        <dt className="font-semibold text-muted-foreground">Mobile:</dt>
                        <dd>{selectedPatient.phone || selectedPatient.mobile}</dd>
                        <dt className="font-semibold text-muted-foreground">Place of Work:</dt>
                        <dd>{selectedPatient.placeOfWork}</dd>
                        <dt className="font-semibold text-muted-foreground">Occupation:</dt>
                        <dd>{selectedPatient.occupation}</dd>
                        <dt className="font-semibold text-muted-foreground">Condition:</dt>
                        <dd>{selectedPatient.condition}</dd>
                        <dt className="font-semibold text-muted-foreground">Status:</dt>
                        <dd>{selectedPatient.status}</dd>
                        <dt className="font-semibold text-muted-foreground">Last Visit:</dt>
                        <dd>{selectedPatient.lastVisit || selectedPatient.date}</dd>
                      </dl>
                    </CardContent>
                  </Card>
                  {/* Doctor Notes Timeline */}
                  <Card className="flex-[2] min-w-[340px] flex flex-col bg-background border border-primary/10 shadow-md relative p-2">
                    <CardHeader>
                      <CardTitle className="text-lg tracking-tight">Doctor Notes Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-2 p-0">
                      <ScrollArea className="max-h-[50vh] pr-2">
                        <div className="relative flex flex-col gap-6 pl-6">
                          {/* Vertical timeline line */}
                          <div className="absolute left-2 top-0 bottom-0 w-1 bg-primary/10 rounded-full" style={{zIndex:0}} />
                          {(selectedPatient.doctorsNotes && selectedPatient.doctorsNotes[0] && selectedPatient.doctorsNotes[0].length > 0) ? (
                            [...selectedPatient.doctorsNotes[0]]
                              .sort((a, b) => new Date(a.date) - new Date(b.date))
                              .map((note, idx, arr) => (
                                <div key={idx} className="relative flex gap-4 items-start z-10">
                                  {/* Timeline dot */}
                                  <div className="flex flex-col items-center">
                                    <Avatar className={idx === arr.length-1 ? 'ring-2 ring-primary' : ''}>
                                      <AvatarFallback>{(selectedPatient.name || 'D')[0]}</AvatarFallback>
                                    </Avatar>
                                    {idx < arr.length-1 && <span className="w-1 h-8 bg-primary/20 mt-1 mb-1 rounded-full" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant={idx === arr.length-1 ? 'default' : 'secondary'}>{note.date}</Badge>
                                      <span className="text-xs text-muted-foreground">Doctor</span>
                                    </div>
                                    <div className={"whitespace-pre-line text-base leading-relaxed " + (idx === arr.length-1 ? 'font-semibold' : '')}>{note.note}</div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-muted-foreground text-sm">No notes yet.</div>
                          )}
                        </div>
                      </ScrollArea>
                      {/* Add Note Sticky Input */}
                      <div className="border-t pt-3 mt-3 bg-card sticky bottom-0 z-20">
                        <div className="flex gap-2 items-end">
                          <Textarea
                            className="flex-1"
                            rows={2}
                            onChange={e => setAnamnesis(e.target.value)}
                            placeholder="Add a new doctor note..."
                          />
                          <Button size="sm" onClick={handleSaveAnamnesis} disabled={loading || !anamnesis.trim()}>
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="billing">
                <Card className="mt-2">
                  <CardHeader>
                    <CardTitle className="text-base">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-0">
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="px-6 pb-6 pt-2">
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
                    <TableCell>{p.lastVisit || p.date}</TableCell>
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
