import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Gamepad2, X, Play, Plus, Users, Sparkles, RotateCcw, MapPin, Instagram, Facebook, Music2, ChevronRight, Volume2, VolumeX, Trophy, WalletCards, Share2, CreditCard, QrCode, Smartphone, Crown, LoaderCircle, ArrowLeft, Camera, LockKeyhole, ReceiptText, UserRound, Mail, CheckCircle2} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import './index.css';

const menu = [
  {id:'matin', short:'Matin', name:'Le matin', note:'Servi chaque jour jusqu’à 12h', dishes:[
    {n:'Toast Juvia',d:'Pain au levain, avocat citronné, œuf parfait, feta et graines torréfiées.',p:68},
    {n:'Croissant Bénédicte',d:'Croissant pur beurre, saumon fumé, œufs pochés et sauce hollandaise.',p:79},
    {n:'Granola Maison',d:'Yaourt grec, granola croustillant au miel et fruits frais de saison.',p:52},
    {n:'Shakshuka',d:'Œufs, tomates mijotées, poivrons, feta et pain toasté.',p:64},
    {n:'Pancakes Nuage',d:'Pancakes moelleux, fruits rouges, sirop d’érable et crème vanillée.',p:62},
    {n:'Petit-déjeuner Juvia',d:'Œufs au choix, viennoiserie, pain, fromage, jus frais et boisson chaude.',p:95}
  ]},
  {id:'entrees', short:'Entrées', name:'Entrées', note:'À picorer ou à partager', dishes:[
    {n:'Burrata solaire',d:'Burrata crémeuse, tomates confites, pesto basilic et focaccia grillée.',p:76},
    {n:'Tacos crevettes',d:'Crevettes croustillantes, mangue, chou frais et mayonnaise chili.',p:72},
    {n:'Croustillants feta',d:'Feta en feuille de brick, miel de thym et sésame torréfié.',p:58},
    {n:'Houmous Juvia',d:'Pois chiches, tahini, huile d’olive, herbes fraîches et pain chaud.',p:48},
    {n:'Calamars dorés',d:'Calamars croustillants, citron frais et aïoli maison.',p:74},
    {n:'Tartare de saumon',d:'Saumon frais, avocat, agrumes, sésame et chips de riz.',p:82}
  ]},
  {id:'salades', short:'Salades', name:'Salades & bowls', note:'Fraîches, colorées, généreuses', dishes:[
    {n:'César Juvia',d:'Poulet grillé, romaine, parmesan, croûtons et sauce César maison.',p:78},
    {n:'Green Bowl',d:'Quinoa, avocat, edamame, concombre, légumes croquants et sauce sésame.',p:74},
    {n:'Salade Riviera',d:'Thon mi-cuit, œuf, tomates, haricots verts et olives marinées.',p:86},
    {n:'Burrata Bowl',d:'Roquette, burrata, tomates cerises, pêches grillées et pistaches.',p:82},
    {n:'Chicken Crunch',d:'Poulet croustillant, chou, carotte, avocat et vinaigrette asiatique.',p:80},
    {n:'Falafel Bowl',d:'Falafels maison, houmous, boulgour, crudités et sauce yaourt menthe.',p:70}
  ]},
  {id:'plats', short:'Plats', name:'Plats signatures', note:'La cuisine solaire de Juvia', dishes:[
    {n:'Saumon laqué',d:'Pavé de saumon, laque miso douce, riz parfumé et légumes rôtis.',p:128},
    {n:'Suprême fermier',d:'Poulet fermier, purée fumée, champignons et jus réduit au thym.',p:112},
    {n:'Pasta verde',d:'Pappardelle, pesto de pistache, stracciatella et citron confit.',p:96},
    {n:'Filet de bœuf',d:'Filet grillé, pommes grenailles, légumes verts et sauce au poivre.',p:165},
    {n:'Risotto safrané',d:'Riz arborio, crevettes, parmesan, safran et huile d’herbes.',p:118},
    {n:'Linguine de la mer',d:'Linguine, calamars, crevettes, moules et sauce tomate relevée.',p:124}
  ]},
  {id:'burgers', short:'Burgers', name:'Burgers', note:'Servis avec frites maison', dishes:[
    {n:'Juvia Smash',d:'Double bœuf smashé, cheddar affiné, pickles et sauce secrète.',p:92},
    {n:'Crispy Chicken',d:'Poulet croustillant, coleslaw, cheddar et mayonnaise épicée.',p:86},
    {n:'Garden Burger',d:'Galette végétale, cheddar maturé, avocat et sauce aux herbes.',p:82},
    {n:'Truffle Burger',d:'Bœuf, comté, champignons, roquette et crème légère à la truffe.',p:108},
    {n:'Blue Cheese',d:'Bœuf grillé, fromage bleu, oignons confits et noix caramélisées.',p:99},
    {n:'Mini Smash',d:'Petit burger bœuf, cheddar et sauce maison, pour les petits appétits.',p:62}
  ]},
  {id:'desserts', short:'Douceurs', name:'Douceurs', note:'Gardez toujours une place', dishes:[
    {n:'Pistache Cloud',d:'Biscuit moelleux, crème légère pistache, framboise et praliné.',p:62},
    {n:'Pain perdu',d:'Brioche caramélisée, sauce caramel et glace vanille de Madagascar.',p:58},
    {n:'Choco Juvia',d:'Chocolat noir, cœur coulant, noisettes et fleur de sel.',p:64},
    {n:'Tiramisu minute',d:'Crème mascarpone, espresso, cacao et biscuit imbibé.',p:55},
    {n:'Cheesecake citron',d:'Cheesecake onctueux, citron frais et crumble aux amandes.',p:58},
    {n:'Fruits givrés',d:'Fruits de saison, granité citron-menthe et sirop léger.',p:48}
  ]},
  {id:'boissons', short:'Boissons', name:'Boissons', note:'Chaudes, fraîches & signatures', dishes:[
    {n:'Blue Matcha',d:'Matcha bleu, vanille, lait de coco et mousse légère.',p:48},
    {n:'Iced Pistachio',d:'Double espresso, lait frais et crème maison à la pistache.',p:46},
    {n:'Juvia Spritz',d:'Agrumes frais, fleur d’oranger, tonic et fines bulles sans alcool.',p:54},
    {n:'Espresso',d:'Café de spécialité, assemblage maison aux notes chocolatées.',p:22},
    {n:'Jus pressé minute',d:'Orange, citron, pomme ou mélange selon la saison.',p:38},
    {n:'Thé signature',d:'Thé vert, menthe fraîche, verveine et touche de fleur d’oranger.',p:32}
  ]}
];

const combos = [
  {emoji:'☀️',mood:'Brunch',name:'Réveil Juvia',items:'Toast Juvia + Iced Pistachio + Pain perdu',price:159},
  {emoji:'🌿',mood:'Frais',name:'Échappée verte',items:'Green Bowl + Blue Matcha + Fruits givrés',price:160},
  {emoji:'🍔',mood:'Comfort',name:'Grand plaisir',items:'Juvia Smash + boisson + Choco Juvia',price:178},
  {emoji:'✨',mood:'Surprise',name:'Choix du chef',items:'Une sélection de 3 créations selon l’inspiration du jour',price:189}
];

function Logo(){return <a className="logo" href="#top" aria-label="Juvia, retour en haut">juvia<span>.</span></a>}

const PASS_STORAGE_KEY='juvia_client_id';
const STAFF_SESSION_KEY='juvia_staff_verified_v2';
const safeStorage={get:(store,key)=>{try{return typeof window!=='undefined'?window[store]?.getItem(key):null}catch{return null}},set:(store,key,value)=>{try{if(typeof window!=='undefined')window[store]?.setItem(key,value)}catch{}},remove:(store,key)=>{try{if(typeof window!=='undefined')window[store]?.removeItem(key)}catch{}}};
const clientName=client=>{const detailed=[client?.first_name,client?.last_name].filter(Boolean).join(' ').trim();return detailed||client?.full_name||client?.name||'Client Juvia'};
const clientPoints=client=>Number(client?.points??client?.points_balance??0);
const callingCodeFor=country=>{try{return getCountryCallingCode(country||'MA')}catch{return '212'}};
const cleanNationalPhone=(value,country='MA')=>{let digits=String(value??'').replace(/\D/g,'');if(digits.startsWith('00'))digits=digits.slice(2);const code=callingCodeFor(country);if(digits.startsWith(code)&&digits.length>code.length+5)digits=digits.slice(code.length);digits=digits.replace(/^0+/,'');return digits.slice(0,Math.max(6,15-code.length))};
const normalizePhone=(value,country='MA')=>{const national=cleanNationalPhone(value,country);return national?`+${callingCodeFor(country)}${national}`:''};
async function findClientByPhone(value,country='MA'){const national=cleanNationalPhone(value,country);if(!national)return {data:null,error:null};const code=callingCodeFor(country),full=`+${code}${national}`,raw=String(value??'').trim(),candidates=[full,`${code}${national}`,`00${code}${national}`,`0${national}`,national,raw];if(country==='MA'&&national.length===9){const spaced=`${national[0]} ${national.slice(1,3)} ${national.slice(3,5)} ${national.slice(5,7)} ${national.slice(7,9)}`;candidates.push(spaced,`+212 ${spaced}`)}const unique=[...new Set(candidates.filter(Boolean))];const {data,error}=await supabase.from('clients').select('*').in('phone',unique).limit(1);return {data:data?.[0]||null,error}}
const parseBillAmount=value=>parseFloat(String(value??'').replace(',','.').replace(/[^0-9.]/g,''));
const missingColumn=error=>error?.code==='PGRST204'||/column .* does not exist|schema cache/i.test(error?.message||'');
async function insertClientProfile(firstName,lastName,phone,email){const name=`${firstName} ${lastName}`.trim();return supabase.from('clients').insert({first_name:firstName,last_name:lastName,name,phone,email,points:0}).select().single()}
async function updatePointsBalance(id,balance){let result=await supabase.from('clients').update({points:balance}).eq('id',id).select().single();if(result.error&&missingColumn(result.error))result=await supabase.from('clients').update({points_balance:balance}).eq('id',id).select().single();return result}
async function logLoyaltyTransaction(clientId,amount,earned){const safeClientId=String(clientId??'').trim();const isUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(safeClientId);if(!isUuid)return {error:new Error('UUID client invalide pour l’historique')};return supabase.from('transactions').insert({client_id:safeClientId,amount_spent:parseFloat(amount),points_added:Number(earned)})}

const countryNames=typeof Intl!=='undefined'&&Intl.DisplayNames?new Intl.DisplayNames(['fr'],{type:'region'}):null;
const phoneCountries=[...new Set([...getCountries(),'PS'])].map(iso=>({iso,name:countryNames?.of(iso)||iso,code:callingCodeFor(iso)})).filter(country=>`+${country.code}`!=='+972'&&country.iso!=='IL').sort((a,b)=>a.iso==='MA'?-1:b.iso==='MA'?1:a.iso==='PS'?-1:b.iso==='PS'?1:a.name.localeCompare(b.name,'fr'));
const parseInternationalInput=(value,currentCountry)=>{const raw=String(value??'');if(/^\s*(\+|00)/.test(raw)){const digits=raw.replace(/\D/g,'').replace(/^00/,'');const match=[...phoneCountries].sort((a,b)=>b.code.length-a.code.length).find(item=>digits.startsWith(item.code));if(match)return {country:match.iso,national:cleanNationalPhone(digits,match.iso)}}return {country:currentCountry,national:cleanNationalPhone(raw,currentCountry)}};
const countryFlag=iso=>iso.replace(/./g,char=>String.fromCodePoint(127397+char.charCodeAt()));

function CountryCodeSelector({value,onChange}){
 const [open,setOpen]=useState(false);const [search,setSearch]=useState('');const root=useRef(null);const selected=phoneCountries.find(item=>item.iso===value)||phoneCountries[0];
 useEffect(()=>{if(!open)return;const close=event=>{if(!root.current?.contains(event.target))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[open]);
 const query=search.trim().toLowerCase();const options=phoneCountries.filter(item=>!query||item.name.toLowerCase().includes(query)||item.iso.toLowerCase().includes(query)||`+${item.code}`.includes(query));
 return <div className="country-select" ref={root}><button type="button" className="country-trigger" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="Choisir l’indicatif pays"><span>{countryFlag(selected.iso)}</span><b>+{selected.code}</b><ChevronRight/></button>{open&&<div className="country-dropdown"><div className="country-search"><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un pays ou +code"/></div><div className="country-options">{options.map(item=><button type="button" key={item.iso} className={item.iso===value?'selected':''} onClick={()=>{onChange(item.iso);setOpen(false);setSearch('')}}><span>{countryFlag(item.iso)}</span><b>{item.name}</b><small>+{item.code}</small></button>)}{!options.length&&<p>Aucun pays trouvé</p>}</div></div>}</div>
}

function LoyaltyModal({open,onClose,installPrompt}){
 const [client,setClient]=useState(null);const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [form,setForm]=useState({first_name:'',last_name:'',country:'MA',phone:'',email:''});const [installHelp,setInstallHelp]=useState(false);
 const clientId=client?.id;
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[open]);
 const fetchClient=async id=>{if(!supabase||!id)return;setLoading(true);setError('');try{const {data,error:queryError}=await supabase.from('clients').select('*').eq('id',id).single();if(queryError)throw queryError;setClient(data)}catch(err){console.error('Juvia Pass fetch:',err);safeStorage.remove('localStorage',PASS_STORAGE_KEY);setClient(null);setError('Carte introuvable. Veuillez vous inscrire à nouveau.')}finally{setLoading(false)}};
 useEffect(()=>{if(!open||typeof window==='undefined')return;const id=safeStorage.get('localStorage',PASS_STORAGE_KEY);if(id)fetchClient(id)},[open]);
 useEffect(()=>{if(!open||!clientId||!supabase)return;const channel=supabase.channel(`juvia-pass-${clientId}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'clients',filter:`id=eq.${clientId}`},payload=>setClient(payload.new)).subscribe();return()=>{supabase.removeChannel(channel)}},[open,clientId]);
 const register=async event=>{event.preventDefault();const firstName=form.first_name.trim(),lastName=form.last_name.trim(),phone=normalizePhone(form.phone,form.country),national=cleanNationalPhone(form.phone,form.country),email=form.email.trim().toLowerCase();if(!firstName||!lastName||national.length<4||!/^\S+@\S+\.\S+$/.test(email))return setError('Veuillez compléter correctement tous les champs.');if(!supabase)return setError('Le service fidélité est momentanément indisponible.');setLoading(true);setError('');try{const {data:existing,error:lookupError}=await findClientByPhone(phone,form.country);if(lookupError)throw lookupError;let profile=existing;if(!profile){const {data,error:insertError}=await insertClientProfile(firstName,lastName,phone,email);if(insertError)throw insertError;profile=data}safeStorage.set('localStorage',PASS_STORAGE_KEY,profile.id);setClient(profile)}catch(err){console.error('Juvia Pass registration:',err);setError(err?.message||'Inscription impossible. Réessayez dans un instant.')}finally{setLoading(false)}};
 const recoverByPhone=async()=>{const national=cleanNationalPhone(form.phone,form.country);if(national.length<4)return setError('Saisissez votre numéro pour retrouver votre carte.');if(!supabase)return setError('Le service fidélité est momentanément indisponible.');setLoading(true);setError('');try{const {data,error:lookupError}=await findClientByPhone(national,form.country);if(lookupError)throw lookupError;if(!data){setError('Aucune carte associée à ce numéro. Complétez le formulaire pour la créer.');return}safeStorage.set('localStorage',PASS_STORAGE_KEY,data.id);setClient(data)}catch(err){console.error('Juvia Pass recovery:',err);setError('Impossible de retrouver votre carte. Réessayez.')}finally{setLoading(false)}};
 const install=async()=>{if(installPrompt){try{await installPrompt.prompt();await installPrompt.userChoice}catch{}return}setInstallHelp(true)};
 const forget=()=>{safeStorage.remove('localStorage',PASS_STORAGE_KEY);setClient(null);setForm({first_name:'',last_name:'',country:'MA',phone:'',email:''});setError('')};
 if(!open)return null;
 return <div className="pass-modal" role="dialog" aria-modal="true" aria-label="Juvia Pass"><button className="pass-backdrop" onClick={onClose}/><div className="pass-sheet"><div className="pass-sheet-head"><div><span>Programme fidélité</span><h2>Juvia Pass</h2></div><button onClick={onClose}><X/></button></div>{loading&&!client?<div className="pass-loading"><LoaderCircle/><p>Votre carte se prépare…</p></div>:client?<div className="pass-view"><div className="loyalty-card"><div className="pass-marble"/><div className="pass-frame"/><div className="pass-brand"><Logo/><span>MEMBER PASS</span></div><Crown className="pass-crown"/><div className="pass-holder"><small>MEMBRE</small><h3>{clientName(client)}</h3></div><div className="pass-points"><small>SOLDE ACTUEL</small><strong>{clientPoints(client)}</strong><span>points</span></div><div className="pass-qr"><div><QRCodeSVG value={client.id} size={128} level="H" bgColor="#fffdf8" fgColor="#17302f" marginSize={1}/></div><span>Présentez ce code à la caisse</span></div><div className="pass-number">N° {client.id.slice(0,8).toUpperCase()}</div></div><button className="install-pass" onClick={install}><Smartphone/> Ajouter à l’écran d’accueil</button>{installHelp&&<div className="install-help"><b>Installer votre Juvia Pass</b><p><strong>iPhone :</strong> touchez Partager, puis « Sur l’écran d’accueil ».<br/><strong>Android :</strong> ouvrez le menu ⋮, puis « Installer l’application ».</p></div>}<button className="pass-forget" onClick={forget}>Ce n’est pas votre carte ?</button></div>:<form className="pass-register" onSubmit={register}><div className="register-icon"><CreditCard/></div><span>Bienvenue dans le cercle</span><h3>Votre fidélité<br/>mérite l’exception.</h3><p>Créez votre pass en quelques secondes. À chaque visite, vos moments Juvia vous récompensent.</p><div className="registration-name-grid"><label><span>Prénom</span><div><UserRound/><input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} placeholder="Votre prénom" autoComplete="given-name"/></div></label><label><span>Nom</span><div><UserRound/><input required value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} placeholder="Votre nom" autoComplete="family-name"/></div></label></div><label className="international-phone-label"><span>Numéro de téléphone</span><div><CountryCodeSelector value={form.country} onChange={country=>setForm({...form,country,phone:cleanNationalPhone(form.phone,country)})}/><input required value={form.phone} onChange={e=>{const parsed=parseInternationalInput(e.target.value,form.country);setForm({...form,country:parsed.country,phone:parsed.national})}} placeholder="Numéro national" inputMode="tel" autoComplete="tel-national" aria-label="Numéro national"/></div></label><label><span>Adresse E-mail</span><div><Mail/><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="vous@exemple.com" inputMode="email" autoComplete="email"/></div></label>{error&&<div className="pass-error">{error}</div>}<button className="create-pass" disabled={loading}>{loading?<LoaderCircle/>:<Crown/>}{loading?'Chargement…':'Créer mon Juvia Pass'}</button><button type="button" className="recover-pass" onClick={recoverByPhone} disabled={loading}>Déjà membre ? Retrouver ma carte avec mon téléphone</button><small>En continuant, vous acceptez de recevoir les avantages Juvia.</small></form>}</div></div>
}

function Header({openGames}){
 return <><header className="topbar" id="top"><Logo/><div className="brandline"><span>Café & Restaurant</span><small>Menu digital</small></div><button className="top-game" onClick={openGames}><Gamepad2 size={18}/><span>Jeux</span></button></header><div className="welcome"><div><span>À table !</span><h1>Que voulez-vous<br/><em>déguster ?</em></h1></div><div className="table-pill"><i/> Menu disponible</div></div></>
}

function CategoryNav({active,onSelect,openPass}){
 const ref=useRef(null);
 useEffect(()=>{
  const nav=ref.current;
  const tab=nav?.querySelector(`[data-id="${active}"]`);
  if(!nav||!tab)return;
  // Move only the horizontal tab strip; scrollIntoView here could also move the page vertically.
  const left=tab.offsetLeft-(nav.clientWidth-tab.offsetWidth)/2;
  nav.scrollTo({left:Math.max(0,left),behavior:'smooth'});
 },[active]);
 const go=id=>{
  const section=document.getElementById(id);
  if(!section)return;
  onSelect(id);
  section.scrollIntoView({behavior:'smooth',block:'start'});
 };
 return <nav id="category-navigation" className="category-nav" ref={ref} aria-label="Catégories du menu"><button type="button" className="pass-nav-button" onClick={openPass}><Crown/><span>Juvia Pass</span></button>{menu.map((c,i)=><button type="button" key={c.id} data-id={c.id} aria-current={active===c.id?'true':undefined} className={active===c.id?'active':''} onClick={()=>go(c.id)}><span>0{i+1}</span>{c.short}</button>)}</nav>
}

function VideoCard({dish,index,onPlay}){
 const src=index===2?'/images/juvia-dessert.jpg':'/images/juvia-food.jpg';
 return <button className={'video-card crop-'+index} onClick={()=>onPlay(dish)} aria-label={`Voir la vidéo de ${dish.n}`}><img src={src} alt=""/><span className="video-play"><Play size={15} fill="currentColor"/></span><span className="video-duration">0:{12+index*3}</span><b>{dish.n}</b></button>
}

function MenuSection({category,index,onPlay}){
 return <section className="menu-category" id={category.id} data-category={category.id}><div className="section-title"><div><span>0{index+1}</span><h2>{category.name}</h2></div><p>{category.note}</p></div><div className="featured"><div className="featured-label"><Play size={12} fill="currentColor"/> En vidéo</div><div className="video-row">{category.dishes.slice(0,3).map((d,i)=><VideoCard key={d.n} dish={d} index={i} onPlay={onPlay}/>)}</div></div><div className="dish-list">{category.dishes.map((d,i)=><article className="dish" key={d.n}><div><h3>{d.n}{i===0&&<span className="chef">Favori</span>}</h3><p>{d.d}</p></div><strong>{d.p}<small> dh</small></strong></article>)}</div></section>
}

function useArcadeAudio(enabled){
 const ctx=useRef(null); const lastTick=useRef(0);
 const ensure=()=>{try{if(!enabled||typeof window==='undefined')return null;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!ctx.current)ctx.current=new AC();if(ctx.current.state==='suspended')ctx.current.resume().catch(()=>{});return ctx.current}catch{return null}};
 const tick=(pitch=720)=>{try{const now=typeof performance!=='undefined'?performance.now():Date.now();if(now-lastTick.current<45)return;lastTick.current=now;const c=ensure();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.setValueAtTime(pitch,c.currentTime);g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.035);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.04)}catch{}};
 const win=()=>{try{const c=ensure();if(!c)return;[523,659,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.1;o.type='sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.11,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.34)})}catch{}};
 return {tick,win,ensure};
}

const safeVibrate=pattern=>{try{if(typeof navigator!=='undefined'&&typeof navigator.vibrate==='function')navigator.vibrate(pattern)}catch{}};

const party=()=>{try{
 if(typeof window==='undefined'||typeof requestAnimationFrame!=='function'||typeof confetti!=='function')return;
 const end=Date.now()+950; const colors=['#1069d5','#21a7d5','#f0bc61','#176d68','#ffffff'];
 (function frame(){try{confetti({particleCount:7,angle:60,spread:65,origin:{x:0,y:.68},colors});confetti({particleCount:7,angle:120,spread:65,origin:{x:1,y:.68},colors})}catch{return}if(Date.now()<end)requestAnimationFrame(frame)})();
 }catch{}};

const roundedRect=(ctx,x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()};
const wrapCanvasText=(ctx,text,x,y,maxWidth,lineHeight,maxLines=10)=>{const words=text.split(' ');let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);lines=lines.slice(0,maxLines);lines.forEach((value,i)=>ctx.fillText(value,x,y+i*lineHeight));return y+lines.length*lineHeight};

async function generateStoryCard(data){
 if(typeof document==='undefined')throw new Error('Canvas indisponible');
 try{await document.fonts?.ready}catch{}
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas indisponible');
 const ivory='#f6f1e7',anthracite='#202927',gold='#c89c56',blue='#1069d5',teal='#176d68';
 ctx.fillStyle=ivory;ctx.fillRect(0,0,1080,1920);
 // Soft procedural marble veins keep the generated file self-contained and share-safe.
 ctx.save();ctx.globalAlpha=.12;for(let i=0;i<34;i++){const y=(i*173)%1920-120;ctx.beginPath();ctx.moveTo(-80,y);ctx.bezierCurveTo(250,y+110+(i%3)*35,650,y-90,1160,y+80);ctx.strokeStyle=i%4===0?gold:'#7c8884';ctx.lineWidth=i%5===0?3:1.2;ctx.stroke()}ctx.restore();
 const glow=ctx.createRadialGradient(840,220,30,840,220,650);glow.addColorStop(0,'rgba(33,167,213,.15)');glow.addColorStop(1,'rgba(33,167,213,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,1080,1000);
 ctx.strokeStyle=anthracite;ctx.lineWidth=12;ctx.strokeRect(38,38,1004,1844);ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.strokeRect(58,58,964,1804);
 ctx.textAlign='center';ctx.fillStyle=anthracite;ctx.font='600 88px Manrope, sans-serif';ctx.fillText('juvia',540,205);ctx.fillStyle=gold;ctx.fillText('.',670,205);
 ctx.font='600 18px "DM Sans", sans-serif';ctx.letterSpacing='7px';ctx.fillStyle=teal;ctx.fillText('CAFÉ  ·  RESTAURANT',540,255);ctx.letterSpacing='0px';
 roundedRect(ctx,115,335,850,1040,38);ctx.fillStyle=anthracite;ctx.fill();ctx.strokeStyle=gold;ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle=gold;ctx.font='600 23px "DM Sans", sans-serif';ctx.fillText(data.type==='payer'?'—  QUI PAIE ?  —':'—  COMBO IDÉAL  —',540,435);
 if(data.type==='payer'){
  ctx.fillStyle='#ffffff';ctx.font='500 54px "Playfair Display", Georgia, serif';ctx.fillText("C’EST",540,600);
  ctx.fillStyle='#72c6eb';ctx.font='italic 500 126px "Playfair Display", Georgia, serif';wrapCanvasText(ctx,data.winner.toUpperCase(),540,755,700,130,2);
  ctx.fillStyle='#ffffff';ctx.font='500 48px "Playfair Display", Georgia, serif';ctx.fillText('qui régale',540,1000);ctx.fillText('aujourd’hui !',540,1062);
  ctx.fillStyle=gold;ctx.font='400 25px "DM Sans", sans-serif';ctx.fillText('Le hasard Juvia a parlé.',540,1195);
 }else{
  ctx.fillStyle='#ffffff';ctx.font='500 53px "Playfair Display", Georgia, serif';ctx.fillText('LE MENU DU HASARD',540,545);
  let y=660;data.items.forEach((item,i)=>{ctx.fillStyle='#72c6eb';ctx.font='600 18px "DM Sans", sans-serif';ctx.fillText(['LE PLAT','LA BOISSON','LA DOUCEUR'][i],540,y);ctx.fillStyle='#fff';ctx.font='500 40px "Playfair Display", Georgia, serif';y=wrapCanvasText(ctx,item.n,540,y+60,700,50,2)+45});
  ctx.strokeStyle='rgba(200,156,86,.55)';ctx.beginPath();ctx.moveTo(310,1160);ctx.lineTo(770,1160);ctx.stroke();ctx.fillStyle=gold;ctx.font='600 52px "DM Sans", sans-serif';ctx.fillText(`${data.total} DH`,540,1250);
 }
 ctx.fillStyle=anthracite;ctx.font='italic 500 43px "Playfair Display", Georgia, serif';ctx.fillText('Des instants qui ont du goût.',540,1490);
 ctx.font='400 29px "DM Sans", sans-serif';ctx.fillStyle='#505956';wrapCanvasText(ctx,"Rejoignez-nous pour une expérience gastronomique & élégante d’exception.",540,1605,750,45,3);
 ctx.fillStyle=blue;roundedRect(ctx,370,1760,340,64,32);ctx.fill();ctx.fillStyle='#fff';ctx.font='600 18px "DM Sans", sans-serif';ctx.fillText('@ JUVIA',540,1801);
 return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image non générée')),'image/png',1));
}

function ShareStoryButton({story}){
 const [busy,setBusy]=useState(false);const [preview,setPreview]=useState(null);const [message,setMessage]=useState('');
 useEffect(()=>()=>{if(preview?.url)URL.revokeObjectURL(preview.url)},[preview]);
 const showPreview=blob=>{const url=URL.createObjectURL(blob);setPreview({url,blob});setMessage('Votre navigateur ne prend pas en charge le partage direct de fichiers. Copiez l’image ou effectuez un appui long pour la partager.')};
 const share=async()=>{
  if(busy)return;setBusy(true);
  try{
   const blob=await generateStoryCard(story);
   const file=typeof File!=='undefined'?new File([blob],`juvia-story-${Date.now()}.png`,{type:'image/png'}):null;
   const canShareFile=!!(file&&typeof navigator!=='undefined'&&typeof navigator.share==='function'&&(!navigator.canShare||navigator.canShare({files:[file]})));
   if(canShareFile){
    await navigator.share({files:[file],title:'Juvia Story',text:story.type==='payer'?`C’est ${story.winner} qui régale aujourd’hui chez Juvia !`:'Mon Combo Idéal chez Juvia ✨'});
   }else showPreview(blob);
  }catch(error){
   if(error?.name!=='AbortError'){
    console.warn('Native file sharing unavailable:',error);
    try{const blob=await generateStoryCard(story);showPreview(blob)}catch(cardError){console.error('Story preview error:',cardError)}
   }
  }finally{setBusy(false)}
 };
 const copyOrShare=async()=>{
  if(!preview?.blob)return;
  try{
   if(typeof ClipboardItem!=='undefined'&&navigator.clipboard?.write){await navigator.clipboard.write([new ClipboardItem({'image/png':preview.blob})]);setMessage('Image copiée ! Collez-la dans votre application préférée.');return}
   if(navigator.share){await navigator.share({title:'Juvia Story',text:'Mon résultat Juvia ✨',url:window.location.href});return}
   setMessage('Effectuez un clic droit ou un appui long sur l’image pour la copier et la partager.')
  }catch(error){if(error?.name!=='AbortError')setMessage('Effectuez un clic droit ou un appui long sur l’image pour la partager.')}
 };
 const closePreview=()=>{if(preview?.url)URL.revokeObjectURL(preview.url);setPreview(null);setMessage('')};
 return <><div className="story-actions"><button className="story-share" onClick={share} disabled={busy}><Instagram/><span>{busy?'Création de votre Story…':'Partager en Story'}</span></button><small>Format vertical 9:16 · Instagram, WhatsApp & Facebook</small></div>{preview&&<div className="story-preview" role="dialog" aria-modal="true" aria-label="Aperçu de la Story"><button className="story-preview-bg" onClick={closePreview}/><div className="story-preview-card"><button className="story-preview-close" onClick={closePreview}><X/></button><span>Aperçu de votre Story</span><img src={preview.url} alt="Story Juvia prête à partager"/><p>{message}</p><button className="story-copy" onClick={copyOrShare}><Share2/> Copier / Partager</button></div></div>}</>
}

function PayerGame({sound,audio}){
 const [names,setNames]=useState(['Lina','Yassine','Sarah']); const [input,setInput]=useState(''); const [display,setDisplay]=useState('Prêt ?'); const [spinning,setSpinning]=useState(false); const [winner,setWinner]=useState(''); const timer=useRef();
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const add=()=>{if(input.trim()&&!spinning){setNames([...names,input.trim()]);setInput('')}};
 const spin=()=>{if(names.length<2||spinning)return;audio.ensure();setSpinning(true);setWinner('');let step=0;const total=34+Math.floor(Math.random()*8);const chosen=names[Math.floor(Math.random()*names.length)];
  const roll=()=>{step++;const final=step>=total;setDisplay(final?chosen:names[step%names.length]);audio.tick(760+(step%4)*55);safeVibrate(final?[35,40,90]:7);if(final){setSpinning(false);setWinner(chosen);audio.win();party();return}const t=.018+Math.pow(step/total,3)*.19;timer.current=setTimeout(roll,t*1000)};roll()};
 return <div className="arcade-body"><div className="arcade-title"><span className="mini-icon"><Users/></span><div><h3>Qui paie ?</h3><p>Le hasard choisit le héros de l’addition.</p></div></div><div className={'name-reel '+(spinning?'spinning':'')+(winner?' won':'')}><div className="reel-lights">{Array.from({length:10},(_,i)=><i key={i}/>)}</div><span className="reel-label">LA BANQUE DÉCIDE</span><div className="reel-window"><div className="reel-blur">{spinning?'••••••••':'★ ★ ★'}</div><strong key={display}>{display}</strong><div className="reel-blur">{spinning?'••••••••':'★ ★ ★'}</div></div>{winner&&<div className="winner-line"><Trophy/> {winner} régale la table !</div>}</div>{winner&&<ShareStoryButton story={{type:'payer',winner}}/>}<div className="participant-head"><span>Joueurs · {names.length}</span><small>Appuyez pour retirer</small></div><div className="name-chips">{names.map((n,i)=><button disabled={spinning} key={n+i} onClick={()=>setNames(names.filter((_,j)=>j!==i))}>{n}<X size={11}/></button>)}</div><div className="add-name"><input disabled={spinning} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Ajouter un prénom"/><button disabled={spinning} onClick={add}><Plus/></button></div><button className={'spin-action '+(spinning?'running':'')} onClick={spin} disabled={spinning||names.length<2}><span><RotateCcw/></span>{spinning?'Ça tourne…':winner?'Rejouer':'Lancer la roue'}</button>{names.length<2&&<p className="game-hint">Ajoutez au moins 2 personnes pour jouer.</p>}</div>
}

function ComboGame({audio}){
 const pools=[menu[3].dishes,menu[6].dishes,menu[5].dishes]; const labels=['Plat','Boisson','Dessert']; const emojis=['🍽️','🥤','🍰'];
 const [values,setValues]=useState([pools[0][0],pools[1][0],pools[2][0]]); const [stopped,setStopped]=useState([true,true,true]); const [spinning,setSpinning]=useState(false); const [revealed,setRevealed]=useState(false); const timers=useRef([]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 const spinReel=(ri,duration)=>new Promise(resolve=>{let step=0;const started=typeof performance!=='undefined'?performance.now():Date.now();const move=()=>{step++;const elapsed=(typeof performance!=='undefined'?performance.now():Date.now())-started;const done=elapsed>=duration;const pool=pools[ri];const final=pool[Math.floor(Math.random()*pool.length)];setValues(v=>{const n=[...v];n[ri]=done?final:pool[step%pool.length];return n});audio.tick(ri===0?620:ri===1?740:860);safeVibrate(done?35:6);if(done){setStopped(s=>{const n=[...s];n[ri]=true;return n});resolve();return}const progress=elapsed/duration;timers.current[ri]=setTimeout(move,35+Math.pow(progress,3)*150)};move()});
 const spin=async()=>{if(spinning)return;audio.ensure();setSpinning(true);setRevealed(false);setStopped([false,false,false]);await Promise.all([spinReel(0,1750),spinReel(1,2350),spinReel(2,2950)]);setSpinning(false);setRevealed(true);audio.win();safeVibrate([40,45,40,45,110]);party()};
 const total=values.reduce((n,v)=>n+v.p,0);
 return <div className="arcade-body"><div className="arcade-title"><span className="mini-icon purple"><Sparkles/></span><div><h3>Combo idéal</h3><p>Trois rouleaux. Un festin surprise.</p></div></div><div className={'slot-machine '+(spinning?'spinning':'')+(revealed?' jackpot':'')}><div className="slot-top"><span>JUVIA</span><b>MEAL JACKPOT</b><span>★</span></div><div className="slot-reels">{values.map((v,i)=><div className={'slot-reel '+(stopped[i]?'stopped':'rolling')} key={i}><small>{labels[i]}</small><span className="slot-emoji">{emojis[i]}</span><strong key={v.n}>{v.n}</strong><em>{v.p} dh</em></div>)}</div><div className="payline"/><div className="slot-lights">{Array.from({length:14},(_,i)=><i key={i}/>)}</div></div>{revealed&&<><div className="combo-win"><span>✨ COMBO DÉBLOQUÉ</span><b>{total} dh</b><small>pour le menu complet</small></div><ShareStoryButton story={{type:'combo',items:values,total}}/></>}<button className={'spin-action combo-spin '+(spinning?'running':'')} onClick={spin} disabled={spinning}><span><Play fill="currentColor"/></span>{spinning?'Les rouleaux tournent…':revealed?'Nouveau combo':'Jouer les rouleaux'}</button></div>
}

function GamesDrawer({open,onClose}){
 const [tab,setTab]=useState('payer'); const [sound,setSound]=useState(true); const audio=useArcadeAudio(sound);
 useEffect(()=>{document.body.style.overflow=open?'hidden':'';return()=>{document.body.style.overflow=''}},[open]);
 return <><button className={'backdrop '+(open?'visible':'')} onClick={onClose} aria-label="Fermer les jeux"/><aside className={'drawer arcade-drawer '+(open?'open':'')} aria-hidden={!open}><div className="drawer-head"><div><span>Juvia Arcade</span><h2>Les jeux à table</h2></div><div className="drawer-tools"><button className="sound-toggle" onClick={()=>setSound(!sound)} aria-label={sound?'Couper le son':'Activer le son'}>{sound?<Volume2/>:<VolumeX/>}</button><button onClick={onClose}><X/></button></div></div><div className="game-tabs"><button className={tab==='payer'?'active':''} onClick={()=>setTab('payer')}><WalletCards size={17}/> Qui paie ?</button><button className={tab==='combo'?'active':''} onClick={()=>setTab('combo')}><Sparkles size={17}/> Combo idéal</button></div>{tab==='payer'?<PayerGame sound={sound} audio={audio}/>:<ComboGame audio={audio}/>}<p className="fx-note">Son & vibrations selon les réglages de votre appareil</p></aside></>
}

function VideoModal({dish,onClose}){
 if(!dish)return null;
 return <div className="video-modal" role="dialog" aria-modal="true"><button className="modal-bg" onClick={onClose}/><div className="modal-card"><button className="modal-close" onClick={onClose}><X/></button><div className="modal-image"><img src="/images/juvia-food.jpg" alt={dish.n}/><span><Play fill="currentColor"/></span></div><span className="modal-kicker">Dans les coulisses</span><h2>{dish.n}</h2><p>{dish.d}</p><strong>{dish.p} dh</strong></div></div>
}

function Footer(){return <footer><Logo/><p>Des instants qui ont du goût.</p><a className="location" href="https://maps.google.com/?q=Casablanca,Morocco" target="_blank" rel="noreferrer"><MapPin size={17}/><span>Ouvrir dans Google Maps</span><ChevronRight size={16}/></a><div className="socials"><a href="https://instagram.com" aria-label="Instagram"><Instagram/></a><a href="https://facebook.com" aria-label="Facebook"><Facebook/></a><a href="https://tiktok.com" aria-label="TikTok"><Music2/></a></div><a className="staff-footer-link" href="/staff-scan"><LockKeyhole/> Espace Staff</a><small>© 2026 Juvia Café & Restaurant</small></footer>}

function StaffScanner(){
 const [authenticated,setAuthenticated]=useState(()=>safeStorage.get('sessionStorage',STAFF_SESSION_KEY)==='1');const [pin,setPin]=useState('');const [pinError,setPinError]=useState('');const [scanning,setScanning]=useState(false);const [profile,setProfile]=useState(null);const [amount,setAmount]=useState('');const [status,setStatus]=useState({type:'',text:''});const [loading,setLoading]=useState(false);const [manualId,setManualId]=useState('');const scannerRef=useRef(null);const billInputRef=useRef(null);
 const unlock=async event=>{event.preventDefault();if(!pin.trim()||loading)return;setLoading(true);setPinError('');try{if(!supabase)throw new Error('Service indisponible');const {data,error}=await supabase.from('staff_pins').select('*').eq('pin_code',pin.trim()).limit(1);if(error)throw error;if(data?.length){safeStorage.set('sessionStorage',STAFF_SESSION_KEY,'1');setAuthenticated(true);setPin('')}else{setPinError('Code PIN incorrect');safeVibrate([40,40,40])}}catch(error){console.error('Staff PIN verification failed:',error);setPinError(error?.message==='Service indisponible'?'Service de vérification indisponible':'Impossible de vérifier le code. Réessayez.')}finally{setLoading(false)}};
 const findClient=async rawId=>{const id=String(rawId||'').trim().replace(/^juvia:/i,'');if(!id)return;setLoading(true);setStatus({type:'',text:''});try{if(!supabase)throw new Error('Supabase non configuré');const {data,error}=await supabase.from('clients').select('*').eq('id',id).single();if(error)throw error;setProfile(data);setScanning(false);safeVibrate(60)}catch(error){console.error('Staff client lookup:',error);setProfile(null);setStatus({type:'error',text:'Client introuvable. Vérifiez le QR code.'})}finally{setLoading(false)}};
 useEffect(()=>{if(!authenticated||!scanning)return;let cancelled=false;import('html5-qrcode').then(({Html5QrcodeScanner})=>{if(cancelled)return;const scanner=new Html5QrcodeScanner('staff-qr-reader',{fps:10,qrbox:{width:230,height:230},aspectRatio:1,rememberLastUsedCamera:true},false);scannerRef.current=scanner;scanner.render(decoded=>{findClient(decoded);scanner.clear().catch(()=>{})},()=>{})}).catch(error=>{console.error('Scanner loading:',error);setStatus({type:'error',text:'Caméra indisponible. Utilisez la saisie manuelle.'})});return()=>{cancelled=true;if(scannerRef.current){scannerRef.current.clear().catch(()=>{});scannerRef.current=null}}},[authenticated,scanning]);
 const addPoints=async event=>{event.preventDefault();if(loading)return;const bill=parseBillAmount(amount);if(Number.isNaN(bill)||bill<=0){setStatus({type:'error',text:'Saisissez un montant numérique supérieur à 0.'});return}if(!profile)return;const earned=Math.floor(bill/10);const newBalance=clientPoints(profile)+earned;setLoading(true);setStatus({type:'',text:''});try{const {data,error:updateError}=await updatePointsBalance(profile.id,newBalance);if(updateError)throw updateError;setProfile(data);setAmount('');setStatus({type:'success',text:`${earned} points crédités avec succès !`});requestAnimationFrame(()=>billInputRef.current?.focus());audioStaffWin();safeVibrate([35,35,80]);party();logLoyaltyTransaction(profile.id,bill,earned).then(({error:historyError})=>{if(historyError)console.error('Non-critical transaction history error:',historyError)}).catch(historyError=>console.error('Non-critical transaction history error:',historyError))}catch(error){console.error('Staff client balance update failed:',error);setStatus({type:'error',text:'Impossible de créditer les points. Réessayez.'})}finally{setLoading(false)}};
 const reset=()=>{setProfile(null);setStatus({type:'',text:''});setAmount('');setManualId('');setScanning(true)};
 if(!authenticated)return <main className="staff-page staff-lock"><a href="/" className="staff-back"><ArrowLeft/> Menu Juvia</a><div className="staff-login"><Logo/><div className="staff-lock-icon"><LockKeyhole/></div><span>Espace sécurisé</span><h1>Accès équipe</h1><p>Entrez le code personnel pour accéder au scanner fidélité.</p><form onSubmit={unlock}><input type="password" inputMode="numeric" maxLength="8" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} placeholder="••••" autoFocus disabled={loading}/><button disabled={loading||!pin.trim()}>{loading?<><LoaderCircle/> Vérification…</>:'Déverrouiller'}</button></form>{pinError&&<small>{pinError}</small>}</div></main>;
 return <main className="staff-page"><header className="staff-header"><a href="/"><Logo/></a><div><span>Juvia Pass</span><b>Scanner équipe</b></div><button onClick={()=>{safeStorage.remove('sessionStorage',STAFF_SESSION_KEY);setAuthenticated(false)}}><LockKeyhole/></button></header><div className="staff-content">{!profile?<><div className="staff-intro"><span><Camera/></span><div><h1>Scanner un pass</h1><p>Cadrez le QR code du client.</p></div></div>{!scanning?<button className="start-camera" onClick={()=>setScanning(true)}><QrCode/> Ouvrir la caméra</button>:<div className="scanner-shell"><div id="staff-qr-reader"/><button onClick={()=>setScanning(false)}>Fermer la caméra</button></div>}<div className="manual-divider"><span>ou saisir l’identifiant</span></div><form className="manual-client" onSubmit={e=>{e.preventDefault();findClient(manualId)}}><input value={manualId} onChange={e=>setManualId(e.target.value)} placeholder="UUID du client"/><button disabled={loading}>{loading?<LoaderCircle/>:<ChevronRight/>}</button></form></>:<><div className="client-found"><div className="client-avatar">{clientName(profile).charAt(0).toUpperCase()}</div><span>PASS IDENTIFIÉ</span><h1>{clientName(profile)}</h1><small>N° {profile.id.slice(0,8).toUpperCase()}</small><div className="staff-balance"><b>{clientPoints(profile)}</b><span>points disponibles</span></div></div><form className="bill-form" onSubmit={addPoints}><label>Montant de l’addition</label><div><ReceiptText/><input ref={billInputRef} type="number" min="1" step="any" value={amount} onChange={e=>{setAmount(e.target.value);if(status.type==='error')setStatus({type:'',text:''})}} inputMode="decimal" placeholder="0.00"/><span>DH</span></div><p>Le client gagne <b>{Math.floor((parseBillAmount(amount)||0)/10)} point(s)</b> · 10 DH = 1 point</p><button disabled={loading}>{loading?<LoaderCircle/>:<Plus/>} Créditer les points</button></form><button className="scan-another" onClick={reset}><QrCode/> Scanner un autre pass</button></>}{status.text&&<div className={'staff-status '+status.type}>{status.type==='success'?<CheckCircle2/>:<X/>}{status.text}</div>}</div></main>
}

function audioStaffWin(){try{if(typeof window==='undefined')return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=new AC();[523,659,784].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.1;o.frequency.value=f;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.26)})}catch{}}

class ErrorBoundary extends React.Component{
 constructor(props){super(props);this.state={error:false}}
 static getDerivedStateFromError(){return {error:true}}
 componentDidCatch(error,info){console.error('Juvia UI error:',error,info)}
 render(){if(this.state.error)return <div className="error-fallback"><div className="fallback-wordmark">juvia<span>.</span></div><div><span>Une petite pause…</span><h1>Le menu revient<br/>dans un instant.</h1><p>Une fonction de votre navigateur n’a pas répondu.</p><button onClick={()=>{if(typeof window!=='undefined')window.location.reload()}}>Recharger le menu</button></div></div>;return this.props.children}
}

function App(){
 const [active,setActive]=useState(menu[0].id); const [games,setGames]=useState(false); const [video,setVideo]=useState(null);const [passOpen,setPassOpen]=useState(()=>typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('pass')==='open');const [installPrompt,setInstallPrompt]=useState(null);
 const isManualScrolling=useRef(false); const manualScrollTimer=useRef(null);
 useEffect(()=>{const capture=event=>{event.preventDefault();setInstallPrompt(event)};window.addEventListener('beforeinstallprompt',capture);if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(error=>console.warn('Service worker:',error));return()=>window.removeEventListener('beforeinstallprompt',capture)},[]);
 const selectCategory=id=>{
  isManualScrolling.current=true;
  setActive(id);
  if(manualScrollTimer.current)clearTimeout(manualScrollTimer.current);
  manualScrollTimer.current=setTimeout(()=>{isManualScrolling.current=false},850);
 };
 useEffect(()=>{
  if(typeof IntersectionObserver==='undefined')return;
  const observer=new IntersectionObserver(entries=>{
   if(isManualScrolling.current)return;
   const visible=entries.filter(entry=>entry.isIntersecting);
   if(!visible.length)return;
   const current=visible.sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
   setActive(previous=>previous===current.target.id?previous:current.target.id);
  },{root:null,rootMargin:'-20% 0px -70% 0px',threshold:0});
  menu.forEach(category=>{const section=document.getElementById(category.id);if(section)observer.observe(section)});
  return()=>{observer.disconnect();if(manualScrollTimer.current)clearTimeout(manualScrollTimer.current)};
 },[]);
 return <><Header openGames={()=>setGames(true)}/><CategoryNav active={active} onSelect={selectCategory} openPass={()=>setPassOpen(true)}/><main className="menu-content">{menu.map((c,i)=><MenuSection key={c.id} category={c} index={i} onPlay={setVideo}/>)}</main><Footer/><button className="floating-game" onClick={()=>setGames(true)}><Gamepad2/><span>Jeux<br/><small>à table</small></span></button><GamesDrawer open={games} onClose={()=>setGames(false)}/><LoyaltyModal open={passOpen} onClose={()=>setPassOpen(false)} installPrompt={installPrompt}/><VideoModal dish={video} onClose={()=>setVideo(null)}/></>
}

const rootElement=typeof document!=='undefined'?document.getElementById('root'):null;
if(rootElement){const isStaffRoute=window.location.pathname.replace(/\/$/,'')==='/staff-scan';createRoot(rootElement).render(<ErrorBoundary>{isStaffRoute?<StaffScanner/>:<App/>}</ErrorBoundary>);}
