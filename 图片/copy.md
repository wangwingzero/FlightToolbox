# Claude Code ¶Mn

## Mn‡öMn

`C:\Users\[¨„(7]\.claude\settings.json`

## Mn…¹

å…¹60 settings.json ‡ö-

```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -Command \"$input = $input | ConvertFrom-Json; $dirName = Split-Path -Leaf $input.workspace.current_dir; try { $branch = git -C $input.workspace.current_dir rev-parse --abbrev-ref HEAD 2>$null; if ($branch) { Write-Host \"$dirName ($branch)\" -NoNewline } else { Write-Host $dirName -NoNewline } } catch { Write-Host $dirName -NoNewline }\""
  }
}
```

## Hœ

Mn¶>::**FlightToolbox (main)**

- >:SMîU
- >: git /ì÷…	
- ‚œ( git Ó“-ê>:îU

## (e¤

1. ‚œ `.claude` îUX(Hú`C:\Users\[¨„(7]\.claude\`
2. (åîUú `settings.json` ‡ö
3. 6
b„ JSON Mn…¹0‡ö-
4. İX‡ö
5. Í/ Claude Code

---

MnŒsïH
