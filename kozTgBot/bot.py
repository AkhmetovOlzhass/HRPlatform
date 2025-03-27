import os
import logging
import fitz  # PyMuPDF
import httpx
from dotenv import load_dotenv
from telegram import Update, Document
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
)
import google.generativeai as genai

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL")

logging.basicConfig(level=logging.INFO)

user_sessions = {}  # Временное хранилище сессий

import httpx

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
user_interviews = {}  # user_id -> dict: { vacancy_id, job_desc, current_q, history }

async def call_ai_model(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text

async def generate_and_ask_question(update: Update, user_id: int):
    data = user_interviews[user_id]
    job_desc = data["job_desc"]
    step = data["step"]

    prompt = f"""
    Ты — HR специалист, проводящий первичное собеседование на вакансию:

    {job_desc}

    Вот резюме кандидата:
    {user_interviews[user_id]["resume_text"]}

    Сгенерируй простой и понятный и короткий вопрос №{step} для кандидата. 
    Учитывай вакансию и его опыт. Вопрос не должен быть слишком абстрактным или философским.
    Фокусируйся на практических вещах: обязанностях, опыте, графике, обучении, навыках.
    Пиши вопрос как будто ты реально общаешься с человеком.
    Не добавляй ничего лишнего, только сам вопрос.
    """


    question = await call_ai_model(prompt)
    user_interviews[user_id]["current_q"] = question.strip()
    user_interviews[user_id]["questions_asked"].append(question.strip())

    await update.message.reply_text(f"❓ Вопрос {step}: {question.strip()}")

async def handle_answer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in user_interviews:
        return  # Не в процессе интервью

    user_data = user_interviews[user_id]
    question = user_data["current_q"]
    answer = update.message.text
    job_desc = user_data["job_desc"]
    step = user_data["step"]

    prompt = f"""
        Вот описание вакансии:

        {job_desc}

        Вот резюме кандидата:
        {user_interviews[user_id]["resume_text"]}

        Вот вопрос, который ты задал кандидату:
        {question}

        Вот ответ кандидата:
        {answer}

        Если кандидат подходит — не используй слово "нет" вообще, даже в положительном контексте

        Если не подходит — скажи, "Нет" в отдельной строке и ниже опиши почему, Обязательно начинай предложение с слова "Нет".
        Сгенерируй текст так, как будто ты обращаешься к самому кандидату
    """

    ai_reply = await call_ai_model(prompt)

    if "нет" in ai_reply.lower():
        await update.message.reply_text(f"❌ Собеседование не пройдено.\n\n{ai_reply}")
        candidate_data = {
            "full_name": update.effective_user.full_name or "Имя не указано",
            "resume_text": user_data["resume_text"],
            "status": "rejected"
        }

        async with httpx.AsyncClient() as client:
            await client.post(f"{os.getenv('BACKEND_URL')}/{user_data['vacancy_id']}/candidates", json=candidate_data)

        user_interviews.pop(user_id)
        return

    if step >= 5:
        await update.message.reply_text(f"✅ Собеседование успешно завершено! \nНаш HR обязательно свяжется с вами позже!")

        # Повторная отправка кандидата с обновлённым статусом
        candidate_data = {
            "full_name": update.effective_user.full_name or "Имя не указано",
            "resume_text": user_data["resume_text"],
            "status": "interview_passed"
        }

        async with httpx.AsyncClient() as client:
            await client.post(f"{os.getenv('BACKEND_URL')}/{user_data['vacancy_id']}/candidates", json=candidate_data)

        user_interviews.pop(user_id)
        return


    # Следующий вопрос
    user_interviews[user_id]["step"] += 1
    await update.message.reply_text(f"{ai_reply}")
    await generate_and_ask_question(update, user_id)



async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args
    if args and args[0].startswith("vacancy_"):
        vacancy_id = args[0].replace("vacancy_", "")
        user_sessions[update.effective_user.id] = {"vacancy_id": vacancy_id}

        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{os.getenv('BACKEND_URL')}/{vacancy_id}")
                if res.status_code == 200:
                    job = res.json()
                    title = job.get("title", "Без названия")
                    await update.message.reply_text(
                        f"Вы откликнулись на вакансию:\n\n<b>{title}</b>\n\nПожалуйста, отправьте ваше CV в формате PDF 📄",
                        parse_mode="HTML"
                    )
                else:
                    await update.message.reply_text(
                        f"Вакансия с ID {vacancy_id} не найдена."
                    )
        except Exception as e:
            await update.message.reply_text("⚠️ Ошибка при получении информации о вакансии.")
    else:
        await update.message.reply_text("Привет! Перейдите по ссылке из вакансии, чтобы начать.")

async def handle_pdf(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in user_sessions:
        await update.message.reply_text("Сначала перейдите по ссылке из вакансии.")
        return

    document: Document = update.message.document
    if document.mime_type != "application/pdf":
        await update.message.reply_text("Пожалуйста, отправьте именно PDF файл 📄")
        return

    file = await context.bot.get_file(document.file_id)
    file_path = f"cv_{user_id}.pdf"
    await file.download_to_drive(file_path)

    try:
        with fitz.open(file_path) as doc:
            resume_text = "\n".join(page.get_text() for page in doc)
        os.remove(file_path)

        # Получаем описание вакансии
        vacancy_id = user_sessions[user_id]["vacancy_id"]
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{os.getenv('BACKEND_URL')}/{vacancy_id}")
            if res.status_code != 200:
                await update.message.reply_text("❌ Не удалось загрузить описание вакансии.")
                return
            job = res.json()
            job_title = job.get("title", "")
            job_desc = f"""
            Компания: {job.get("company", "")}
            Должность: {job.get("title", "")}
            Локация: {job.get("location", "")}
            Адрес: {job.get("address", "")}

            Зарплата: от {job.get("salary", {}).get("from", "")} до {job.get("salary", {}).get("to", "")} {job.get("salary", {}).get("currency", "")} ({job.get("salary", {}).get("type", "")})

            Тип занятости и график: {", ".join(job.get("schedule", []))}

            📋 Обязанности:
            {chr(10).join(job.get("responsibilities", []))}

            🛠 Условия:
            {chr(10).join(job.get("conditions", []))}

            🕒 График работы:
            {job.get("workTime", {}).get("schedule", "")} | с {job.get("workTime", {}).get("shiftStart", "")} до {job.get("workTime", {}).get("shiftEnd", "")}

            📄 Описание:
            {job.get("description", "")}
            """.strip()


        # 🧠 Запрос к AI
        prompt = f"""
            Вот описание вакансии:

            {job_title.upper()}
            {job_desc}

            Вот текст резюме кандидата:

            {resume_text}

            На основе этого, подходит ли кандидат на эту вакансию? Ответь "Да" или "Нет" Без точек и поясни, почему.
            Во время описывания почему кандидат подходит или не подходит, ты должен писать текст так, как будто ты обращаешься к самому кандидату
        """

        ai_result = await call_ai_model(prompt)  # Ниже функция

        if "нет" in ai_result.lower():
            await update.message.reply_text(f"❌ Вы пока не подходите на эту вакансию.\n\nAI ответ:\n{ai_result}")
            return
        else:
            await update.message.reply_text(f"✅ Вы подходите на вакансию! Продолжаем проверку...\n\nAI ответ:\n{ai_result}")

            # 👉 Сохраняем кандидата в базу
            candidate_data = {
                "full_name": update.effective_user.full_name or "Имя не указано",
                "resume_text": resume_text,
                "status": "approved"
            }

            async with httpx.AsyncClient() as client:
                save_res = await client.post(f"{os.getenv('BACKEND_URL')}/{vacancy_id}/candidates", json=candidate_data)

            if save_res.status_code in (200, 201):
                await update.message.reply_text("🗂 Ваше резюме подходит нашей вакансии! Теперь вам нужно пройти небольшое собеседование.")
                # 👇 Запуск собеседования
                user_interviews[user_id] = {
                    "vacancy_id": vacancy_id,
                    "job_desc": job_desc,
                    "questions_asked": [],
                    "resume_text": resume_text,
                    "step": 1
                }

                await generate_and_ask_question(update, user_id)

            else:
                await update.message.reply_text("⚠️ Не удалось сохранить в базу. Попробуйте позже.")


    except Exception as e:
        logging.exception("Ошибка при обработке резюме")
        await update.message.reply_text("Произошла ошибка при анализе резюме 😓")



# Запуск бота
if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.Document.PDF, handle_pdf))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_answer))


    app.run_polling()
