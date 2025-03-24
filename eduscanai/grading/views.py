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
from google.cloud import documentai_v1beta3 as documentai
from google.cloud import storage
import time




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



# @csrf_exempt
# def evaluate(request):
#     if request.method == "POST":
#         try:
#             answer_key_file = request.FILES.get("answer_key")
#             student_script_file = request.FILES.get("student_script")

#             if not answer_key_file or not student_script_file:
#                 return JsonResponse({"error": "Both answer key and student script are required."}, status=400)

#             answer_key = extract_text(answer_key_file)
#             student_script = extract_text(student_script_file)

#             if not answer_key or not student_script:
#                 return JsonResponse({"error": "Failed to extract text from one or both files."}, status=400)

#             print("extracted answer key:\n", answer_key[:500])  
#             print("extracted student script:\n", student_script[:500])

#             model = genai.GenerativeModel("gemini-1.5-flash")
#             response = model.generate_content(f"Compare this student answer: {student_script} with answer key: {answer_key}. Provide constructive feedback.")

#             feedback = response.candidates[0].content.parts[0].text if response.candidates else "Unable to generate feedback."

#             return JsonResponse({"feedback": feedback})

#         except Exception as e:
#             print("error in evaluate():", str(e))
#             return JsonResponse({"error": "Failed to generate feedback", "details": str(e)}, status=500)

@csrf_exempt
def evaluate(request):
    if request.method == "POST":
        try:
            answer_key_file = request.FILES.get("answer_key")
            student_script_file = request.FILES.get("student_script")

            if not answer_key_file or not student_script_file:
                return JsonResponse({"error": "both answer key and student script are required."}, status=400)

          
            answer_key = extract_text(answer_key_file)
            student_script = extract_text(student_script_file)

            if not answer_key or not student_script:
                return JsonResponse({"error": "failed to extract text."}, status=400)

           
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(f"Compare this student answer: {student_script} with answer key: {answer_key}. Provide constructive feedback.")

            
            feedback = response.candidates[0].content.parts[0].text if response.candidates else "Unable to generate feedback."

            return JsonResponse({"feedback": feedback})

        except Exception as e:
            print("Error in evaluate():", str(e))
            return JsonResponse({"error": "failed to generate feedback", "details": str(e)}, status=500)

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

            return JsonResponse({"message": "feedback sent successfully"})
        
        except Exception as e:
            print("error in send_feedback():", str(e))
            return JsonResponse({"error": "failed to send feedback", "details": str(e)}, status=500)
        

def is_scanned_pdf(pdf_bytes):
   
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page in doc:
        if page.get_text(): 
            return False
    return True       

PROJECT_ID = "eduscanai"
LOCATION = "us"
PROCESSOR_ID = "6db65a3b9bc94c91"  

def extract_text_with_document_ai(pdf_bytes):

    client = documentai.DocumentUnderstandingServiceClient()

    
    gcs_client = storage.Client()
    bucket_name = "your-gcs-bucket"
    bucket = gcs_client.bucket(bucket_name)
    blob = bucket.blob(f"scanned_pdfs/{time.time()}.pdf")
    blob.upload_from_string(pdf_bytes, content_type="application/pdf")
    
    
    gcs_uri = f"gs://{bucket_name}/{blob.name}"

    
    request = {
        "name": f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{PROCESSOR_ID}",
        "raw_document": {
            "content": pdf_bytes,
            "mime_type": "application/pdf",
        },
    }

    
    response = client.process_document(request=request)
    
    
    extracted_text = []
    for page in response.document.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                for word in paragraph.words:
                    extracted_text.append("".join([symbol.text for symbol in word.symbols]))

    return " ".join(extracted_text)



def extract_text(file):
    file_name = file.name.lower()
    file_bytes = file.read()

    if file_name.endswith(".txt"):
        encoding = chardet.detect(file_bytes)["encoding"]
        return file_bytes.decode(encoding or "utf-8", errors="ignore")

    elif file_name.endswith(".pdf"):
        if is_scanned_pdf(file_bytes):  
            return extract_text_with_document_ai(file_bytes)
        else:
            return extract_text_from_pdf(file_bytes)  

    elif file_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)

    else:
        return None  
    
from google.cloud import translate_v2 as translate

def translate_text(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        text_list = data.get('text', [])
        target_lang = data.get('target', 'en')

        if not text_list:
            return JsonResponse({"error": "No text provided"}, status=400)

        translate_client = translate.Client()
        translations = translate_client.translate(text_list, target_language=target_lang)

        translated_texts = [t['translatedText'] for t in translations]

        return JsonResponse({"translations": translated_texts})
