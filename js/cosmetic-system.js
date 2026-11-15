/* Наградные визуальные эффекты для кампании. */
const COSMETIC_REWARDS=[
 {id:'shadow',name:'Классическая тень',level:0,accent:null},
 {id:'embers',name:'След искр · уровень 5',level:5,accent:'#ffbc70'},
 {id:'moonlight',name:'Лунный свет · уровень 15',level:15,accent:'#80e5ff'},
 {id:'rift',name:'Разлом · уровень 25',level:25,accent:'#d18bff'}
];
function getCosmetic(id){return COSMETIC_REWARDS.find(effect=>effect.id===id)||COSMETIC_REWARDS[0]}
function unlockedCosmetics(progress){return COSMETIC_REWARDS.filter(effect=>progress>=effect.level)}
