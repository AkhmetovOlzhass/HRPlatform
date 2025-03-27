import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { ApplyForm } from "@/components/apply-form"
import { Button } from "@/components/ui/button"

interface JobPageProps {
  params: {
    id: string
  }
}

export default async function JobPage({ params }: JobPageProps) {
  // Fetch job details from your API
  const response = await fetch(`http://localhost:5000/api/jobs/${params.id}`, { cache: "no-store" })

  if (!response.ok) {
    return notFound()
  }

  const job = await response.json()

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Назад к списку вакансий
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-4">{job.title}         
            <Button asChild>
            <Link href={`/jobs/${job._id}/edit`}>Редактировать</Link>
            </Button>
        </h1>
            <p className="text-xl font-medium mb-2">
              {job.company}, {job.location}
            </p>
            <p className="text-xl font-medium mb-4">
              от {formatCurrency(job.salary.from)} до {formatCurrency(job.salary.to)} {job.salary.currency} на руки
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.schedule.map((item: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
            {!job.isActive && (
              <Badge variant="outline" className="bg-muted">
                Вакансия неактивна
              </Badge>
            )}
          </div>

          <Separator className="my-6" />

          <Button asChild>
            <Link href={`/jobs/${job._id}/candidates`}>Кандидаты</Link>
            </Button>


          <div className="mb-8">
          Телеграм бот: <Link className=" text-blue-600" href={`https://t.me/koztgbot?start=vacancy_${job._id}`}>KoztgBot</Link>
            <h2 className="text-2xl font-bold mb-4">Описание</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, "<br />") }}
            />
          </div>

          <div className="md:hidden">
            <ApplyForm jobId={params.id} />
          </div>
        </div>

      </div>
    </main>
  )
}

