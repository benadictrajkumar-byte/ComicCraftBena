# 🎨 ComicCraft - AI Comic Story Creator using Gemini Models

> **🌐 Live Demo:** [https://3000-i8cscxy3ccqupj5clnbvg.e2b.app](https://3000-i8cscxy3ccqupj5clnbvg.e2b.app)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Scenarios](#-scenarios)
4. [Technical Architecture](#-technical-architecture)
5. [Pre-requisites](#-pre-requisites)
6. [Project Workflow & Milestones](#-project-workflow--milestones)
7. [Team Members & Work Distribution](#-team-members--work-distribution)
8. [Installation & Setup](#-installation--setup)
9. [API Endpoints](#-api-endpoints)
10. [Project Structure](#-project-structure)
11. [Screenshots & Pages](#-screenshots--pages)
12. [Conclusion](#-conclusion)

---

## 🚀 Project Overview

**ComicCraft** is a web-based application that leverages the power of Artificial Intelligence to generate **personalized comic book stories and illustrations** from simple user-provided text prompts. Built with **FastAPI** as the backend framework and integrated with **Google's Gemini AI models** (Gemini Flash & Gemini Pro) alongside **Stable Diffusion** for image generation, ComicCraft automates the entire creative pipeline of comic creation.

### What Does It Do?

The application accepts user inputs such as:

| Input Field | Description | Example |
|---|---|---|
| **Story Prompt** | The main idea or concept for the comic | *"A brave fox exploring an enchanted forest"* |
| **Main Character Name** | The hero/protagonist of the story | *"Finn"* |
| **Setting** | The location where the story takes place | *Forest, City, Space, School* |
| **Tone** | The mood or emotional feel of the narrative | *Dramatic, Funny, Poetic, Light-hearted* |
| **Art Style** | The visual style for illustrations | *Anime, Comic Book, Pixel Art, Realistic* |

Using these inputs, ComicCraft automatically generates:

- ✅ A **5-panel structured comic outline** (titles, scene descriptions, image prompts)
- ✅ **Full narration and character dialogues** for each panel
- ✅ **AI-generated comic-style illustrations** for every panel
- ✅ A **downloadable PDF** containing the complete comic

This makes comic creation **accessible to everyone** — including non-artists, casual users, storytellers, and hobbyists — without requiring any drawing skills or technical expertise.

---

## ✨ Key Features

### 1. AI-Powered Story Generation

ComicCraft uses **two specialized Gemini models** working in tandem:

- **Gemini 1.5 Flash** (`models/gemini-1.5-flash`): Optimized for speed, this model generates the **structured panel-by-panel outline** of the comic. It quickly produces panel numbers, titles, scene descriptions, and image generation prompts based on the user's story idea.

- **Gemini 1.5 Pro** (`models/gemini-1.5-pro`): Optimized for creativity and detail, this model takes the outline and expands it into **rich narration, atmospheric captions, and engaging character dialogues** that bring the story to life.

### 2. AI-Powered Image Generation

- Uses **Stable Diffusion** (`runwayml/stable-diffusion-v1-5`) via Hugging Face's Diffusers library to generate **high-quality, comic-style illustrations** for each panel based on AI-crafted image prompts.
- Images are automatically sanitized for safe filenames and saved to the server's `static/panels` directory.

### 3. Automated Layout Building

- The `layout_builder.py` module intelligently **matches each generated image with its corresponding panel story**, creating a structured layout of panel number, image path, and narrative text.

### 4. PDF Export

- The `exporters.py` module compiles the entire comic — images, titles, descriptions, and narration — into a **professionally formatted multi-page PDF** using the **FPDF** library.
- PDFs are saved with **timestamped filenames** in the `static/exports` folder for easy identification.

### 5. Interactive Web Interface

- A clean, responsive frontend built with **HTML, CSS, and Jinja2 templates** allows users to submit inputs, preview their comics panel-by-panel, and download the final PDF — all from the browser.

### 6. Dual Interface Support

- **Web Form Interface**: For casual users who prefer a visual form-based experience.
- **JSON API Endpoints**: For developers and automated systems that want to interact with the backend programmatically.

---

## 📖 Scenarios

### Scenario 1: Personalized Comic Generation from a Story Prompt

**Situation:** A user enters a prompt like *"A brave fox exploring an enchanted forest."*

**What Happens:**

1. The user fills in additional preferences:
   - **Character Name:** Finn
   - **Setting:** Forest
   - **Tone:** Dramatic
   - **Art Style:** Anime
2. The system sends the prompt to **Gemini Flash**, which generates a 5-panel outline with titles, scene descriptions, and image prompts.
3. **Gemini Pro** then expands each panel into full narration with character dialogues.
4. **Stable Diffusion** generates a unique anime-style illustration for each panel.
5. The user sees a complete, cohesive comic strip on the preview page that matches their creative vision.

**Why It Matters:** This personalized approach ensures every comic is unique and tailored to the user's specific creative preferences, dramatically enhancing user satisfaction.

---

### Scenario 2: Iterating on Tone and Art Style

**Situation:** A user wants a lighter, more humorous comic instead of a dramatic one.

**What Happens:**

1. On the input form, the user changes:
   - **Tone:** from "dramatic" → **"funny"**
   - **Art Style:** from "anime" → **"comic book"**
2. Upon resubmission, the **entire pipeline regenerates**:
   - Gemini Flash creates a new outline with humorous panel structures.
   - Gemini Pro writes witty narration and comedic dialogues.
   - Stable Diffusion produces classic comic-book-style illustrations.
3. The result is a completely different comic with a light-hearted, cartoonish feel.

**Why It Matters:** This demonstrates the system's **flexibility and customization capability**, allowing users to iterate and experiment until the output perfectly matches their creative vision.

---

### Scenario 3: Downloading the Comic as a PDF

**Situation:** After reviewing the on-screen preview, the user wants to save their comic.

**What Happens (Step-by-Step):**

1. **Layout Binding** (`layout_builder.py`):
   - The system assembles each panel's title, image, and narrative text into a structured layout object.
   - Each panel is matched with its corresponding AI-generated illustration.

2. **PDF Generation** (`exporters.py`):
   - The system calls the `save_pdf()` function, which uses the **FPDF** library.
   - Images and narrative text are placed onto consecutive pages in a clean, readable format.
   - The PDF is saved with a **timestamped filename** (e.g., `comic_20250615_143022.pdf`) in the `static/exports` directory.

3. **Export Success**:
   - The user is redirected to the **Export Success Page** (`export_success.html`), which confirms the download was successful.
   - A "Go Create Another Comic" button encourages continued engagement.

**Why It Matters:** Users can **save, print, or share** their AI-generated comics in a professional PDF format, giving them a tangible creative output.

---

## 🏗️ Technical Architecture

### Architecture Overview

ComicCraft follows a **three-tier architecture**:
┌─────────────────────────────────────────────────────────┐
│ FRONTEND LAYER │
│ (HTML, CSS, Jinja2 Templates) │
│ │
│ index.html │ comic_preview.html │ export_success │
│ (Input Form)│ (Comic Display) │ (Confirmation) │
└──────────────────────┬──────────────────────────────────┘
│ POST / GET Requests
▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND LAYER │
│ (FastAPI + routes.py) │
│ │
│ Route Handling │ Input Validation │ Workflow Orchest. │
│ Error Handling │ Template Render │ PDF Compilation │
└──────────────────────┬──────────────────────────────────┘
│ API Calls
▼
┌─────────────────────────────────────────────────────────┐
│ AI SERVICES LAYER │
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │ Gemini Flash │ │ Gemini Pro │ │ Stable Diffusion│ │
│ │ (Outlines) │ │ (Narration) │ │ (Images) │ │
│ └──────────────┘ └──────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────┘

text


### Frontend Responsibilities

- Built with **HTML, CSS, and Jinja2 templates** for dynamic content rendering.
- Captures user inputs through a structured form (story prompt, character name, setting, tone, art style).
- Sends data to the FastAPI backend via **POST requests**.
- Displays AI-generated comics panel-by-panel on the preview page.
- Provides download functionality for PDF export.

**Templates Used:**

| Template | Purpose |
|---|---|
| `index.html` | User input collection form |
| `comic_preview.html` | Displays the generated comic panels |
| `export_success.html` | Shows download confirmation message |

### Backend Responsibilities

- **FastAPI** manages all server-side operations and route handling.
- Receives form data (via `Form(...)`) or JSON payloads (via Pydantic models).
- Orchestrates the AI generation pipeline: outline → story → images → layout → PDF.
- Handles error management using `HTTPException` and `try-except` blocks.
- Renders Jinja2 templates with dynamically generated comic data.

### AI Integration Points

| AI Model | Purpose | When Called |
|---|---|---|
| **Gemini Flash** | Generate structured 5-panel comic outline | First step after user input |
| **Gemini Pro** | Create detailed narration and character dialogues | After outline is generated |
| **Stable Diffusion** | Generate comic-style illustrations per panel | After story narration is ready |

All AI interactions happen **dynamically at runtime**, ensuring every comic is fully unique and customized.

---

## 📚 Pre-requisites

Before setting up ComicCraft, ensure you have knowledge of and access to the following technologies:

| # | Technology | Purpose | Documentation Link |
|---|---|---|---|
| 1 | **FastAPI** | Backend web framework for building APIs | [FastAPI Docs](https://fastapi.tiangolo.com/) |
| 2 | **Uvicorn** | ASGI server to run the FastAPI application | [Uvicorn Docs](https://www.uvicorn.org/) |
| 3 | **Python** | Core programming language (v3.9+) | [Python Docs](https://docs.python.org/3/) |
| 4 | **HTML, CSS, Jinja2** | Frontend templating and styling | [W3Schools](https://www.w3schools.com/) |
| 5 | **Google Gemini API** | AI text generation (Flash & Pro models) | [Google AI Docs](https://ai.google.dev/) |
| 6 | **Hugging Face Diffusers** | Stable Diffusion image generation | [Diffusers Docs](https://huggingface.co/docs/diffusers) |
| 7 | **PyTorch** | Deep learning framework (backend for Diffusers) | [PyTorch Docs](https://pytorch.org/docs/) |
| 8 | **FPDF** | PDF file generation library | [FPDF Docs](https://pyfpdf.readthedocs.io/) |
| 9 | **Git** | Version control system | [Git Docs](https://git-scm.com/doc) |
| 10 | **pip / virtualenv** | Python package and environment management | [Virtualenv Guide](https://virtualenv.pypa.io/) |

---

## 🔄 Project Workflow & Milestones

### Milestone 1: Model Selection and Architecture

> **Goal:** Research, evaluate, and select the best AI models for comic generation, define the system architecture, and set up the development environment.

#### Activity 1.1: Research and Select the Appropriate Generative AI Model

**Understanding Project Requirements:**

The ComicCraft application needs to generate three types of content:

- **Structured comic outlines** (panel-by-panel breakdown with titles and scene descriptions)
- **Full comic narration and character dialogues** (creative, engaging storytelling)
- **Visual comic-style illustrations** (high-quality images for each panel)

**Model Evaluation Process:**

The team researched and tested multiple AI models:

| Model Category | Models Evaluated | Evaluation Criteria |
|---|---|---|
| Text Generation | Gemini Flash, Gemini Pro, GPT-3.5 | Response quality, creativity, prompt adherence, speed |
| Image Generation | Stable Diffusion v1.5, SDXL, DALL-E | Image quality, style consistency, resolution, generation speed |

**Final Model Selection:**

| Selected Model | Role | Reason for Selection |
|---|---|---|
| **Gemini 1.5 Flash** | Panel outline generation | Fast, structured outputs ideal for creating organized panel breakdowns |
| **Gemini 1.5 Pro** | Story narration & dialogues | Superior creative writing quality with rich, detailed storytelling |
| **Stable Diffusion v1.5** | Comic illustrations | High-quality image generation with excellent prompt adherence for comic styles |

#### Activity 1.2: Define the Architecture of the Application

The architecture is structured into three primary components:

- **Frontend** → User interaction and display
- **Backend** → Data processing, routing, and workflow orchestration
- **AI Integration** → Content generation via Gemini APIs and Stable Diffusion

#### Activity 1.3: Set Up the Development Environment

**Steps:**

1. Install Python (v3.9+) and pip
2. Create and activate a virtual environment
3. Install all required dependencies
4. Set up the project directory structure
5. Configure environment variables for API keys

---

### Milestone 2: Core Functionalities Development

> **Goal:** Develop all core AI-powered functions and implement the FastAPI backend for routing and input processing.

#### Activity 2.1: Develop the Core Functionalities

**Function 1: `generate_outline()`** — *File: `gemini_flash.py`*

- Uses **Gemini Flash** to generate a structured 5-panel comic outline.
- Input: User's story prompt, character name, setting, tone, art style.
- Output: A list of dictionaries, each containing `panel_number`, `title`, `scene_description`, and `image_prompt`.
- **Why Gemini Flash?** Its speed and structured output capability make it ideal for generating organized panel breakdowns quickly.

**Function 2: `generate_story()`** — *File: `gemini_pro.py`*

- Uses **Gemini Pro** to expand the panel outlines into full comic narration.
- Input: The 5-panel outline from `generate_outline()`.
- Output: Formatted text containing narration, atmospheric captions, and character dialogues for each panel.
- **Why Gemini Pro?** Its superior creative writing ability produces engaging, detailed storytelling with natural-sounding dialogues.

**Function 3: `generate_image()`** — *File: `image_generator.py`*

- Uses **Stable Diffusion** (`runwayml/stable-diffusion-v1-5`) to create comic-style illustrations.
- Input: An image prompt generated by the AI for each panel.
- Process: Sanitizes the prompt for safe filenames, generates the image using the Diffusers pipeline, and saves it to `static/panels/`.
- Output: The file path to the saved image.

**Function 4: `build_comic_layout()`** — *File: `layout_builder.py`*

- Organizes generated images and story text into a structured layout.
- Input: List of panel images and the full comic story text.
- Output: A list of dictionaries containing `panel_number`, `image_path`, `title`, `scene_description`, and `narration`.
- This function acts as the **bridge** between AI generation and frontend display.

**Function 5: `save_pdf()`** — *File: `exporters.py`*

- Compiles the complete comic into a downloadable PDF.
- Input: The structured layout from `build_comic_layout()`.
- Process: Uses **FPDF** to create a multi-page PDF with images and text on consecutive pages. Saves with a timestamped filename to `static/exports/`.
- Output: The file path to the generated PDF.

#### Activity 2.2: Implement the FastAPI Backend

**Input Processing:**

- **HTML Form Input:** Captured using FastAPI's `Form(...)` parameters from `index.html`.
- **JSON API Input:** Validated using a Pydantic schema (`PromptRequest`) for programmatic access.

**AI Workflow Integration:**

Each route handler orchestrates the full pipeline:
User Input → generate_outline() → generate_story() → generate_image() × 5 → build_comic_layout() → save_pdf() → Render Template / Return JSON

text


---

### Milestone 3: `routes.py` Development

> **Goal:** Set up all major FastAPI routes, handle user inputs, integrate AI workflows, and ensure smooth frontend-backend interaction.

#### Activity 3.1: Writing the Main Application Logic in `routes.py`

**Core Routes Defined:**

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Loads the homepage (`index.html`) with the input form |
| `/generate` | POST | Processes form submission, runs full AI pipeline, renders comic preview |
| `/generate-comic/json` | POST | Accepts JSON payload, runs AI pipeline, returns JSON response with layout + PDF path |
| `/export-success` | GET | Displays success confirmation after PDF download |
| `/test-image` | GET | Developer utility to test image generation with a custom prompt |

**Input Handling:**

- `/generate` uses `Form(...)` parameters for: `story_prompt`, `character_name`, `setting`, `tone`, `art_style`.
- `/generate-comic/json` uses a Pydantic `PromptRequest` model for JSON body validation.

**Error Handling:**

- All route handlers use `try-except` blocks with FastAPI's `HTTPException` for graceful error management (API failures, JSON decode errors, image generation failures).

**AI Workflow Integration per Route:**

- `/generate` and `/generate-comic/json` both execute the complete 5-step AI pipeline.
- `/test-image` calls only `generate_image()` for isolated testing.
- AI outputs are dynamically injected into Jinja2 templates or returned as structured JSON.

---

### Milestone 4: Frontend Development

> **Goal:** Build responsive, clean, and interactive web pages using HTML, CSS, and Jinja2 templating for a seamless user experience.

#### Activity 4.1: Designing and Developing the User Interface

**`index.html` — Homepage / Input Form:**

- Features a scenic background image to foster a creative atmosphere.
- Contains a structured form with fields for: Story Prompt, Character Name, Setting (dropdown), Tone (dropdown), Art Style (dropdown).
- Uses semantic HTML elements with proper labels and grouping.
- Submits data via POST to `/generate`.

**`comic_preview.html` — Comic Display Page:**

- Displays AI-generated comic panels sequentially.
- Each panel shows:
  - **Panel Title** (e.g., "Panel 2: Into the Deep Woods")
  - **Comic Image** (AI-generated illustration)
  - **Scene Description** (in italics, setting the atmosphere)
  - **Caption** (ambient background description)
  - **Narration** (character actions, emotions, dialogues)
  - **Image Prompt Reference** (the artistic description used for generation)
- Includes a **"Download Your Comic as PDF"** button.

**`export_success.html` — Confirmation Page:**

- Displays a success message confirming the PDF download.
- Includes a **"Go Create Another Comic"** button to return to the homepage.

**CSS Styling:**

- Fixed-width centered layout for readability.
- Consistent button styling with hover effects.
- Input fields with padding, box shadows, and rounded corners.
- Light color scheme for an inviting visual aesthetic.

#### Activity 4.2: Creating Dynamic Templates with FastAPI's Jinja2

**Template Rendering Setup:**

```python
from fastapi.templating import Jinja2Templates
templates = Jinja2Templates(directory="templates")
Dynamic Data Binding:

index.html: Form name attributes map directly to FastAPI Form(...) parameters.
comic_preview.html: Uses Jinja2 {% for panel in layout %} loops to dynamically render each panel's data.
export_success.html: Receives the PDF path as context via Jinja2 variables.
Route-Template Mapping:

Route	Template Rendered
/	index.html
/generate	comic_preview.html
/export-success	export_success.html
Milestone 5: Deployment
Goal: Deploy the ComicCraft application locally, configure the server environment, and verify the complete workflow runs smoothly.

Activity 5.1: Preparing the Application for Local Deployment
Virtual Environment Setup:

Bash

python -m venv env
# Windows
env\Scripts\activate
# macOS/Linux
source env/bin/activate
pip install -r requirements.txt
Environment Variables Configuration:

env

GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your-huggingface-api-key-here
Sensitive API keys are stored in a .env file and loaded using python-dotenv.

Static Files & Templates:

Ensure static/panels/ and static/exports/ directories exist.
Verify all Jinja2 templates are in the templates/ directory.
Activity 5.2: Testing and Verifying Local Deployment
Start the Server:

Bash

uvicorn app.main:app --reload
Access the Application:

Web Interface: http://127.0.0.1:8000
API Documentation: http://127.0.0.1:8000/docs
Verification Checklist:

✅ Homepage loads correctly with all form fields
✅ Form submission triggers the full AI pipeline
✅ Comic preview displays all 5 panels with images and text
✅ PDF download works and generates a valid file
✅ Export success page appears after download
✅ JSON API endpoint returns correct structured data
✅ Test image route generates a single image successfully
👥 Team Members & Work Distribution
Role	Name	Assigned Responsibilities
🏆 Team Leader	Benadict Raj Kumar	Project architecture design, AI model research & selection (Milestone 1), overall project coordination, deployment & local testing (Milestone 5), environment setup, and final integration verification
👨‍💻 Team Member	Kurusil	Core AI story generation functions — generate_outline() using Gemini Flash and generate_story() using Gemini Pro (Activity 2.1), backend AI workflow integration in route handlers (Activity 2.2), prompt engineering for narrative quality
👨‍💻 Team Member	Nithish	Image generation using Stable Diffusion — generate_image() function (Activity 2.1), layout building — build_comic_layout() function, PDF export functionality — save_pdf() using FPDF, static file management for panels and exports
👨‍💻 Team Member	Raja JJ	FastAPI backend & routes development (Milestone 3) — all route handlers in routes.py, input validation with Form parameters and Pydantic models, error handling with HTTPException, JSON API endpoint implementation, server configuration
👨‍💻 Team Member	Pradip	Frontend development (Milestone 4) — designing and building all HTML/CSS pages (index.html, comic_preview.html, export_success.html), Jinja2 dynamic template integration, responsive UI/UX design, form-to-backend data binding
⚙️ Installation & Setup
Step 1: Clone the Repository
Bash

git clone <repository-url>
cd ComicCraft
Step 2: Create Virtual Environment
Bash

python -m venv comiccraft-env

# Windows
comiccraft-env\Scripts\activate

# macOS/Linux
source comiccraft-env/bin/activate
Step 3: Install Dependencies
Bash

pip install fastapi uvicorn jinja2 python-multipart google-generativeai diffusers transformers fpdf Pillow accelerate
Step 4: Configure API Keys
Create a .env file in the project root:

env

GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your-huggingface-api-key-here
Step 5: Run the Application
Bash

uvicorn app.main:app --reload
Step 6: Access the Application
Web App: http://127.0.0.1:8000
API Docs: http://127.0.0.1:8000/docs
Live Demo: https://3000-i8cscxy3ccqupj5clnbvg.e2b.app
🔌 API Endpoints
Endpoint	Method	Description	Input	Output
/	GET	Homepage with input form	None	HTML page
/generate	POST	Generate comic from form data	Form fields (prompt, character, setting, tone, style)	HTML comic preview
/generate-comic/json	POST	Generate comic via JSON API	JSON body (PromptRequest)	JSON with layout + PDF path
/export-success	GET	Export confirmation page	None	HTML success page
/test-image	GET	Test single image generation	Query param: prompt	Generated image file
📁 Project Structure
text

ComicCraft/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── routes.py               # All route handlers and API endpoints
│   ├── gemini_flash.py         # Gemini Flash - outline generation
│   ├── gemini_pro.py           # Gemini Pro - story narration
│   ├── image_generator.py      # Stable Diffusion - image generation
│   ├── layout_builder.py       # Comic layout assembly
│   └── exporters.py            # PDF export functionality
├── templates/
│   ├── index.html              # Homepage input form
│   ├── comic_preview.html      # Comic display page
│   └── export_success.html     # Download confirmation page
├── static/
│   ├── panels/                 # Generated comic panel images
│   └── exports/                # Exported PDF files
├── .env                        # Environment variables (API keys)
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation
🖼️ Screenshots & Pages
🏠 Home Page
The homepage features a clean layout with a scenic background. Users enter their story prompt, character name, setting, tone, and art style through an intuitive form. The design encourages creativity and makes the comic creation process accessible to all users.

📖 Comic Preview Page
Displays the AI-generated comic panel-by-panel. Each panel includes a title, AI-generated illustration, scene description (in italics), captions, narration text, and the original image prompt reference. The sequential layout creates an immersive storytelling experience.

⬇️ Download Button
A prominent "Download Your Comic as PDF" button compiles all panels, images, and text into a professionally formatted PDF file that downloads directly to the user's device.

✅ Export Success Page
Confirms successful PDF download with a success message and a "Go Create Another Comic" call-to-action button to encourage continued engagement.

🎯 Conclusion
ComicCraft successfully demonstrates the creative potential of AI-driven comic generation. By combining:

Gemini Flash for fast, structured story outlining
Gemini Pro for rich, creative narration and dialogues
Stable Diffusion for high-quality comic-style illustrations
...the application enables users to transform simple text prompts into complete, visually engaging comic narratives.

The project delivers an end-to-end experience:

✅ Personalized story outline generation
✅ Full narration and dialogue creation
✅ High-quality image generation per panel
✅ Automated layout assembly
✅ Exportable PDF download
All within an intuitive web interface that requires no artistic or technical skills.

Future Enhancements
While the current version focuses on single comic generation, the modular architecture supports future additions such as:

🔐 User authentication and profiles
📚 Personal comic libraries
📖 Multi-page story arcs
🎨 Additional art style models
☁️ Cloud deployment and scaling
ComicCraft showcases how AI can democratize storytelling and empower anyone to bring their creative visions to life with minimal effort.

🌐 Try it now: https://3000-i8cscxy3ccqupj5clnbvg.e2b.app

Built with ❤️ by Team ComicCraft

Benadict Raj Kumar | Kurusil | Nithish | Raja JJ | Pradip





Just give me only the code to copy and paste and give nothing else



Max



Thought for 19 seconds

The user wants the complete README.md file content in a single code block that they can directly copy and paste into their repository. I need to include everything from the previous response — all sections, team members, the website link, detailed explanations of every topic — formatted as a proper Markdown README file inside a code block.

Markdown

# 🎨 ComicCraft - AI Comic Story Creator using Gemini Models

> **🌐 Live Demo:** [https://3000-i8cscxy3ccqupj5clnbvg.e2b.app](https://3000-i8cscxy3ccqupj5clnbvg.e2b.app)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Scenarios](#-scenarios)
4. [Technical Architecture](#-technical-architecture)
5. [Pre-requisites](#-pre-requisites)
6. [Project Workflow & Milestones](#-project-workflow--milestones)
7. [Team Members & Work Distribution](#-team-members--work-distribution)
8. [Installation & Setup](#-installation--setup)
9. [API Endpoints](#-api-endpoints)
10. [Project Structure](#-project-structure)
11. [Screenshots & Pages](#-screenshots--pages)
12. [Conclusion](#-conclusion)

---

## 🚀 Project Overview

**ComicCraft** is a web-based application that leverages the power of Artificial Intelligence to generate **personalized comic book stories and illustrations** from simple user-provided text prompts. Built with **FastAPI** as the backend framework and integrated with **Google's Gemini AI models** (Gemini Flash & Gemini Pro) alongside **Stable Diffusion** for image generation, ComicCraft automates the entire creative pipeline of comic creation.

### What Does It Do?

The application accepts user inputs such as:

| Input Field | Description | Example |
|---|---|---|
| **Story Prompt** | The main idea or concept for the comic | *"A brave fox exploring an enchanted forest"* |
| **Main Character Name** | The hero/protagonist of the story | *"Finn"* |
| **Setting** | The location where the story takes place | *Forest, City, Space, School* |
| **Tone** | The mood or emotional feel of the narrative | *Dramatic, Funny, Poetic, Light-hearted* |
| **Art Style** | The visual style for illustrations | *Anime, Comic Book, Pixel Art, Realistic* |

Using these inputs, ComicCraft automatically generates:

- ✅ A **5-panel structured comic outline** (titles, scene descriptions, image prompts)
- ✅ **Full narration and character dialogues** for each panel
- ✅ **AI-generated comic-style illustrations** for every panel
- ✅ A **downloadable PDF** containing the complete comic

This makes comic creation **accessible to everyone** — including non-artists, casual users, storytellers, and hobbyists — without requiring any drawing skills or technical expertise.

---

## ✨ Key Features

### 1. AI-Powered Story Generation

ComicCraft uses **two specialized Gemini models** working in tandem:

- **Gemini 1.5 Flash** (`models/gemini-1.5-flash`): Optimized for speed, this model generates the **structured panel-by-panel outline** of the comic. It quickly produces panel numbers, titles, scene descriptions, and image generation prompts based on the user's story idea.

- **Gemini 1.5 Pro** (`models/gemini-1.5-pro`): Optimized for creativity and detail, this model takes the outline and expands it into **rich narration, atmospheric captions, and engaging character dialogues** that bring the story to life.

### 2. AI-Powered Image Generation

- Uses **Stable Diffusion** (`runwayml/stable-diffusion-v1-5`) via Hugging Face's Diffusers library to generate **high-quality, comic-style illustrations** for each panel based on AI-crafted image prompts.
- Images are automatically sanitized for safe filenames and saved to the server's `static/panels` directory.

### 3. Automated Layout Building

- The `layout_builder.py` module intelligently **matches each generated image with its corresponding panel story**, creating a structured layout of panel number, image path, and narrative text.

### 4. PDF Export

- The `exporters.py` module compiles the entire comic — images, titles, descriptions, and narration — into a **professionally formatted multi-page PDF** using the **FPDF** library.
- PDFs are saved with **timestamped filenames** in the `static/exports` folder for easy identification.

### 5. Interactive Web Interface

- A clean, responsive frontend built with **HTML, CSS, and Jinja2 templates** allows users to submit inputs, preview their comics panel-by-panel, and download the final PDF — all from the browser.

### 6. Dual Interface Support

- **Web Form Interface**: For casual users who prefer a visual form-based experience.
- **JSON API Endpoints**: For developers and automated systems that want to interact with the backend programmatically.

---

## 📖 Scenarios

### Scenario 1: Personalized Comic Generation from a Story Prompt

**Situation:** A user enters a prompt like *"A brave fox exploring an enchanted forest."*

**What Happens:**

1. The user fills in additional preferences:
   - **Character Name:** Finn
   - **Setting:** Forest
   - **Tone:** Dramatic
   - **Art Style:** Anime
2. The system sends the prompt to **Gemini Flash**, which generates a 5-panel outline with titles, scene descriptions, and image prompts.
3. **Gemini Pro** then expands each panel into full narration with character dialogues.
4. **Stable Diffusion** generates a unique anime-style illustration for each panel.
5. The user sees a complete, cohesive comic strip on the preview page that matches their creative vision.

**Why It Matters:** This personalized approach ensures every comic is unique and tailored to the user's specific creative preferences, dramatically enhancing user satisfaction.

---

### Scenario 2: Iterating on Tone and Art Style

**Situation:** A user wants a lighter, more humorous comic instead of a dramatic one.

**What Happens:**

1. On the input form, the user changes:
   - **Tone:** from "dramatic" → **"funny"**
   - **Art Style:** from "anime" → **"comic book"**
2. Upon resubmission, the **entire pipeline regenerates**:
   - Gemini Flash creates a new outline with humorous panel structures.
   - Gemini Pro writes witty narration and comedic dialogues.
   - Stable Diffusion produces classic comic-book-style illustrations.
3. The result is a completely different comic with a light-hearted, cartoonish feel.

**Why It Matters:** This demonstrates the system's **flexibility and customization capability**, allowing users to iterate and experiment until the output perfectly matches their creative vision.

---

### Scenario 3: Downloading the Comic as a PDF

**Situation:** After reviewing the on-screen preview, the user wants to save their comic.

**What Happens (Step-by-Step):**

1. **Layout Binding** (`layout_builder.py`):
   - The system assembles each panel's title, image, and narrative text into a structured layout object.
   - Each panel is matched with its corresponding AI-generated illustration.

2. **PDF Generation** (`exporters.py`):
   - The system calls the `save_pdf()` function, which uses the **FPDF** library.
   - Images and narrative text are placed onto consecutive pages in a clean, readable format.
   - The PDF is saved with a **timestamped filename** (e.g., `comic_20250615_143022.pdf`) in the `static/exports` directory.

3. **Export Success**:
   - The user is redirected to the **Export Success Page** (`export_success.html`), which confirms the download was successful.
   - A "Go Create Another Comic" button encourages continued engagement.

**Why It Matters:** Users can **save, print, or share** their AI-generated comics in a professional PDF format, giving them a tangible creative output.

---

## 🏗️ Technical Architecture

### Architecture Overview

ComicCraft follows a **three-tier architecture**:
┌─────────────────────────────────────────────────────────┐
│ FRONTEND LAYER │
│ (HTML, CSS, Jinja2 Templates) │
│ │
│ index.html │ comic_preview.html │ export_success │
│ (Input Form)│ (Comic Display) │ (Confirmation) │
└──────────────────────┬──────────────────────────────────┘
│ POST / GET Requests
▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND LAYER │
│ (FastAPI + routes.py) │
│ │
│ Route Handling │ Input Validation │ Workflow Orchest. │
│ Error Handling │ Template Render │ PDF Compilation │
└──────────────────────┬──────────────────────────────────┘
│ API Calls
▼
┌─────────────────────────────────────────────────────────┐
│ AI SERVICES LAYER │
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │ Gemini Flash │ │ Gemini Pro │ │ Stable Diffusion│ │
│ │ (Outlines) │ │ (Narration) │ │ (Images) │ │
│ └──────────────┘ └──────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────┘

text


### Frontend Responsibilities

- Built with **HTML, CSS, and Jinja2 templates** for dynamic content rendering.
- Captures user inputs through a structured form (story prompt, character name, setting, tone, art style).
- Sends data to the FastAPI backend via **POST requests**.
- Displays AI-generated comics panel-by-panel on the preview page.
- Provides download functionality for PDF export.

**Templates Used:**

| Template | Purpose |
|---|---|
| `index.html` | User input collection form |
| `comic_preview.html` | Displays the generated comic panels |
| `export_success.html` | Shows download confirmation message |

### Backend Responsibilities

- **FastAPI** manages all server-side operations and route handling.
- Receives form data (via `Form(...)`) or JSON payloads (via Pydantic models).
- Orchestrates the AI generation pipeline: outline → story → images → layout → PDF.
- Handles error management using `HTTPException` and `try-except` blocks.
- Renders Jinja2 templates with dynamically generated comic data.

### AI Integration Points

| AI Model | Purpose | When Called |
|---|---|---|
| **Gemini Flash** | Generate structured 5-panel comic outline | First step after user input |
| **Gemini Pro** | Create detailed narration and character dialogues | After outline is generated |
| **Stable Diffusion** | Generate comic-style illustrations per panel | After story narration is ready |

All AI interactions happen **dynamically at runtime**, ensuring every comic is fully unique and customized.

---

## 📚 Pre-requisites

Before setting up ComicCraft, ensure you have knowledge of and access to the following technologies:

| # | Technology | Purpose | Documentation Link |
|---|---|---|---|
| 1 | **FastAPI** | Backend web framework for building APIs | [FastAPI Docs](https://fastapi.tiangolo.com/) |
| 2 | **Uvicorn** | ASGI server to run the FastAPI application | [Uvicorn Docs](https://www.uvicorn.org/) |
| 3 | **Python** | Core programming language (v3.9+) | [Python Docs](https://docs.python.org/3/) |
| 4 | **HTML, CSS, Jinja2** | Frontend templating and styling | [W3Schools](https://www.w3schools.com/) |
| 5 | **Google Gemini API** | AI text generation (Flash & Pro models) | [Google AI Docs](https://ai.google.dev/) |
| 6 | **Hugging Face Diffusers** | Stable Diffusion image generation | [Diffusers Docs](https://huggingface.co/docs/diffusers) |
| 7 | **PyTorch** | Deep learning framework (backend for Diffusers) | [PyTorch Docs](https://pytorch.org/docs/) |
| 8 | **FPDF** | PDF file generation library | [FPDF Docs](https://pyfpdf.readthedocs.io/) |
| 9 | **Git** | Version control system | [Git Docs](https://git-scm.com/doc) |
| 10 | **pip / virtualenv** | Python package and environment management | [Virtualenv Guide](https://virtualenv.pypa.io/) |

---

## 🔄 Project Workflow & Milestones

### Milestone 1: Model Selection and Architecture

> **Goal:** Research, evaluate, and select the best AI models for comic generation, define the system architecture, and set up the development environment.

#### Activity 1.1: Research and Select the Appropriate Generative AI Model

**Understanding Project Requirements:**

The ComicCraft application needs to generate three types of content:
- **Structured comic outlines** (panel-by-panel breakdown with titles and scene descriptions)
- **Full comic narration and character dialogues** (creative, engaging storytelling)
- **Visual comic-style illustrations** (high-quality images for each panel)

**Model Evaluation Process:**

The team researched and tested multiple AI models:

| Model Category | Models Evaluated | Evaluation Criteria |
|---|---|---|
| Text Generation | Gemini Flash, Gemini Pro, GPT-3.5 | Response quality, creativity, prompt adherence, speed |
| Image Generation | Stable Diffusion v1.5, SDXL, DALL-E | Image quality, style consistency, resolution, generation speed |

**Final Model Selection:**

| Selected Model | Role | Reason for Selection |
|---|---|---|
| **Gemini 1.5 Flash** | Panel outline generation | Fast, structured outputs ideal for creating organized panel breakdowns |
| **Gemini 1.5 Pro** | Story narration & dialogues | Superior creative writing quality with rich, detailed storytelling |
| **Stable Diffusion v1.5** | Comic illustrations | High-quality image generation with excellent prompt adherence for comic styles |

#### Activity 1.2: Define the Architecture of the Application

The architecture is structured into three primary components as detailed in the [Technical Architecture](#-technical-architecture) section above:
- **Frontend** → User interaction and display
- **Backend** → Data processing, routing, and workflow orchestration
- **AI Integration** → Content generation via Gemini APIs and Stable Diffusion

#### Activity 1.3: Set Up the Development Environment

**Steps:**

1. Install Python (v3.9+) and pip
2. Create and activate a virtual environment
3. Install all required dependencies
4. Set up the project directory structure
5. Configure environment variables for API keys

---

### Milestone 2: Core Functionalities Development

> **Goal:** Develop all core AI-powered functions and implement the FastAPI backend for routing and input processing.

#### Activity 2.1: Develop the Core Functionalities

**Function 1: `generate_outline()`** — *File: `gemini_flash.py`*

- Uses **Gemini Flash** to generate a structured 5-panel comic outline.
- Input: User's story prompt, character name, setting, tone, art style.
- Output: A list of dictionaries, each containing `panel_number`, `title`, `scene_description`, and `image_prompt`.
- **Why Gemini Flash?** Its speed and structured output capability make it ideal for generating organized panel breakdowns quickly.

**Function 2: `generate_story()`** — *File: `gemini_pro.py`*

- Uses **Gemini Pro** to expand the panel outlines into full comic narration.
- Input: The 5-panel outline from `generate_outline()`.
- Output: Formatted text containing narration, atmospheric captions, and character dialogues for each panel.
- **Why Gemini Pro?** Its superior creative writing ability produces engaging, detailed storytelling with natural-sounding dialogues.

**Function 3: `generate_image()`** — *File: `image_generator.py`*

- Uses **Stable Diffusion** (`runwayml/stable-diffusion-v1-5`) to create comic-style illustrations.
- Input: An image prompt generated by the AI for each panel.
- Process: Sanitizes the prompt for safe filenames, generates the image using the Diffusers pipeline, and saves it to `static/panels/`.
- Output: The file path to the saved image.

**Function 4: `build_comic_layout()`** — *File: `layout_builder.py`*

- Organizes generated images and story text into a structured layout.
- Input: List of panel images and the full comic story text.
- Output: A list of dictionaries containing `panel_number`, `image_path`, `title`, `scene_description`, and `narration`.
- This function acts as the **bridge** between AI generation and frontend display.

**Function 5: `save_pdf()`** — *File: `exporters.py`*

- Compiles the complete comic into a downloadable PDF.
- Input: The structured layout from `build_comic_layout()`.
- Process: Uses **FPDF** to create a multi-page PDF with images and text on consecutive pages. Saves with a timestamped filename to `static/exports/`.
- Output: The file path to the generated PDF.

#### Activity 2.2: Implement the FastAPI Backend

**Input Processing:**

- **HTML Form Input:** Captured using FastAPI's `Form(...)` parameters from `index.html`.
- **JSON API Input:** Validated using a Pydantic schema (`PromptRequest`) for programmatic access.

**AI Workflow Integration:**

Each route handler orchestrates the full pipeline:
User Input → generate_outline() → generate_story() → generate_image() × 5 → build_comic_layout() → save_pdf() → Render Template / Return JSON

text


---

### Milestone 3: `routes.py` Development

> **Goal:** Set up all major FastAPI routes, handle user inputs, integrate AI workflows, and ensure smooth frontend-backend interaction.

#### Activity 3.1: Writing the Main Application Logic in `routes.py`

**Core Routes Defined:**

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Loads the homepage (`index.html`) with the input form |
| `/generate` | POST | Processes form submission, runs full AI pipeline, renders comic preview |
| `/generate-comic/json` | POST | Accepts JSON payload, runs AI pipeline, returns JSON response with layout + PDF path |
| `/export-success` | GET | Displays success confirmation after PDF download |
| `/test-image` | GET | Developer utility to test image generation with a custom prompt |

**Input Handling:**

- `/generate` uses `Form(...)` parameters for: `story_prompt`, `character_name`, `setting`, `tone`, `art_style`.
- `/generate-comic/json` uses a Pydantic `PromptRequest` model for JSON body validation.

**Error Handling:**

- All route handlers use `try-except` blocks with FastAPI's `HTTPException` for graceful error management (API failures, JSON decode errors, image generation failures).

**AI Workflow Integration per Route:**

- `/generate` and `/generate-comic/json` both execute the complete 5-step AI pipeline.
- `/test-image` calls only `generate_image()` for isolated testing.
- AI outputs are dynamically injected into Jinja2 templates or returned as structured JSON.

---

### Milestone 4: Frontend Development

> **Goal:** Build responsive, clean, and interactive web pages using HTML, CSS, and Jinja2 templating for a seamless user experience.

#### Activity 4.1: Designing and Developing the User Interface

**`index.html` — Homepage / Input Form:**

- Features a scenic background image to foster a creative atmosphere.
- Contains a structured form with fields for: Story Prompt, Character Name, Setting (dropdown), Tone (dropdown), Art Style (dropdown).
- Uses semantic HTML elements with proper labels and grouping.
- Submits data via POST to `/generate`.

**`comic_preview.html` — Comic Display Page:**

- Displays AI-generated comic panels sequentially.
- Each panel shows:
  - **Panel Title** (e.g., "Panel 2: Into the Deep Woods")
  - **Comic Image** (AI-generated illustration)
  - **Scene Description** (in italics, setting the atmosphere)
  - **Caption** (ambient background description)
  - **Narration** (character actions, emotions, dialogues)
  - **Image Prompt Reference** (the artistic description used for generation)
- Includes a **"Download Your Comic as PDF"** button.

**`export_success.html` — Confirmation Page:**

- Displays a success message confirming the PDF download.
- Includes a **"Go Create Another Comic"** button to return to the homepage.

**CSS Styling:**

- Fixed-width centered layout for readability.
- Consistent button styling with hover effects.
- Input fields with padding, box shadows, and rounded corners.
- Light color scheme for an inviting visual aesthetic.

#### Activity 4.2: Creating Dynamic Templates with FastAPI's Jinja2

**Template Rendering Setup:**

```python
from fastapi.templating import Jinja2Templates
templates = Jinja2Templates(directory="templates")
Dynamic Data Binding:

index.html: Form name attributes map directly to FastAPI Form(...) parameters.
comic_preview.html: Uses Jinja2 {% for panel in layout %} loops to dynamically render each panel's data.
export_success.html: Receives the PDF path as context via Jinja2 variables.
Route-Template Mapping:

Route	Template Rendered
/	index.html
/generate	comic_preview.html
/export-success	export_success.html
Milestone 5: Deployment
Goal: Deploy the ComicCraft application locally, configure the server environment, and verify the complete workflow runs smoothly.

Activity 5.1: Preparing the Application for Local Deployment
Virtual Environment Setup:

Bash

python -m venv env
# Windows
env\Scripts\activate
# macOS/Linux
source env/bin/activate
pip install -r requirements.txt
Environment Variables Configuration:

env

GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your-huggingface-api-key-here
Sensitive API keys are stored in a .env file and loaded using python-dotenv.

Static Files & Templates:

Ensure static/panels/ and static/exports/ directories exist.
Verify all Jinja2 templates are in the templates/ directory.
Activity 5.2: Testing and Verifying Local Deployment
Start the Server:

Bash

uvicorn app.main:app --reload
Access the Application:

Web Interface: http://127.0.0.1:8000
API Documentation: http://127.0.0.1:8000/docs
Verification Checklist:

✅ Homepage loads correctly with all form fields
✅ Form submission triggers the full AI pipeline
✅ Comic preview displays all 5 panels with images and text
✅ PDF download works and generates a valid file
✅ Export success page appears after download
✅ JSON API endpoint returns correct structured data
✅ Test image route generates a single image successfully
👥 Team Members & Work Distribution
Role	Name	Assigned Responsibilities
🏆 Team Leader	Benadict Raj Kumar	Project architecture design, AI model research & selection (Milestone 1), overall project coordination, deployment & local testing (Milestone 5), environment setup, and final integration verification
👨‍💻 Team Member	Kurusil	Core AI story generation functions — generate_outline() using Gemini Flash and generate_story() using Gemini Pro (Activity 2.1), backend AI workflow integration in route handlers (Activity 2.2), prompt engineering for narrative quality
👨‍💻 Team Member	Nithish	Image generation using Stable Diffusion — generate_image() function (Activity 2.1), layout building — build_comic_layout() function, PDF export functionality — save_pdf() using FPDF, static file management for panels and exports
👨‍💻 Team Member	Raja JJ	FastAPI backend & routes development (Milestone 3) — all route handlers in routes.py, input validation with Form parameters and Pydantic models, error handling with HTTPException, JSON API endpoint implementation, server configuration
👨‍💻 Team Member	Pradip	Frontend development (Milestone 4) — designing and building all HTML/CSS pages (index.html, comic_preview.html, export_success.html), Jinja2 dynamic template integration, responsive UI/UX design, form-to-backend data binding
⚙️ Installation & Setup
Step 1: Clone the Repository
Bash

git clone <repository-url>
cd ComicCraft
Step 2: Create Virtual Environment
Bash

python -m venv comiccraft-env

# Windows
comiccraft-env\Scripts\activate

# macOS/Linux
source comiccraft-env/bin/activate
Step 3: Install Dependencies
Bash

pip install fastapi uvicorn jinja2 python-multipart google-generativeai diffusers transformers fpdf Pillow accelerate
Step 4: Configure API Keys
Create a .env file in the project root:

env

GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your-huggingface-api-key-here
Step 5: Run the Application
Bash

uvicorn app.main:app --reload
Step 6: Access the Application
Web App: http://127.0.0.1:8000
API Docs: http://127.0.0.1:8000/docs
Live Demo: https://3000-i8cscxy3ccqupj5clnbvg.e2b.app
🔌 API Endpoints
Endpoint	Method	Description	Input	Output
/	GET	Homepage with input form	None	HTML page
/generate	POST	Generate comic from form data	Form fields (prompt, character, setting, tone, style)	HTML comic preview
/generate-comic/json	POST	Generate comic via JSON API	JSON body (PromptRequest)	JSON with layout + PDF path
/export-success	GET	Export confirmation page	None	HTML success page
/test-image	GET	Test single image generation	Query param: prompt	Generated image file
📁 Project Structure
text

ComicCraft/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── routes.py               # All route handlers and API endpoints
│   ├── gemini_flash.py         # Gemini Flash - outline generation
│   ├── gemini_pro.py           # Gemini Pro - story narration
│   ├── image_generator.py      # Stable Diffusion - image generation
│   ├── layout_builder.py       # Comic layout assembly
│   └── exporters.py            # PDF export functionality
├── templates/
│   ├── index.html              # Homepage input form
│   ├── comic_preview.html      # Comic display page
│   └── export_success.html     # Download confirmation page
├── static/
│   ├── panels/                 # Generated comic panel images
│   └── exports/                # Exported PDF files
├── .env                        # Environment variables (API keys)
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation
🖼️ Screenshots & Pages
🏠 Home Page
The homepage features a clean layout with a scenic background. Users enter their story prompt, character name, setting, tone, and art style through an intuitive form. The design encourages creativity and makes the comic creation process accessible to all users.

📖 Comic Preview Page
Displays the AI-generated comic panel-by-panel. Each panel includes a title, AI-generated illustration, scene description (in italics), captions, narration text, and the original image prompt reference. The sequential layout creates an immersive storytelling experience.

⬇️ Download Button
A prominent "Download Your Comic as PDF" button compiles all panels, images, and text into a professionally formatted PDF file that downloads directly to the user's device.

✅ Export Success Page
Confirms successful PDF download with a success message and a "Go Create Another Comic" call-to-action button to encourage continued engagement.

🎯 Conclusion
ComicCraft successfully demonstrates the creative potential of AI-driven comic generation. By combining:

Gemini Flash for fast, structured story outlining
Gemini Pro for rich, creative narration and dialogues
Stable Diffusion for high-quality comic-style illustrations
...the application enables users to transform simple text prompts into complete, visually engaging comic narratives.

The project delivers an end-to-end experience:

✅ Personalized story outline generation
✅ Full narration and dialogue creation
✅ High-quality image generation per panel
✅ Automated layout assembly
✅ Exportable PDF download
All within an intuitive web interface that requires no artistic or technical skills.

Future Enhancements
While the current version focuses on single comic generation, the modular architecture supports future additions such as:

🔐 User authentication and profiles
📚 Personal comic libraries
📖 Multi-page story arcs
🎨 Additional art style models
☁️ Cloud deployment and scaling
ComicCraft showcases how AI can democratize storytelling and empower anyone to bring their creative visions to life with minimal effort.

🌐 Try it now: https://3000-i8cscxy3ccqupj5clnbvg.e2b.app

Built with ❤️ by Team ComicCraft

Benadict Raj Kumar | Kurusil | Nithish | Raja JJ | Pradip




give me the full readme code for everything..



Max



Thought for 5 seconds

The user wants me to create a comprehensive README file for their ComicCraft project. They want me to:

Add the website link to the README
Add team names and assign work to each member
Explain every given topic properly
Let me organize this into a well-structured README.md file that covers all the content from the project description, with proper team assignments and the website link.

I need to distribute the work among 5 team members:

Team Leader: Benadict Raj Kumar
Team Members: Kurusil, Nithish, Raja JJ, Pradip
Let me assign work logically:

Benadict Raj Kumar (Team Leader):

Project architecture design and model selection (Milestone 1)
Overall project coordination
Deployment and testing (Milestone 5)
Kurusil:

Core functionality development - Story generation (Gemini Flash & Pro integration) (Activity 2.1)
Backend AI workflow integration (Activity 2.2)
Nithish:

Image generation using Stable Diffusion (Activity 2.1)
PDF export functionality (Activity 2.1)
Layout builder (Activity 2.1)
Raja JJ:

FastAPI Backend & Routes development (Milestone 3)
API endpoint creation and routing logic
Pradip:

Frontend Development (Milestone 4)
HTML/CSS/Jinja2 templates design
UI/UX implementation
Now let me create a comprehensive README with all topics explained properly.

🎨 ComicCraft - AI Comic Story Creator using Gemini Models
🌐 Live Demo: https://3000-i8cscxy3ccqupj5clnbvg.e2b.app

📋 Table of Contents
Project Overview
Key Features
Scenarios
Technical Architecture
Pre-requisites
Project Workflow & Milestones
Team Members & Work Distribution
Installation & Setup
API Endpoints
Project Structure
Screenshots & Pages
Conclusion
🚀 Project Overview
ComicCraft is a web-based application that leverages the power of Artificial Intelligence to generate personalized comic book stories and illustrations from simple user-provided text prompts. Built with FastAPI as the backend framework and integrated with Google's Gemini AI models (Gemini Flash & Gemini Pro) alongside Stable Diffusion for image generation, ComicCraft automates the entire creative pipeline of comic creation.

What Does It Do?
The application accepts user inputs such as:

Input Field	Description	Example
Story Prompt	The main idea or concept for the comic	"A brave fox exploring an enchanted forest"
Main Character Name	The hero/protagonist of the story	"Finn"
Setting	The location where the story takes place	Forest, City, Space, School
Tone	The mood or emotional feel of the narrative	Dramatic, Funny, Poetic, Light-hearted
Art Style	The visual style for illustrations	Anime, Comic Book, Pixel Art, Realistic
Using these inputs, ComicCraft automatically generates:

✅ A 5-panel structured comic outline (titles, scene descriptions, image prompts)
✅ Full narration and character dialogues for each panel
✅ AI-generated comic-style illustrations for every panel
✅ A downloadable PDF containing the complete comic
This makes comic creation accessible to everyone — including non-artists, casual users, storytellers, and hobbyists — without requiring any drawing skills or technical expertise.

✨ Key Features
1. AI-Powered Story Generation
ComicCraft uses two specialized Gemini models working in tandem:

Gemini 1.5 Flash (models/gemini-1.5-flash): Optimized for speed, this model generates the structured panel-by-panel outline of the comic. It quickly produces panel numbers, titles, scene descriptions, and image generation prompts based on the user's story idea.
Gemini 1.5 Pro (models/gemini-1.5-pro): Optimized for creativity and detail, this model takes the outline and expands it into rich narration, atmospheric captions, and engaging character dialogues that bring the story to life.
2. AI-Powered Image Generation
Uses Stable Diffusion (runwayml/stable-diffusion-v1-5) via Hugging Face's Diffusers library to generate high-quality, comic-style illustrations for each panel based on AI-crafted image prompts.
Images are automatically sanitized for safe filenames and saved to the server's static/panels directory.
3. Automated Layout Building
The layout_builder.py module intelligently matches each generated image with its corresponding panel story, creating a structured layout of panel number, image path, and narrative text.
4. PDF Export
The exporters.py module compiles the entire comic — images, titles, descriptions, and narration — into a professionally formatted multi-page PDF using the FPDF library.
PDFs are saved with timestamped filenames in the static/exports folder for easy identification.
5. Interactive Web Interface
A clean, responsive frontend built with HTML, CSS, and Jinja2 templates allows users to submit inputs, preview their comics panel-by-panel, and download the final PDF — all from the browser.
6. Dual Interface Support
Web Form Interface: For casual users who prefer a visual form-based experience.
JSON API Endpoints: For developers and automated systems that want to interact with the backend programmatically.
📖 Scenarios
Scenario 1: Personalized Comic Generation from a Story Prompt
Situation: A user enters a prompt like "A brave fox exploring an enchanted forest."

What Happens:

The user fills in additional preferences:
Character Name: Finn
Setting: Forest
Tone: Dramatic
Art Style: Anime
The system sends the prompt to Gemini Flash, which generates a 5-panel outline with titles, scene descriptions, and image prompts.
Gemini Pro then expands each panel into full narration with character dialogues.
Stable Diffusion generates a unique anime-style illustration for each panel.
The user sees a complete, cohesive comic strip on the preview page that matches their creative vision.
Why It Matters: This personalized approach ensures every comic is unique and tailored to the user's specific creative preferences, dramatically enhancing user satisfaction.

Scenario 2: Iterating on Tone and Art Style
Situation: A user wants a lighter, more humorous comic instead of a dramatic one.

What Happens:

On the input form, the user changes:
Tone: from "dramatic" → "funny"
Art Style: from "anime" → "comic book"
Upon resubmission, the entire pipeline regenerates:
Gemini Flash creates a new outline with humorous panel structures.
Gemini Pro writes witty narration and comedic dialogues.
Stable Diffusion produces classic comic-book-style illustrations.
The result is a completely different comic with a light-hearted, cartoonish feel.
Why It Matters: This demonstrates the system's flexibility and customization capability, allowing users to iterate and experiment until the output perfectly matches their creative vision.

Scenario 3: Downloading the Comic as a PDF
Situation: After reviewing the on-screen preview, the user wants to save their comic.

What Happens (Step-by-Step):

Layout Binding (layout_builder.py):

The system assembles each panel's title, image, and narrative text into a structured layout object.
Each panel is matched with its corresponding AI-generated illustration.
PDF Generation (exporters.py):

The system calls the save_pdf() function, which uses the FPDF library.
Images and narrative text are placed onto consecutive pages in a clean, readable format.
The PDF is saved with a timestamped filename (e.g., comic_20250615_143022.pdf) in the static/exports directory.
Export Success:

The user is redirected to the Export Success Page (export_success.html), which confirms the download was successful.
A "Go Create Another Comic" button encourages continued engagement.
Why It Matters: Users can save, print, or share their AI-generated comics in a professional PDF format, giving them a tangible creative output.

🏗️ Technical Architecture
Architecture Overview
ComicCraft follows a three-tier architecture:

text

┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
│         (HTML, CSS, Jinja2 Templates)                   │
│                                                         │
│  index.html  │  comic_preview.html  │  export_success   │
│  (Input Form)│  (Comic Display)     │  (Confirmation)   │
└──────────────────────┬──────────────────────────────────┘
                       │ POST / GET Requests
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                        │
│              (FastAPI + routes.py)                      │
│                                                         │
│  Route Handling │ Input Validation │ Workflow Orchest.  │
│  Error Handling │ Template Render  │ PDF Compilation    │
└──────────────────────┬──────────────────────────────────┘
                       │ API Calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   AI SERVICES LAYER                     │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐  │
│  │ Gemini Flash │ │  Gemini Pro  │ │ Stable Diffusion│  │
│  │  (Outlines)  │ │ (Narration)  │ │  (Images)       │  │
│  └──────────────┘ └──────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
Frontend Responsibilities
Built with HTML, CSS, and Jinja2 templates for dynamic content rendering.
Captures user inputs through a structured form (story prompt, character name, setting, tone, art style).
Sends data to the FastAPI backend via POST requests.
Displays AI-generated comics panel-by-panel on the preview page.
Provides download functionality for PDF export.
Templates Used:

Template	Purpose
index.html	User input collection form
comic_preview.html	Displays the generated comic panels
export_success.html	Shows download confirmation message
Backend Responsibilities
FastAPI manages all server-side operations and route handling.
Receives form data (via Form(...)) or JSON payloads (via Pydantic models).
Orchestrates the AI generation pipeline: outline → story → images → layout → PDF.
Handles error management using HTTPException and try-except blocks.
Renders Jinja2 templates with dynamically generated comic data.
AI Integration Points
AI Model	Purpose	When Called
Gemini Flash	Generate structured 5-panel comic outline	First step after user input
Gemini Pro	Create detailed narration and character dialogues	After outline is generated
Stable Diffusion	Generate comic-style illustrations per panel	After story narration is ready
All AI interactions happen dynamically at runtime, ensuring every comic is fully unique and customized.

📚 Pre-requisites
Before setting up ComicCraft, ensure you have knowledge of and access to the following technologies:

#	Technology	Purpose	Documentation Link
1	FastAPI	Backend web framework for building APIs	FastAPI Docs
2	Uvicorn	ASGI server to run the FastAPI application	Uvicorn Docs
3	Python	Core programming language (v3.9+)	Python Docs
4	HTML, CSS, Jinja2	Frontend templating and styling	W3Schools
5	Google Gemini API	AI text generation (Flash & Pro models)	Google AI Docs
6	Hugging Face Diffusers	Stable Diffusion image generation	Diffusers Docs
7	PyTorch	Deep learning framework (backend for Diffusers)	PyTorch Docs
8	FPDF	PDF file generation library	FPDF Docs
9	Git	Version control system	Git Docs
10	pip / virtualenv	Python package and environment management	Virtualenv Guide
🔄 Project Workflow & Milestones
Milestone 1: Model Selection and Architecture
Goal: Research, evaluate, and select the best AI models for comic generation, define the system architecture, and set up the development environment.

Activity 1.1: Research and Select the Appropriate Generative AI Model
Understanding Project Requirements:
The ComicCraft application needs to generate three types of content:

Structured comic outlines (panel-by-panel breakdown with titles and scene descriptions)
Full comic narration and character dialogues (creative, engaging storytelling)
Visual comic-style illustrations (high-quality images for each panel)
Model Evaluation Process:
The team researched and tested multiple AI models:

Model Category	Models Evaluated	Evaluation Criteria
Text Generation	Gemini Flash, Gemini Pro, GPT-3.5	Response quality, creativity, prompt adherence, speed
Image Generation	Stable Diffusion v1.5, SDXL, DALL-E	Image quality, style consistency, resolution, generation speed
Final Model Selection:

Selected Model	Role	Reason for Selection
Gemini 1.5 Flash	Panel outline generation	Fast, structured outputs ideal for creating organized panel breakdowns
Gemini 1.5 Pro	Story narration & dialogues	Superior creative writing quality with rich, detailed storytelling
Stable Diffusion v1.5	Comic illustrations	High-quality image generation with excellent prompt adherence for comic styles
Activity 1.2: Define the Architecture of the Application
The architecture is structured into three primary components as detailed in the Technical Architecture section above:

Frontend → User interaction and display
Backend → Data processing, routing, and workflow orchestration
AI Integration → Content generation via Gemini APIs and Stable Diffusion
Activity 1.3: Set Up the Development Environment
Steps:

Install Python (v3.9+) and pip
Create and activate a virtual environment
Install all required dependencies
Set up the project directory structure
Configure environment variables for API keys
Milestone 2: Core Functionalities Development
Goal: Develop all core AI-powered functions and implement the FastAPI backend for routing and input processing.

Activity 2.1: Develop the Core Functionalities
Function 1: generate_outline() — File: gemini_flash.py

Uses Gemini Flash to generate a structured 5-panel comic outline.
Input: User's story prompt, character name, setting, tone, art style.
Output: A list of dictionaries, each containing panel_number, title, scene_description, and image_prompt.
Why Gemini Flash? Its speed and structured output capability make it ideal for generating organized panel breakdowns quickly.
Function 2: generate_story() — File: gemini_pro.py

Uses Gemini Pro to expand the panel outlines into full comic narration.
Input: The 5-panel outline from generate_outline().
Output: Formatted text containing narration, atmospheric captions, and character dialogues for each panel.
Why Gemini Pro? Its superior creative writing ability produces engaging, detailed storytelling with natural-sounding dialogues.
Function 3: generate_image() — File: image_generator.py

Uses Stable Diffusion (runwayml/stable-diffusion-v1-5) to create comic-style illustrations.
Input: An image prompt generated by the AI for each panel.
Process: Sanitizes the prompt for safe filenames, generates the image using the Diffusers pipeline, and saves it to static/panels/.
Output: The file path to the saved image.
Function 4: build_comic_layout() — File: layout_builder.py

Organizes generated images and story text into a structured layout.
Input: List of panel images and the full comic story text.
Output: A list of dictionaries containing panel_number, image_path, title, scene_description, and narration.
This function acts as the bridge between AI generation and frontend display.
Function 5: save_pdf() — File: exporters.py

Compiles the complete comic into a downloadable PDF.
Input: The structured layout from build_comic_layout().
Process: Uses FPDF to create a multi-page PDF with images and text on consecutive pages. Saves with a timestamped filename to static/exports/.
Output: The file path to the generated PDF.
Activity 2.2: Implement the FastAPI Backend
Input Processing:

HTML Form Input: Captured using FastAPI's Form(...) parameters from index.html.
JSON API Input: Validated using a Pydantic schema (PromptRequest) for programmatic access.
AI Workflow Integration:
Each route handler orchestrates the full pipeline:

text

User Input → generate_outline() → generate_story() → generate_image() × 5 → build_comic_layout() → save_pdf() → Render Template / Return JSON
Milestone 3: routes.py Development
Goal: Set up all major FastAPI routes, handle user inputs, integrate AI workflows, and ensure smooth frontend-backend interaction.

Activity 3.1: Writing the Main Application Logic in routes.py
Core Routes Defined:

Route	Method	Purpose
/	GET	Loads the homepage (index.html) with the input form
/generate	POST	Processes form submission, runs full AI pipeline, renders comic preview
/generate-comic/json	POST	Accepts JSON payload, runs AI pipeline, returns JSON response with layout + PDF path
/export-success	GET	Displays success confirmation after PDF download
/test-image	GET	Developer utility to test image generation with a custom prompt
Input Handling:

/generate uses Form(...) parameters for: story_prompt, character_name, setting, tone, art_style.
/generate-comic/json uses a Pydantic PromptRequest model for JSON body validation.
Error Handling:

All route handlers use try-except blocks with FastAPI's HTTPException for graceful error management (API failures, JSON decode errors, image generation failures).
AI Workflow Integration per Route:

/generate and /generate-comic/json both execute the complete 5-step AI pipeline.
/test-image calls only generate_image() for isolated testing.
AI outputs are dynamically injected into Jinja2 templates or returned as structured JSON.
Milestone 4: Frontend Development
Goal: Build responsive, clean, and interactive web pages using HTML, CSS, and Jinja2 templating for a seamless user experience.

Activity 4.1: Designing and Developing the User Interface
index.html — Homepage / Input Form:

Features a scenic background image to foster a creative atmosphere.
Contains a structured form with fields for: Story Prompt, Character Name, Setting (dropdown), Tone (dropdown), Art Style (dropdown).
Uses semantic HTML elements with proper labels and grouping.
Submits data via POST to /generate.
comic_preview.html — Comic Display Page:

Displays AI-generated comic panels sequentially.
Each panel shows:
Panel Title (e.g., "Panel 2: Into the Deep Woods")
Comic Image (AI-generated illustration)
Scene Description (in italics, setting the atmosphere)
Caption (ambient background description)
Narration (character actions, emotions, dialogues)
Image Prompt Reference (the artistic description used for generation)
Includes a "Download Your Comic as PDF" button.
export_success.html — Confirmation Page:

Displays a success message confirming the PDF download.
Includes a "Go Create Another Comic" button to return to the homepage.
CSS Styling:

Fixed-width centered layout for readability.
Consistent button styling with hover effects.
Input fields with padding, box shadows, and rounded corners.
Light color scheme for an inviting visual aesthetic.
Activity 4.2: Creating Dynamic Templates with FastAPI's Jinja2
Template Rendering Setup:

Python

from fastapi.templating import Jinja2Templates
templates = Jinja2Templates(directory="templates")
Dynamic Data Binding:

index.html: Form name attributes map directly to FastAPI Form(...) parameters.
comic_preview.html: Uses Jinja2 {% for panel in layout %} loops to dynamically render each panel's data.
export_success.html: Receives the PDF path as context via Jinja2 variables.
Route-Template Mapping:

Route	Template Rendered
/	index.html
/generate	comic_preview.html
/export-success	export_success.html
Milestone 5: Deployment
Goal: Deploy the ComicCraft application locally, configure the server environment, and verify the complete workflow runs smoothly.

Activity 5.1: Preparing the Application for Local Deployment
Virtual Environment Setup:

Bash

python -m venv env
# Windows
env\Scripts\activate
# macOS/Linux
source env/bin/activate
pip install -r requirements.txt
Environment Variables Configuration:

env

GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your-huggingface-api-key-here
Sensitive API keys are stored in a .env file and loaded using python-dotenv.

Static Files & Templates:

Ensure static/panels/ and static/exports/ directories exist.
Verify all Jinja2 templates are in the templates/ directory.
Activity 5.2: Testing and Verifying Local Deployment
Start the Server:

Bash

uvicorn app.main:app --reload
Access the Application:

Web Interface: http://127.0.0.1:8000
API Documentation: http://127.0.0.1:8000/docs
Verification Checklist:

✅ Homepage loads correctly with all form fields
✅ Form submission triggers the full AI pipeline
✅ Comic preview displays all 5 panels with images and text
✅ PDF download works and generates a valid file
✅ Export success page appears after download
✅ JSON API endpoint returns correct structured data
✅ Test image route generates a single image successfully
👥 Team Members & Work Distribution
Role	Name	Assigned Responsibilities
🏆 Team Leader	Benadict Raj Kumar	Project architecture design, AI model research & selection (Milestone 1), overall project coordination, deployment & local testing (Milestone 5), environment setup, and final integration verification
👨‍💻 Team Member	Kurusil	Core AI story generation functions — generate_outline() using Gemini Flash and generate_story() using Gemini Pro (Activity 2.1), backend AI workflow integration in route handlers (Activity 2.2), prompt engineering for narrative quality
👨‍💻 Team Member	Nithish	Image generation using Stable Diffusion — generate_image() function (Activity 2.1), layout building — build_comic_layout() function, PDF export functionality — save_pdf() using FPDF, static file management for panels and exports
👨‍💻 Team Member	Raja JJ	FastAPI backend & routes development (Milestone 3) — all route handlers in routes.py, input validation with Form parameters and Pydantic models, error handling with HTTPException, JSON API endpoint implementation, server configuration
👨‍💻 Team Member	Pradip	Frontend development (Milestone 4) — designing and building all HTML/CSS pages (index.html, comic_preview.html, export_success.html), Jinja2 dynamic template integration, responsive UI/UX design, form-to-backend data binding
⚙️ Installation & Setup
Step 1: Clone the Repository
Bash

git clone <repository-url>
cd ComicCraft
Step 2: Create Virtual Environment
Bash

python -m venv comiccraft-env

# Windows
comiccraft-env\Scripts\activate

# macOS/Linux
source comiccraft-env/bin/activate
Step 3: Install Dependencies
Bash

pip install fastapi uvicorn jinja2 python-multipart google-generativeai diffusers transformers fpdf Pillow accelerate
Step 4: Configure API Keys
Create a .env file in the project root:

env

GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your-huggingface-api-key-here
Step 5: Run the Application
Bash

uvicorn app.main:app --reload
Step 6: Access the Application
Web App: http://127.0.0.1:8000
API Docs: http://127.0.0.1:8000/docs
Live Demo: https://3000-i8cscxy3ccqupj5clnbvg.e2b.app
🔌 API Endpoints
Endpoint	Method	Description	Input	Output
/	GET	Homepage with input form	None	HTML page
/generate	POST	Generate comic from form data	Form fields (prompt, character, setting, tone, style)	HTML comic preview
/generate-comic/json	POST	Generate comic via JSON API	JSON body (PromptRequest)	JSON with layout + PDF path
/export-success	GET	Export confirmation page	None	HTML success page
/test-image	GET	Test single image generation	Query param: prompt	Generated image file
📁 Project Structure
text

ComicCraft/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── routes.py               # All route handlers and API endpoints
│   ├── gemini_flash.py         # Gemini Flash - outline generation
│   ├── gemini_pro.py           # Gemini Pro - story narration
│   ├── image_generator.py      # Stable Diffusion - image generation
│   ├── layout_builder.py       # Comic layout assembly
│   └── exporters.py            # PDF export functionality
├── templates/
│   ├── index.html              # Homepage input form
│   ├── comic_preview.html      # Comic display page
│   └── export_success.html     # Download confirmation page
├── static/
│   ├── panels/                 # Generated comic panel images
│   └── exports/                # Exported PDF files
├── .env                        # Environment variables (API keys)
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation
🖼️ Screenshots & Pages
🏠 Home Page
The homepage features a clean layout with a scenic background. Users enter their story prompt, character name, setting, tone, and art style through an intuitive form. The design encourages creativity and makes the comic creation process accessible to all users.

📖 Comic Preview Page
Displays the AI-generated comic panel-by-panel. Each panel includes a title, AI-generated illustration, scene description (in italics), captions, narration text, and the original image prompt reference. The sequential layout creates an immersive storytelling experience.

⬇️ Download Button
A prominent "Download Your Comic as PDF" button compiles all panels, images, and text into a professionally formatted PDF file that downloads directly to the user's device.

✅ Export Success Page
Confirms successful PDF download with a success message and a "Go Create Another Comic" call-to-action button to encourage continued engagement.

🎯 Conclusion
ComicCraft successfully demonstrates the creative potential of AI-driven comic generation. By combining:

Gemini Flash for fast, structured story outlining
Gemini Pro for rich, creative narration and dialogues
Stable Diffusion for high-quality comic-style illustrations
...the application enables users to transform simple text prompts into complete, visually engaging comic narratives.

The project delivers an end-to-end experience:

✅ Personalized story outline generation
✅ Full narration and dialogue creation
✅ High-quality image generation per panel
✅ Automated layout assembly
✅ Exportable PDF download
All within an intuitive web interface that requires no artistic or technical skills.

Future Enhancements
While the current version focuses on single comic generation, the modular architecture supports future additions such as:

🔐 User authentication and profiles
📚 Personal comic libraries
📖 Multi-page story arcs
🎨 Additional art style models
☁️ Cloud deployment and scaling
ComicCraft showcases how AI can democratize storytelling and empower anyone to bring their creative visions to life with minimal effort.

🌐 Try it now: https://3000-i8cscxy3ccqupj5clnbvg.e2b.app

Built with ❤️ by Team ComicCraft
Benadict Raj Kumar | Kurusil | Nithish | Raja JJ | Pradip




ComicCraft - AI Comic Story Creator using Gemini Models Project Description: ComicCraft is a web-based application that uses AI to generate personalized comic book stories and illustrations based on user-provided prompts. Built with FastAPI and integrated with Google’s Gemini AI models along with Stable Diffusion, ComicCraft streamlines the creative process of generating storylines, dialogues, and vivid comic-style imagery automatically. The application takes in user information—such as story prompt, main character name, setting, tone, and art style—and generates a panel-by-panel storyline and corresponding illustrations. Users can view the comic preview directly on the web interface and also download the full comic in PDF format, structured with both images and narration. With a clean, interactive HTML interface and efficient image generation powered by Hugging Face’s Diffusers library, ComicCraft ensures that each story feels cohesive and visually engaging. It offers both API endpoints and an intuitive frontend for ease of use, making comic creation accessible even to non-artists and casual users. Scenarios: Scenario 1 : A user enters a prompt describing their comic story, such as “A brave fox exploring an enchanted forest.” The system uses this input to generate a complete comic strip, including multiple panels with accompanying images and text. The user also specifies preferences like the main character’s name, the setting (e.g., forest), tone (e.g., dramatic), and art style (e.g., anime). The system combines Gemini 1.5 Pro for story generation and Stable Diffusion for image creation to produce a visually immersive, personalized comic strip. This personalized approach enhances user satisfaction by generating a cohesive comic story that fits the user’s creative vision. Scenario 2: A user wants a light-hearted, cartoonish feel for their comic. On the input form, they select “funny” as the tone and “comic book” as the art style (instead of the default or their previous choices). When they submit, the system regenerates the entire pipeline—outline, story, and images—this time with prompts and model instructions tailored to produce a more humorous narrative and a classic comic-book look. This lets users iterate on and customize the mood and visual style of their comic until it matches their creative vision. Scenario 3: After reviewing the on-screen preview of their comic, the user decides to download it. The system then: 1. Layout Binding: Uses layout_builder.py to assemble each panel’s title, image, and text into a structured layout. 2. PDF Generation: Calls exporters.py to compile the comic into a PDF file using FPDF , placing images and narrative text onto consecutive pages and saving the PDF with a timestamped filename. 3. Export Success: The user is redirected to an export success page, confirming the successful download. This feature ensures users can save, print, or share their comic in a professional PDF format.Technical Architecture: Pre - requisites: 1. FastAPI Framework Knowledge: FastAPI Documentation 2. Uvicorn ASGI Server: Uvicorn Docs 3. Python Programming Proficiency: Python Official Docs 4. HTML, CSS, and Jinja2 Template Skills: W3Schools HTML/CSS/Jinja2 Tutorials 5. Google Gemini API Familiarity: Google Generative AI Documentation 6. Hugging Face Diffusers & Stable Diffusion: Hugging Face Diffusers Documentation 7. PyTorch Basics: PyTorch Documentation 8. PDF Generation with FPDF: FPDF Documentation 9. Version Control with Git: Git Documentation 10. Python Package & Environment Setup (pip, virtualenv, or conda): Virtualenv Guide Project Workflow: Milestone 1. Model selection and Architecture Activity 1.1. Research and Select the Appropriate Generative AI Model Activity 1.2. Define the architecture of the application Activity 1.3. Set up the development Environment Milestone 2. Core functionalities Development Activity 2.1. Develop the core functionalities Activity 2.2. Implement the FastAPI Backend to Manage Routing and User Input Processing Milestone 3. route.py Development Activity 3.1. Writing the Main Application Logic in routes.py Milestone 4. Frontend Development Activity 4.1. Designing and Developing User Interface Activity 4.2. Creating Dynamic Templates with FastAPI’s Jinja2 Milestone 5. Deployment ComicCraft - AI Comic Story Creator using Gemini Models.docxActivity 5.1. Preparing the Application for Local Deployment Activity 5.2. Testing and Verifying Local Deployment ComicCraft - AI Comic Story Creator using Gemini Models.docx Milestone 1. Model selection and Architecture In this milestone, we focus on selecting appropriate generative AI models for the ComicCraft application. This involves researching the capabilities and performance of multiple AI models to ensure that the chosen models align well with the application's objectives of generating comic storylines, character dialogues, scene descriptions, and comic-style illustrations. Activity 1.1: Research and Select the Appropriate Generative AI Model Understand the Project Requirements Review the specific needs of the ComicCraft application, focusing on the types of content it must generate: ● Structured comic outlines (panel-by-panel) ● Full comic narration and character dialogues ● Visual comic-style illustrations for each panel The system must deliver creative, engaging, and visually rich comic outputs for users based on their custom story prompts. Model Evaluation Research documentation and capabilities of: ● Google's Gemini Models : Gemini Flash (optimized for fast structured outputs) and Gemini Pro (optimized for detailed, creative text generation). ● Hugging Face Diffusers : Stable Diffusion model (for high-quality AI-generated images based on prompts). Compare the selected models based on: ● Response quality for creative writing tasks (narration and dialogues) ● Prompt adherence and richness of detail for scene descriptions ● Speed and resolution of image generation ● Model stability, available documentation, and community support Practical testing was conducted using different prompts to assess each model's storytelling abilities and image generation performance.Final Model Selection ComicCraft - AI Comic Story Creator using Gemini Models.docx Choose the AI models that best match ComicCraft’s project needs: ● Gemini Flash (models/gemini-1.5-flash) : Selected for fast and structured generation of comic panel outlines based on story prompts. ● Gemini Pro (models/gemini-1.5-pro) : Selected for detailed, creative comic narration and engaging character dialogues. ● Stable Diffusion (runwayml/stable-diffusion-v1-5) : Selected for generating high-quality comic-style illustrations from image prompts. This combination ensures that ComicCraft can deliver rich, creative storytelling alongside vivid, visually appealing comic panels in an automated, efficient manner. Activity 1.2.Define the architecture of the application Architecture Overview: The architecture of ComicCraft is structured into three primary components: ● Frontend (HTML, CSS, Jinja2) ● Backend (FastAPI application) ● AI Integration (Google Gemini APIs and Hugging Face Diffusers) The frontend captures user inputs and displays generated comics, the backend handles data processing and routing, and the AI services generate story content and illustrations. Below is a high-level description of each component’s role in the system. Frontend Responsibilities: ● Users interact with a simple and user-friendly web interface developed using HTML, CSS, and Jinja2 templates . ● Key user input fields include: ○ Story Prompt : Main idea for the comic ○ Character Name : Hero of the comic ○ Setting : Location (e.g., forest, school, city) ○ Story Tone : Mood of the story (e.g., dramatic, funny) ○ Art Style : Visual style preference (e.g., anime, realistic) ● Upon form submission, data is sent to the FastAPI backend via a POST request for processing. Templates Used: ● index.html: For user input collection ● comic_preview.html: To display the generated comic ● export_success.html: To show a success message after comic export The frontend ensures a seamless flow from input collection to comic generation display. Backend Responsibilities: ● FastAPI is used to manage server-side operations and route handling. ● Key backend tasks:○ Receive form data from the frontend or JSON API calls. ○ Call AI models to generate panel outlines, story narration, and illustrations. ComicCraft - AI Comic Story Creator using Gemini Models.docx ○ Organize and build the complete comic layout. ○ Export the comic to a downloadable PDF format. ● Routes are defined in routes.py to handle: ○ Form-based and JSON-based comic generation ○ Image testing ○ Comic export confirmation The backend ensures proper coordination between user inputs, AI generation workflows, and template rendering. AI Integration Points: ● Gemini Flash is called to generate the structured 5-panel comic outline based on the user’s story prompt. ● Gemini Pro is called next to create detailed narration and character dialogue from the outline. panel. ● Stable Diffusion is used to generate comic-style illustrations based on the AI-generated image prompts for each ● The backend receives AI responses, formats the text and images appropriately, and passes them to the frontend templates for preview and export. All AI model interactions happen dynamically during comic generation, ensuring that every comic is fully unique and customized based on user input. Activity 1.3 Set up the development Environment: Install Python & Pip :Ensure that Python is installed on your system along with pip , which will be used to manage the necessary project dependencies. Create Virtual Environment :This ensures that project-specific packages do not conflict with system-wide installations. python -m venv comiccraft-env comiccraft-env\Scripts\activate # For Windows Install Required Libraries : pip install fastapi uvicorn jinja2 python-multipart google-generativeai diffusers transformers fpdf Pillow accelerate Run Server : uvicorn app.main:app --reload Visit http://127.0.0.1:8000 for the app and /docs for API testing. Set Up Project Structure : Create the initial project directory structure for ComicCraft:ComicCraft - AI Comic Story Creator using Gemini Models.docx Milestone 2. Core functionalities Development Activity 2.1 Develop the core functionalities: Generate Structured Comic Panel Outline Function: generate_outline() File: gemini_flash.py story prompt. ● This function uses the Gemini Flash AI model to generate a structured 5-panel comic outline based on the user's ● Each panel contains a panel number, title, scene description, and an image generation prompt. ● The output is a list of dictionaries, one for each comic panel.ComicCraft - AI Comic Story Creator using Gemini Models.docx Generate Comic Story Narration and Dialogue Function: generate_story() File: gemini_pro.py ● This function uses the Gemini Pro AI model to expand the panel outlines into a full comic-style story. ● It creates engaging narration and character dialogues for each panel. ● The output is a single formatted text containing all the panels' stories.ComicCraft - AI Comic Story Creator using Gemini Models.docx Generate Comic Illustrations from Prompts Function: generate_image() File: image_generator.py ● This function uses the Stable Diffusion model to create a comic-style image based on the provided image prompt. ● It sanitizes the prompt for safe filenames and saves the generated image to the static/panels directory. ● Returns the file path to the saved image. Organize Comic Panels into Layout Structure Functions: build_comic_layout() File: layout_builder.py● This function organizes the generated images and full comic story into a structured layout. ComicCraft - AI Comic Story Creator using Gemini Models.docx ● It matches each image with its corresponding panel story. ● The output is a list of dictionaries containing the panel number, image path, and text. Export Comic Panel and Story into PDF Function: save_pdf() File: exporters.py ● This function compiles the full comic into a multi-page PDF file using the FPDF library. ● Each panel’s image and narration are placed neatly on separate pages. ● The final PDF file is saved into the static/exports folder, and the path is returned.ComicCraft - AI Comic Story Creator using Gemini Models.docx Activity 2.2: Implement the FastAPI Backend to Manage Routing and User Input Processing Define Routes in FastAPI All routing logic is handled in routes.py . Each route is linked to the corresponding backend function that processes the comic generation workflow developed in Activity 2.1. Process User Input ● HTML Form : Created in index.html ● Users enter : story prompt, main character name, setting, tone, and art style ● FastAPI captures inputs using Form( .) parameters from the request ● Pydantic schema (PromptRequest) is used to validate JSON input for API-based comic generationComicCraft - AI Comic Story Creator using Gemini Models.docx Integrate Gemini API Calls Each route handler connects directly to the respective AI-powered function modules: ● /generate → ○ Calls generate_outline() to create panel outlines from user prompt ○ Calls generate_story() to expand into narration and dialogue ○ Calls generate_image() for each panel to create comic-style images ○ Calls build_comic_layout() to organize the final layout ○ Calls save_pdf() to compile and export the complete comic into a PDF ● /generate-comic/json → ○ Similar flow as /generate, but triggered via a raw JSON API request ○ Returns JSON response with layout data and PDF path for API clients ● /test-image → ○ Calls generate_image() directly with a custom prompt to test image generation functionality separately All AI-generated responses (text and images) are processed, cleaned, and injected into the Jinja2 frontend templates (comic_preview.html, export_success.html) for a seamless user experience. Milestone 3. routes.py Development In this milestone, the primary focus was on setting up all major FastAPI routes for the app, handling user inputs efficiently, integrating AI generation workflows, and ensuring smooth interaction between backend processing and frontend templates. This step-by-step approach created a stable foundation for processing prompts, generating comics, and providing a seamless user experience. Activity 3.1: Writing the Main Application Logic in routes.py Defining Core routes in routes.py: Separate routes were established for each of ComicCraft’s core functionalities: ● / → Loads the homepage (index.html) where users can submit their story details. ● /generate → Handles form submission , processes the input using AI, generates the comic panels, and returns the comic preview page. ● /generate-comic/json → An API route that accepts JSON payloads , triggers comic generation, and returns comic layout data and the generated PDF path. ● /export-success → Displays a success confirmation page after the comic is downloaded. ● /test-image → A developer utility route to test image generation from a direct prompt without full comic creation. Each route serves as a distinct entry point for different types of user interaction — through browser forms or direct API requests. Set up Route Handlers for Each Feature Each route handler captures and processes user inputs using FastAPI’s form and request body mechanisms: ● For /generate, user inputs are captured using Form( .) parameters for: ○ Story prompt ○ Character name ○ Setting ○ Story tone ○ Art style ● For /generate-comic/json, inputs are captured from a JSON body using a PromptRequest model with Pydantic.ComicCraft - AI Comic Story Creator using Gemini Models.docx Form data and JSON payloads are correctly extracted and passed into backend functions (generate_outline, generate_story, generate_image, build_comic_layout, save_pdf) ensuring smooth AI processing based on user details. The route handlers manage error handling via FastAPI’s HTTPException system and use try-except blocks to gracefully handle unexpected failures like API errors or JSON decode errors. Integrate AI workflows in each Route Within each relevant route, the core AI functionalities were integrated: In /generate and /generate-comic/json: ○ generate_outline() is called to create a 5-panel structured story. ○ generate_story() is called to write narration and dialogues. ○ generate_image() is called iteratively to generate images for each panel. ○ build_comic_layout() structures the final panel layout. ○ save_pdf() compiles the story and illustrations into an exportable PDF. Each AI-generated output is processed and dynamically passed to HTML templates (comic_preview.html) or returned as a JSON response for API clients. This ensures that users receive a complete, coherent comic experience, while developers and testers can interact with the backend directly through structured API responses. Comic Generation Route: Export Success Route:ComicCraft - AI Comic Story Creator using Gemini Models.docx Image generation Route: Milestone 4. Frontend Development This part involved building responsive and clean web pages using HTML, CSS, and Jinja2 templating . Each template is dynamically rendered through FastAPI , ensuring that users can easily submit inputs, view generated comics panel-by-panel, and confirm comic export actions. This milestone guarantees an engaging and seamless comic creation experience for all users. Activity 4.1 Designing and Developing the User Interface Set Up the Base HTML Structure Developed index.html as the main entry point for user input. Structured the form to capture: ● Story Prompt ● Main Character Name ● Setting ● Story Tone ● Art Style Each field is properly labeled and grouped using semantic HTML elements. The design uses a scenic background image , simple typography, and organized form layout to encourage creativity and focus on storytelling. Navigation is minimal to maintain focus, with a direct flow from input to comic generation. Design a Responsive Layout Using CSS Embedded CSS styles were applied directly within each HTML file. Layouts use fixed width with centered content to ensure readability across different screen sizes. Consistent button styling with hover effects was implemented. Input fields and result panels are designed with padding, box shadows, and rounded corners for a clean, modern comicgeneration experience. The light color scheme enhances visibility and promotes an inviting visual aesthetic. Create Separate Pages for Each Core Functionality Three Jinja2-powered HTML templates were created under the /templates folder: ● index.html : A user-friendly form where users input the story prompt, character name, setting, tone, and preferred art style. Submits data to the /generate FastAPI route via POST. ● comic_preview.html : Displays the AI-generated comic panel-by-panel.Each panel includes: ○ Title ComicCraft - AI Comic Story Creator using Gemini Models.docx ○ Scene illustration (image) ○ Scene description (in italics) ○ Captions and narration text This allows users to review the full comic storyline sequentially. ● export_success.html : Displays a success message after the user downloads their comic as a PDF. Encourages users to return and create a new comic. Templates are modular, cleanly separated by functionality, and UI transitions smoothly between comic creation and comic review. Activity 4.2 Creating Dynamic Templates with FastAPI’s Jinja2 Integrate Jinja2 Templating for Dynamic Content Rendering ● Used FastAPI’s Jinja2Templates for template rendering: from fastapi.templating import Jinja2Templates templates = Jinja2Templates(directory="templates") interaction: Each FastAPI route uses TemplateResponse to dynamically render HTML templates ● / route renders index.html ● /generate route renders comic_preview.html ● /export-success route renders export_success.html based on the user’s This dynamic binding ensures that the comic content (layout, images, text) updates automatically after user input. Bind Backend Data to HTML Templates ➤ ➤ ➤ index.html ● Form elements use name=" ." attributes that directly map to backend Form( .) parameters in FastAPI. ● Submits form data via POST to /generate. comic_preview.html ● Dynamically displays: ○ Panel number, title ○ Image generated for the panel ○ Scene description (in italics) ○ Captions and narration text ● Loops through the layout list using Jinja2 {% for panel in layout %} syntax. export_success.html ● Displays a confirmation message using Jinja2 variables. ● Receives the exported PDF path as context and optionally provides a button for returning to the homepage. The frontend of ComicCraft is fully integrated with FastAPI, dynamically renders AI-generated comics, and provides a smooth user flow from prompt input to comic export.ComicCraft - AI Comic Story Creator using Gemini Models.docx Milestone 5. Deployment Now, the focus is on deploying the ComicCraft application on a local system using FastAPI. This involves configuring the server environment, installing all required dependencies, setting up static files and templates, and launching the app locally to simulate a real-world environment. This milestone verifies that the complete comic generation workflow — including AI text generation, image creation, layout building, and PDF export — runs smoothly before planning deployment to a cloud platform in the future. Activity 5.1: Preparing the Application for Local Deployment Set up a virtual environment Begin by creating a virtual environment to manage dependencies and ensure the deployment is isolated from other Python projects. Activate the environment and install all required libraries listed in the requirements.txt file, including FastAPI, Uvicorn, Google Generative AI, Hugging Face Diffusers, FPDF, and others. python -m venv env # For Windows env\Scripts\activate # For macOS/Linux source env/bin/activate pip install -r requirements.txt Configure environment variables ● Use environment variables to store sensitive data such as the Gemini API Key and Hugging Face API token ● These variables can be set directly in the terminal or added to a .env file which is loaded into the application using python-dotenv. GEMINI_API_KEY=your_gemini_api_key_here HF_API_KEY=your-huggingface-api-key-here Frontend-Backend Rendering via Jinja2 All user interactions are facilitated via Jinja2-rendered templates: ● index.html: Collects user inputs ● result.html: Displays the generated AI plan● all_users.html: Lists all user records for admin view ComicCraft - AI Comic Story Creator using Gemini Models.docx Activity 5.2: Testing and Verifying Local Deployment Start the FASTAPI Server Navigate to the project root where your app/main.py file is located. Use Uvicorn to launch the FastAPI development server with hot reload enabled: uvicorn app.main:app --reload Access the Application Locally Once the server is running, open any web browser and navigate to: http://127.0.0.1:8000 This URL loads the ComicCraft homepage, where users can input their story prompt, character name, setting, tone, and art style to generate a personalized AI-powered comic. Additionally, the interactive API documentation provided by FastAPI can be accessed at: http://127.0.0.1:8000/docs This documentation allows developers to test available API endpoints, such as /generate-comic/json, /generate, /exportsuccess, and /test-image. Exploring Website’s web pages: Home page: Description: The homepage of ComicCraft is designed as an intuitive starting point for users to create AI-generated comic stories. It features a clean layout with a scenic background that fosters a creative atmosphere. At the center, a structured form collects user inputs necessary for comic generation. Users can: ● Enter a Story Prompt describing their comic idea, ● Specify a Main Character Name, ● Choose a Setting (school, forest, space, city), ● Select a Story Tone (light-hearted, dramatic, poetic, funny), ● Pick an Art Style (anime, pixel art, comic book, realistic).ComicCraft - AI Comic Story Creator using Gemini Models.docx Once the form is submitted, the system uses AI models to automatically generate a complete comic, including storyline outlines, detailed dialogues, illustrations, and an exportable PDF. The homepage is designed to be simple, user-friendly, and visually appealing, encouraging creativity and making the comic creation process accessible to all users without requiring technical expertise. Comic Preview- Result page: Description: The Comic Preview Page in ComicCraft presents the AI-generated comic panels sequentially after the user submits their input through the homepage form. This page provides a complete view of the comic's storyline, combining visual and textual elements for each panel. Each panel displayed on the page includes: ● Panel Title: Clearly labeled with the panel number and a descriptive title (e.g., "Panel 2: Into the Deep Woods"). ● Comic Image: An AI-generated illustration created based on the scene's image prompt. ● Scene Description: A short descriptive paragraph, displayed in italics, that sets the atmosphere and context for the panel. ● Caption and Narration: ○ Caption providing a brief, ambient description of the environment or background sounds.○ Narration detailing the main character's actions, emotions, or dialogue within the scene. ComicCraft - AI Comic Story Creator using Gemini Models.docx ● Image Prompt Reference: The original artistic description used to generate the illustration, displayed for reference. The design of the Comic Preview Page ensures that each panel is clearly separated and visually appealing, making it easy for users to follow the story’s flow panel-by-panel. The combination of imagery, scene-setting description, and narrative text helps create an immersive storytelling experience directly from the AI-generated content. At this stage, the page focuses purely on comic viewing and story review, allowing users to experience the full creative output before proceeding to any final actions like exporting. Download Button: Description: On the Comic Preview Page, a "Download Your Comic as PDF" button is displayed. When users click this button, the entire comic — including images, panel titles, scene descriptions, captions, and narration — is compiled into a professionally formatted PDF file and downloaded directly to the user's device. This ensures users can save, share, and view their comic offline. Comic Export Success Page: Description: After the download is triggered, users are automatically redirected to the Comic Export Success Page. This page provides a confirmation message indicating that their AI-powered comic has been successfully created and downloaded. The success page also includes a call-to-action button, "Go Create Another Comic", which encourages users to return to the homepage and start a new comic creation process. The export and success flow are designed to provide closure and satisfaction after the creative process, ensuring users have a tangible output from their story idea while promoting continued engagement with the platform. Conclusion: ComicCraft successfully demonstrates the creative potential of AI-driven comic generation. By combining the capabilities of Large Language Models (Gemini Flash and Gemini Pro) for storytelling and Stable Diffusion for comic-style illustration, the application enables users to transform simple prompts into complete, visually engaging comic narratives. The project provides an end-to-end experience — from personalized story outline generation, full narration, high-quality image creation, to exporting the final comic as a downloadable PDF — all within an intuitive web interface. ComicCraft simplifies comic creation for non-artists, storytellers, and hobbyists, offering a seamless blend of imagination and AI assistance.ComicCraft - AI Comic Story Creator using Gemini Models.docx While the current version focuses on single comic generation without user account management, the strong modular architecture allows easy future enhancements like user profiles, comic libraries, or multi-page story arcs. Overall, ComicCraft showcases how AI can democratize storytelling and empower users to bring their creative visions to life with minimal effort.

Add The given Website link to my readme file and Add Team Nmaes and assign each work to each member.
Team Leader: Benadict Raj Kumar
Team Members: Kurusil, Nithish, Raja JJ, Pradip

https://3000-i8cscxy3ccqupj5clnbvg.e2b.app

and also explain every given topic properly.


