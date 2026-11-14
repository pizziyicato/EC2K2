// Public bootstrap helpers. No course modules or data are loaded at module scope.
export const emptyProgress=()=>({version:2,answers:{},bookmarks:[],understood:[],walks:{},session:null});
export function cleanBootstrapProgress(value){
 if(!value||value.version!==2||!value.answers||typeof value.answers!=='object'||Array.isArray(value.answers)||!Array.isArray(value.bookmarks)||!Array.isArray(value.understood))return emptyProgress();
 try{return JSON.parse(JSON.stringify({...value,walks:value.walks&&typeof value.walks==='object'?value.walks:{},session:value.session||null}))}catch{return emptyProgress()}
}
export function safeStudyHash(hash){
 return typeof hash==='string'&&/^#(?:home|ib400|st100|pb20|recaps|decoded|session|question|coverage|admin|account)(?:\/[A-Za-z0-9_-]+){0,3}$/.test(hash)&&hash.length<=240?hash:'#home';
}
export const signInReturnPath=hash=>'/'+safeStudyHash(hash);
const accessError=(code,message)=>Object.assign(new Error(message),{code});
export async function loadProtectedCourse({getAccess,signal,fetcher=globalThis.fetch,importer=url=>import(url)}){
 const expected={...getAccess()};
 if(!expected?.hasAccount||!expected.userId)throw accessError('account_required','Sign in and create your EC2K2 account to continue.');
 const guard=()=>{const now=getAccess();if(signal?.aborted||!now?.hasAccount||now.userId!==expected.userId||now.generation!==expected.generation)throw accessError('account_changed','Your account changed while the study space was opening.')};
 guard();
 const responses=await Promise.all(['data.json?v=6','banks.json?v=6','pb20.json?v=6'].map(url=>fetcher(url,{credentials:'same-origin',cache:'no-store',signal,headers:{Accept:'application/json','X-EC2K2-User':expected.userId}})));
 guard();
 if(responses.some(r=>r.status===401||r.status===403))throw accessError('account_required','Sign in and create your EC2K2 account to continue.');
 if(responses.some(r=>!r.ok))throw new Error('Course content could not be loaded. Please try again.');
 const [data,banks,pb]=await Promise.all(responses.map(r=>r.json()));guard();
 if(!Array.isArray(data.lessons)||!Array.isArray(data.questions)||!Array.isArray(banks.st)||!Array.isArray(banks.recaps)||!Array.isArray(pb.questions)||!Array.isArray(pb.cases)||!Array.isArray(pb.sources))throw new Error('Course data format is invalid.');
 const [quiz,labs,walkthrough]=await Promise.all([importer('./quiz.js?v=6'),importer('./labs.js?v=4'),importer('./walkthrough.js?v=6')]);guard();
 return {data,banks,pb,quiz,labs,walkthrough};
}
