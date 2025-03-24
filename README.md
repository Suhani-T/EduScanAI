# AI-Powered Teacher Assistant

## Overview

The AI-Powered Teacher Assistant is a web application designed to automate grading and provide personalized feedback to students. This project leverages the **Gemini API** to evaluate student responses and generate structured feedback in Markdown format. The system processes responses in real-time without storing data in a database.

## Features

- **Teacher Authentication**: Secure signup and login system.
- **Answer Evaluation**: AI analyzes student responses and generates detailed feedback.
- **Real-Time Feedback**: Instant processing without data storage.
- **Markdown Formatting**: Feedback is structured for better readability.
- **Email Integration**: Teachers can review and send feedback directly to students.

## Tech Stack

- **Backend**: Django
- **Frontend**: HTML, CSS, JavaScript
- **AI Model**: Gemini API
- **Libraries Used**:
  - `pymupdf` for handling PDFs
  - `markdown` for formatting AI-generated feedback
  - `smtplib` for email integration

## Setup Instructions

1. **Clone the Repository**

   ```sh
   git clone https://github.com/Suhani-T/EduScanAI.git
   cd EduScanGIT
   cd eduscanai
   ```

2. **Create a Virtual Environment**

   ```sh
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Dependencies**

   ```sh
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**

   - Configure the API key for Gemini from https://aistudio.google.com/apikey
   - Set up email credentials for feedback delivery.

5. **Run Migrations**

   ```sh
   python manage.py migrate
   ```

6. **Start the Development Server**

   ```sh
   python manage.py runserver
   ```

## Usage

1. Enter the details required as a teacher.
2. Upload a student's answer script.
3. Provide an answer key for evaluation.
4. Click "Evaluate" to generate AI-powered feedback.
5. Review, edit and send feedback to students.

## Enhancements & Future Scope

- Enhance UI for better user experience.
- Add support for multiple question types.
- **Multilingual Support**: Allow teachers and students to interact with the system in different languages.
- **Offline Mode**: Enable limited grading capabilities without an internet connection.
- **Customizable Feedback Tone**: Allow teachers to adjust the formality or encouragement level of AI-generated feedback.
- **Rubric-Based Evaluation**: Implement a system where teachers can define specific grading rubrics for AI assessment.
- **Integration with LMS**: Provide support for integration with platforms like Google Classroom or Moodle.
- **Handwritten Answer Recognition**: Use OCR technology to analyze handwritten answers from scanned documents.



