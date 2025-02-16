<script>
        // 扩展游戏状态
        let gameState = {
            karma: 50,
            cultivation: '炼气初期',
            attributes: {
                perception: 5,
                physique: 4,
                luck: 6,
                mana: 100,
                lifespan: 120
            },
            inventory: ['下品灵石×10'],
            relationships: {
                '青云门': 50
            },
            currentEvent: 1
        };

        // 扩展事件树
        const eventTree = {
            1: {
                text: `【灵气潮涌】东南方传来异常的灵力波动，<br>
                    隐约可见青紫色光晕在云雾间流转...`,
                choices: [
                    { 
                        text: "深入探查（需神识≥5）", 
                        next: 101, 
                        check: { attr: 'perception', min: 5 },
                        cost: { mana: 20 }
                    },
                    { 
                        text: "布置警戒阵法（需灵力≥50）", 
                        next: 201,
                        check: { attr: 'mana', min: 50 },
                        cost: { item: '下品灵石×1' }
                    },
                    { 
                        text: "联系宗门长老", 
                        next: 301,
                        effect: { relationships: { '青云门': +10 } }
                    }
                ]
            },
            101: {
                text: `【古修洞府】破开禁制后，发现石壁上刻有：<br>
                    "后来者当承吾道统..."<br>
                    获得《玄天功》残卷`,
                effect: { 
                    karma: +10,
                    inventory: ['《玄天功》残卷']
                },
                choices: [
                    { text: "参悟功法", next: 102 },
                    { text: "继续探索", next: 103 }
                ]
            },
            201: {
                text: `【阵法波动】成功布置三才阵，<br>
                    察觉到地下有微弱灵气渗出...`,
                effect: { 
                    mana: -30,
                    inventory: ['下品灵石×1'] 
                },
                choices: [
                    { text: "挖掘探查", next: 202 },
                    { text: "标记位置", next: 203 }
                ]
            },
            301: {
                text: `【长老传讯】收到青云门回信：<br>
                    "此乃百年一遇的灵气潮，速回宗门！"`,
                effect: { 
                    relationships: { '青云门': +15 },
                    karma: -5 
                },
                choices: [
                    { text: "立即返回", next: 302 },
                    { text: "抗命继续", next: 303 }
                ]
            }
        };

        // 增强事件处理逻辑
        function handleChoice(nextEvent) {
            const currentChoices = eventTree[gameState.currentEvent].choices;
            const selectedChoice = currentChoices.find(c => c.next === nextEvent);
            
            // 属性检查
            if(selectedChoice.check) {
                if(gameState.attributes[selectedChoice.check.attr] < selectedChoice.check.min) {
                    alert("条件不足！");
                    return;
                }
            }
            
            // 消耗处理
            if(selectedChoice.cost) {
                if(selectedChoice.cost.mana && gameState.attributes.mana < selectedChoice.cost.mana) {
                    alert("灵力不足！");
                    return;
                }
                if(selectedChoice.cost.item && !gameState.inventory.includes(selectedChoice.cost.item)) {
                    alert("缺少必要物品！");
                    return;
                }
            }

            // 应用效果
            if(selectedChoice.effect) {
                Object.keys(selectedChoice.effect).forEach(key => {
                    if(key === 'relationships') {
                        Object.entries(selectedChoice.effect[key]).forEach(([faction, value]) => {
                            gameState.relationships[faction] += value;
                        });
                    } else {
                        gameState[key] = {...gameState[key], ...selectedChoice.effect[key]};
                    }
                });
            }

            gameState.currentEvent = nextEvent;
            renderGame(nextEvent);
            updateStatus();
        }

        // 新增状态更新函数
        function updateStatus() {
            document.getElementById('perception-value').textContent = gameState.attributes.perception;
            document.getElementById('mana-value').textContent = `${gameState.attributes.mana}/100`;
            document.querySelector('.karma-fill').style.width = `${gameState.karma}%`;
        }

        // 初始化游戏
        renderGame(1);
        updateStatus();
    
// 在game.js中添加存档功能
function saveGame() {
    localStorage.setItem('cultivationSave', JSON.stringify(gameState));
}

function loadGame() {
    const save = localStorage.getItem('cultivationSave');
    if(save) gameState = JSON.parse(save);
}

// 添加自动保存事件
window.addEventListener('beforeunload', saveGame);
</script>
