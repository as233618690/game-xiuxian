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

        // 在选项按钮中调用
{ text: "开始修炼", action: startCultivation }

        // 示例任务接取
function acceptMission(missionName) {
    const mission = sectSystem.missions[missionName];
    if(checkRequirements(mission.require)) {
        gameState.quests.active.push(missionName);
    }
}

        

// 任务完成处理
function completeMission(missionName) {
    const reward = sectSystem.missions[missionName].reward;
    applyEffects(reward);
}

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

        const specialEvents = {
    "天劫": {
        trigger: (cultivationLevel) => cultivationLevel >= 5,
        stages: [
            { damage: 30, description: "第一道雷劫劈下！" },
            { damage: 50, description: "心魔劫降临..." }
        ]
    },
    "秘境探索": {
        require: { item: "秘境地图" },
        stages: 3,
        rewardLevels: ["普通", "稀有", "传说"]
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



        // 扩展游戏状态
let gameState = {
    // ...原有状态...
    cultivationStage: {
        current: 1,
        stages: [
            { name: "炼气初期", require: 100 },
            { name: "炼气中期", require: 300 },
            { name: "炼气后期", require: 800 }
        ]
    },
    quests: {
        active: [],
        completed: []
    }
};

// 新增修炼系统
function startCultivation() {
    const interval = setInterval(() => {
        if(gameState.attributes.mana < 10) {
            alert("灵力不足！");
            clearInterval(interval);
            return;
        }
        
        gameState.attributes.mana -= 5;
        gameState.cultivationStage.currentProgress += 10;
        
        updateStatus();
        
        if(gameState.cultivationStage.currentProgress >= 
           gameState.cultivationStage.stages[gameState.cultivationStage.current].require) {
            advanceStage();
            clearInterval(interval);
        }
    }, 1000);
}

function advanceStage() {
    gameState.cultivationStage.current++;
    gameState.cultivationStage.currentProgress = 0;
    triggerEvent({
        type: "突破",
        message: `成功突破至${getCurrentStage().name}！`,
        effect: {
            attributes: {
                mana: +50,
                perception: +2
            }
        }
    });
}

// 新增奇遇事件系统
const randomEvents = {
    1: {
        trigger: () => Math.random() < gameState.attributes.luck / 100,
        message: "【山间奇遇】发现一株散发灵光的草药",
        choices: [
            { text: "采摘（神识≥6）", effect: { inventory: ["灵草×1"] }, check: "perception" },
            { text: "观察后再取", effect: { luck: +1 } },
            { text: "置之不理" }
        ]
    },
    2: {
        trigger: () => gameState.relationships["青云门"] > 60,
        message: "【宗门传讯】收到门派大比邀请函",
        choices: [
            { text: "参加比试", next: "sect_tournament" },
            { text: "婉拒邀请", effect: { relationships: { "青云门": -10 } }
        ]
    }
};

// 新增轮回系统
const reincarnationSystem = {
    karmaThresholds: {
        good: 70,
        neutral: 30,
        evil: 0
    },
    getNextLifeBonus() {
        if(gameState.karma >= this.karmaThresholds.good) {
            return { attributes: { luck: +3 }, items: ["功德玉佩"] };
        } else if(gameState.karma >= this.karmaThresholds.neutral) {
            return { attributes: { perception: +1 } };
        } else {
            return { attributes: { physique: -1 }, curses: ["业火缠身"] };
        }
    }
};

// 在事件树中新增更多分支
const eventTree = {
    // ...原有事件...
    303: {
        text: "【逆天而行】强行留在灵气潮中修炼",
        effect: {
            mana: +200,
            lifespan: -20,
            karma: -15
        },
        choices: [
            { text: "继续吸收灵气", next: 304 },
            { text: "见好就收", next: 305 }
        ]
    },
    304: {
        text: "【灵气暴走】经脉承受不住狂暴的灵气...",
        effect: {
            health: -50,
            cultivation: "境界跌落"
        },
        choices: [
            { text: "运功调息", next: 306, check: { attr: "physique", min: 5 } },
            { text: "服用丹药", cost: { item: "回春丹" } }
        ]
    }
};

// 新增宗门系统
const sectSystem = {
    missions: {
        "采集灵草": {
            require: { level: "炼气初期" },
            reward: { contribution: 50, items: ["下品灵石×5"] }
        },
        "剿灭妖兽": {
            require: { level: "炼气中期" },
            reward: { contribution: 100, karma: +5 }
        }
    },
    exchange: {
        "功法阁": {
            "基础剑诀": { cost: 100, effect: { attack: +5 } },
            "炼丹入门": { cost: 200, effect: { alchemy: true } }
        }
    }
};

// 在renderGame函数中添加奇遇触发
function renderGame(eventId) {
    // ...原有逻辑...
    
    // 20%概率触发随机事件
    if(Math.random() < 0.2) {
        const event = getRandomEvent();
        showPopupEvent(event);
    }
}

function showPopupEvent(event) {
    const popup = document.createElement('div');
    popup.className = 'event-popup';
    popup.innerHTML = `
        <h4>${event.message}</h4>
        <div class="event-choices">
            ${event.choices.map((c, i) => `
                <button onclick="handlePopupChoice(${i})">
                    ${c.text}
                </button>
            `).join('')}
        </div>
    `;
    document.body.appendChild(popup);
}

        

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
// 每5分钟自动保存
setInterval(() => {
    localStorage.setItem('autoSave', JSON.stringify(gameState));
}, 300000);
</script>

        // 初始化游戏
        renderGame(1);
        updateStatus();
    

