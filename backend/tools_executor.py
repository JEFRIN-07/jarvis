import subprocess
import webbrowser
import httpx
import os
import sys

# Windows app name → executable mapping
APP_MAP = {
    "chrome": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "google chrome": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "vscode": "code",
    "vs code": "code",
    "visual studio code": "code",
    "notepad": "notepad",
    "explorer": "explorer",
    "file explorer": "explorer",
    "cmd": "cmd",
    "terminal": "cmd",
    "calculator": "calc",
    "paint": "mspaint",
    "word": "winword",
    "excel": "excel",
    "powerpoint": "powerpnt",
}

async def execute_action(action_type: str, value: str) -> str:
    """Execute a tool action"""
    action_type = action_type.upper().strip()

    if action_type == "OPEN_APP":
        return open_app(value)

    elif action_type == "OPEN_URL":
        return open_url(value)

    elif action_type == "SEARCH":
        return await search_web(value)

    else:
        return f"Unknown action: {action_type}"


def open_app(app_name: str) -> str:
    """Open a Windows application"""
    app_lower = app_name.lower().strip()
    executable = APP_MAP.get(app_lower, app_lower)

    try:
        if sys.platform == "win32":
            os.startfile(executable) if executable in [
                "notepad", "calc", "mspaint", "explorer"
            ] else subprocess.Popen(
                f'start "" "{executable}"',
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        return f"✅ Opened {app_name}"
    except Exception as e:
        # Try with start command as fallback
        try:
            subprocess.Popen(
                f'start "" "{executable}"',
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            return f"✅ Opened {app_name}"
        except Exception as e2:
            return f"❌ Could not open {app_name}: {str(e2)}"


def open_url(url: str) -> str:
    """Open a URL in the default browser"""
    if not url.startswith("http"):
        url = "https://" + url
    try:
        webbrowser.open(url)
        return f"✅ Opened {url}"
    except Exception as e:
        return f"❌ Could not open URL: {str(e)}"


async def search_web(query: str) -> str:
    """Search the web using DuckDuckGo and return summary"""
    try:
        search_url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(search_url)
            data = response.json()

        results = []

        # Abstract (main answer)
        if data.get("AbstractText"):
            results.append(f"📖 {data['AbstractText']}")

        # Related topics
        topics = data.get("RelatedTopics", [])[:3]
        for topic in topics:
            if isinstance(topic, dict) and topic.get("Text"):
                results.append(f"• {topic['Text'][:150]}")

        if results:
            # Open search in browser too
            webbrowser.open(f"https://duckduckgo.com/?q={query}")
            return "\n".join(results)
        else:
            webbrowser.open(f"https://duckduckgo.com/?q={query}")
            return f"🔍 Opened search for: {query}"

    except Exception as e:
        # Fallback: just open browser
        webbrowser.open(f"https://duckduckgo.com/?q={query}")
        return f"🔍 Opened search for: {query}"
