import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.14;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#a9b5ad'); scene.fog = new THREE.Fog('#a9b5ad', 130, 510);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, .1, 900); const clock = new THREE.Clock();
const hemi = new THREE.HemisphereLight('#e4e6d9', '#69745b', 2); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff0d6', 3.1); sun.position.set(-115,150,100); sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-180,right:180,top:180,bottom:-180}); sun.shadow.bias=-.0005; sun.shadow.normalBias=.035; scene.add(sun);
const mat=(color,roughness=.86,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1300,1300),mat('#78836a')); ground.rotation.x=-Math.PI/2; ground.position.y=-.13; ground.receiveShadow=true; scene.add(ground);
const roadCurve=new THREE.CatmullRomCurve3([
 new THREE.Vector3(-4,0,145),new THREE.Vector3(2,0,86),new THREE.Vector3(22,0,43),new THREE.Vector3(67,0,12),new THREE.Vector3(112,0,-6),new THREE.Vector3(136,0,-52),new THREE.Vector3(119,0,-104),new THREE.Vector3(67,0,-132),new THREE.Vector3(9,0,-123),new THREE.Vector3(-49,0,-98),new THREE.Vector3(-102,0,-61),new THREE.Vector3(-125,0,-15),new THREE.Vector3(-108,0,31),new THREE.Vector3(-63,0,76),new THREE.Vector3(-34,0,116)],true,'catmullrom',.25);
function makeStrip(width,material,y,segments=600){const v=[],idx=[];for(let i=0;i<=segments;i++){const t=i/segments,p=roadCurve.getPointAt(t),d=roadCurve.getTangentAt(t).normalize(),s=new THREE.Vector3(d.z,0,-d.x).normalize();for(const sign of [-1,1])v.push(p.x+s.x*width*sign/2,y,p.z+s.z*width*sign/2);if(i<segments){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.receiveShadow=true;m.frustumCulled=false;scene.add(m)}
makeStrip(17.2,mat('#827e6c'),-.025);makeStrip(14.4,mat('#414542',1),.005);
const lineMat=mat('#d4c8a9',.78); makeStrip(.2,mat('#7b786d',.9),.013);
for(let i=0;i<154;i++){const p=roadCurve.getPointAt(i/154),d=roadCurve.getTangentAt(i/154).normalize(),dash=new THREE.Mesh(new THREE.BoxGeometry(.14,.025,2.4),lineMat);dash.position.set(p.x,.035,p.z);dash.rotation.y=Math.atan2(d.x,d.z);scene.add(dash)}
for(const sign of [-1,1]){const v=[],idx=[],N=600;for(let i=0;i<=N;i++){const p=roadCurve.getPointAt(i/N),d=roadCurve.getTangentAt(i/N).normalize(),s=new THREE.Vector3(d.z,0,-d.x).normalize();for(let j=0;j<2;j++)v.push(p.x+s.x*sign*(6.6+j*.18),.024,p.z+s.z*sign*(6.6+j*.18));if(i<N){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();scene.add(new THREE.Mesh(g,lineMat))}
// Soft distant hills in muted valley colors.
for(let ring=0;ring<2;ring++){const hm=mat(ring?'#788671':'#899681');for(let i=0;i<15;i++){const a=i/15*Math.PI*2+ring*.15,r=ring?340:280,s=50+((i*17+ring*9)%46),m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),hm);m.position.set(Math.cos(a)*r,13+(i%3)*4,Math.sin(a)*r-15);m.scale.set(s*1.7,s*.72,s);scene.add(m)}}
const treeMats=['#495e48','#58694d','#657451','#78805c'].map(c=>mat(c)),trunkMat=mat('#594b39');let seed=937;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function makeTree(x,z,scale=1,variant=0){const tree=new THREE.Group();tree.position.set(x,0,z);tree.scale.setScalar(scale);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.22,2.3,6),trunkMat);trunk.position.y=1.05;trunk.castShadow=true;tree.add(trunk);if(variant%3===0){for(let i=0;i<3;i++){const cone=new THREE.Mesh(new THREE.ConeGeometry(1.05-i*.16,2.25,7),treeMats[(variant+i)%4]);cone.position.y=2.05+i*.85;cone.castShadow=true;tree.add(cone)}}else{const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.05,1),treeMats[variant%4]);crown.position.y=3;crown.scale.set(1,1.12,1);crown.castShadow=true;tree.add(crown)}scene.add(tree)}
for(let i=0;i<175;i++){const t=(i/175+rand()*.004)%1,p=roadCurve.getPointAt(t),d=roadCurve.getTangentAt(t),s=new THREE.Vector3(d.z,0,-d.x).normalize();for(const sign of [-1,1]){const n=13+rand()*33;makeTree(p.x+s.x*n*sign,p.z+s.z*n*sign,.7+rand()*.8,Math.floor(rand()*7))}}
for(let i=0;i<140;i++){const x=(rand()-.5)*700,z=(rand()-.5)*700;if(Math.hypot(x,z)>160)makeTree(x,z,.65+rand()*.8,Math.floor(rand()*7))}
const wallMats=['#8c8877','#aa9e85','#727c6a','#b6a58a'].map(c=>mat(c)),roofMats=['#625f55','#725c4a','#555c54'].map(c=>mat(c));
function makeHouse(x,z,rotation=0,scale=1,kind=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;g.scale.setScalar(scale);const w=kind===0?8:10,h=kind===0?4.2:5;const base=new THREE.Mesh(new THREE.BoxGeometry(w,h,w*.78),wallMats[(kind+Math.floor(rand()*4))%4]);base.position.y=h/2;base.castShadow=true;base.receiveShadow=true;g.add(base);const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.77,3.2,4),roofMats[Math.floor(rand()*3)]);roof.rotation.y=Math.PI/4;roof.position.y=h+1.25;roof.scale.z=.78;roof.castShadow=true;g.add(roof);const door=new THREE.Mesh(new THREE.BoxGeometry(1.15,2.5,.15),mat('#504d42'));door.position.set(0,1.25,w*.395);g.add(door);for(const wx of [-2.4,2.4]){const win=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.1,.12),mat('#b7b2a1',.35));win.position.set(wx,2.7,w*.395+.04);g.add(win)}g.traverse(o=>{if(o.isMesh)o.receiveShadow=true});scene.add(g)}
makeHouse(26,34,-.34,1.4,0);makeHouse(39,43,.2,1.1,1);makeHouse(-21,33,-.1,1.05,0);makeHouse(72,-28,.5,1.3,1);
const fenceMat=mat('#83745c');for(const [x,z,n] of [[4,29,22],[52,33,24],[-34,45,18]]){for(let i=0;i<=n;i+=2.3){const p=new THREE.Mesh(new THREE.BoxGeometry(.12,1.15,.12),fenceMat);p.position.set(x+i,.55,z);p.castShadow=true;scene.add(p)}for(const y of [.42,.84]){const rail=new THREE.Mesh(new THREE.BoxGeometry(n,.12,.09),fenceMat);rail.position.set(x+n/2,y,z);scene.add(rail)}}
const vehicleCatalog=[{name:'FIELD COUPE',desc:'A little grit. A lot of character.',color:'#a9593e',kind:'coupe',max:58,width:1.88,length:4.15,height:1.28},{name:'TRAIL WAGON',desc:'Room for the long way around.',color:'#65765c',kind:'wagon',max:49,width:1.94,length:4.65,height:1.52},{name:'RIVER GT',desc:'Old soul. Open stretches.',color:'#c0a36f',kind:'gt',max:66,width:1.92,length:4.45,height:1.22},{name:'MILEPOST 4X4',desc:'When the pavement runs out.',color:'#59666a',kind:'suv',max:46,width:2.05,length:4.25,height:1.62}];
const carRoot=new THREE.Group();scene.add(carRoot);let car=new THREE.Group();carRoot.add(car);let wheelRoll=[],selected=0;
function box(parent,size,color,pos,options={}){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color,options.roughness??.52,options));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function buildCar(index){const spec=vehicleCatalog[index];selected=index;carRoot.remove(car);car=new THREE.Group();carRoot.add(car);wheelRoll=[];const c=spec.color;
 box(car,[spec.width,.47,spec.length],c,[0,.6,0],{roughness:.38,metalness:.18});box(car,[spec.width*.93,.26,spec.length*.72],c,[0,.85,-.05],{roughness:.4,metalness:.15});
 const cab=spec.kind==='wagon'?2:spec.kind==='suv'?1.85:1.6;const cabin=new THREE.Mesh(new THREE.BoxGeometry(spec.width*.77,spec.height*.57,cab),mat('#343c3a',.36,{metalness:.12}));cabin.position.set(0,1.28+(spec.height-1.28)*.17,-.22);cabin.castShadow=true;car.add(cabin);
 const glass=new THREE.Mesh(new THREE.BoxGeometry(spec.width*.72,.42,cab*.76),new THREE.MeshStandardMaterial({color:'#8b9b99',metalness:.27,roughness:.2,transparent:true,opacity:.76}));glass.position.set(0,1.34+(spec.height-1.28)*.17,-.19);car.add(glass);
 box(car,[spec.width*.91,.1,.32],'#302f2b',[0,.37,spec.length*.42]);box(car,[spec.width*.91,.1,.32],'#302f2b',[0,.37,-spec.length*.42]);
 for(const x of [-spec.width*.36,spec.width*.36]){const h=new THREE.Mesh(new THREE.BoxGeometry(.33,.16,.08),new THREE.MeshStandardMaterial({color:'#eee1b9',emissive:'#251d11',emissiveIntensity:.3}));h.position.set(x,.78,spec.length*.5);car.add(h);const t=new THREE.Mesh(new THREE.BoxGeometry(.3,.15,.08),mat('#8c4033',.35));t.position.set(x,.76,-spec.length*.5);car.add(t)}
 box(car,[spec.width*.44,.1,.06],'#48483e',[0,.65,spec.length*.505]);const wm=mat('#252725',.95),hm=mat('#9c9788',.43,{metalness:.55});
 for(const z of [-spec.length*.31,spec.length*.31])for(const x of [-spec.width*.53,spec.width*.53]){const p=new THREE.Group();p.position.set(x,.43,z);car.add(p);const w=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.25,12),wm);w.rotation.z=Math.PI/2;w.castShadow=true;p.add(w);const h=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.26,10),hm);h.rotation.z=Math.PI/2;p.add(h);wheelRoll.push({wheel:w,pivot:p,front:z>0})}
 for(const x of [-1,1]){const mirror=new THREE.Mesh(new THREE.BoxGeometry(.24,.12,.23),mat(c,.45));mirror.position.set(x*spec.width*.56,1.12,.65);car.add(mirror)}
 document.querySelector('#car-name').textContent=spec.name;document.querySelector('#car-description').textContent=spec.desc;document.querySelector('#car-index').textContent=`0${index+1}`;
 document.querySelector('#swatches').innerHTML=vehicleCatalog.map((v,i)=>`<button aria-label="${v.name}" class="swatch" data-car="${i}" style="background:${v.color};${i===index?'outline:1px solid #fff;outline-offset:3px':''}"></button>`).join('');document.querySelectorAll('.car-option').forEach((el,i)=>el.classList.toggle('active',i===index));document.querySelectorAll('.swatch').forEach(el=>el.addEventListener('click',()=>chooseCar(+el.dataset.car)))}
const picker=document.querySelector('#car-picker');vehicleCatalog.forEach((v,i)=>{const b=document.createElement('button');b.className='car-option';b.textContent=`0${i+1}`;b.setAttribute('aria-label',v.name);b.onclick=()=>chooseCar(i);picker.appendChild(b)});
function chooseCar(i){if(i===selected)return;buildCar(i);state.speed=Math.min(state.speed,14);toast(`${vehicleCatalog[i].name} SELECTED`)}
buildCar(0);

const state={speed:0,yaw:0,started:false,paused:false,sound:true,keys:new Set(),touch:new Set(),elapsed:0};
const forward=new THREE.Vector3(),right=new THREE.Vector3(),cameraTarget=new THREE.Vector3();
const spawn=roadCurve.getPointAt(.012),spawnTan=roadCurve.getTangentAt(.012).normalize();carRoot.position.set(spawn.x,0,spawn.z);state.yaw=Math.atan2(spawnTan.x,spawnTan.z);carRoot.rotation.y=state.yaw;
function quality(name){const cfg={low:{ratio:1,shadows:false,size:512,far:95},medium:{ratio:1.15,shadows:true,size:768,far:145},high:{ratio:1.6,shadows:true,size:1024,far:200},ultra:{ratio:2,shadows:true,size:2048,far:260}}[name];renderer.setPixelRatio(Math.min(devicePixelRatio||1,cfg.ratio));renderer.shadowMap.enabled=cfg.shadows;sun.castShadow=cfg.shadows;sun.shadow.mapSize.set(cfg.size,cfg.size);sun.shadow.camera.far=cfg.far;sun.shadow.needsUpdate=true;renderer.setSize(innerWidth,innerHeight);localStorage.setItem('countryline-quality',name)}
const qualitySelect=document.querySelector('#quality-select');qualitySelect.value=localStorage.getItem('countryline-quality')||'high';quality(qualitySelect.value);qualitySelect.addEventListener('change',()=>quality(qualitySelect.value));
const settingsModal=document.querySelector('#settings-modal');function openSettings(){settingsModal.classList.add('open');settingsModal.setAttribute('aria-hidden','false')}function closeSettings(){settingsModal.classList.remove('open');settingsModal.setAttribute('aria-hidden','true')}
document.querySelector('#settings-button').addEventListener('click',openSettings);document.querySelector('#close-settings').addEventListener('click',closeSettings);settingsModal.addEventListener('click',e=>{if(e.target===settingsModal)closeSettings()});
document.querySelector('#sound-toggle').addEventListener('click',e=>{state.sound=!state.sound;e.currentTarget.classList.toggle('on',state.sound);e.currentTarget.setAttribute('aria-pressed',String(state.sound));if(engineGain)engineGain.gain.setTargetAtTime(state.sound?.012:0,audioCtx.currentTime,.15)});
let audioCtx,engineGain,engineOsc;function startEngineAudio(){if(audioCtx||!state.sound)return;try{audioCtx=new AudioContext();engineOsc=audioCtx.createOscillator();engineGain=audioCtx.createGain();engineOsc.type='triangle';engineOsc.frequency.value=48;engineGain.gain.value=.012;engineOsc.connect(engineGain);engineGain.connect(audioCtx.destination);engineOsc.start()}catch(_){}}
function startDriving(){state.started=true;state.paused=false;state.speed=0;document.querySelector('#garage-screen').classList.add('hidden');document.querySelector('#hud').classList.add('active');document.querySelector('#controls-hint').classList.add('active');document.querySelector('#touch-controls').classList.toggle('active',matchMedia('(pointer:coarse)').matches||innerWidth<850);startEngineAudio();closeSettings()}
document.querySelector('#drive-button').addEventListener('click',startDriving);document.querySelector('#resume-button').addEventListener('click',()=>{state.paused=false;document.querySelector('#pause-chip').classList.remove('show')});
function backToGarage(){state.started=false;state.paused=false;state.speed=0;document.querySelector('#garage-screen').classList.remove('hidden');document.querySelector('#hud').classList.remove('active');document.querySelector('#controls-hint').classList.remove('active');document.querySelector('#touch-controls').classList.remove('active');document.querySelector('#pause-chip').classList.remove('show')}
let toastTimer;function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1500)}
function setKey(code,down){if(down)state.keys.add(code);else state.keys.delete(code)}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='Escape'||e.code==='KeyP'){if(settingsModal.classList.contains('open'))closeSettings();else if(state.started){state.paused=!state.paused;document.querySelector('#pause-chip').classList.toggle('show',state.paused)}return}if(e.code==='KeyG'&&state.started){backToGarage();return}setKey(e.code,true)});window.addEventListener('keyup',e=>setKey(e.code,false));window.addEventListener('blur',()=>{state.keys.clear();state.touch.clear()});
document.querySelectorAll('.touch-controls button').forEach(b=>{const c=b.dataset.control,down=e=>{e.preventDefault();state.touch.add(c);b.setPointerCapture?.(e.pointerId)},up=e=>{e.preventDefault();state.touch.delete(c)};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up)});
function active(...codes){return codes.some(c=>state.keys.has(c))}function isDown(...cs){return cs.some(c=>state.touch.has(c))}
function updateDriving(dt){if(!state.started||state.paused||settingsModal.classList.contains('open'))return;dt=Math.min(dt,.04);const accel=active('KeyW','ArrowUp')||isDown('up'),brake=active('KeyS','ArrowDown')||isDown('down'),left=active('KeyA','ArrowLeft')||isDown('left'),rightKey=active('KeyD','ArrowRight')||isDown('right'),spec=vehicleCatalog[selected];if(accel)state.speed+=(state.speed<0?21:11.5)*dt;else if(brake)state.speed-=(state.speed>0?27:6.5)*dt;else state.speed*=Math.exp(-.4*dt);if(active('Space')||isDown('brake'))state.speed*=Math.exp(-3.2*dt);state.speed=THREE.MathUtils.clamp(state.speed,-9,spec.max);const steer=(rightKey?1:0)-(left?1:0),factor=Math.min(Math.abs(state.speed)/8,1);state.yaw+=steer*(1.25-Math.min(Math.abs(state.speed)/70,.62))*factor*Math.sign(state.speed||1)*dt;carRoot.rotation.y=state.yaw;forward.set(Math.sin(state.yaw),0,Math.cos(state.yaw));carRoot.position.addScaledVector(forward,state.speed*dt);carRoot.position.y=0;for(const w of wheelRoll){w.wheel.rotation.x+=state.speed*dt/.39;w.pivot.rotation.y=w.front?-steer*.22:0}
 const kmh=Math.round(Math.abs(state.speed)*3.6);document.querySelector('#speed').textContent=String(kmh).padStart(3,'0');document.querySelector('#speed-meter').style.width=`${Math.min(kmh/(spec.max*3.6)*100,100)}%`;document.querySelector('#gear').textContent=state.speed<-.3?'R':state.speed>.5?(kmh>48?'3':kmh>20?'2':'1'):'P';document.querySelector('#drive-label').textContent=state.speed<-.3?'REVERSING':state.speed>.5?'IN MOTION':'PARKED';if(engineOsc&&audioCtx){engineOsc.frequency.setTargetAtTime(45+Math.abs(state.speed)*2.2,audioCtx.currentTime,.08);engineGain.gain.setTargetAtTime(state.sound?.009+Math.min(Math.abs(state.speed)/900,.016):0,audioCtx.currentTime,.1)}document.querySelector('#location-name').textContent=carRoot.position.z < -58?'RIVER CUT':carRoot.position.x>82?'EAST MEADOW':carRoot.position.x< -70?'PINE RIDGE':'NORTH VALLEY'}

const cameraOffset=new THREE.Vector3();
function updateCamera(dt){
  const moving=state.started;
  const distance=moving?10.5:12.5;
  const height=moving?5.1:5.7;
  forward.set(Math.sin(state.yaw),0,Math.cos(state.yaw));
  cameraOffset.set(-forward.x*distance,height,-forward.z*distance);
  cameraTarget.copy(carRoot.position).add(cameraOffset);
  const blend=state.elapsed===0?1:1-Math.exp(-Math.min(dt,.05)*(moving?3.8:2.2));
  camera.position.lerp(cameraTarget,blend);
  const lookAhead=moving?5:0;
  cameraTarget.copy(carRoot.position).addScaledVector(forward,lookAhead);
  cameraTarget.y+=moving?1.05:1.15;
  camera.lookAt(cameraTarget);
}

function resize(){
  const width=window.innerWidth,height=window.innerHeight;
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width,height);
}
window.addEventListener('resize',resize);

function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(clock.getDelta(),.05);
  state.elapsed+=dt;
  updateDriving(dt);
  updateCamera(dt);
  renderer.render(scene,camera);
}
resize();
updateCamera(1);
frame();
