# InkForge Backup API 自动化测试脚本

$BASE_URL = "http://127.0.0.1:3000"
$RESULTS = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    try {
        $url = "$BASE_URL$Endpoint"
        $params = @{
            Uri = $url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod @params
        $status = "✓ PASS"
        $result = $response | ConvertTo-Json -Depth 3
        
        Write-Host "$status - $Name" -ForegroundColor Green
        Write-Host "  Response: $($result.Substring(0, [Math]::Min(100, $result.Length)))..." -ForegroundColor Gray
        
        $RESULTS += @{
            Name = $Name
            Status = "PASS"
            Response = $response
        }
        
        return $response
    }
    catch {
        $status = "✗ FAIL"
        Write-Host "$status - $Name" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        
        $RESULTS += @{
            Name = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
        
        return $null
    }
}

Write-Host "`n========== InkForge Backup API 测试开始 ==========" -ForegroundColor Cyan

# 1. 健康检查
Write-Host "`n[1] 基础可用性测试" -ForegroundColor Magenta
Test-Endpoint -Name "健康检查" -Method "GET" -Endpoint "/api/health"

# 2. 创建本地备份
Write-Host "`n[2] 创建备份测试" -ForegroundColor Magenta
$localBackupResp = Test-Endpoint -Name "创建 Local 备份" -Method "POST" -Endpoint "/api/admin/backup" -Body @{ provider = "local" }
$backupId = $localBackupResp.id

# 3. 创建 S3 备份
$s3BackupResp = Test-Endpoint -Name "创建 S3 备份" -Method "POST" -Endpoint "/api/admin/backup" -Body @{ provider = "s3" }

# 4. 查看备份列表
Write-Host "`n[3] 备份列表测试" -ForegroundColor Magenta
$listResp = Test-Endpoint -Name "查看备份列表" -Method "GET" -Endpoint "/api/admin/backup/list"

if ($listResp) {
    Write-Host "  备份数量: $($listResp.Count)" -ForegroundColor Gray
    foreach ($backup in $listResp) {
        Write-Host "    - ID: $($backup.id), Provider: $($backup.provider), Status: $($backup.status), Size: $($backup.size) bytes" -ForegroundColor Gray
    }
}

# 5. 获取调度配置
Write-Host "`n[4] 调度配置测试" -ForegroundColor Magenta
$scheduleResp = Test-Endpoint -Name "获取调度配置" -Method "GET" -Endpoint "/api/admin/backup/schedule"

# 6. 更新调度配置 - Daily
Write-Host "`n[5] 更新调度配置测试" -ForegroundColor Magenta
$updateScheduleResp = Test-Endpoint -Name "更新调度为 Daily" -Method "PATCH" -Endpoint "/api/admin/backup/schedule" -Body @{
    enabled = $true
    frequency = "daily"
    hour = 2
    minute = 30
    provider = "local"
}

# 7. 更新调度配置 - Weekly
$updateScheduleResp2 = Test-Endpoint -Name "更新调度为 Weekly" -Method "PATCH" -Endpoint "/api/admin/backup/schedule" -Body @{
    enabled = $true
    frequency = "weekly"
    hour = 3
    minute = 0
    provider = "s3"
}

# 8. 更新调度配置 - Monthly
$updateScheduleResp3 = Test-Endpoint -Name "更新调度为 Monthly" -Method "PATCH" -Endpoint "/api/admin/backup/schedule" -Body @{
    enabled = $false
    frequency = "monthly"
    hour = 4
    minute = 15
    provider = "local"
}

# 9. 恢复备份
if ($backupId) {
    Write-Host "`n[6] 恢复备份测试" -ForegroundColor Magenta
    $restoreResp = Test-Endpoint -Name "执行备份恢复" -Method "POST" -Endpoint "/api/admin/backup/restore" -Body @{ backup_id = $backupId }
    
    if ($restoreResp) {
        Write-Host "  恢复步骤:" -ForegroundColor Gray
        foreach ($step in $restoreResp) {
            Write-Host "    - $($step.step): $($step.status) - $($step.message)" -ForegroundColor Gray
        }
    }
}

# 10. 删除备份
if ($backupId) {
    Write-Host "`n[7] 删除备份测试" -ForegroundColor Magenta
    Test-Endpoint -Name "删除备份" -Method "DELETE" -Endpoint "/api/admin/backup/$backupId"
}

# 11. 验证删除后的列表
Write-Host "`n[8] 验证删除结果" -ForegroundColor Magenta
$finalListResp = Test-Endpoint -Name "查看删除后的备份列表" -Method "GET" -Endpoint "/api/admin/backup/list"
if ($finalListResp) {
    Write-Host "  剩余备份数量: $($finalListResp.Count)" -ForegroundColor Gray
}

# 测试总结
Write-Host "`n========== 测试总结 ==========" -ForegroundColor Cyan
$passCount = ($RESULTS | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($RESULTS | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $RESULTS.Count

Write-Host "总计: $totalCount 个测试" -ForegroundColor White
Write-Host "通过: $passCount 个" -ForegroundColor Green
Write-Host "失败: $failCount 个" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`n✓ 所有测试通过！Backup 模块功能正常。" -ForegroundColor Green
} else {
    Write-Host "`n✗ 有 $failCount 个测试失败，请检查上面的错误信息。" -ForegroundColor Red
}

Write-Host "`n========== 测试完成 ==========" -ForegroundColor Cyan
