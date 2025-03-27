import Link from "next/link"
import { notFound } from "next/navigation"
import { CandidatesList } from "@/components/candidates-list"

interface CandidatesPageProps {
  params: {
    id: string
  }
}

export default async function CandidatesPage(props: CandidatesPageProps) {
    const { id } = await props.params // 👈 await здесь  
  const response = await fetch(`http://localhost:5000/api/jobs/${id}/candidates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  })

  
  

  if (!response.ok) {
    return notFound()
  }

  const data = await response.json()
  

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Link href={`/jobs/${id}`} className="text-sm text-muted-foreground hover:underline">
          ← Назад к вакансии
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Кандидаты</h1>
      </div>

      <CandidatesList jobId={id} candidates={data.candidates} />
    </main>
  )
}
