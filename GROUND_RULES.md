# CLAUDE.md - Data Analysis Project Configuration

> **Audience:** AI coding agents
> **Hardware:** MacBook M3 Max Pro (Apple Silicon)  
> **Project Type:** Python Data Analysis & Data Science

## 🎯 CRITICAL LANGUAGE RULES

**MANDATORY**: 
- **Think & Code:** ALWAYS use English for all internal reasoning, coding, debugging, and technical work
- **Output to Human:** ALWAYS provide summaries, conclusions, and explanations in Chinese (中文) in CLI responses and report files
- **Documentation:** Code comments in English, README summaries and analysis conclusions in Chinese. For each analysis summarize in a documents with date and verions in the naming standard and maintain and update a documents list in the README file. It is easy for you and I track the hostory

## 🛠️ Environment Requirements

### Runtime Baseline
- OS: macOS (Apple Silicon M3 Max Pro, arm64)
- Python: 3.10-3.12 (default 3.12)
- Package Manager: pip3

### Mandatory Setup (ALWAYS execute first)
```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
```

### Apple Silicon Specific
```bash
# Install if needed
xcode-select --install
brew install git git-lfs graphviz pkg-config

# ML Acceleration
# PyTorch MPS: torch.backends.mps.is_available()
# TensorFlow: tensorflow-metal
```

## 🔐 Security & Environment

- Never hardcode credentials
- Use `.env` file with `python-dotenv`
- Access via `os.getenv()`
- Sanitize sensitive data before logging

## 🎛️ Behavior Rules

### For Claude Code
1. **Environment First**: Verify venv activation before ANY operation
2. **Language Protocol**: Think/code in English, output summaries in Chinese
3. **Reproducibility**: Set random seeds, pin dependencies
4. **Apple Silicon**: Use MPS/Metal when available
5. **Data Safety**: No sensitive data in logs or outputs
6. **Error Handling**: Log errors in English, explain to user in Chinese

### Expected Outputs
- Type-hinted Python code with English docstrings
- Test coverage >80%
- Chinese summaries in CLI responses
- Chinese conclusions in analysis reports
- Bilingual documentation (technical: English, executive: Chinese)

## 🚀 Common Workflows

### Initial Setup
1. Create and activate venv
2. Install all dependencies
3. Set up `.env` from `.env.example`
4. Initialize git with proper `.gitignore`

### Data Analysis Flow
1. Load and validate data
2. Run exploratory analysis
3. Generate visualizations
4. Build models if needed
5. Create report with Chinese executive summary

### Troubleshooting
- **NumPy/SciPy on M3**: Use `--no-binary :all:` flag
- **Jupyter Kernel**: `python3 -m ipykernel install --user --name=venv`
- **Memory Issues**: Auto-switch to chunking or Polars

---

## 🔄 Git Workflow Rules

### 远程推送策略 (Push Policy)
- ✅ **只做本地提交**: 默认只执行 `git add` + `git commit`
- ❌ **不自动推送**: 未经用户明确指示，禁止执行 `git push`
- **原因**: 每次 `git push` 会触发 AWS Amplify 自动部署，产生构建费用和不必要的部署

### 操作流程
```bash
# 正常操作 (默认)
git add .
git commit -m "message"

# 仅在用户指示时
git push origin main
```

---
*Claude Code will strictly follow these rules throughout the session.*