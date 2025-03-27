"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

interface CandidatesListProps {
  jobId: string
  candidates: Array<{
    full_name: string
    phone: string
    email: string
    resume_text: string
    status: string
    submittedAt: string
  }>
}

export function CandidatesList({ jobId, candidates }: CandidatesListProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const reviewedCandidates = candidates.filter((c) => c.status === "approved")
  const interviewCandidates = candidates.filter((c) => c.status === "interview_passed")
  const rejectedCandidates = candidates.filter((c) => c.status === "rejected")

  async function updateCandidateStatus(candidateEmail: string, newStatus: string) {
    setIsUpdating(true)
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/candidates`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: candidateEmail, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Ошибка при обновлении статуса кандидата")
      }

      router.refresh()
    } catch (error) {
      console.error("Ошибка при обновлении статуса кандидата:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return <Badge variant="outline">Рассмотрен</Badge>
      case "interview_passed":
        return <Badge className="bg-green-500 hover:bg-green-600">Интервью</Badge>
      case "rejected":
        return <Badge variant="destructive">Отклонен</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div>
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="approved">Рассмотренные ({reviewedCandidates.length})</TabsTrigger>
          <TabsTrigger value="interview_passed">Интервью ({interviewCandidates.length})</TabsTrigger>
          <TabsTrigger value="rejected">Отклоненные ({rejectedCandidates.length})</TabsTrigger>
        </TabsList>

        {["approved", "interview_passed", "rejected"].map((status) => (
          <TabsContent key={status} value={status}>
            {candidates.filter((c) => c.status === status).length > 0 ? (
              <div className="grid gap-4">
                {candidates
                  .filter((c) => c.status === status)
                  .map((candidate, index) => (
                    <Card key={index}>
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{candidate.full_name}</CardTitle>
                          {getStatusBadge(candidate.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid gap-2 mb-4">
                          <p className="text-sm text-muted-foreground">Email: {candidate.email}</p>
                          <p className="text-sm text-muted-foreground">Телефон: {candidate.phone}</p>
                          <p className="text-sm text-muted-foreground">
                            Дата заявки: {formatDate(candidate.submittedAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setSelectedCandidate(candidate)}>
                                Подробнее
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>{selectedCandidate?.full_name}</DialogTitle>
                                <DialogDescription>
                                  Заявка от {selectedCandidate && formatDate(selectedCandidate.submittedAt)}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div>
                                  <h4 className="font-medium mb-1">Контактная информация</h4>
                                  <p className="text-sm">Email: {selectedCandidate?.email}</p>
                                  <p className="text-sm">Телефон: {selectedCandidate?.phone}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-1">О кандидате</h4>
                                  <div className="text-sm whitespace-pre-line max-h-64 overflow-y-auto border rounded p-2 bg-muted">
                                    {selectedCandidate?.resume_text}
                                    </div>

                                </div>
                              </div>
                              <DialogClose asChild>
                                <Button variant="outline" className="w-full">
                                  Закрыть
                                </Button>
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Нет кандидатов в этой категории</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

