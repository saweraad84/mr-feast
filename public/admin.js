const items=['Classic Burger','Zinger Burger','Chicken Pizza','Chicken Shawarma','Fries','Club Sandwich','Chicken Tikka','Malai Boti','Seekh Kebab','Chicken Wings','BBQ Platters','Gulab Jamun','Rasmalai','Kheer','Brownies','Ice Cream','Chocolate Lava Cake','Cheesecake','Waffles','Sundaes'];
const item=document.getElementById('item');items.forEach(x=>item.add(new Option(x,x)));
const loginCard=document.getElementById('loginCard'),manager=document.getElementById('manager'),logout=document.getElementById('logout');
function showAdmin(ok){loginCard.style.display=ok?'none':'block';manager.style.display=ok?'block':'none';logout.style.display=ok?'block':'none'}
fetch('/api/admin/status',{cache:'no-store'}).then(r=>r.json()).then(x=>showAdmin(x.authenticated)).catch(()=>showAdmin(false));

async function submitLogin(){
  const status=document.getElementById('loginStatus');
  const passwordBox=document.getElementById('password');
  const password=String(passwordBox.value||'').trim();
  if(!password){status.textContent='Enter admin password';passwordBox.focus();return;}
  status.textContent='Checking…';
  try{
    const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({password})});
    let j={};try{j=await r.json()}catch{}
    if(r.ok){showAdmin(true);status.textContent='';passwordBox.value='';}
    else{status.textContent=j.error||'Login failed';passwordBox.select();}
  }catch{status.textContent='Login request failed. Please try again.';}
}

document.getElementById('login').onclick=submitLogin;
document.getElementById('password').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submitLogin();}});
logout.onclick=async()=>{await fetch('/api/admin/logout',{method:'POST',cache:'no-store'});showAdmin(false)};
const input=document.getElementById('image'),preview=document.getElementById('preview');input.onchange=()=>{const f=input.files[0];if(!f)return;preview.src=URL.createObjectURL(f);preview.style.display='block'};
document.getElementById('save').onclick=async()=>{const f=input.files[0],status=document.getElementById('saveStatus');if(!f){status.textContent='Please choose a picture first.';return}const fd=new FormData();fd.append('item',item.value);fd.append('image',f);status.textContent='Uploading…';const r=await fetch('/api/admin/image',{method:'POST',body:fd});let j={};try{j=await r.json()}catch{}status.textContent=r.ok?'Picture updated successfully. Refresh the website to see it.':(j.error||'Upload failed')};
document.getElementById('reset').onclick=async()=>{const status=document.getElementById('saveStatus');const r=await fetch('/api/admin/image/'+encodeURIComponent(item.value),{method:'DELETE'});status.textContent=r.ok?'Original picture restored.':'Could not reset picture.'};
