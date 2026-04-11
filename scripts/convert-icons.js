/**
 * SVG 转 PNG 图标转换脚本
 * 
 * 使用 sharp 库将 SVG 转换为多尺寸 PNG
 * 
 * 安装依赖：npm install sharp
 * 运行脚本：node scripts/convert-icons.js
 */

const fs = require('fs');
const path = require('path');

async function convertIcons() {
  try {
    // 动态导入 sharp
    const sharp = await import('sharp');
    const sharpModule = sharp.default;

    const inputSvg = path.join(__dirname, '../src/app-icon.svg');
    const outputDir = path.join(__dirname, '../src-tauri/icons');

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 需要生成的尺寸
    const sizes = [
      { size: 32, name: '32x32.png' },
      { size: 128, name: '128x128.png' },
      { size: 256, name: '128x128@2x.png' },
      { size: 512, name: 'icon.png' },
      { size: 1024, name: 'icon@2x.png' }
    ];

    console.log('开始转换图标...\n');
    console.log(`输入文件: ${inputSvg}`);
    console.log(`输出目录: ${outputDir}\n`);

    // 转换每个尺寸
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharpModule(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ 已生成: ${name} (${size}x${size})`);
    }

    console.log('\n✅ 所有图标转换完成！');
    console.log(`\n图标位置: ${outputDir}`);
    
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.includes('sharp')) {
      console.error('\n❌ 错误: 未找到 sharp 模块');
      console.error('\n请先安装 sharp:');
      console.error('  npm install sharp');
      console.error('\n然后重新运行此脚本:');
      console.error('  node scripts/convert-icons.js');
    } else {
      console.error('\n❌ 转换失败:', error.message);
    }
    process.exit(1);
  }
}

convertIcons();
