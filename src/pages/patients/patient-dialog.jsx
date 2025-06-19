import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"


export default function PatientDialog(){

    return(
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
    )
}