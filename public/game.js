const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; }
addEventListener('resize', resize); resize();

let player = { x:400, y:300, r:14, dir:0, classKey:'mage', color:'#f60', baseSpeed:190, abilities:{q:0,e:0,x:0}, attacking:false };
const keys={}; addEventListener('keydown', e=>{ keys[e.key.toLowerCase()]=true; if(e.code==='Space') e.preventDefault(); });
addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });

let projectiles = []; let particles = [];

function update(dt){
  let vx=0, vy=0;
  if(keys['w']||keys['arrowup']) vy -=1;
  if(keys['s']||keys['arrowdown']) vy +=1;
  if(keys['a']||keys['arrowleft']) vx -=1;
  if(keys['d']||keys['arrowright']) vx +=1;
  if(vx||vy){ const n=1/Math.hypot(vx,vy); vx*=n; vy*=n; player.dir = Math.atan2(vy,vx); }

  player.x += vx*player.baseSpeed*dt;
  player.y += vy*player.baseSpeed*dt;

  sendMove(player.x,player.y,player.dir);

  // space: class-specific
  if(keys[' '] && !player.attacking){
    if(player.classKey==='mage') mageCone();
    player.attacking=true; setTimeout(()=>player.attacking=false,200);
  }
  // Q/E/X
  if(keys['q'] && player.abilities.q<=0) { mageTeleport(); player.abilities.q=3; setTimeout(()=>player.abilities.q=0,3000); }
  if(keys['e'] && player.abilities.e<=0) { mageFireball(); player.abilities.e=3; setTimeout(()=>player.abilities.e=0,3000); }
  if(keys['x'] && player.abilities.x<=0) { mageMeteor(); player.abilities.x=10; setTimeout(()=>player.abilities.x=0,10000); }

  // update projectiles
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];
    p.x += p.vx*dt; p.y += p.vy*dt; if(p.life) { p.life-=dt; if(p.life<=0) projectiles.splice(i,1); }
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // local player
  drawHumanoid(player.x,player.y,player.color);

  // other players
  for(const id in otherPlayers) drawHumanoid(otherPlayers[id].x, otherPlayers[id].y, otherPlayers[id].color);

  // projectiles
  for(const p of projectiles){ ctx.fillStyle=p.color||'#f80'; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill(); }

  // HUD
  ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(12,canvas.height-72,380,64);
  ctx.fillStyle='#fff'; ctx.font='14px system-ui'; ctx.fillText('Magier',22,canvas.height-46);
  ctx.fillStyle=player.abilities.q? '#666':'#6f9'; ctx.fillRect(22,canvas.height-36,80,8);
  ctx.fillStyle=player.abilities.e? '#666':'#6f9'; ctx.fillRect(110,canvas.height-36,80,8);
  ctx.fillStyle=player.abilities.x? '#666':'#6f9'; ctx.fillRect(198,canvas.height-36,80,8);
}

function drawHumanoid(x,y,color){
  ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y-12,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#184'; ctx.fillRect(x-10,y-6,20,28);
}

function mageCone(){ for(let i=0;i<8;i++){ const a=player.dir+(Math.random()-0.5)*0.6; projectiles.push({x:player.x+Math.cos(a)*12, y:player.y+Math.sin(a)*12, vx:Math.cos(a)*420, vy:Math.sin(a)*420, life:0.45, color:'#f60'}); sendSpell('cone',player.x,player.y,player.dir); } }
function mageFireball(){ const a=player.dir; projectiles.push({x:player.x,y:player.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:2,color:'#f80'}); sendSpell('fireball',player.x,player.y,player.dir);}
function mageMeteor(){ for(let i=0;i<6;i++){ const tx=player.x+(Math.random()-0.5)*400; const ty=player.y-400+Math.random()*60; projectiles.push({x:tx,y:ty,vx:0,vy:420,life:3,color:'orange'}); sendSpell('meteor',tx,ty,0); } }

let last=performance.now(); function loop(t){ const dt=Math.min((t-last)/1000,0.04); last=t; update(dt); draw(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
