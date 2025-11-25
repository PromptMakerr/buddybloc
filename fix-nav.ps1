$content = Get-Content 'index.html' -Raw
$content = $content -replace '\<button class="btn btn-secondary"\>Log In\</button\>', '<a href="login.html" class="btn btn-secondary">Log In</a>'
$content = $content -replace '\<button class="btn btn-primary"\>(\s*)\<span\>Sign Up Free\</span\>(\s*)\</button\>', '<a href="signup.html" class="btn btn-primary">$1<span>Sign Up Free</span>$2</a>'
Set-Content 'index.html' -Value $content -NoNewline
Write-Host "Fixed navigation buttons!"
