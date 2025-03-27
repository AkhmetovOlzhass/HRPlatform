import Link from "next/link"
import { JobCard } from "@/components/job-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function Home() {
  // Fetch jobs from your API
  const response = await fetch("http://localhost:5000/api/jobs", { cache: "no-store" })
  const jobs = await response.json()

  const activeJobs = jobs.filter((job: any) => job.isActive)
  const inactiveJobs = jobs.filter((job: any) => !job.isActive)

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Вакансии</h1>
        <Button asChild>
          <Link href="/jobs/create">Создать вакансию</Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Активные ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="inactive">Неактивные ({inactiveJobs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {activeJobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeJobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Нет активных вакансий</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="inactive">
          {inactiveJobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveJobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Нет неактивных вакансий</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

