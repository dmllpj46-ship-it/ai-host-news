const data = JSON.stringify({
  title: 'AI 后训练算力吞噬 80%-90%，预训练时代终结',
  summary: '据 SemiAnalysis 统计，后训练和强化学习已吞噬 80%-90% 算力，预训练收益递减。',
  content: '## 概述\n\n两年前，AI 巨头们几乎 100% 的算力都砸在「预训练（Pre-training）」上。\n\n而今天，据 SemiAnalysis 统计，「后训练（Post-training）」和强化学习（RL）已经吞噬了 80%-90% 的算力！\n\n这一变化正在重塑我们理解 AI 的方式。\n\n## 核心要点\n\n- **预训练「没书看」了：** 互联网上高质量人类数据已快被挖干，传统 Scaling Law 收益递减。\n- **后训练「自己练」：** 通过强化学习，模型开始自己做题、写代码并自我验证，不再只是模仿，而是学会社我博弈和长链条逻辑推理。',
  tags: ['ai', 'post-training', 'rl', 'scaling-law']
});

fetch('https://ai-news-hot-4ei.pages.dev/api/news', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'news-api-key-2026',
    'User-Agent': 'Mozilla/5.0'
  },
  body: data
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(e => console.error('ERR', e));