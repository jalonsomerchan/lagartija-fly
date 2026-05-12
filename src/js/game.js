import {GAME,LEVELS} from './config.js';

const img=new Image();img.src='/src/assets/lagartija.gif';
const rnd=(a,b)=>a+Math.random()*(b-a);
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

export class Game{
  constructor(canvas,ui){this.c=canvas;this.x=canvas.getContext('2d');this.ui=ui;this.best=+localStorage.getItem('lf-best')||0;this.bind();this.resize();addEventListener('resize',()=>this.resize(),{passive:true})}
  bind(){let y=0;this.c.addEventListener('pointerdown',e=>{y=e.clientY},{passive:true});this.c.addEventListener('pointerup',e=>{const d=e.clientY-y;if(Math.abs(d)>GAME.swipe)this.flap(d<0?-1:1)},{passive:true})}
  resize(){const d=devicePixelRatio||1,r=this.c.getBoundingClientRect();this.w=r.width;this.h=r.height;this.c.width=r.width*d;this.c.height=r.height*d;this.x.setTransform(d,0,0,d,0,0)}
  start(level){this.level=LEVELS[level];this.t=0;this.last=0;this.spawn=0;this.dead=false;this.obs=[];this.coins=[];this.l={x:this.w*GAME.lizard.x,y:this.h*.48,w:GAME.lizard.w,h:GAME.lizard.h,v:0,tilt:0};this.s={score:0,coins:0,best:this.best};this.ui.setHud(this.s);this.ui.hide();requestAnimationFrame(t=>this.loop(t))}
  flap(dir){if(!this.l||this.dead)return;this.l.v=dir<0?this.level.lift:Math.abs(this.level.lift)*.72;this.l.tilt=dir<0?-.28:.3}
  loop(now){if(this.dead)return;const dt=Math.min(32,now-(this.last||now));this.last=now;this.t+=dt;this.update(dt);this.draw();requestAnimationFrame(t=>this.loop(t))}
  update(dt){const k=dt/16.67,hard=1+this.t/36000,speed=this.level.speed*hard;this.l.v=Math.min(GAME.maxFall,this.l.v+this.level.gravity*k);this.l.y+=this.l.v*k;this.l.tilt+=(this.l.v*.045-this.l.tilt)*.09;this.spawn-=dt;if(this.spawn<=0){this.addSet(hard);this.spawn=Math.max(560,this.level.spawn-(hard-1)*230)}[this.obs,this.coins].forEach(list=>list.forEach(o=>o.x-=speed*k));this.obs=this.obs.filter(o=>o.x+o.w>-40);this.coins=this.coins.filter(o=>!o.got&&o.x+o.w>-40);const box={x:this.l.x+10,y:this.l.y+8,w:this.l.w-18,h:this.l.h-16};if(this.l.y<28||this.l.y+this.l.h>this.h-28||this.obs.some(o=>hit(box,o)))return this.end();for(const c of this.coins){if(hit(box,c)){c.got=true;this.s.coins++;this.s.score+=GAME.coin.value;this.ui.flashCoins()}}this.s.score+=dt*.01;this.s.best=Math.max(this.best,this.s.score|0);this.ui.setHud(this.s)}
  addSet(hard){const gap=Math.max(104,this.level.gap-(hard-1)*28),top=rnd(82,this.h-gap-116),w=rnd(54,76);this.obs.push({x:this.w+40,y:0,w,h:top,type:'top'},{x:this.w+40,y:top+gap,w,h:this.h-top-gap,type:'bottom'});if(Math.random()>.18)this.coins.push({x:this.w+62,y:top+gap*.5-12,w:24,h:24,r:GAME.coin.r,spin:0})}
  end(){this.dead=true;this.best=Math.max(this.best,this.s.score|0);localStorage.setItem('lf-best',this.best);this.s.best=this.best;this.ui.setHud(this.s);this.ui.showEnd(this.s)}
  draw(){const x=this.x,w=this.w,h=this.h,t=this.t*.001;x.clearRect(0,0,w,h);this.sky(x,w,h,t);for(const o of this.obs)this.log(x,o);for(const c of this.coins)this.coin(x,c,t);this.lizard(x,t)}
  sky(x,w,h,t){x.fillStyle='#82ddff';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.72)';for(let i=0;i<5;i++){const cx=(w-((t*22+i*132)% (w+160)))+60,cy=80+i%3*76;x.beginPath();x.ellipse(cx,cy,42,16,0,0,7);x.ellipse(cx+32,cy+4,28,13,0,0,7);x.fill()}x.fillStyle='#5fbd57';x.fillRect(0,h-34,w,34);x.fillStyle='rgba(255,255,255,.22)';x.fillRect(0,h-38,w,5)}
  log(x,o){const g=x.createLinearGradient(o.x,o.y,o.x+o.w,o.y);g.addColorStop(0,'#6a3d25');g.addColorStop(.5,'#9b6035');g.addColorStop(1,'#57331f');x.fillStyle=g;x.beginPath();x.roundRect(o.x,o.y,o.w,o.h,14);x.fill();x.fillStyle='rgba(255,255,255,.18)';x.fillRect(o.x+8,o.y+8,7,Math.max(0,o.h-16))}
  coin(x,c,t){c.spin+=.1;x.save();x.translate(c.x+12,c.y+12);x.scale(Math.max(.32,Math.cos(t*6+c.x*.02)),1);x.fillStyle='#ffcf33';x.beginPath();x.arc(0,0,12,0,7);x.fill();x.strokeStyle='#fff2a8';x.lineWidth=3;x.stroke();x.fillStyle='#b77900';x.font='900 13px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText('€',0,1);x.restore()}
  lizard(x){x.save();x.translate(this.l.x+this.l.w/2,this.l.y+this.l.h/2);x.rotate(this.l.tilt);if(img.complete)x.drawImage(img,-this.l.w/2,-this.l.h/2,this.l.w,this.l.h);else{x.fillStyle='#3fb869';x.beginPath();x.ellipse(0,0,31,21,0,0,7);x.fill()}x.restore()}
}
