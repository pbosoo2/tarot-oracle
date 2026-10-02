const token = process.env.NOTION_TOKEN;
const body = process.env.ISSUE_BODY || "";
if (!token) throw new Error("GitHub Secret NOTION_TOKEN이 없습니다.");
const match = body.match(/<!-- TAROT_PAYLOAD_START\n([\s\S]*?)\nTAROT_PAYLOAD_END -->/);
if (!match) throw new Error("타로 저장 데이터가 없습니다.");
const reading = JSON.parse(match[1]);
if (reading.source !== "tarot-github-action-v1") throw new Error("지원하지 않는 요청입니다.");
if (!reading.spread || !Array.isArray(reading.cards)) throw new Error("필수 리딩 데이터가 없습니다.");

const DATA_SOURCE_ID = "3870202e-da70-401c-a05c-4b9cff60a058";
const API = "https://api.notion.com/v1/pages";
const headers = {
  Authorization: `Bearer ${token}`,
  "Notion-Version": "2026-03-11",
  "Content-Type": "application/json",
};
const rich = value => ({ rich_text: [{ type: "text", text: { content: String(value || "").slice(0, 1900) } }] });
const paragraph = value => ({ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: String(value || "").slice(0, 1900) } }] } });
const heading = value => ({ object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: value } }] } });
const chunks = String(reading.detailed || "").match(/[\s\S]{1,1800}/g) || [];
const advice = Array.isArray(reading.advice) ? reading.advice.slice(0, 5) : [];
const cards = reading.cards.slice(0, 12).join(" → ");

const payload = {
  parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
  properties: {
    "리딩 제목": { title: [{ type: "text", text: { content: String(reading.title || `${reading.spread} 리딩`).slice(0, 100) } }] },
    "스프레드": rich(reading.spread),
    "질문": rich(reading.question),
    "카드 순서": rich(cards),
    "요약 해석": rich(reading.summary),
    "조언": rich(advice.join(" · ")),
  },
  children: [
    heading("질문"), paragraph(reading.question || "질문 없음"),
    ...(reading.situation ? [heading("현재 상황"), paragraph(reading.situation)] : []),
    heading("스프레드와 카드 순서"), paragraph(`${reading.spread}\n${cards}`),
    heading("요약 해석"), paragraph(reading.summary),
    heading("상세 해석"), ...chunks.map(paragraph),
    heading("조언"), ...advice.map(item => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: String(item).slice(0, 1900) } }] } })),
  ],
};

const response = await fetch(API, { method: "POST", headers, body: JSON.stringify(payload) });
if (!response.ok) throw new Error(`Notion API ${response.status}: ${await response.text()}`);
const page = await response.json();
console.log(`Notion 저장 완료: ${page.url}`);
