import json
import os
import re
import subprocess
import sys
import time
from google import genai
from google.genai import types
from google.genai import errors

# Initialize Gemini Client (reads GEMINI_API_KEY from environment)
client = genai.Client()

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(PROJECT_ROOT, "docs")
TASKS_FILE = os.path.join(DOCS_DIR, "tasks.json")
SPEC_FILE = os.path.join(DOCS_DIR, "spec.md")

CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash"
]

CODER_SYSTEM_PROMPT = """
You are an expert Senior Software Engineer acting as a Coder Agent in an automated software factory.
Your goal is to write production-grade, clean, modern code strictly adhering to provided specifications.

CRITICAL OUTPUT FORMATTING INSTRUCTIONS:
For EVERY file you create or update, you MUST wrap the complete file content inside explicit FILE tags like this:

=== FILE: package.json ===
{
  "name": "md2pdf"
}
=== END FILE ===

Do NOT use Markdown code blocks (```) for file boundaries. Use ONLY the === FILE: path === and === END FILE === tags.
Do not include conversational preamble, introductory text, or explanations outside these file blocks.
"""

# --- GIT AUTOMATION HELPERS ---

def run_git(args, check=True):
    """Executes git commands safely inside the project root."""
    result = subprocess.run(
        ["git"] + args,
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True
    )
    if check and result.returncode != 0:
        raise RuntimeError(f"Git command failed ('git {' '.join(args)}'): {result.stderr.strip()}")
    return result.stdout.strip()

def ensure_git_environment():
    """Ensures git repository exists and starts from a clean main branch."""
    if not os.path.exists(os.path.join(PROJECT_ROOT, ".git")):
        print("⚠️ Git repository not initialized. Running 'git init'...")
        run_git(["init"])
        run_git(["branch", "-M", "main"])
    
    # Switch to main branch
    current_branch = run_git(["rev-parse", "--abbrev-ref", "HEAD"], check=False)
    if current_branch != "main":
        run_git(["checkout", "main"], check=False)

def create_task_branch(task_id):
    """Creates and checks out an isolated feature branch for the task."""
    branch_name = f"factory/{task_id.lower()}"
    print(f"🌿 Checking out feature branch: {branch_name}")
    run_git(["checkout", "main"], check=False)
    run_git(["checkout", "-B", branch_name])
    return branch_name

def finalize_task_git(task_id, task_title, target_files):
    """Stages target files, commits, merges into main (--no-ff), and deletes feature branch."""
    branch_name = f"factory/{task_id.lower()}"
    print(f"📦 Staging target files for {task_id}...")
    
    staged_count = 0
    for rel_path in target_files:
        safe_rel_path = rel_path.lstrip("./")
        full_path = os.path.join(PROJECT_ROOT, safe_rel_path)
        if os.path.exists(full_path):
            run_git(["add", safe_rel_path])
            staged_count += 1

    if staged_count == 0:
        print(f"⚠️ No target files found to stage for {task_id}.")
        return

    commit_msg = f"feat({task_id.lower()}): {task_title}\n\nAutomated delivery by Factory Runner."
    run_git(["commit", "-m", commit_msg])

    print(f"🔀 Merging {branch_name} into main...")
    run_git(["checkout", "main"])
    run_git(["merge", "--no-ff", branch_name, "-m", f"Merge branch '{branch_name}' into main"])
    run_git(["branch", "-D", branch_name])
    print(f"  └── ✅ Branch {branch_name} merged and deleted.")

def abort_task_git(task_id):
    """Discards feature branch on failure and reverts working tree to main."""
    branch_name = f"factory/{task_id.lower()}"
    print(f"🚨 Aborting task {task_id}. Rolling back git working tree to main...")
    run_git(["checkout", "main"], check=False)
    run_git(["branch", "-D", branch_name], check=False)

# --- FILE & UTILITY HELPERS ---

def load_file(path):
    if not os.path.exists(path):
        print(f"[Error] Required spec file not found: {path}")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def is_task_completed(task):
    """Returns True if all target_files exist on main and are non-empty."""
    target_files = task.get("target_files", [])
    if not target_files:
        return False
        
    for rel_path in target_files:
        safe_rel_path = rel_path.lstrip("./")
        full_path = os.path.join(PROJECT_ROOT, safe_rel_path)
        if not os.path.exists(full_path) or os.path.getsize(full_path) == 0:
            return False
    return True

def extract_file_blocks(llm_response_text):
    if not llm_response_text:
        return {}
    pattern = r"===\s*FILE:\s*([^\n=]+)\s*===\n(.*?)===\s*END FILE\s*==="
    matches = re.findall(pattern, llm_response_text, re.DOTALL)
    
    files = {}
    for filepath, content in matches:
        clean_path = filepath.strip()
        if any(char in clean_path for char in ['"', "'", '{', '}', ',']):
            continue
        files[clean_path] = content.strip()
    return files

# --- AI GENERATION & RETRY ENGINE ---

def generate_code_with_fallback(prompt):
    config = types.GenerateContentConfig(
        system_instruction=CODER_SYSTEM_PROMPT,
        temperature=0.2,
        max_output_tokens=8192,
    )

    for model_idx, model_name in enumerate(CANDIDATE_MODELS, start=1):
        print(f"📡 Requesting response using model: {model_name} (Candidate {model_idx}/{len(CANDIDATE_MODELS)})")
        
        max_server_retries = 3
        server_retry_count = 0

        while server_retry_count < max_server_retries:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )

                text_content = getattr(response, 'text', None)
                extracted_files = extract_file_blocks(text_content)

                if extracted_files:
                    return extracted_files
                else:
                    print(f"⚠️ [Parse Warning] Model '{model_name}' produced no extractable file blocks. Retrying with next candidate...")
                    break

            except errors.APIError as e:
                code = getattr(e, 'code', None) or getattr(e, 'status_code', None)
                message = str(e)

                if code == 429 or "RESOURCE_EXHAUSTED" in message or "Quota exceeded" in message:
                    print(f"\n🛑 [Rate Limit / Quota Exceeded (429)] {message}")
                    sys.exit(1)
                elif code == 503 or "UNAVAILABLE" in message or "high demand" in message.lower():
                    print(f"⚠️ [High Demand (503)] Model '{model_name}' overloaded.")
                    break
                elif code in [500, 502, 504] or "INTERNAL" in message:
                    server_retry_count += 1
                    if server_retry_count < max_server_retries:
                        time.sleep(2.0)
                    else:
                        sys.exit(1)
                elif code in [401, 403, 404, 400]:
                    print(f"\n🛑 [Permanent API Error ({code})] {message}")
                    sys.exit(1)

            except Exception as e:
                server_retry_count += 1
                if server_retry_count < max_server_retries:
                    time.sleep(2.0)
                else:
                    sys.exit(1)

        print(f"🔄 Switching from '{model_name}' to next candidate model...\n")

    print(f"\n🛑 [Pipeline Failure] All models failed to produce valid outputs.")
    sys.exit(1)

# --- TEST EXECUTION & SELF-HEALING ---

def execute_npm_tests():
    """Executes 'npm test' via subprocess and captures stdout/stderr."""
    print("🧪 Running automated test suite ('npm test')...")
    try:
        result = subprocess.run(
            ["npm", "test"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            print("  └── ✅ All tests passed successfully!")
            return True, result.stdout
        else:
            print("  └── ❌ Test suite failed!")
            error_log = (result.stdout or "") + "\n" + (result.stderr or "")
            return False, error_log.strip()
    except Exception as e:
        return False, f"Subprocess error while running npm test: {str(e)}"

def run_auto_fix_loop(spec_content, initial_error_log, max_fix_attempts=3):
    """Feeds test failure logs back to the LLM for automated remediation on the feature branch."""
    current_error = initial_error_log

    for attempt in range(1, max_fix_attempts + 1):
        print(f"\n🛠️ [Auto-Fix Loop {attempt}/{max_fix_attempts}] Sending error logs to Coder Agent...")
        
        fix_prompt = f"""
PROJECT SPECIFICATION:
{spec_content}

TEST FAILURE LOGS:
{current_error}

INSTRUCTION:
The current codebase failed the automated test suite. Analyze the error trace above, identify the failing logic in the generated files, and return corrected versions of the broken target files.
"""
        extracted_files = generate_code_with_fallback(fix_prompt)
        
        for rel_path, content in extracted_files.items():
            safe_rel_path = rel_path.lstrip("./")
            full_path = os.path.join(PROJECT_ROOT, safe_rel_path)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content + "\n")
            print(f"  └── 📄 Auto-Fixed: {safe_rel_path}")

        passed, output = execute_npm_tests()
        if passed:
            print(f"🎉 Auto-remediation successful on attempt {attempt}!")
            return True
        
        current_error = output

    print(f"🛑 Auto-fix loop reached maximum attempts ({max_fix_attempts}) without passing tests.")
    return False

# --- TASK ORCHESTRATION ---

def run_task(task, spec_content):
    task_id = task.get("id")
    title = task.get("title")
    target_files = task.get("target_files", [])

    print(f"\n==========================================")
    print(f"🚀 Executing {task_id}: {title}")
    print(f"==========================================")

    # 1. Checkout Feature Branch
    create_task_branch(task_id)

    # 2. Prompt Coder Agent & Generate Code
    user_prompt = f"""
PROJECT SPECIFICATION:
{spec_content}

CURRENT TASK:
ID: {task_id}
Title: {title}
Description: {task.get('description')}
Target Files: {', '.join(target_files)}
Action Items:
{json.dumps(task.get('action_items', []), indent=2)}

Acceptance Criteria:
{task.get('acceptance_criteria')}

Please generate the code for the target files required for this task.
"""

    extracted_files = generate_code_with_fallback(user_prompt)

    # 3. Write Files to Feature Branch
    for rel_path, content in extracted_files.items():
        safe_rel_path = rel_path.lstrip("./")
        full_path = os.path.join(PROJECT_ROOT, safe_rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content + "\n")
        print(f"  └── 📄 Written: {safe_rel_path}")

    # 4. Run Tests & Self-Healing Loop on Feature Branch
    if os.path.exists(os.path.join(PROJECT_ROOT, "package.json")):
        passed, log = execute_npm_tests()
        if not passed:
            print("⚠️ Initial tests failed on feature branch. Starting auto-fix loop...")
            passed = run_auto_fix_loop(spec_content, log)
            if not passed:
                abort_task_git(task_id)
                return False

    # 5. Finalize Git Commit & Merge to Main
    finalize_task_git(task_id, title, target_files)
    return True

def main():
    if "GEMINI_API_KEY" not in os.environ:
        print("[Error] GEMINI_API_KEY environment variable is not set.")
        sys.exit(1)

    ensure_git_environment()

    spec_content = load_file(SPEC_FILE)
    tasks_data = json.loads(load_file(TASKS_FILE))

    tasks = tasks_data.get("tasks", [])
    print(f"Found {len(tasks)} tasks in pipeline.")

    for task in tasks:
        task_id = task.get("id")
        title = task.get("title")
        
        if is_task_completed(task):
            print(f"⏩ Skipping {task_id} ({title}): Target files already present on main.")
            continue

        success = run_task(task, spec_content)
        if not success:
            print(f"❌ Aborting pipeline execution due to failure at {task_id}.")
            sys.exit(1)

    print("\n✅ Factory pipeline execution, verification, and git merges complete!")

if __name__ == "__main__":
    main()
