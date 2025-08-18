@echo off
REM 清理Windows系统中的nul文件脚本
echo 正在检查并清理nul文件...

REM 删除当前目录的nul文件
if exist "nul" (
    echo 发现nul文件，正在删除...
    del "nul" 2>NUL
    if not exist "nul" (
        echo nul文件已成功删除
    ) else (
        echo 删除nul文件失败，请手动删除
    )
) else (
    echo 未发现nul文件
)

echo 完成!