import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
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

export default function PatientStepperDialog({ open, onOpenChange, onPatientAdded }) {
  const [step, setStep] = React.useState(0)
  const [form, setForm] = React.useState({
    name: "",
    age: "",
    sex: "Male",
    placeOfWork: "",
    occupation: "",
    mobile: "",
    history: {
      heart: false,
      bleeding: false,
      asthma: false,
      epilepsy: false,
      diabetes: false,
      ulcers: false,
    },
    foodAllergy: "",
    currentMedication: "",
    recentSurgery: "",
    bloodTransfusion: "",
  })
  const [saving, setSaving] = React.useState(false)

  function handleNext() {
    setStep(s => Math.min(s + 1, 3))
  }
  function handleBack() {
    setStep(s => Math.max(s - 1, 0))
  }
  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }
  function handleHistoryChange(field, value) {
    setForm(f => ({ ...f, history: { ...f.history, [field]: value } }))
  }
  function handleSubmit() {
    setSaving(true)
    setTimeout(() => {
      const patients = getStoredPatients()
      const newPatient = {
        id: "P" + String(Date.now()),
        ...form,
        age: Number(form.age),
        createdAt: new Date().toISOString(),
        status: "Active",
        lastVisit: new Date().toISOString().slice(0, 10),
      }
      savePatients([...patients, newPatient])
      setSaving(false)
      onPatientAdded(newPatient)
      onOpenChange(false)
      setStep(0)
      setForm({
        name: "",
        age: "",
        sex: "Male",
        placeOfWork: "",
        occupation: "",
        mobile: "",
        history: {
          heart: false,
          bleeding: false,
          asthma: false,
          epilepsy: false,
          diabetes: false,
          ulcers: false,
        },
        foodAllergy: "",
        currentMedication: "",
        recentSurgery: "",
        bloodTransfusion: "",
      })
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setStep(0) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            New Patient Registration
            <div className="flex gap-2 mt-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-2 w-10 rounded-full transition-all ${step === i ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Label>Name</Label>
              <Input autoFocus value={form.name} onChange={e => handleChange("name", e.target.value)} />
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Age</Label>
                  <Input type="number" value={form.age} onChange={e => handleChange("age", e.target.value)} />
                </div>
                <div className="flex-1">
                  <Label>Sex</Label>
                  <RadioGroup value={form.sex} onValueChange={v => handleChange("sex", v)}>
                    <div className="flex gap-4 mt-2">
                      <RadioGroupItem value="Male" id="sex-male" />
                      <Label htmlFor="sex-male">Male</Label>
                      <RadioGroupItem value="Female" id="sex-female" />
                      <Label htmlFor="sex-female">Female</Label>
                      <RadioGroupItem value="Other" id="sex-other" />
                      <Label htmlFor="sex-other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <Label>Mobile Phone</Label>
              <Input value={form.mobile} onChange={e => handleChange("mobile", e.target.value)} />
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Label>Place of Work</Label>
              <Input value={form.placeOfWork} onChange={e => handleChange("placeOfWork", e.target.value)} />
              <Label>Occupation</Label>
              <Input value={form.occupation} onChange={e => handleChange("occupation", e.target.value)} />
              <Label>Medical History</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.history.heart} onCheckedChange={v => handleHistoryChange("heart", !!v)} id="heart" />
                  <Label htmlFor="heart">Heart Problem</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.history.bleeding} onCheckedChange={v => handleHistoryChange("bleeding", !!v)} id="bleeding" />
                  <Label htmlFor="bleeding">Bleeding Disorder</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.history.asthma} onCheckedChange={v => handleHistoryChange("asthma", !!v)} id="asthma" />
                  <Label htmlFor="asthma">Asthma</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.history.epilepsy} onCheckedChange={v => handleHistoryChange("epilepsy", !!v)} id="epilepsy" />
                  <Label htmlFor="epilepsy">Epilepsy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.history.diabetes} onCheckedChange={v => handleHistoryChange("diabetes", !!v)} id="diabetes" />
                  <Label htmlFor="diabetes">Diabetes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.history.ulcers} onCheckedChange={v => handleHistoryChange("ulcers", !!v)} id="ulcers" />
                  <Label htmlFor="ulcers">Ulcers</Label>
                </div>
              </div>
              <Label>Any Food Allergy? (specify)</Label>
              <Input value={form.foodAllergy} onChange={e => handleChange("foodAllergy", e.target.value)} />
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Label>Current Medication</Label>
              <Textarea value={form.currentMedication} onChange={e => handleChange("currentMedication", e.target.value)} />
              <Label>Recent Surgery</Label>
              <Textarea value={form.recentSurgery} onChange={e => handleChange("recentSurgery", e.target.value)} />
              <Label>Blood Transfusion?</Label>
              <Input value={form.bloodTransfusion} onChange={e => handleChange("bloodTransfusion", e.target.value)} placeholder="Yes/No, details if yes" />
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="text-lg font-semibold mb-2">Review & Confirm</div>
              <div className="bg-muted rounded p-3 text-sm">
                <div><b>Name:</b> {form.name}</div>
                <div><b>Age:</b> {form.age}</div>
                <div><b>Sex:</b> {form.sex}</div>
                <div><b>Mobile:</b> {form.mobile}</div>
                <div><b>Place of Work:</b> {form.placeOfWork}</div>
                <div><b>Occupation:</b> {form.occupation}</div>
                <div><b>Medical History:</b> {Object.entries(form.history).filter(([k, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(", ") || "None"}</div>
                <div><b>Food Allergy:</b> {form.foodAllergy || "None"}</div>
                <div><b>Current Medication:</b> {form.currentMedication || "None"}</div>
                <div><b>Recent Surgery:</b> {form.recentSurgery || "None"}</div>
                <div><b>Blood Transfusion:</b> {form.bloodTransfusion || "None"}</div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          {step > 0 ? (
            <Button variant="outline" onClick={handleBack} disabled={saving}>
              Back
            </Button>
          ) : <span />}
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 0 && (!form.name.trim() || !form.age || !form.sex || !form.mobile)) ||
                (step === 1 && (!form.placeOfWork.trim() || !form.occupation.trim()))
              }
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Submit"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}