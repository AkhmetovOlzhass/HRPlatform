"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

const scheduleOptions = [
  { id: "full-time", label: "Полная занятость" },
  { id: "part-time", label: "Частичная занятость" },
  { id: "flexible", label: "Гибкий график" },
  { id: "remote", label: "Удаленная работа" },
  { id: "shift", label: "Сменный график" },
]

const formSchema = z.object({
  title: z.string().min(5, { message: "Название должно содержать минимум 5 символов" }),
  company: z.string().min(2, { message: "Название компании должно содержать минимум 2 символа" }),
  location: z.string().min(2, { message: "Укажите местоположение" }),
  salary: z.object({
    from: z.coerce.number().min(1, { message: "Укажите минимальную зарплату" }),
    to: z.coerce.number().min(1, { message: "Укажите максимальную зарплату" }),
    currency: z.string().default("KZT"),
    type: z.string().default("netto"),
  }),
  schedule: z.array(z.string()).min(1, { message: "Выберите хотя бы один график работы" }),
  description: z.string().min(50, { message: "Описание должно содержать минимум 50 символов" }),
  isActive: z.boolean().default(true),
})

export function JobForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salary: {
        from: 0,
        to: 0,
        currency: "KZT",
        type: "netto",
      },
      schedule: [],
      description: "",
      isActive: true,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Ошибка при создании вакансии")
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Ошибка при создании вакансии:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название вакансии</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: Специалист по обслуживанию ресторана" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Компания</FormLabel>
                    <FormControl>
                      <Input placeholder="Название компании" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Местоположение</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Алматы, улица Розыбакиева, 247а" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salary.from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Зарплата от</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary.to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Зарплата до</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="schedule"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>График работы</FormLabel>
                    <FormDescription>Выберите подходящие варианты</FormDescription>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {scheduleOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="schedule"
                        render={({ field }) => {
                          return (
                            <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.id])
                                      : field.onChange(field.value?.filter((value) => value !== option.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{option.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание вакансии</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Подробное описание вакансии, требования, обязанности, условия"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Активная вакансия</FormLabel>
                    <FormDescription>Если отмечено, вакансия будет видна всем пользователям</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Создать вакансию"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

