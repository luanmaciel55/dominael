export function owned(s,seat){return s.owners.map((v,i)=>v===seat?i:-1).filter(i=>i>=0)}
export function tickIncome(s,regs){
  const now=Date.now();
  const m=Math.min(180,Math.max(0,(now-s.lastTick)/60000));
  for(const p of s.players){
    for(const id of owned(s,p.seat)){
      const r=regs[id];
      const b=s.buildings[id]||[];
      p.food+=((r.type==='farmland'?1.5:0)+(b.includes('farm')?2:0))*m;
      p.goods+=((r.type==='port'?0.4:0)+(b.includes('workshop')?1.5:0))*m;
      p.wood+=(r.type==='forest'?1.2:0)*m;
      p.stone+=(r.type==='quarry'?1:0)*m;
      p.coins+=((r.type==='market'?0.8:0)+(b.includes('market')?1.2:0)+(b.includes('port')?1.8:0))*m;
      p.influence+=0.01*m;
    }
  }
  s.lastTick=now;
}
export function rank(s){
  return [...s.players]
    .sort((a,b)=>(b.coins+b.influence*8+b.stats.territories*35)-(a.coins+a.influence*8+a.stats.territories*35))
    .map((p,i)=>({...p,rank:i+1,score:Math.floor(p.coins+p.influence*8+p.stats.territories*35)}));
}
