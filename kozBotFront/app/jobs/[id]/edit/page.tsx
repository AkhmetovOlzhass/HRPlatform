import Link from "next/link"
import { notFound } from "next/navigation"
import { JobEditForm } from "@/components/job-edit-form"

interface EditJobPageProps {
  params: {
    id: string
  }
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  // Fetch job details from your API
  const response = await fetch(`http://localhost:5000/api/jobs/${params.id}`, { cache: "no-store" })

  if (!response.ok) {
    return notFound()
  }

  const job = await response.json()

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Link href={`/jobs/${params.id}`} className="text-sm text-muted-foreground hover:underline">
          ← Назад к вакансии
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Редактировать вакансию</h1>
      </div>

      <JobEditForm job={job} />
    </main>
  )
}

