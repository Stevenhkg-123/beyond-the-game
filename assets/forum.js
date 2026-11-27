const forumCategories=[['all','所有運動'],...sports.map(s=>[s.id,s.zh])];
const forumPrompts=[
 {sport:'tchoukball',title:'巧固球初學者可以先練甚麼？',body:'我想在體育課試玩巧固球，大家會先練傳球、射球，還是接反彈球？'},
 {sport:'stacking',title:'競技疊杯 3-3-3 有甚麼入門貼士？',body:'剛開始練 3-3-3，怎樣可以先把動作做得穩定？'},
 {sport:'kendama',title:'劍玉大杯接球如何練習？',body:'練大杯接球時，你會先注意球的高度，還是雙膝的節奏？'}
];
let forumFilter={q:'',sport:'all',sort:'new'},activeThread=null;
let forumPosts=[];
function forumDate(timestamp){try{return new Intl.DateTimeFormat('zh-HK',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(timestamp))}catch(_){return '剛剛'}}
function forumText(value){return esc(value).replace(/\n/g,'<br>')}
function forumCategory(id){return sports.find(s=>s.id===id)?.zh||'其他運動'}
function forumTeaser(){return `<section class="section-tight"><div class="shell forum-teaser"><div><span class="eyebrow">一起交流</span><h2>分享你的運動問題。</h2><p>從巧固球規則到劍玉入門，在討論區分享你的想法。</p></div>${button('前往討論區','forum',null,'btn-light')}</div></section>`}
function forumOptions(selected='all',includeAll=true){return forumCategories.filter(([id])=>includeAll||id!=='all').map(([id,label])=>`<option value="${id}" ${selected===id?'selected':''}>${label}</option>`).join('')}
function forumCard(post){const replyCount=post.replies.length;return `<article class="forum-card"><div class="forum-card-top"><span class="tag">${forumCategory(post.sport)}</span><span class="small">${post.starter?'網站團隊討論引子':forumDate(post.created)}</span></div><h3><button class="forum-title" data-thread="${esc(post.id)}">${esc(post.title)}</button></h3><p>${forumText(post.body.length>160?post.body.slice(0,160)+'…':post.body)}</p><div class="forum-meta"><span>由 ${esc(post.author)} 發表</span><span>${replyCount} 則回覆</span><span>${post.likes} 個支持</span></div></article>`}
function forumResults(){let list=forumPosts.filter(p=>(forumFilter.sport==='all'||p.sport===forumFilter.sport)&&`${p.title} ${p.body} ${forumCategory(p.sport)}`.toLowerCase().includes(forumFilter.q.toLowerCase()));list.sort((a,b)=>forumFilter.sort==='popular'?(b.likes+b.replies.length)-(a.likes+a.replies.length)||b.created-a.created:b.created-a.created);return `<p class="result-count">${list.length} 篇討論</p>${list.length?list.map(forumCard).join(''):`<div class="forum-empty">${icon('spark')}<h3>暫時沒有符合條件的討論</h3><p>試試其他關鍵字或運動，亦可發表新討論。</p></div>`}`}
function forumStatus(){return '<p id="forumStatus" class="forum-status" role="status"></p>'}
function likeButton(post){
  return `<button class="btn btn-outline" data-like="${esc(post.id)}" aria-pressed="${Boolean(post.liked)}">${icon('spark')} 支持 ${post.likes}</button>`;
}
function forumReplies(post){
  const replies=post.replies.map(r=>`<article class="forum-reply"><div class="forum-card-top"><strong>${esc(r.author)}</strong><span class="small">${forumDate(r.created)}</span></div><p>${forumText(r.body)}</p></article>`);
  return `<h2>回覆（${replies.length}）</h2>${replies.join('')||'<p class="small">暫時未有回覆，歡迎分享你的想法。</p>'}`;
}
function forumThread(post){
  return `<section class="page-hero"><div class="shell"><button class="forum-back" data-forum-back>返回討論區</button><span class="eyebrow">${forumCategory(post.sport)}${post.starter?' · 網站團隊討論引子':''}</span><h1 class="forum-thread-heading">${esc(post.title)}</h1><p>由 ${esc(post.author)} 發表${post.starter?'':' · '+forumDate(post.created)}</p></div></section><section class="section-tight"><div class="shell forum-layout"><div><article class="panel forum-thread-body"><p>${forumText(post.body)}</p><div class="forum-thread-actions"><span id="forumLike">${likeButton(post)}</span><button class="btn btn-outline" data-forum-refresh>更新討論</button></div></article><div class="forum-replies" id="forumReplies">${forumReplies(post)}</div></div><aside class="panel forum-side"><span class="eyebrow">加入討論</span><h3>寫一則回覆</h3>${forumStatus()}<form id="forumReplyForm"><label class="field">暱稱<input name="author" maxlength="30" required placeholder="例如：運動新手"></label><label class="field form-gap">你的回覆<textarea name="body" minlength="5" maxlength="800" required placeholder="分享你的經驗、問題或建議"></textarea></label><button class="btn btn-dark form-gap" type="submit">公開回覆</button></form><p class="small forum-disclaimer">任何可瀏覽此網站的人都看得到回覆。請使用暱稱，避免留下私人資料。</p></aside></div></section>`;
}
function forum(){const current=forumPosts.find(p=>p.id===activeThread);if(current)return forumThread(current);activeThread=null;return `<section class="forum-banner"><div class="shell forum-banner-inner"><div><span class="eyebrow">Beyond the Game · 同學交流</span><h1>討論區。</h1><p>問規則、分享練習心得，或為學校運動日出點子。</p><div class="notice forum-disclosure">帖子及回覆公開予任何可瀏覽此網站的人，毋須登入。請使用暱稱，避免留下私人資料。</div></div><div class="forum-banner-art" aria-hidden="true">${icon('people')}${icon('ball')}${icon('spark')}</div></div></section><section class="section-tight"><div class="shell"><div class="forum-starters"><span class="eyebrow">不知道如何開始？</span><h2>試試這些話題</h2><div class="forum-prompt-grid">${forumPrompts.map((p,i)=>`<button class="forum-prompt" data-prompt="${i}"><span class="tag">${forumCategory(p.sport)}</span><strong>${p.title}</strong><span>用這個話題發帖</span></button>`).join('')}</div></div><div class="forum-layout"><div><div class="section-heading forum-list-heading"><h2>最新話題</h2><div class="forum-list-actions"><button class="btn btn-outline" data-forum-refresh>更新討論</button><button class="btn btn-dark" data-forum-compose>發表討論</button></div></div>${forumStatus()}${saved('btg-forum-v1')&&!["[]","null"].includes(saved('btg-forum-v1'))?'<p class="small forum-legacy">舊版的私人討論仍留在此瀏覽器。 <button class="forum-back" data-forum-export>下載舊有討論備份</button></p>':''}<div class="forum-controls"><label class="field">搜尋討論<input id="forumSearch" type="search" placeholder="搜尋標題、內容或運動" value="${esc(forumFilter.q)}"></label><label class="field">運動<select id="forumSportFilter">${forumOptions(forumFilter.sport)}</select></label><label class="field">排序<select id="forumSort"><option value="new" ${forumFilter.sort==='new'?'selected':''}>最新發表</option><option value="popular" ${forumFilter.sort==='popular'?'selected':''}>最多互動</option></select></label></div><div id="forumResults" aria-live="polite">${forumResults()}</div></div><aside class="panel forum-side" id="forumCompose"><span class="eyebrow">分享你的想法</span><h3>發表新討論</h3><form id="forumPostForm"><label class="field">暱稱<input name="author" maxlength="30" required placeholder="例如：運動新手"></label><label class="field form-gap">運動類別<select name="sport" required>${forumOptions('tchoukball',false)}</select></label><label class="field form-gap">標題<input name="title" minlength="5" maxlength="90" required placeholder="你想討論甚麼？"></label><label class="field form-gap">內容<textarea name="body" minlength="10" maxlength="1200" required placeholder="寫下你的問題、心得或活動構思"></textarea></label><button class="btn btn-primary form-gap" type="submit">發表討論</button></form><p class="small forum-disclaimer">帖子公開顯示。請尊重他人，避免留下私人資料。</p></aside></div></div></section>`}

function refreshForumResults(){
  if(page!=='forum'||activeThread)return;
  forumFilter.q=$('#forumSearch').value;
  forumFilter.sport=$('#forumSportFilter').value;
  forumFilter.sort=$('#forumSort').value;
  $('#forumResults').innerHTML=forumResults();
}

function forumNotice(message,error=false){
  const status=$('#forumStatus');
  if(!status)return;
  status.setAttribute('role',error?'alert':'status');
  status.textContent=message;
}

function forumToken(){
  return Array.from(crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('');
}

function componentMessage(type,payload={}){
  window.parent.postMessage({isStreamlitMessage:true,type,...payload},window.location.origin);
}

const visitorKey='btg-forum-visitor';
let forumVisitor=saved(visitorKey);
if(!/^[a-f0-9]{32}$/.test(forumVisitor||'')){
  forumVisitor=forumToken();
  saved(visitorKey,forumVisitor);
}

let pendingForum=null,retryForum=null;
function sendForum(action,fields={},form=null){
  if(pendingForum?.request.action==='list')clearTimeout(pendingForum.timer);
  else if(pendingForum){
    forumNotice('請等待目前的討論區操作完成。');
    return;
  }
  const signature=JSON.stringify({action,...fields});
  const request={id:retryForum?.signature===signature?retryForum.id:forumToken(),
    visitor:forumVisitor,action,...fields};
  const submit=form?.querySelector('[type="submit"]');
  if(submit)submit.disabled=true;
  const timer=setTimeout(()=>{
    pendingForum=null;
    if(action!=='list')retryForum={signature,id:request.id};
    if(submit)submit.disabled=false;
    forumNotice('等候時間較長，請再試一次。',true);
  },12000);
  pendingForum={request,form,submit,timer};
  forumNotice(action==='list'?'正在載入討論…':'正在儲存…');
  componentMessage('streamlit:setComponentValue',{value:request,dataType:'json'});
}

function refreshSharedForum(){
  if(!pendingForum)sendForum('list');
}

window.addEventListener('message',event=>{
  if(event.source!==window.parent||event.origin!==window.location.origin||
    event.data?.type!=='streamlit:render')return;
  const response=event.data.args?.forum_response;
  if(!pendingForum||response?.id!==pendingForum.request.id)return;
  const {request,form,submit,timer}=pendingForum;
  clearTimeout(timer);
  pendingForum=null;
  if(submit)submit.disabled=false;
  if(response.error){
    forumNotice(response.error,true);
    return;
  }
  if(retryForum?.id===request.id)retryForum=null;
  forumPosts=response.posts;
  if(page!=='forum')return;
  if(request.action==='post'&&form?.isConnected){
    forumFilter={q:'',sport:'all',sort:'new'};
    activeThread=response.post;
    render();
    focusPageTop();
    forumNotice('帖子已公開。');
    return;
  }
  if(!activeThread){
    refreshForumResults();
  }else{
    const post=forumPosts.find(p=>p.id===activeThread);
    if(post){
      const restoreLikeFocus=document.activeElement?.matches('[data-like]');
      $('#forumLike').innerHTML=likeButton(post);
      if(restoreLikeFocus)$('[data-like]').focus({preventScroll:true});
      $('#forumReplies').innerHTML=forumReplies(post);
    }
  }
  if(request.action==='reply'&&form?.isConnected){
    if(form.elements.body.value.trim()===request.body)form.elements.body.value='';
    forumNotice('回覆已公開。');
  }else{
    forumNotice('');
  }
});

document.addEventListener('input',e=>{if(e.target.id==='forumSearch')refreshForumResults()});
document.addEventListener('change',e=>{
  if(['forumSportFilter','forumSort'].includes(e.target.id))refreshForumResults();
});
document.addEventListener('click',e=>{
  const target=e.target.closest('[data-thread], [data-like], [data-forum-back], [data-forum-compose], [data-prompt], [data-forum-refresh], [data-forum-export]');
  if(!target)return;
  if(target.hasAttribute('data-forum-refresh')){
    refreshSharedForum();
  }else if(target.dataset.thread||target.hasAttribute('data-forum-back')){
    activeThread=target.dataset.thread||null;
    render();
    focusPageTop();
    refreshSharedForum();
  }else if(target.dataset.like){
    const post=forumPosts.find(p=>p.id===target.dataset.like);
    if(post)sendForum('like',{post:post.id,liked:!post.liked});
  }else if(target.hasAttribute('data-forum-export')){
    const url=URL.createObjectURL(new Blob([saved('btg-forum-v1')],{type:'application/json'}));
    const link=document.createElement('a');
    link.href=url;
    link.download='beyond-the-game-private-discussions.json';
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }else{
    const form=$('#forumPostForm');
    const prompt=forumPrompts[target.dataset.prompt];
    if(prompt){
      form.elements.sport.value=prompt.sport;
      form.elements.title.value=prompt.title;
      form.elements.body.value=prompt.body;
    }
    $('#forumCompose').scrollIntoView({behavior:'smooth',block:'start'});
    form.elements.author.focus({preventScroll:true});
  }
});

document.addEventListener('submit',e=>{
  const form=e.target;
  if(!['forumPostForm','forumReplyForm'].includes(form.id))return;
  e.preventDefault();
  const data=new FormData(form);
  const author=data.get('author').trim(),body=data.get('body').trim();
  const isPost=form.id==='forumPostForm';
  const title=isPost?data.get('title').trim():'';
  if(!author||body.length<(isPost?10:5)||(isPost&&title.length<5)){
    forumNotice('請檢查必填欄位及字數。',true);
    return;
  }
  if(isPost)sendForum('post',{author,body,title,sport:data.get('sport')},form);
  else sendForum('reply',{author,body,post:activeThread},form);
});

componentMessage('streamlit:componentReady',{apiVersion:1});
componentMessage('streamlit:setFrameHeight',{height:window.innerHeight});

render();
