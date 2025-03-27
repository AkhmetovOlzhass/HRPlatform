"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  full_name: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  phone: z.string().min(10, { message: "Введите корректный номер телефона" }),
  email: z.string().email({ message: "Введите корректный email" }),
  resume_text: z.string().min(10, { message: "Расскажите немного о себе" }),
})

interface ApplyFormProps {
  jobId: string
}

export function ApplyForm({ jobId }: ApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      resume_text: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Ошибка при отправке заявки")
      }

      setIsSuccess(true)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пройти собеседование</CardTitle>
        <CardDescription>Заполните форму, чтобы откликнуться на вакансию</CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="text-center py-4">
            <h3 className="text-lg font-medium mb-2">Заявка отправлена!</h3>
            <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => setIsSuccess(false)}
            >
              Отправить еще одну заявку
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ФИО</FormLabel>
                    <FormControl>
                      <Input placeholder="Иванов Иван Иванович" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 (777) 123-45-67" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resume_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>О себе</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Расскажите о своем опыте и навыках" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Отправка..." : "Отправить заявку"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
