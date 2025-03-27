import Link from "next/link"
import { JobForm } from "@/components/job-form"

export default function CreateJobPage() {
  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Назад к списку вакансий
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Создать вакансию</h1>
      </div>

      <JobForm />
    </main>
  )
}

