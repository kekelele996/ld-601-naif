// 设施封控闭环前端运行时冒烟测试：jsdom 渲染真实页面 + 真实后端(localhost:3000)
import { JSDOM } from "jsdom";
import esbuild from "esbuild";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: "http://localhost:20101/facilities", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.Event = dom.window.Event;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.matchMedia = dom.window.matchMedia ?? (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
dom.window.matchMedia = globalThis.matchMedia;
// antd App context message 需要
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
dom.window.ResizeObserver = globalThis.ResizeObserver;
for (const name of ["SVGElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLButtonElement", "HTMLSelectElement", "DocumentFragment", "ShadowRoot", "DOMParser", "XMLSerializer"]) {
  if (dom.window[name]) globalThis[name] = dom.window[name];
}
globalThis.DOMParser = dom.window.DOMParser;
globalThis.XMLSerializer = dom.window.XMLSerializer;
dom.window.scrollTo = () => {};
globalThis.scrollTo = () => {};

// jsdom 没有 fetch，页面全部使用相对路径 /api：把相对 URL 指向真实后端
const nodeFetch = globalThis.fetch;
const absoluteFetch = (input, init) => {
  const url = typeof input === "string" || input instanceof URL ? input : input.url;
  const absolute = new URL(String(url), "http://localhost:3000");
  if (typeof input !== "string" && !(input instanceof URL)) return nodeFetch(new Request(absolute, input), init);
  return nodeFetch(absolute, init);
};
globalThis.fetch = absoluteFetch;
dom.window.fetch = absoluteFetch;

const entry = path.join("/workspace/frontend", "smoke-entry.tsx");
fs.writeFileSync(
  entry,
  `import React from "react";
   import { createRoot } from "react-dom/client";
   import { FacilitiesPage } from ${JSON.stringify(path.resolve("/workspace/frontend/src/pages/FacilitiesPage.tsx"))};
   const root = createRoot(document.getElementById("root"));
   root.render(React.createElement(FacilitiesPage));
   setInterval(() => {}, 1 << 30);`
);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  outfile: path.join("/workspace/frontend", "smoke-bundle.js"),
  loader: { ".css": "empty" },
  define: { "process.env.NODE_ENV": '"test"' },
  alias: { "@": "/workspace/frontend/src" }
});

await import(path.join("/workspace/frontend", "smoke-bundle.js"));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await sleep(2500);

const text = () => document.body.textContent ?? "";
const assert = (cond, label) => {
  if (!cond) {
    console.error("FAIL:", label);
    process.exitCode = 1;
  } else {
    console.log("PASS:", label);
  }
};

assert(text().includes("设施巡检 · 封控闭环"), "页面标题渲染");
assert(text().includes("换乘大厅1号无障碍电梯"), "回读到设施列表");
assert(text().includes("因障碍封控"), "封控按钮渲染");
assert(text().includes("路线状态回读") && text().includes("协助请求回读"), "路线与协助请求回读区块");

// 打开封控弹窗并提交（设施1）
const buttons = Array.from(document.querySelectorAll("button"));
const closeBtn = buttons.find((b) => (b.textContent ?? "").includes("因障碍封控"));
assert(Boolean(closeBtn), "找到封控按钮");
closeBtn.click();
await sleep(500);
assert(text().includes("影响范围") && text().includes("预计解除时间"), "封控表单包含影响范围和预计解除时间");

const future = new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 16);
const textarea = document.querySelector("textarea");
textarea.value = "冒烟测试影响范围：B1电梯";
textarea.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
const dt = document.querySelector('input[type="datetime-local"]');
dt.value = future;
dt.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
dt.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
await sleep(200);

const submitBtn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent ?? "").includes("提交封控"));
submitBtn.click();
await sleep(2500);

const afterClose = text();
assert(afterClose.includes("封控成功"), "封控成功提示");
assert(afterClose.includes("禁止派单"), "路线禁止派单状态回读");
assert(afterClose.includes("待重派"), "退回待重派状态回读");
assert(afterClose.includes("封控中"), "设施封控中标记回读");

// 解除封控
const releaseBtn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent ?? "").includes("解除封控"));
assert(Boolean(releaseBtn), "找到解除按钮");
releaseBtn.click();
await sleep(500);
assert(text().includes("仍有待核实障碍"), "解除前提示待核实障碍规则");
const confirmBtn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent ?? "").includes("确认解除"));
confirmBtn.click();
await sleep(2500);

const afterRelease = text();
assert(afterRelease.includes("解除成功"), "解除成功提示");
assert(afterRelease.includes("保持高风险"), "高风险禁派说明回读");
assert(afterRelease.includes("已解除"), "封控记录已解除时间线回读");

console.log(process.exitCode ? "SMOKE FAILED" : "SMOKE PASSED");
process.exit(process.exitCode ?? 0);
