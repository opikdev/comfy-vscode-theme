#!/usr/bin/env node
// Generates both Comfy variants from palette/comfy.json.
// Never edit themes/*.json by hand; change the palette and re-run.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = JSON.parse(readFileSync(join(root, "palette/comfy.json"), "utf8"));

// --- contrast, so the build fails loudly if a colour drifts out of band ---
const lin = (c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const build = (key, v) => {
  const { base: b, syntax: s, state: st, ansi: a } = v;
  const dark = v.appearance === "dark";
  const alpha = (hex, aa) => hex + aa;

  const colors = {
    focusBorder: alpha(b.accent, "66"),
    foreground: b.text1,
    disabledForeground: b.text3,
    descriptionForeground: b.text2,
    errorForeground: st.error,
    "icon.foreground": b.text2,
    "selection.background": b.sel,
    "widget.border": b.border,
    "sash.hoverBorder": alpha(b.accent, "66"),

    "editor.background": b.bg,
    "editor.foreground": b.text1,
    "editorLineNumber.foreground": b.gutter,
    "editorLineNumber.activeForeground": b.text2,
    "editorCursor.foreground": b.accent,
    "editor.selectionBackground": b.sel,
    "editor.selectionHighlightBackground": alpha(b.sel, "99"),
    "editor.inactiveSelectionBackground": alpha(b.sel, "66"),
    "editor.wordHighlightBackground": alpha(b.sel, "80"),
    "editor.wordHighlightStrongBackground": alpha(b.accent, "24"),
    "editor.findMatchBackground": alpha(b.accent, "40"),
    "editor.findMatchHighlightBackground": alpha(b.accent, "24"),
    "editor.lineHighlightBackground": b.line,
    "editor.rangeHighlightBackground": b.line,
    "editor.foldBackground": b.line,
    "editorIndentGuide.background1": b.border,
    "editorIndentGuide.activeBackground1": b.gutter,
    "editorWhitespace.foreground": b.border,
    "editorRuler.foreground": b.border,
    "editorBracketMatch.background": alpha(b.accent, "24"),
    "editorBracketMatch.border": alpha(b.accent, "66"),
    "editorBracketHighlight.foreground1": s.keyword,
    "editorBracketHighlight.foreground2": s.type,
    "editorBracketHighlight.foreground3": s.string,
    "editorBracketHighlight.foreground4": s.attribute,
    "editorBracketHighlight.foreground5": s.number,
    "editorBracketHighlight.foreground6": s.constant,
    "editorBracketHighlight.unexpectedBracket.foreground": st.error,
    "editorError.foreground": st.error,
    "editorWarning.foreground": st.warning,
    "editorInfo.foreground": st.info,
    "editorHint.foreground": b.text2,
    "editorGutter.background": b.bg,
    "editorGutter.addedBackground": st.added,
    "editorGutter.modifiedBackground": st.modified,
    "editorGutter.deletedBackground": st.deleted,
    "editorOverviewRuler.border": "#00000000",
    "editorOverviewRuler.findMatchForeground": alpha(b.accent, "66"),
    "editorOverviewRuler.errorForeground": st.error,
    "editorOverviewRuler.warningForeground": st.warning,
    "editorLink.activeForeground": b.accent,

    "editorStickyScroll.background": b.line,
    "editorStickyScroll.border": b.border,
    "editorStickyScrollGutter.background": b.line,
    "editorStickyScrollHover.background": b.sel,
    "sideBarStickyScroll.background": b.chrome,
    "sideBarStickyScroll.border": b.border,
    "panelStickyScroll.background": b.panel,
    "panelStickyScroll.border": b.border,
    "terminalStickyScroll.background": b.panel,
    "terminalStickyScroll.border": b.border,
    "terminalStickyScrollHover.background": b.raised,

    "editorInlayHint.background": b.raised,
    "editorInlayHint.foreground": b.text3,
    "editorInlayHint.typeBackground": b.raised,
    "editorInlayHint.typeForeground": s.type,
    "editorInlayHint.parameterBackground": b.raised,
    "editorInlayHint.parameterForeground": s.parameter,

    "editorGhostText.foreground": b.text3,
    "editorGhostText.border": "#00000000",

    "commandCenter.background": b.raised,
    "commandCenter.foreground": b.text2,
    "commandCenter.border": b.border,
    "commandCenter.activeBackground": b.sel,
    "commandCenter.activeForeground": b.text1,
    "commandCenter.activeBorder": alpha(b.accent, "66"),
    "commandCenter.inactiveForeground": b.text3,
    "commandCenter.inactiveBorder": b.border,

    "chat.requestBackground": b.raised,
    "chat.requestBorder": b.border,
    "chat.avatarBackground": b.raised,
    "chat.avatarForeground": b.accent,
    "chat.slashCommandBackground": alpha(b.accent, "24"),
    "chat.slashCommandForeground": b.accent,
    "inlineChat.background": b.raised,
    "inlineChat.border": b.border,
    "inlineChat.foreground": b.text1,
    "inlineChatInput.background": b.bg,
    "inlineChatInput.border": b.border,
    "inlineChatInput.focusBorder": alpha(b.accent, "66"),

    "minimap.background": b.bg,
    "minimap.selectionHighlight": b.accent,
    "minimap.findMatchHighlight": alpha(b.accent, "99"),
    "minimapSlider.background": alpha(b.border, "99"),
    "minimapSlider.hoverBackground": alpha(b.gutter, "80"),
    "minimapSlider.activeBackground": alpha(b.gutter, "A6"),

    "sideBar.background": b.chrome,
    "sideBar.foreground": b.text2,
    "sideBar.border": b.border,
    "sideBarTitle.foreground": b.text3,
    "sideBarSectionHeader.background": b.chrome,
    "sideBarSectionHeader.foreground": b.text3,
    "sideBarSectionHeader.border": b.border,

    "activityBar.background": b.chrome,
    "activityBar.foreground": b.text1,
    "activityBar.inactiveForeground": b.text3,
    "activityBar.border": b.border,
    "activityBar.activeBorder": b.accent,
    "activityBarBadge.background": b.accent,
    "activityBarBadge.foreground": b.accentInk,

    "list.activeSelectionBackground": b.sel,
    "list.activeSelectionForeground": b.text1,
    "list.inactiveSelectionBackground": b.raised,
    "list.inactiveSelectionForeground": b.text1,
    "list.hoverBackground": b.raised,
    "list.hoverForeground": b.text1,
    "list.focusBackground": b.sel,
    "list.focusOutline": "#00000000",
    "list.highlightForeground": b.accent,
    "list.errorForeground": st.error,
    "list.warningForeground": st.warning,
    "tree.indentGuidesStroke": b.border,

    "editorGroup.border": b.border,
    "editorGroupHeader.tabsBackground": b.chrome,
    "editorGroupHeader.tabsBorder": b.border,
    "editorGroupHeader.noTabsBackground": b.chrome,
    "tab.activeBackground": b.bg,
    "tab.activeForeground": b.text1,
    "tab.activeBorderTop": b.accent,
    "tab.activeBorder": "#00000000",
    "tab.inactiveBackground": b.chrome,
    "tab.inactiveForeground": b.text3,
    "tab.hoverBackground": b.raised,
    "tab.border": b.border,
    "tab.unfocusedActiveBorderTop": b.border,
    "tab.lastPinnedBorder": b.border,

    "titleBar.activeBackground": b.chrome,
    "titleBar.activeForeground": b.text2,
    "titleBar.inactiveBackground": b.chrome,
    "titleBar.inactiveForeground": b.text3,
    "titleBar.border": b.border,

    "statusBar.background": b.chrome,
    "statusBar.foreground": b.text2,
    "statusBar.border": b.border,
    "statusBar.noFolderBackground": b.chrome,
    "statusBar.debuggingBackground": b.accent,
    "statusBar.debuggingForeground": b.accentInk,
    "statusBarItem.hoverBackground": b.raised,
    "statusBarItem.remoteBackground": b.raised,
    "statusBarItem.remoteForeground": b.accent,
    "statusBarItem.errorBackground": b.chrome,
    "statusBarItem.errorForeground": st.error,
    "statusBarItem.warningBackground": b.chrome,
    "statusBarItem.warningForeground": st.warning,

    "panel.background": b.panel,
    "panel.border": b.border,
    "panelTitle.activeForeground": b.text1,
    "panelTitle.activeBorder": b.accent,
    "panelTitle.inactiveForeground": b.text3,
    "panelSection.border": b.border,

    "terminal.background": b.panel,
    "terminal.foreground": b.text1,
    "terminal.border": b.border,
    "terminalCursor.foreground": b.accent,
    "terminal.selectionBackground": b.sel,
    "terminal.tab.activeBorder": b.accent,
    ...Object.fromEntries(
      Object.entries(a).map(([k, v2]) => [
        "terminal.ansi" + k[0].toUpperCase() + k.slice(1),
        v2,
      ])
    ),

    "input.background": dark ? b.raised : b.bg,
    "input.foreground": b.text1,
    "input.border": b.border,
    "input.placeholderForeground": b.text3,
    "inputOption.activeBorder": b.accent,
    "inputOption.activeBackground": alpha(b.accent, "24"),
    "inputOption.activeForeground": b.text1,
    "inputValidation.errorBackground": b.raised,
    "inputValidation.errorBorder": st.error,
    "inputValidation.warningBackground": b.raised,
    "inputValidation.warningBorder": st.warning,
    "inputValidation.infoBackground": b.raised,
    "inputValidation.infoBorder": st.info,

    "dropdown.background": dark ? b.raised : b.bg,
    "dropdown.foreground": b.text1,
    "dropdown.border": b.border,
    "dropdown.listBackground": dark ? b.raised : b.bg,

    "button.background": b.accent,
    "button.foreground": b.accentInk,
    "button.hoverBackground": b.accent,
    "button.secondaryBackground": b.raised,
    "button.secondaryForeground": b.text1,
    "button.secondaryHoverBackground": b.sel,
    "badge.background": b.accent,
    "badge.foreground": b.accentInk,
    "progressBar.background": b.accent,

    "scrollbar.shadow": "#00000000",
    "scrollbarSlider.background": alpha(b.border, "99"),
    "scrollbarSlider.hoverBackground": alpha(b.gutter, "99"),
    "scrollbarSlider.activeBackground": alpha(b.gutter, "CC"),

    "editorWidget.background": dark ? b.raised : b.chrome,
    "editorWidget.border": b.border,
    "editorSuggestWidget.background": dark ? b.raised : b.chrome,
    "editorSuggestWidget.border": b.border,
    "editorSuggestWidget.foreground": b.text1,
    "editorSuggestWidget.selectedBackground": b.sel,
    "editorSuggestWidget.highlightForeground": b.accent,
    "editorHoverWidget.background": dark ? b.raised : b.chrome,
    "editorHoverWidget.border": b.border,
    "quickInput.background": dark ? b.raised : b.chrome,
    "quickInput.foreground": b.text1,
    "quickInputList.focusBackground": b.sel,
    "quickInputList.focusForeground": b.text1,
    "pickerGroup.border": b.border,
    "pickerGroup.foreground": b.accent,

    "peekView.border": alpha(b.accent, "66"),
    "peekViewEditor.background": b.line,
    "peekViewEditor.matchHighlightBackground": alpha(b.accent, "33"),
    "peekViewResult.background": b.chrome,
    "peekViewResult.selectionBackground": b.sel,
    "peekViewTitle.background": b.chrome,

    "diffEditor.insertedTextBackground": alpha(st.added, "1F"),
    "diffEditor.removedTextBackground": alpha(st.deleted, "1F"),
    "diffEditor.insertedLineBackground": alpha(st.added, "14"),
    "diffEditor.removedLineBackground": alpha(st.deleted, "14"),
    "diffEditor.border": b.border,

    "merge.currentHeaderBackground": alpha(b.accent, "33"),
    "merge.incomingHeaderBackground": alpha(s.type, "33"),

    "gitDecoration.addedResourceForeground": st.added,
    "gitDecoration.modifiedResourceForeground": st.modified,
    "gitDecoration.deletedResourceForeground": st.deleted,
    "gitDecoration.untrackedResourceForeground": st.untracked,
    "gitDecoration.ignoredResourceForeground": st.ignored,
    "gitDecoration.conflictingResourceForeground": st.conflict,
    "gitDecoration.stageModifiedResourceForeground": st.modified,

    "breadcrumb.background": b.bg,
    "breadcrumb.foreground": b.text3,
    "breadcrumb.focusForeground": b.text1,
    "breadcrumb.activeSelectionForeground": b.accent,
    "breadcrumbPicker.background": dark ? b.raised : b.chrome,

    "menu.background": dark ? b.raised : b.chrome,
    "menu.foreground": b.text1,
    "menu.border": b.border,
    "menu.selectionBackground": b.sel,
    "menu.selectionForeground": b.text1,
    "menubar.selectionBackground": b.raised,

    "notifications.background": dark ? b.raised : b.chrome,
    "notifications.foreground": b.text1,
    "notifications.border": b.border,
    "notificationLink.foreground": b.accent,
    "notificationsErrorIcon.foreground": st.error,
    "notificationsWarningIcon.foreground": st.warning,
    "notificationsInfoIcon.foreground": st.info,

    "textLink.foreground": b.accent,
    "textLink.activeForeground": b.accent,
    "textCodeBlock.background": b.raised,
    "textPreformat.foreground": s.string,
    "textBlockQuote.background": b.raised,
    "textBlockQuote.border": b.accent,

    "charts.green": s.function,
    "charts.yellow": s.string,
    "charts.orange": s.number,
    "charts.red": st.error,
    "charts.blue": a.blue,
    "charts.purple": s.constant,
    "charts.foreground": b.text1,
    "charts.lines": b.border,

    "welcomePage.tileBackground": dark ? b.raised : b.chrome,
    "welcomePage.progress.foreground": b.accent,
    "walkThrough.embeddedEditorBackground": b.chrome,
  };

  const rule = (name, scope, foreground, fontStyle) => ({
    name,
    scope,
    settings: fontStyle ? { foreground, fontStyle } : { foreground },
  });

  const tokenColors = [
    rule("Comment", ["comment", "punctuation.definition.comment", "string.comment"], s.comment, "italic"),
    rule("Punctuation", ["punctuation", "punctuation.separator", "punctuation.terminator", "punctuation.accessor", "meta.brace"], s.punctuation),
    rule("Operator", ["keyword.operator", "keyword.operator.arithmetic", "keyword.operator.logical"], s.punctuation),
    rule("Variable", ["variable", "variable.other.readwrite", "meta.definition.variable.name", "support.variable", "entity.name.variable"], s.variable),
    rule("Parameter", ["variable.parameter", "meta.parameter"], s.parameter),
    rule("Property", ["variable.other.property", "variable.other.object.property", "support.variable.property", "meta.object-literal.key", "support.type.property-name"], s.property),
    rule("Keyword", ["keyword", "keyword.control", "keyword.control.flow", "keyword.control.import", "keyword.control.from", "keyword.operator.new", "keyword.operator.expression", "keyword.operator.export", "storage", "storage.type", "storage.modifier"], s.keyword),
    rule("Type, class, interface", ["entity.name.type", "entity.name.class", "entity.name.namespace", "entity.other.inherited-class", "support.type", "support.class", "meta.type.annotation", "storage.type.class"], s.type),
    rule("Function, method", ["entity.name.function", "support.function", "variable.function", "meta.function-call.generic", "meta.function-call entity.name.function"], s.function),
    rule("String", ["string", "string.quoted", "punctuation.definition.string"], s.string),
    rule("Template expression punctuation", ["punctuation.definition.template-expression"], s.function),
    rule("Number, constant", ["constant.numeric", "constant.language", "constant.language.boolean", "constant.language.null", "constant.language.undefined", "support.constant", "constant.other"], s.number),
    rule("Escape, regex", ["constant.character.escape", "string.regexp", "constant.other.character-class"], s.number),
    rule("Tag", ["entity.name.tag", "support.class.component", "meta.tag"], s.type),
    rule("Attribute", ["entity.other.attribute-name", "meta.attribute"], s.attribute),
    rule("Decorator", ["meta.decorator", "punctuation.decorator", "entity.name.function.decorator"], s.constant),
    rule("CSS selector", ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css"], s.attribute),
    rule("CSS property", ["support.type.property-name.css", "support.constant.property-value.css"], s.property),
    rule("JSON key", ["support.type.property-name.json", "meta.structure.dictionary.key.json"], s.property),
    rule("Markdown heading", ["markup.heading", "entity.name.section"], s.function, "bold"),
    rule("Markdown bold", ["markup.bold"], b.text1, "bold"),
    rule("Markdown italic", ["markup.italic"], b.text1, "italic"),
    rule("Markdown link", ["markup.underline.link", "string.other.link"], s.type),
    rule("Markdown inline code", ["markup.inline.raw", "markup.fenced_code"], s.string),
    rule("Markdown quote", ["markup.quote"], b.text2, "italic"),
    rule("Diff inserted", ["markup.inserted"], st.added),
    rule("Diff deleted", ["markup.deleted"], st.deleted),
    rule("Diff changed", ["markup.changed"], st.modified),
    rule("Invalid", ["invalid", "invalid.illegal"], st.error),
    rule("Deprecated", ["invalid.deprecated"], st.warning, "strikethrough"),
  ];

  const semanticTokenColors = {
    namespace: s.type, class: s.type, interface: s.type, enum: s.type,
    enumMember: s.number, type: s.type, typeParameter: s.type,
    function: s.function, method: s.function, property: s.property,
    variable: s.variable, parameter: s.parameter,
    "variable.readonly": s.number, "variable.defaultLibrary": s.type,
    "function.defaultLibrary": s.function,
  };

  return {
    theme: {
      $schema: "vscode://schemas/color-theme",
      name: key === "light" ? P.name : `${P.name} Night`,
      type: v.appearance,
      semanticHighlighting: true,
      colors,
      tokenColors,
      semanticTokenColors,
    },
    audit: { b, s, st, a },
  };
};

// --- emit + verify ---
let failed = false;
for (const [key, v] of Object.entries(P.variants)) {
  const { theme, audit } = build(key, v);
  const file = `themes/comfy-${key}-color-theme.json`;
  writeFileSync(join(root, file), JSON.stringify(theme, null, 2) + "\n");

  const bg = audit.b.bg;
  const band = Object.entries(audit.s)
    .filter(([k]) => !["comment", "punctuation", "variable", "property", "parameter"].includes(k))
    .map(([k, hex]) => [k, ratio(hex, bg)]);
  const lo = Math.min(...band.map(([, r]) => r));
  const hi = Math.max(...band.map(([, r]) => r));
  const quiet = [
    ["comment", ratio(audit.s.comment, bg)],
    ["punctuation", ratio(audit.s.punctuation, bg)],
    ["text3", ratio(audit.b.text3, bg)],
  ];

  console.log(`\n${theme.name}  (${Object.keys(theme.colors).length} colours, ${theme.tokenColors.length} token rules)`);
  console.log(`  ink band       ${lo.toFixed(2)}–${hi.toFixed(2)}:1   spread ${(hi - lo).toFixed(2)}`);
  console.log(`  primary text   ${ratio(audit.b.text1, bg).toFixed(2)}:1`);
  for (const [k, r] of quiet) {
    const ok = r >= 4.5;
    if (!ok) failed = true;
    console.log(`  ${k.padEnd(14)} ${r.toFixed(2)}:1  ${ok ? "AA" : "*** BELOW 4.5:1 ***"}`);
  }
  if (hi - lo > 1.5) {
    failed = true;
    console.log(`  *** ink band spread ${(hi - lo).toFixed(2)} exceeds 1.5 ***`);
  }
  console.log(`  wrote ${file}`);
}

if (failed) {
  console.error("\nbuild failed: a colour is out of band or below AA");
  process.exit(1);
}
console.log("\nall variants within band and above AA\n");
