# 1. Proses Desain & Prompt Engineering

## 1.1. Reality Filter
Sometimes I started the conversation with this prompt. I found it on social media as a trick to reduce hallucination.

```
REALITY FILTER
•Never present generated, inferred, speculated, or deduced content as fact.
•If you cannot verify something directly, say:
•“I cannot verify this.”
•“I do not have access to that information.”
•“My knowledge base does not contain that.”
•Label unverified content at the start of a sentence:
•[Inference] [Speculation] [Unverified]
•Ask for clarification if information is missing. Do not guess or fill gaps.
•If any part is unverified, label the entire response.
•Do not paraphrase or reinterpret my input unless I request it.
•If you use these words, label the claim unless sourced:
•Prevent, Guarantee, Will never, Fixes, Eliminates, Ensures that
•For LLM behavior claims (including yourself), include:
•[Inference] or [Unverified], with a note that it’s based on observed patterns
•If you break this directive, say:
•“❌ Correction: I previously made an unverified claim. That was incorrect and should have been labeled.”
•Never override or alter my input unless asked.
```

#### Analisis singkat
The AI now lets me know if it's unsure about something instead of acting like it knows everything and ends up making things up. I think it's kinda useful.

<br><br>


## 1.2. Ideation

Saya menggunakan struktur prompt Role + Task + Context untuk memminta ide dari AI. Berikut prompt yang saya gunakan dan hasilnya.

<img width="807" height="365" alt="image" src="https://github.com/user-attachments/assets/b7cbf250-5a22-43fc-aec9-015b530c8d61" />

<img width="1400" height="547" alt="image" src="https://github.com/user-attachments/assets/949147fc-66d2-4e3f-bd06-1ac3e4a893e9" />

<img width="1408" height="582" alt="image" src="https://github.com/user-attachments/assets/b239cd37-f1e0-4724-a290-d01e80d9acba" />


#### Analisis singkat
Saya mendapat insight terkait apa-apa saya yang bisa saya tambahkan ke aplikasi yang mau dibangun.

<br><br>


## 1.3. Project Initialization

Saya menggunakan prompt dengan CRISPE (Capacity, Role, Insight, Personality, Experiment) Framework untuk menginisiasi project.

```
You are an expert full-stack developer and product designer. I want you to help me build a web-based decision support tool with the following requirements.

Project Overview:
- The app helps users make better choices using 9 different decision-making frameworks (Eisenhower Matrix, Pros & Cons, Decision Matrix, SWOT Analysis, Cost-Benefit, Decision Tree, Random Decision, Weighted Random).
- The app supports multiple languages/locales (at least English and Indonesian) with dynamic routing and language switching.
- The UI must be modern, use casual tone for the app wordings, and mobile-responsive.
- All state should persist in the browser, and users can export/share their data.
- The app integrates with OpenAI GPT-4o for intelligent decision analysis and suggestions.

Development Guidelines:
- Use Next.js (App Router), TypeScript, Tailwind CSS, and best practices for modern web apps.
- Organize code into clear folders: components/, hooks/, lib/, i18n/, messages/, app/[locale]/, etc.Write unit tests for all utilities, hooks, components, API endpoints, and decision tool pages.
- Ensure accessibility (ARIA, keyboard navigation), responsiveness, and performance (code splitting, bundle optimization).
- Set up CI/CD with GitHub Actions, linting, type checking, SonarCloud, and automated deployment.
- Document all features and provide clear implementation steps.

Start by scaffolding the project structure, then proceed phase by phase as described. For each phase, provide clear implementation steps, code samples, and best practices.

If you find any great tools that could add value to this app, just add it.
```

#### Analisis singkat

AI menghasilkan sebuah repository MVP beserta implementation plan-nya. 
- Hasil inisialisasi ini sangat membantu karena saya bisa langsung skip pembuatan boilerplate (routing, struktur folder, template function, component, dll).  
- Terdapat beberapa error ketika saya testing manual. Dengan beberapa iterasi permintaan fixing, eror-eror tersebut bisa diselesaikan. Ada juga sebagian yang lebih cepat saya fixing sendiri dan ada bagian yang saya harus menjelaskan dengan sangat detail letak kesalahannya, terutama di bagian proses kalkulasi hasil decision yang logic-nya kompleks

<br><br>

## 1.4. Debug dan Refactor 

Previously in my code, each of decision tool has these functions.

```
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<DecisionMatrixData>(() => {...

  const generateFromContext = async (context: string) => {...

  const handleShowResult = (value: boolean) =>...

  const resetData = () => {...

  const showSampleData = (t: ReturnType<typeof useTranslations>) => {...
```

I asked AI to refactor these repetitive functions because I want to centralize these logic. So that in the future, changes could be done without having to edit each tool page. It becomes like this.

```
  const {
    data,
    setData,
    generating,
    generateFromContext,
    loading,
    handleShowResult,
    resetData,
    updateLocalStorage,
    showSampleData
  } = useDecisionTool<DecisionMatrixData>(tool);
```
<img width="925" height="295" alt="image" src="https://github.com/user-attachments/assets/102f64c8-7ad7-457f-a48b-38c75ceb7b9e" />



### Improve reusable component
<img width="1436" height="674" alt="image" src="https://github.com/user-attachments/assets/c963addc-0f6b-4a86-b117-d653da89ca36" />
<img width="1433" height="683" alt="image" src="https://github.com/user-attachments/assets/1a667826-bcf2-42fc-ac97-689cee995a91" />
<img width="1417" height="299" alt="image" src="https://github.com/user-attachments/assets/e48c6055-760d-414e-891a-172b7b505a8f" />

#### Analisis singkat 
The result is very helpful and comprehensive. It even provides which parts have been enhanced and how to use the component. 
However, I need to do a little manual tweak for an existing component that it uses since I didn't provide the component as context. It doesn't matter anyway. I could just tell it to make some changes there too.


<br><br>

# 2. Testing

Saya meng-generate script testing dengan AI Agent. Testing juga running otomatis di GitHub Actions untuk setiap push dan pull request. Untuk report coverage, ada integrasi dengan codecov dan badgenya ditambah ke readme.

Tool yang digunakan untuk unit testing adalah Vitest. Each function and hook is tested in isolation, including edge cases and error handling.
Untuk component testing, tools yang digunakan adalah Vitest + React Testing Library. Components are rendered in test environments, and their output, accessibility, and user interactions are asserted. Dialogs, overlays, and forms are tested for correct rendering and ARIA compliance.


<img width="1470" height="818" alt="image" src="https://github.com/user-attachments/assets/ae214afd-7750-4806-9df3-c188cadea475" />


<br><br>

# 3. Dokumentasi

Saya meminta AI untuk membuat implementation_plan.md berisi checklist task yang harus dikerjakan sekaligus tracking progress yang mudah diberikan ke AI agent.

```
Project Overview:
- The app helps users make better choices using 9 different decision-making frameworks (Eisenhower Matrix, Pros & Cons, Decision Matrix, SWOT Analysis, Cost-Benefit, Decision Tree, Random Decision, Weighted Random).
- The app supports multiple languages/locales (at least English and Indonesian) with dynamic routing and language switching.
- The UI must be modern, use casual tone for the app wordings, and mobile-responsive.
- All state should persist in the browser, and users can export/share their data.
- The app integrates with OpenAI GPT-4o for intelligent decision analysis and suggestions.
- Each tool's data is saved in local storage
- There's a share url button that carry page url with encoded tool data. On open, it could be displayed in tool page

Development Guidelines:
- Use Next.js (App Router), TypeScript, Tailwind CSS, and best practices for modern web apps.
- Organize code into clear folders: components/, hooks/, lib/, i18n/, messages/, app/[locale]/, etc.Write unit tests for all utilities, hooks, components, API endpoints, and decision tool pages.
- Ensure accessibility (ARIA, keyboard navigation), responsiveness, and performance (code splitting, bundle optimization).
- Set up CI/CD with GitHub Actions, linting, type checking, SonarCloud, and automated deployment.
- Document all features and provide clear implementation steps.

Based on above description, create a docs/implementation_task.md that consist of compherensive checklist of task need to be done, thoroughly from development to high quality deployment. Group it into phase of development.
```

Outputnya adalah seperti berikut. Check list ini membantu saya untuk memberi perintah yang compact kepada AI Agent.

<img width="1234" height="640" alt="image" src="https://github.com/user-attachments/assets/57abd0a7-d8ef-4aac-a24d-a2057b49041f" />

<br><br>


# 4. Pipeline CI


Pipeline CI/CD ini menggunakan GitHub Actions untuk mengotomatisasi proses development, testing, dan quality assurance. Pipeline berjalan pada setiap push ke branch main dan setiap pull request.

*Pipeline Structure*
#### 1. Lint Job
Tujuan: Memastikan konsistensi kode dan mengikuti standar coding

Menggunakan ESLint untuk JavaScript/TypeScript
Memeriksa format kode dan potensi error
Gagal jika ada pelanggaran aturan linting

#### 2. Build Job
Tujuan: Memvalidasi bahwa aplikasi dapat dibuild dengan sukses
- Menggunakan Next.js build process
- Mengoptimasi bundle untuk production
- Memastikan tidak ada error kompilasi

#### 3. Test Job
Tujuan: Menjalankan unit dan integration tests

- Menggunakan Vitest sebagai test runner
- Generate coverage report dengan format LCOV
- continue-on-error: true memungkinkan pipeline lanjut meski ada test yang gagal
- Berguna untuk development stage dimana beberapa test mungkin masih dalam perbaikan

#### 4. SonarCloud Job
Tujuan: Code quality analysis dan security scanning


<br> <br>

# 5. Deployment

Project di-deploy ke Vercel dengan limitasi free plan. 
[https://decision-tool-kappa.vercel.app/id
](https://decision-tool-kappa.vercel.app/id)

<img width="1246" height="578" alt="image" src="https://github.com/user-attachments/assets/97059cb8-0bf4-44c1-9e7d-98d499a9afb0" />





