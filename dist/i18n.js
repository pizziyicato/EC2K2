const KEY='ec2k2-ui-language';
const dictionary={
 'Home':'首页','Language':'语言','Main navigation':'主菜单','YOUR EC2102 STUDY SPACE':'你的 EC2102 学习空间',
 'YOUR EC2K2 ACCOUNT':'你的 EC2K2 账户','Log in / Sign up':'登录 / 注册','My account':'我的账户','Create account':'创建账户',
 'Owner dashboard':'站主控制台','Owner access only':'仅限站主访问','Open account':'打开账户','Your account':'你的账户',
 'Export progress':'导出进度','Import':'导入','Display name':'显示名称','Sign out':'退出登录','Sync progress now':'立即同步进度',
 'Log in or sign up with ChatGPT':'通过 ChatGPT 登录或注册','Create my EC2K2 account':'创建我的 EC2K2 账户',
 'Create your EC2K2 account':'创建你的 EC2K2 账户','What your account records':'账户会记录哪些信息',
 'Return to the study space':'返回学习空间','Go to your account':'前往账户','A personal place to resume':'随时接着上次进度学习',
 'Bring this device’s guest progress into my account':'将本设备以前的访客进度导入账户','Copy guest progress to my account':'将访客进度复制到账户',
 'Progress saved to your account':'进度已保存到账户','Account progress is up to date':'账户进度已同步','Saving account progress…':'正在保存账户进度…',
 'Loading account progress…':'正在读取账户进度…','Checking your account…':'正在验证账户…','Create an account to enable cloud saving':'创建账户以启用云端保存',
 'Saved on this device · cloud sync will retry':'已保存在本设备，稍后将重试云端同步','Saved on this device · cloud sync unavailable':'已保存在本设备，暂时无法云端同步',
 'Saved on this device · account service unavailable':'已保存在本设备，账户服务暂时不可用','Opening your study space…':'正在打开学习空间…',
 'Your sign-in is ready. Choose a display name to create your study profile.':'你已完成身份验证。请选择显示名称，以创建学习账户。',
 'Your display name, sign-in name and email, quiz responses and confidence, study activity, and timestamps are recorded and visible to the site owner, who uses them to review study activity. Your saved progress is private to you and the site owner. Guest progress stays on this device unless you choose to copy it into your account.':'系统会记录你的显示名称、登录姓名和电子邮箱、答题记录及信心程度、学习活动和时间。站主可以查看这些记录，以了解学习活动。已保存的进度仅对你和站主可见。以前的访客进度保留在本设备，除非你选择将其复制到账户。',
 'Answers and explanations are public. Your saved progress is private to you and the site owner. The owner can review your display name, sign-in name and email, quiz responses and confidence, study activity, and timestamps.':'学习资料供注册用户使用。你保存的进度仅对你和站主可见。站主可以查看你的显示名称、登录姓名和电子邮箱、答题记录及信心程度、学习活动和时间。',
 'Chapter':'章节','Tutorial':'基础','Exam':'考试','Challenge':'挑战','Recap':'复习','Difficulty':'难度','Review queue':'复习筛选','Search':'搜索',
 'All 12 chapters':'全部 12 章','All 10 tutorials':'全部 10 份习题','All levels in this bank':'本题库全部难度','All questions':'全部题目','Unattempted':'未作答',
 'Incorrect or revised':'答错或已修订','Bookmarked':'已收藏','Unsure or guessed':'不确定或猜测','Keyword, idea or equation…':'关键词、概念或公式…',
 'Practice · immediate explanations':'练习模式 · 即时解析','Exam · explanations after finishing':'考试模式 · 完成后显示解析',
 '10 questions':'10 题','20 questions':'20 题','40 questions':'40 题','100 questions':'100 题','All matching questions':'全部符合条件的题目',
 'Source order':'原始顺序','Shuffle questions':'随机题序','Untimed':'不限时','30 minutes':'30 分钟','40 minutes':'40 分钟','60 minutes':'60 分钟','80 minutes':'80 分钟','120 minutes':'120 分钟','160 minutes':'160 分钟',
 'Start a new set':'开始一组练习','Continue session':'继续练习','Review results':'查看结果','Show all chapter concepts':'显示本章全部概念',
 'Know why your answer is right.':'理解答案为什么正确。','Make the models work together.':'将不同模型联系起来。',
 'Rebuild every tutorial, one decision at a time.':'逐步重建每份习题的推理。','Every tutorial part, mapped':'每个习题小问都有对应练习',
 'Your course coverage':'课程覆盖情况','Questions':'题目','Attempted':'已作答','Latest correct':'最近答对','Practise':'练习',
 'QUESTIONS ATTEMPTED':'已作答题目','LATEST ANSWER ACCURACY':'最近作答正确率','BOOKMARKED':'已收藏','QUESTIONS TO REVISIT':'需要重做的题目',
 'IB400 QUESTIONS ATTEMPTED':'IB400 已作答题目','CONCEPTS SELF-CHECKED':'已自查概念','CASES COMPLETED':'已完成案例','PARTS ATTEMPTED':'已作答小问','CASES TO REVISIT':'需要复习的案例',
 'Context':'背景','All contexts':'全部背景','All cases':'全部案例','Unfinished cases':'未完成案例','Incorrect or revised parts':'答错或已修订的小问','Completed cases':'已完成案例',
 'Concept, case or equation…':'概念、案例或公式…','Start all matching cases':'开始全部符合条件的案例','Open case':'打开案例',
 'Case brief and model assumptions':'案例背景与模型假设','Hypothetical teaching scenario':'假设性教学情境','Restart all eight parts':'重新开始全部八个小问',
 'One question. Six possibilities.':'一道题，六个选项。','One question. Five possibilities.':'一道题，五个选项。','Review the reasoning.':'回顾推理过程。',
 'Cross out':'划去','Restore':'恢复','How certain are you?':'你有多大把握？','Guessed':'猜测','Unsure':'不确定','Confident':'有把握',
 'Check answer':'检查答案','Previous':'上一题','Next':'下一题','Finish & review':'完成并查看解析','Finish this set':'结束本组练习',
 'Back to results':'返回结果','Redo this question':'重做本题','Clear this attempt':'清除此轮作答','Redo in a new practice set':'在新练习中重做',
 'Why this is a stretch':'本题的进阶之处','Understand this in Decoded':'在 Decoded 中理解这个概念',
 'Correct. Now check the mechanism.':'正确。接着检查背后的机制。','Revisit the mechanism.':'重新梳理背后的机制。','Unanswered':'未作答',
 'Turn the mistakes into understanding.':'从错误中建立理解。','Review every answer':'逐题查看解析','Redo incorrect & unanswered':'重做答错及未作答题目','Redo the full set':'重做整组题目','Choose another set':'选择另一组题目',
 'Your answer trail':'你的作答记录','Every option has an explanation.':'每个选项都有解析。','Start a practice set':'开始一组练习','Open IB400':'打开 IB400',
 'Translate question · 中文':'翻译题目 · Google 翻译','Translate explanations · 中文':'翻译解析 · Google 翻译','Translate case brief · 中文':'翻译案例背景 · Google 翻译',
 'Translation opens in Google Translate.':'点击后将在 Google 翻译中打开。',
 'Explore Decoded':'探索 Decoded','Practise with IB400':'使用 IB400 练习','Five ways to make the course yours.':'五种方式，逐步掌握课程。',
 'Find out what you understand':'检验你的理解','Push beyond the familiar':'突破熟悉的题型','Follow the entire chain of reasoning':'跟完整个推理过程','Make every curve mean something':'理解每条曲线的含义','Rebuild the tutorial reasoning':'重建习题推理',
 'PRACTISE & DIAGNOSE':'练习与诊断','COMBINE & CHALLENGE':'综合与挑战','APPLY & CONNECT':'应用与联系','EXPLORE & UNDERSTAND':'探索与理解','REVISIT & RECONSTRUCT':'复习与重建',
 'All chapters':'全部章节','Practise this chapter':'练习本章','Find a concept, equation or chapter…':'搜索概念、公式或章节…','The course, connected':'贯通整门课程',
 'Test this concept':'练习这个概念','Next concept':'下一个概念','I can explain this':'我能解释这个概念','Self-checked':'已自查',
 'Quick reference · formula, cases and worked example':'速查 · 公式、情形与例题','The mechanism':'作用机制','When the usual conclusion changes':'通常结论何时会改变','Compare your explanation':'对照你的解释',
 'GUIDED WALKTHROUGH':'分步推导','Make each step make sense.':'理解每一步的理由。','Before you start · symbols and assumptions':'开始之前 · 符号与假设',
 'Derive it':'逐步推导','Build the graph':'构建图形','Increase case':'增加的情形','Decrease case':'减少的情形','Edge cases':'边界情形',
 'Go to a step':'跳转至某一步','Read the whole sequence':'阅读完整过程','Return to one step':'返回单步视图','Pause and explain':'暂停并解释','Compare the reasoning':'对照推理',
 'Previous step':'上一步','Next step':'下一步','Next sequence':'下一组推导','Try the experiment':'试试交互实验','Put the mechanism in your own words…':'用自己的话解释这个机制…',
 'Close ×':'关闭 ×','Enlarge graph':'放大图形','Reset':'重置','Reset controls':'重置参数','Explore this step':'查看这一步','Explore this step and its diagram':'查看这一步及其图形',
 'Course map & sources':'课程覆盖与来源','Sources and model assumptions':'资料来源与模型假设','Source code':'源代码','Source and concept index':'资料与概念索引','Model boundaries that matter':'重要的模型适用边界',
 'See the corrections and clarifications':'查看修正与澄清','Every existing question reviewed again':'全部既有题目已重新检查',
 'OWNER SPACE':'站主管理','People & progress.':'用户与学习进度。','Private · owner only':'私密 · 仅限站主','Learners':'学习者','Find a name or email':'搜索姓名或邮箱','Search learners':'搜索学习者',
 'Choose a learner':'选择学习者','SELECTED LEARNER':'已选学习者','Joined':'注册时间','Last seen':'最近活动','Progress last saved':'最近保存进度','Refresh this learner':'刷新该用户记录',
 'Saved progress':'已保存进度','Saved answers':'已保存答案','Recorded activity':'活动记录','Activity type':'活动类型','All activity':'全部活动','Question number':'题目编号','Any question':'任意题目','Apply filters':'应用筛选',
 'Find a saved answer':'搜索已保存答案','Question number or prompt':'题目编号或题干','Show':'显示','All saved answers':'全部已保存答案','Does not match current key':'与当前正确答案不符','Content changed · revisit':'内容已修订，需重做','Unavailable question or option':'题目或选项当前不可用',
 'Filter answers':'筛选答案','Next page':'下一页','First page / refresh':'第一页 / 刷新','Download account & saved progress (JSON)':'下载账户资料及进度（JSON）','Download this activity page (JSON)':'下载本页活动（JSON）',
 'Saved MCQ responses':'已保存选择题答案','Flagged after content changes':'内容修订后需复习','Bookmarked questions':'收藏题目','Concepts self-checked':'已自查概念','Matches current key':'与当前正确答案一致',
 'Not recorded':'未记录','Page opened':'打开页面','Question opened':'打开题目','Answer checked':'检查答案','Option selected':'选择选项','Option crossed out or restored':'划去或恢复选项','Confidence changed':'更改信心程度',
 'Question restarted':'重做题目','Practice set started':'开始练习','Practice set finished':'结束练习','Bookmark changed':'更改收藏','Concept self-check changed':'更改概念自查','Guided step opened':'打开推导步骤','Reflection submitted':'提交解释',
 'Progress imported':'导入进度','Guest progress copied':'复制访客进度','Progress exported':'导出进度','Account created':'创建账户','Signed-in study session':'已登录的学习会话','Signed out':'退出登录',
 'Foundations & production':'基础与生产','The labour market':'劳动市场','Consumption & saving':'消费与储蓄','The consumer–worker':'消费者与劳动者','Fiscal policy & Ricardian equivalence':'财政政策与李嘉图等价',
 'Investment & the goods market':'投资与商品市场','Money & the asset market':'货币与资产市场','Business-cycle facts':'经济周期事实','The IS–LM–FE model':'IS–LM–FE 模型','The Classical model':'古典模型','The Keynesian model':'凯恩斯模型','Inflation & unemployment':'通货膨胀与失业'
};
Object.assign(dictionary,{
 "Start practising": "开始练习",
 "Explore IB400": "浏览 IB400",
 "Open S&T100": "打开 S&T100",
 "Explore PB20": "浏览 PB20",
 "Open Recaps": "打开习题复习",
 "Explore the EC2K2 repository": "查看 EC2K2 代码仓库",
 "Build the foundation": "打好基础",
 "Push your reasoning": "深化推理",
 "Follow the whole case": "跟完整个案例",
 "Understand the mechanism": "理解作用机制",
 "Reconnect the tutorials": "重温习题逻辑",
 "Your guide to the site": "网站使用指南",
 "Five sections. Different jobs.": "五个板块，各有所长。",
 "A suggested study route": "建议学习路线",
 "Understand": "理解",
 "Reconnect": "联系",
 "Stretch": "挑战",
 "Apply": "应用",
 "Your study space": "你的学习空间",
 "Welcome to EC2K2": "欢迎来到 EC2K2",
 "Opening your study space": "正在打开学习空间",
 "Check my account again": "重新验证账户",
 "Check your account": "检查账户",
 "Try again": "重试",
 "Sign in to open the course": "登录后开始学习",
 "Sign in to study": "登录后学习",
 "Bring earlier guest progress into my account": "将以前的访客进度导入账户",
 "Copy earlier guest progress to my account": "将以前的访客进度复制到账户",
 "Your sign-in is ready. Choose a display name to open your study space.": "你已完成身份验证。请选择显示名称，以打开学习空间。",
 "Sign in with ChatGPT and create your EC2K2 profile to access the questions, Decoded and study tools. Registration is open to everyone.": "通过 ChatGPT 登录并创建 EC2K2 账户，即可使用题库、Decoded 和学习工具。所有人均可注册。",
 "Your study space starts here": "从这里开始学习",
 "Sign in.": "登录。",
 "Make the course yours.": "逐步掌握这门课。",
 "Keep your progress.": "保存学习进度。",
 "Pick up anywhere.": "随时随地继续学习。",
 "Account verification unavailable · reconnect to open the course": "暂时无法验证账户，重新连接后即可打开课程",
 "Sign in and create your account to study": "登录并创建账户后开始学习",
 "Your saved progress is private to you and the site owner. The owner can review your display name, sign-in name and email, quiz responses and confidence, study activity, and timestamps.": "你保存的进度仅对你和站主可见。站主可以查看你的显示名称、登录姓名及邮箱、答题记录与信心程度、学习活动和时间。",
 "Your display name, sign-in name and email, quiz responses and confidence, study activity, and timestamps are recorded and visible to the site owner, who uses them to review study activity. Your saved progress is private to you and the site owner. Any guest progress saved before accounts became required stays on this device unless you choose to copy it into your account.": "系统会记录你的显示名称、登录姓名及邮箱、答题记录与信心程度、学习活动和时间，供站主了解学习活动。已保存进度仅对你和站主可见。强制注册之前保存的访客记录仍留在本设备，除非你选择将其复制到账户。",
 "An account is required for all study tools. Your account keeps a separate device copy and syncs it when connected. Earlier guest records remain available for explicit import after signing in. Signing out closes the study space.": "使用学习工具需要账户。你的账户会在本设备保留独立副本，并在联网时同步。登录后可以手动导入以前的访客记录。退出登录会关闭学习空间。"
});
const originals=new WeakMap();let language='en',scheduled=false,observer;
try{language=localStorage.getItem(KEY)==='zh'?'zh':'en'}catch{}
const protectedSelector='.choices,.feedback>p,.pb-news,.pb-brief ol,.pb-card>p,.pb-card h2,.pb-objectives,.concept-panel>.explain,.mechanism,.cases,.example,.formula,.walk-why,.walk-math,.walk-reason h4,.walk-predict p,.walk-predict textarea,.walk-predict details p,.walk-complete li h4,.walk-complete li p,.walk-setup-grid,.walk-sources,.admin-person,#admin-learner-name,.admin-email,#admin-answers,#admin-events,#admin-reflections,.admin-reference-list,.account-card:has(#sync-now) h2,[data-no-i18n],svg,script,style,textarea,code';
function translate(text){
 const trimmed=text.trim();if(!trimmed)return text;
 let value=dictionary[trimmed];
 if(!value){const m=trimmed.match(/^([←↻✓]\s*)?(.*?)(\s*[→↗↓])?$/);if(m&&dictionary[m[2]])value=(m[1]||'')+dictionary[m[2]]+(m[3]||'')}
 if(!value){const rules=[[/^(\d+) matching questions$/,m=>`${m[1]} 道符合条件的题目`],[/^Tutorial (\d+)$/,m=>`习题 ${m[1]}`],[/^(\d+) cases · (\d+) parts$/,m=>`${m[1]} 个案例 · ${m[2]} 个小问`],[/^(\d+) of (\d+) answered$/,m=>`已作答 ${m[1]} / ${m[2]}`],[/^Page (\d+)$/,m=>`第 ${m[1]} 页`],[/^(\d+) \/ (\d+) steps visited$/,m=>`已查看 ${m[1]} / ${m[2]} 步`],[/^Answer ([A-F])$/,m=>`正确答案 ${m[1]}`],[/^Chapter (\d+)$/,m=>`第 ${m[1]} 章`],[/^(\d+) questions$/,m=>`${m[1]} 题`]];for(const[pattern,fn]of rules){const m=trimmed.match(pattern);if(m){value=fn(m);break}}}
 return value?text.replace(trimmed,value):text;
}
function apply(){
 scheduled=false;observer?.disconnect();document.documentElement.lang=language==='zh'?'zh-Hans':'en';
 for(const option of document.querySelectorAll('option:not([value])'))option.value=option.textContent;
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){
  const parent=node.parentElement;if(!parent||parent.closest(protectedSelector)||parent.id==='site-language')continue;
  if(!parent.closest('button,a,label,summary,select,.topbar,.eyebrow,.small,.badge,.stat span,.stat strong,.account-status,h1,h2,h3,h4,.account-card,.note,dt,.admin-small,.intro,.confidence,.session-options,.translation-tools')||parent.closest('.question-card>h2'))continue;
  const previous=originals.get(node);let original=node.nodeValue;
  if(previous&&(original===previous.translated||original===previous.original))original=previous.original;
  const translated=language==='zh'?(original.trim()==='Tutorial'&&parent.matches('label')&&parent.querySelector('#filter-tutorial')?original.replace('Tutorial','习题'):translate(original)):original;originals.set(node,{original,translated});if(node.nodeValue!==translated)node.nodeValue=translated;
 }
 for(const el of document.querySelectorAll('[placeholder],[aria-label],[title]')){
  if(el.closest('.choices,.admin-person,[data-no-i18n]'))continue;
  for(const attribute of ['placeholder','aria-label','title']){if(!el.hasAttribute(attribute))continue;const key='i18n'+attribute.replace('-',''),current=el.getAttribute(attribute),original=el.dataset[key]||current;if(!el.dataset[key])el.dataset[key]=original;el.setAttribute(attribute,language==='zh'?translate(original):original)}
 }
 const control=document.querySelector('#site-language');if(control)control.value=language;
 observer?.observe(document.body,{subtree:true,childList:true,characterData:true});
}
export function initLanguage(){
 const control=document.querySelector('#site-language');control?.addEventListener('change',()=>{language=control.value==='zh'?'zh':'en';try{localStorage.setItem(KEY,language)}catch{}apply()});
 window.addEventListener('storage',e=>{if(e.key===KEY){language=e.newValue==='zh'?'zh':'en';apply()}});
 observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(apply)}});apply();window.ec2k2TranslateUI=apply;
}
export function translationLinks(text,label='Translate question · 中文'){
 const chunks=[];let rest=String(text);while(rest.length>4800){let cut=rest.lastIndexOf('\n',4800);if(cut<1000)cut=4800;chunks.push(rest.slice(0,cut));rest=rest.slice(cut).trimStart()}if(rest)chunks.push(rest);
 return chunks.map((chunk,i)=>`<a class="translation-link quiet" href="https://translate.google.com/?sl=en&amp;tl=zh-CN&amp;text=${encodeURIComponent(chunk)}&amp;op=translate" target="_blank" rel="noopener noreferrer">${label}${chunks.length>1?` ${i+1}/${chunks.length}`:''} ↗</a>`).join(' ');
}
