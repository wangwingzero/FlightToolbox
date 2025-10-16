# Claude Code StatusLine Configuration

## Settings File Location

`C:\Users\[YourUsername]\.claude\settings.json`

## Configuration JSON

Copy the following content to your settings.json file:

```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -Command \"$input = $input | ConvertFrom-Json; $dirName = Split-Path -Leaf $input.workspace.current_dir; try { $branch = git -C $input.workspace.current_dir rev-parse --abbrev-ref HEAD 2>$null; if ($branch) { Write-Host \"$dirName ($branch)\" -NoNewline } else { Write-Host $dirName -NoNewline } } catch { Write-Host $dirName -NoNewline }\""
  }
}
```

## Result

After configuration, your status line will display: **FlightToolbox (main)**

- Shows current directory name
- Shows git branch name (in parentheses)
- If not in a git repo, shows only directory name

## Setup Steps

1. Create directory if not exists: `C:\Users\[YourUsername]\.claude\`
2. Create file `settings.json` in that directory
3. Copy the JSON configuration above into the file
4. Save the file
5. Restart Claude Code

---

Configuration will take effect after restart.
