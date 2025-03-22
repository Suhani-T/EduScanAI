from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMessage, send_mail
import google.generativeai as genai
import environ
import json
import chardet
import easyocr
from pdf2image import convert_from_bytes
import fitz
import pytesseract
from docx import Document
import markdown


env = environ.Env()
environ.Env.read_env()

API_KEY = env("GEMINI_API_KEY", default=None)

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print(" gemini API error")

def index(request):
    return render(request, "index.html")  


def extract_text_from_pdf(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    extracted_text = "\n".join(page.get_text("text") for page in doc)
    return extracted_text

def extract_text_from_docx(docx_bytes):
    with open("temp.docx", "wb") as f:
        f.write(docx_bytes)

    doc = Document("temp.docx")
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text(file):
    file_name = file.name.lower()
    file_bytes = file.read()

    if file_name.endswith(".txt"):
        encoding = chardet.detect(file_bytes)["encoding"]
        return file_bytes.decode(encoding or "utf-8", errors="ignore")

    elif file_name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)

    elif file_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)

    else:
        return None  



@csrf_exempt
def evaluate(request):
    if request.method == "POST":
        try:
            answer_key_file = request.FILES.get("answer_key")
            student_script_file = request.FILES.get("student_script")

            if not answer_key_file or not student_script_file:
                return JsonResponse({"error": "Both answer key and student script are required."}, status=400)

            answer_key = extract_text(answer_key_file)
            student_script = extract_text(student_script_file)

            if not answer_key or not student_script:
                return JsonResponse({"error": "Failed to extract text from one or both files."}, status=400)

            print("extracted answer key:\n", answer_key[:500])  
            print("extracted student script:\n", student_script[:500])

            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(f"Compare this student answer: {student_script} with answer key: {answer_key}. Provide constructive feedback.")

            feedback = response.candidates[0].content.parts[0].text if response.candidates else "Unable to generate feedback."

            return JsonResponse({"feedback": feedback})

        except Exception as e:
            print("error in evaluate():", str(e))
            return JsonResponse({"error": "Failed to generate feedback", "details": str(e)}, status=500)

@csrf_exempt
def send_feedback(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            student_email = data.get("student_email")
            feedback_markdown = data.get("feedback")  
            teacher_email = data.get("teacher_email")

            
            feedback_html = markdown.markdown(feedback_markdown)

            email = EmailMessage(
                subject="Feedback on Your Answer Script",
                body=feedback_html,
                from_email="aieduscan@gmail.com",
                to=[student_email],
                headers={"Reply-To": teacher_email}
            )
            email.content_subtype = "html"  
            email.send()

            return JsonResponse({"message": "Feedback sent successfully"})
        
        except Exception as e:
            print("error in send_feedback():", str(e))
            return JsonResponse({"error": "Failed to send feedback", "details": str(e)}, status=500)
