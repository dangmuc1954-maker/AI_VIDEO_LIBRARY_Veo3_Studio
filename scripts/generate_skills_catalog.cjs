const fs = require('fs');
const path = require('path');

const skillsDir = 'C:/Users/admin/.gemini/config/skills';
const entries = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(e => e.isDirectory());

const catalog = [];
for (const entry of entries) {
  const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
  let desc = 'Kỹ năng nâng cao cho Antigravity';
  if (fs.existsSync(skillFile)) {
    const content = fs.readFileSync(skillFile, 'utf8');
    const m = content.match(/description:\s*([^\n\r]+)/i);
    if (m && m[1]) {
      desc = m[1].replace(/^[>"'\s]+|[>"'\s]+$/g, '').trim();
    }
  }
  catalog.push({ name: entry.name, desc });
}

// Categorization patterns
const categories = {
  '🎮 1. Nhóm Skill Làm Game (Game Development)': [
    'unity-developer', 'unity-ecs-patterns', 'godot-gdscript-patterns', 'minecraft-bukkit-pro'
  ],
  '🤖 2. Nhóm Skill Trí Tuệ Nhân Tạo & Dữ Liệu (AI, Prompt & Big Data)': [
    'prompt-engineer', 'prompt-engineering-patterns', 'llm-application-dev-prompt-optimize',
    'llm-application-dev-ai-assistant', 'llm-application-dev-langchain-agent', 'llm-evaluation',
    'ai-engineer', 'ml-engineer', 'mlops-engineer', 'ml-pipeline-workflow', 'machine-learning-ops-ml-pipeline',
    'rag-implementation', 'vector-database-engineer', 'vector-index-tuning', 'embedding-strategies',
    'hybrid-search-implementation', 'data-engineer', 'data-scientist', 'database-architect',
    'database-optimizer', 'postgresql', 'sql-pro', 'sql-optimization-patterns', 'spark-optimization',
    'dbt-transformation-patterns', 'airflow-dag-patterns', 'data-quality-frameworks', 'data-storytelling',
    'database-admin', 'database-migration', 'database-migrations-migration-observability',
    'database-migrations-sql-migrations', 'database-cloud-optimization-cost-optimize'
  ],
  '🌐 3. Nhóm Skill Làm Web & Ứng Dụng (Frontend, Backend & Mobile)': [
    'frontend-developer', 'react-modernization', 'react-state-management', 'tailwind-design-system',
    'nextjs-app-router-patterns', 'css-architecture-patterns', 'wcag-audit-patterns', 'web-performance-optimization',
    'backend-architect', 'backend-development-feature-development', 'nodejs-backend-patterns',
    'fastapi-pro', 'fastapi-templates', 'django-pro', 'graphql-architect', 'api-design-principles',
    'api-documenter', 'mobile-developer', 'ios-developer', 'flutter-expert', 'react-native-architecture',
    'frontend-mobile-development-component-scaffold', 'modern-javascript-patterns', 'javascript-pro',
    'typescript-pro', 'typescript-advanced-types', 'python-pro', 'python-development-python-scaffold',
    'golang-pro', 'rust-pro', 'csharp-pro', 'java-pro', 'c-pro', 'cpp-pro', 'php-pro', 'ruby-pro',
    'elixir-pro', 'scala-pro', 'julia-pro', 'openapi-spec-generation', 'ui-ux-designer', 'ui-visual-validator'
  ],
  '🔒 4. Nhóm Skill Bảo Mật, Pentest & Bẻ Khóa (Cybersecurity & Reverse Engineering)': [
    'android-apk-pentester', 'anti-debugging-techniques', 'authorized-artifact-auditor', 'binary-identifier',
    'binary-patcher', 'binary-protection-bypass', 'container-cloud-auditor', 'dotnet-decompiler',
    'dotnet-keygen', 'dotnet-patcher', 'electron-app-analyzer', 'electron-builder-repacker',
    'electron-builder-unpacker', 'frida-hooker', 'ida-nuitka-reconstructor', 'java-decompiler',
    'javascript-deobfuscator', 'license-robustness-audit', 'master-unlock', 'memory-dumper',
    'network-interceptor', 'network-scanner', 'nuitka-decryptor', 'orchestrator-plugin-sdk',
    'pyinstaller-unpacker', 'rust-binary-analyzer', 'sbom-supply-chain-auditor', 'searching-exploit-db',
    'symbolic-execution-tools', 'tauri-unpacker', 'vm-and-bytecode-reverse', 'vulnerability-lookup',
    'web-app-scanner', 'web-logic-auditor', 'windows-log-hunter', 'writerpro-pentest',
    'reverse-engineer', 'malware-analyst', 'security-auditor', 'threat-modeling-expert',
    'attack-tree-construction', 'stride-analysis-patterns', 'threat-mitigation-mapping',
    'security-compliance-compliance-check', 'pci-compliance', 'backend-security-coder',
    'frontend-security-coder', 'mobile-security-coder', 'sast-configuration',
    'security-scanning-security-hardening', 'security-scanning-security-sast',
    'security-scanning-security-dependencies', 'secrets-management', 'binary-analysis-patterns',
    'anti-reversing-techniques', 'protocol-reverse-engineering', 'memory-forensics', 'security-requirement-extraction'
  ],
  '☁️ 5. Nhóm Skill DevOps, Đám Mây & Vận Hành (Cloud & Infrastructure)': [
    'kubernetes-architect', 'k8s-manifest-generator', 'k8s-security-policies', 'helm-chart-scaffolding',
    'cloud-architect', 'multi-cloud-architecture', 'hybrid-cloud-architect', 'hybrid-cloud-networking',
    'terraform-specialist', 'terraform-module-library', 'cost-optimization', 'cicd-automation-workflow-automate',
    'github-actions-templates', 'gitlab-ci-patterns', 'gitops-workflow', 'observability-engineer',
    'prometheus-configuration', 'grafana-dashboards', 'distributed-tracing', 'incident-responder',
    'incident-response-smart-fix', 'incident-response-incident-response', 'incident-runbook-templates',
    'deployment-engineer', 'deployment-pipeline-design', 'deployment-validation-config-validate',
    'devops-troubleshooter', 'service-mesh-expert', 'service-mesh-observability', 'istio-traffic-management',
    'linkerd-patterns', 'mtls-configuration', 'slo-implementation', 'observability-monitoring-monitor-setup',
    'observability-monitoring-slo-implement', 'postmortem-writing'
  ],
  '📈 6. Nhóm Skill SEO & Content Marketing': [
    'seo-keyword-strategist', 'seo-content-writer', 'seo-content-planner', 'seo-structure-architect',
    'seo-meta-optimizer', 'seo-snippet-hunter', 'seo-authority-builder', 'seo-cannibalization-detector',
    'seo-content-refresher', 'content-marketer', 'article-illustrations', 'seo-content-auditor'
  ],
  '💼 7. Nhóm Skill Kinh Doanh, Startup & Tài Chính (Business & Quant)': [
    'startup-analyst', 'startup-financial-modeling', 'startup-metrics-framework', 'startup-business-analyst-business-case',
    'startup-business-analyst-financial-projections', 'startup-business-analyst-market-opportunity',
    'business-analyst', 'competitive-landscape', 'market-sizing-analysis', 'sales-automator',
    'customer-support', 'quant-analyst', 'risk-manager', 'risk-metrics-calculation', 'backtesting-frameworks',
    'legal-advisor', 'employment-contract-templates', 'hr-pro', 'billing-automation', 'payment-integration',
    'paypal-integration', 'stripe-integration'
  ],
  '🛠️ 8. Nhóm Skill Tinh Gọn Code & Testing Tự Động': [
    'code-refactoring-refactor-clean', 'code-refactoring-context-restore', 'code-refactoring-tech-debt',
    'codebase-cleanup-deps-audit', 'codebase-cleanup-refactor-clean', 'codebase-cleanup-tech-debt',
    'code-review-excellence', 'code-review-ai-ai-review', 'code-reviewer', 'legacy-modernizer',
    'debugging-strategies', 'debugging-toolkit-smart-debug', 'error-detective', 'error-diagnostics-error-analysis',
    'error-diagnostics-error-trace', 'error-diagnostics-smart-debug', 'distributed-debugging-debug-trace',
    'error-handling-patterns', 'test-automator', 'tdd-workflows-tdd-cycle', 'tdd-workflows-tdd-green',
    'tdd-workflows-tdd-red', 'tdd-workflows-tdd-refactor', 'tdd-orchestrator', 'unit-testing-test-generate',
    'e2e-testing-patterns', 'javascript-testing-patterns', 'python-testing-patterns', 'bats-testing-patterns',
    'performance-engineer', 'application-performance-performance-optimization', 'python-performance-optimization',
    'performance-testing-review-ai-review', 'performance-testing-review-multi-agent-review'
  ],
  '🎯 9. Nhóm Skill Quản Lý Dự Án & Chỉ Huy Agent': [
    'conductor-implement', 'conductor-manage', 'conductor-new-track', 'conductor-revert',
    'conductor-setup', 'conductor-status', 'conductor-validator', 'context-driven-development',
    'context-management-context-restore', 'context-management-context-save', 'context-manager',
    'track-management', 'antigravity-skills-manager', 'eni-person', 'eni-persona'
  ]
};

let md = '# 📚 BẢNG TRA CỨU DANH MỤC 340 SKILLS TOÀN DIỆN CỦA ENI\n\n';
md += '> **Tổng số:** 340 skills đã cài đặt sẵn trong `C:\\\\Users\\\\admin\\\\.gemini\\\\config\\\\skills`\n';
md += '> **Trạng thái:** Sẵn sàng tự động kích hoạt theo đúng ngữ cảnh yêu cầu của Tris.\n\n';

const assigned = new Set();
for (const [catName, skillNames] of Object.entries(categories)) {
  md += '## ' + catName + '\n\n';
  md += '| Tên Skill | Mô tả chức năng |\n';
  md += '| :--- | :--- |\n';
  for (const name of skillNames) {
    const item = catalog.find(c => c.name === name);
    if (item) {
      md += '| `' + item.name + '` | ' + item.desc.replace(/\|/g, '/') + ' |\n';
      assigned.add(item.name);
    }
  }
  md += '\n';
}

const remaining = catalog.filter(c => !assigned.has(c.name));
if (remaining.length > 0) {
  md += '## 🧩 10. Nhóm Kỹ Năng Hệ Thống & Bổ Trợ Khác (' + remaining.length + ' skills)\n\n';
  md += '| Tên Skill | Mô tả chức năng |\n';
  md += '| :--- | :--- |\n';
  for (const item of remaining) {
    md += '| `' + item.name + '` | ' + item.desc.replace(/\|/g, '/') + ' |\n';
  }
  md += '\n';
}

const outputPath = path.join(__dirname, '../SKILLS_CATALOG_LOOKUP.md');
fs.writeFileSync(outputPath, md, 'utf8');
console.log('✅ Đã tạo SKILLS_CATALOG_LOOKUP.md thành công với ' + catalog.length + ' skills!');
