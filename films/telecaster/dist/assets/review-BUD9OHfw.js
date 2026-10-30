import{O as q,l as A,m as I,b as W,c as B}from"./model-9lvc8o6N.js";import{P as O,W as T}from"./GLTFLoader-BoWxWGcr.js";import{Y as S,M as v,a0 as k,S as _,a1 as F,n as h,C as g,P as H,a2 as V,m as N,i as J,p as K,K as U,J as Y}from"./three.core-CKNa_xcx.js";function Q(e){const t=new S,a=new v(new k(10,64,32),new _({side:F,uniforms:{},vertexShader:"varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec3 vDir;
        void main() {
          float y = vDir.y;
          vec3 zenith = vec3(0.55, 0.68, 0.95) * 1.5, haze = vec3(1.3, 1.25, 1.15);
          vec3 leaves = vec3(0.05, 0.07, 0.035), ground = vec3(0.10, 0.06, 0.045);
          // a band of dark foliage from the horizon up to about 20 degrees, bright sky above it, tiled
          // terracotta below (as in the reference photos' balcony)
          vec3 sky = mix(haze, zenith, smoothstep(0.3, 0.9, y));
          vec3 c = y > 0.0 ? mix(leaves, sky, smoothstep(0.26, 0.36, y + 0.04 * sin(atan(vDir.z, vDir.x) * 7.0)))
                           : mix(ground * 1.4, ground, smoothstep(0.0, 0.5, -y));
          gl_FragColor = vec4(c, 1.0);
        }`}));t.add(a);const s=new v(new k(.55,16,8),new h({color:new g(28,25,20)}));s.position.set(-4,6,6),t.add(s);const m=new v(new H(3,4),new h({color:new g(2.2,2.1,2),side:V}));m.position.set(7,1.5,2),m.lookAt(0,0,0),t.add(m);const j=new h({color:724232});for(let c=0;c<9;c++){const y=c/9*Math.PI*2+.3,u=new v(new N(.5+c%3*.4,3+c%2*2,.4),j);u.position.set(Math.cos(y)*8,.5,Math.sin(y)*8),u.lookAt(0,.5,0),t.add(u)}const x=new O(e),G=x.fromScene(t,.02).texture;return x.dispose(),G}const r=.0254,b=new URLSearchParams(location.search),l=document.getElementById("stage"),i=new T({canvas:l,antialias:!0});i.setPixelRatio(Math.min(devicePixelRatio,2));i.toneMapping=J;i.toneMappingExposure=1;i.outputColorSpace=K;const n=new S;n.background=new g(1907481);n.environment=Q(i);n.environmentIntensity=.6;const z=new U(16774374,1.8);z.position.set(-.8,1.2,1.6);n.add(z);const p=new Y(28,1,.005,20),f=new q(p,l);f.enableDamping=!0;const{guitar:w,parts:X}=await A();n.add(w);const E=I(),P=new Map;w.traverse(e=>{e.isMesh&&P.set(e,e.material)});W(w,E);const C=new Map;w.traverse(e=>{e.isMesh&&C.set(e,e.material)});const D={front:[[0,2.5,1],[0,0,82]],bridge:[[.6,-9.6,2],[-2,-6,9]],controls:[[3.6,-10.4,2],[7,-5,5.5]],headstock:[[0,18.8,1.8],[-1.2,1,10]],edge:[[-5.6,-11.5,1.4],[-7,-4,6]],back:[[0,2.5,.4],[0,0,-82]],"bridge pu":[[.1,-8.8,2],[-.6,-2.4,4.6]],saddles:[[0,-10.25,2.05],[-1.1,-2.9,2.2]],"neck pu":[[0,-3.7,2],[1.4,-3.4,3.4]]};function L(e){const[t,a]=D[e];f.target.set(t[0]*r,t[1]*r,t[2]*r),p.position.set((t[0]+a[0])*r,(t[1]+a[1])*r,(t[2]+a[2])*r),f.update();for(const s of document.querySelectorAll("[data-view]"))s.setAttribute("aria-pressed",String(s.dataset.view===e))}const o=document.createElement("aside");o.id="review";o.innerHTML=`
  <h1>Materials · gate D1</h1>
  <p>The approved model with its finishes, under plain daylight. Compare with the reference photos below.</p>
  <div class="row views">${Object.keys(D).map(e=>`<button data-view="${e}">${e}</button>`).join("")}</div>
  <label class="slider">Wear <span id="wear-val">0.25</span>
    <input id="wear" type="range" min="0" max="1" step="0.01" value="0.25"></label>
  <label class="check"><input id="finished" type="checkbox" checked> Finished materials (off = placeholders)</label>
  <div class="refs" id="refs"></div>`;document.body.append(o);const R=document.createElement("style");R.textContent=`
  #review { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; overflow-y: auto; box-sizing: border-box; padding: 16px;
    background: #24211e; color: #ece6dc; font: 13px/1.45 system-ui, sans-serif; border-right: 1px solid #3a352f; }
  #review h1 { font-size: 15px; margin: 0 0 6px; } #review p { margin: 0 0 12px; color: #b3a99a; }
  #review .views { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px; }
  #review button { font: inherit; color: inherit; background: none; border: 1px solid #4a443c; border-radius: 4px; padding: 6px 0; cursor: pointer; text-transform: capitalize; }
  #review button[aria-pressed="true"] { border-color: #e0a54f; color: #e0a54f; }
  #review button:focus-visible, #review input:focus-visible { outline: 2px solid #e0a54f; outline-offset: 2px; }
  #review .slider, #review .check { display: block; margin: 0 0 12px; } #review input[type=range] { width: 100%; accent-color: #e0a54f; }
  #review .refs figure { margin: 0 0 12px; } #review .refs img { width: 100%; display: block; border-radius: 3px; }
  #review .refs figcaption { font-size: 11px; color: #9c9284; margin-top: 3px; }
  #stage { left: 280px !important; width: calc(100% - 280px) !important; }
  @media (max-width: 720px) { #review { width: 100%; top: auto; height: 40vh; border-right: 0; border-top: 1px solid #3a352f; }
    #stage { left: 0 !important; width: 100% !important; height: 60% !important; } }`;document.head.append(R);for(const e of o.querySelectorAll("[data-view]"))e.addEventListener("click",()=>L(e.dataset.view));const d=o.querySelector("#wear");d.addEventListener("input",()=>{B(E,+d.value),o.querySelector("#wear-val").textContent=(+d.value).toFixed(2)});o.querySelector("#finished").addEventListener("change",e=>{for(const[t,a]of e.target.checked?C:P)t.material=a});fetch("./refs/credits.json").then(e=>e.ok?e.json():[]).then(e=>{o.querySelector("#refs").innerHTML=e.map(t=>`<figure><img src="./refs/${t.file}" alt="Reference: ${t.file}" loading="lazy">
    <figcaption>${t.author}, ${t.licence}${t.note?" · "+t.note:""} · reference only</figcaption></figure>`).join("")}).catch(()=>{});const M=b.get("wear");M!==null&&(d.value=M,d.dispatchEvent(new Event("input")));L(b.get("view")||"front");function $(){const e=l.clientWidth,t=l.clientHeight;i.setSize(e,t,!1),p.aspect=e/t,p.updateProjectionMatrix()}new ResizeObserver($).observe(l);$();i.setAnimationLoop(()=>{f.update(),i.render(n,p)});window.__telecaster={parts:X.size,view:b.get("view")||"front"};
