const token = process.env.NOTION_TOKEN;
const encoded = process.env.READING_PAYLOAD_B64 || "";
if (!token) throw new Error("GitHub Secret NOTION_TOKEN이 없습니다.");
if (!encoded) throw new Error("타로 리딩 payload가 없습니다.");
const reading = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
if (reading.source !== "tarot-github-action-v2") throw new Error("지원하지 않는 요청입니다.");
if (!reading.spread || !Array.isArray(reading.cards)) throw new Error("필수 리딩 데이터가 없습니다.");

const DATA_SOURCE_ID = "3870202e-da70-401c-a05c-4b9cff60a058";
const headers = {Authorization:`Bearer ${token}`,"Notion-Version":"2026-03-11","Content-Type":"application/json"};
const rich = v => ({rich_text:[{type:"text",text:{content:String(v||"").slice(0,1900)}}]});
const paragraph = v => ({object:"block",type:"paragraph",paragraph:{rich_text:[{type:"text",text:{content:String(v||"").slice(0,1900)}}]}});
const heading = v => ({object:"block",type:"heading_2",heading_2:{rich_text:[{type:"text",text:{content:v}}]}});
const chunks = String(reading.detailed||"").match(/[\s\S]{1,1800}/g)||[];
const advice = Array.isArray(reading.advice)?reading.advice.slice(0,5):[];
const cards = reading.cards.slice(0,12).join(" → ");
const payload = {
  parent:{type:"data_source_id",data_source_id:DATA_SOURCE_ID},
  properties:{
    "리딩 제목":{title:[{type:"text",text:{content:String(reading.title||`${reading.spread} 리딩`).slice(0,100)}}]},
    "스프레드":rich(reading.spread),"질문":rich(reading.question),"카드 순서":rich(cards),
    "요약 해석":rich(reading.summary),"조언":rich(advice.join(" · "))
  },
  children:[heading("질문"),paragraph(reading.question||"질문 없음"),...(reading.situation?[heading("현재 상황"),paragraph(reading.situation)]:[]),heading("스프레드와 카드 순서"),paragraph(`${reading.spread}\n${cards}`),heading("요약 해석"),paragraph(reading.summary),heading("상세 해석"),...chunks.map(paragraph),heading("조언"),...advice.map(item=>({object:"block",type:"bulleted_list_item",bulleted_list_item:{rich_text:[{type:"text",text:{content:String(item).slice(0,1900)}}]}}))]
};
const response = await fetch("https://api.notion.com/v1/pages",{method:"POST",headers,body:JSON.stringify(payload)});
if(!response.ok) throw new Error(`Notion API ${response.status}: ${await response.text()}`);
const page=await response.json();
console.log(`Notion 저장 완료: ${page.url}`);
