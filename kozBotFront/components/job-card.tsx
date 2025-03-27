import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface JobCardProps {
  job: {
    _id: string
    title: string
    location: string
    company: string
    salary: {
      from: number
      to: number
      currency: string
      type: string
    }
    schedule: string[]
    isActive: boolean
    candidates: any[]
  }
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
          {!job.isActive && (
            <Badge variant="outline" className="bg-muted">
              Неактивна
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{job.company}</p>
        <p className="text-sm text-muted-foreground">{job.location}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <p className="font-medium">
            от {formatCurrency(job.salary.from)} до {formatCurrency(job.salary.to)} {job.salary.currency} на руки
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {job.schedule.map((item, index) => (
            <Badge key={index} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Кандидатов: {job.candidates.length}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/jobs/${job._id}`}
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Подробнее
        </Link>
      </CardFooter>
    </Card>
  )
}

