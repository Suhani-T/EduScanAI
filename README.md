<p align="center">
  <img src="assets/EduScan_Banner.png" alt="EduScanAI Banner" width="100%">
</p>

<h1 align="center">
  <img src="assets/EduScan_logo.png" alt="EduScanAI" width="280"/><br>
  An AI-Powered Teacher Assistant
</h1>

## Overview

The AI-Powered Teacher Assistant is a web application designed to automate grading and provide personalized feedback to students. This project leverages the **Gemini API** to evaluate student responses and generate structured feedback in Markdown format. The system processes responses in real-time without storing data in a database.

## Features

- **Teacher Authentication**: Secure and reliable OTP-based verification to ensure authorized access.
- **Answer Evaluation**: AI-driven evaluation of student responses based on the provided answer key or prompt.
- **Real-Time Feedback**: Immediate feedback generation without storing sensitive data on the server.
- **Markdown-Formatted Responses**: Feedback is structured using Markdown for improved clarity and readability.
- **Email Integration**: Teachers can review and send feedback directly to students via email from within the platform.
- **Customizable Prompt**: Teachers have the flexibility to provide additional context or criteria to guide the AI's evaluation.
- **Issue Reporting & Feedback Submission**: Teachers can submit reviews or report bugs, contributing to ongoing improvements.
- **Accessibility Modes**: Option to switch between dark and light themes for a more comfortable user experience.
- **Multilingual Support**: Interface and generated messages can be dynamically translated to support international users.



- ## Tech Stack

| Technology | Description |
|------------|-------------|
| ![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white) | **Backend Framework** used for server-side logic |
| ![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) | **Frontend** technologies used for UI and interactivity |

- ## APIs Used
| API | Description |
|-----|-------------|
| ![Gemini](https://img.shields.io/badge/Gemini%20API-4285F4?style=for-the-badge&logo=google&logoColor=white) | **AI Model** used for answer evaluation and feedback generation |
| ![Google Cloud](https://img.shields.io/badge/Google%20Cloud%20Translation%20API-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white) <br> ![Document AI](https://img.shields.io/badge/Google%20Cloud%20Document%20AI-34A853?style=for-the-badge&logo=googlecloud&logoColor=white) | **Google Cloud APIs** for multilingual support and document parsing |


- ## Major Libraries
| Library | Description |
|---------|-------------|
| 🧩 `google-generativeai` | Official Gemini API Python library for integrating generative AI capabilities |
| 🧩 `pymupdf` | For handling and parsing PDF files |
| 🧩 `markdown` | For rendering well-formatted feedback from the AI |


## Setup Instructions

1. **Clone the Repository**

   ```sh
   git clone https://github.com/Suhani-T/EduScanAI.git
   cd <name of your folder in which repository is cloned>
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
     
5. **Run Makemigrations**

   ```sh
   python manage.py makemigrations
   ```

6. **Run Migrations**

   ```sh
   python manage.py migrate
   ```

7. **Start the Development Server**

   ```sh
   python manage.py runserver
   ```

## Usage

1. Authenticate yourself as the teacher.
2. Upload a student's answer script.
3. Provide an answer key for evaluation.
4. Add further custom specifications or criteria for evaluation.
5. Click "Evaluate" to generate AI-powered feedback.
6. Review, edit and send feedback to students.
7. Report any issues or give reviews through the feedback form.

## Enhancements & Future Scope

- Enhance UI for better user experience.
- **Evaluate Variety of Questions**: Capability to evaluate multiple question types such as graph based(in Mathematics), picture based, flowchart, etc.
- **Offline Mode**: Enable limited grading capabilities without an internet connection.
- **Integration with LMS**: Provide support for integration with platforms like Google Classroom or Moodle.
- **Bulk File Uploads**: Introduce functionality for uploading multiple student answer scripts simultaneously, reducing manual effort and saving time.
- **Comprehensive Student Performance Tracking**: Maintain a centralized record of each student’s performance across assessments to facilitate year-end reporting and long-term academic analysis.
- **Student Portal with Self-Evaluation Tools**: Develop individual student accounts that enable learners to attempt mock or practice papers and receive automated feedback, encouraging self-assessment and preparation.
- **Feedback Repository for Students**: Allow students to access their evaluated scripts and feedback history at any time, fostering continuous improvement and reflective learning.



