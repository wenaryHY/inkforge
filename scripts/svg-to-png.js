/**
 * SVG 转 PNG 脚本
 * 
 * 使用方法：
 * 1. 安装依赖：npm install sharp
 * 2. 运行脚本：node scripts/svg-to-png.js
 * 
 * 注意：sharp 需要系统支持，Windows 上可能需要额外配置
 */

const fs = require('fs');
const path = require('path');

// 读取 SVG 文件
const iconSvg = fs.readFileSync(path.join(__dirname, '../src/logo-icon.svg'));
const logoSvg = fs.readFileSync(path.join(__dirname, '../src/logo.svg'));

// 需要生成的尺寸
const sizes = [32, 128, 256, 512, 1024];

console.log('SVG 文件已读取');
console.log('图标 SVG 大小:', iconSvg.length, 'bytes');
console.log('Logo SVG 大小:', logoSvg.length, 'bytes');
console.log('\n请使用以下在线工具转换：');
console.log('1. https://svg-to-png.org/');
console.log('2. https://www.svgvisualize.com/convert-svg-to-png');
console.log('\n需要生成的尺寸:', sizes.join('x, ') + 'x');
console.log('\n转换后请保存到: src-tauri/icons/');
