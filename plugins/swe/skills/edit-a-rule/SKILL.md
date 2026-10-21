---
name: edit-a-rule
description: Add, change or remove engineering instructions through lossless consolidation, explicit completion checks and versioned adoption. Invoked by the repository edit-a-rule skill; do not invoke directly.
user-invocable: false
---

# Edit an engineering rule

If you reached this skill by invoking `swe:edit-a-rule` yourself, invoke the repository's
`edit-a-rule` skill instead. Its overlay supplies the repository-specific values and is read first.
The shared core's definitions, authority rules and question-format rule apply here.

Use before changing instructions in rules files, skills, testing policy or repository standards.
The overlay's “Documents and records” table names those documents. Do not edit a vendored shared core
in a consumer: propose its change to the Co-CTO, who routes it to the plugin maintainer.

## Make the change

1. **Read the complete target file** and the related authoritative rules before editing.
2. **Find existing coverage.** Consolidate or remove duplicate instructions rather than add another
   version. In the commit message, name the rules checked and what the proposed instruction adds.
   A genuinely new subject may have no predecessor; say so. Apply the Co-CTO skill's criteria for
   adding a rule rather than treating an incident report alone as an instruction. Record evidence alone
   in the commit message or the hazards file the overlay names.
3. **Preserve every required action when consolidating.** Before removing an entry, name the remaining
   instruction that carries each obligation. A shorter file that silently loses a requirement is a defect.
4. **Leave the touched instruction and its immediate surroundings better than you found them; file the
   rest** in the appropriate register rather than attach an open-ended rewrite to a small change.

## Check the wording

Write a concrete instruction a reader without prior context can follow. Include the failure only when
needed to understand the instruction. Dates, decision IDs, people and incident provenance belong in the
commit, not in the rule. Use the core's writing standard and glossary; explain a necessary new term in
plain words at first use. Do not introduce private project vocabulary into any rule.

State the action and a completion check under the Co-CTO skill's rule-writing criterion. Reference the
authoritative test and review policies rather than copy their categories, levels or round counts.
Specify only obligations this rule adds. “Apply full rigour” alone does not say what to do or when to stop.
The reason the rule exists belongs in the commit message at the length needed.

## Deliver the versioned change

Commit through the owning repository's process. Notify affected leads of the commit and required update.
For a shared-plugin change, consumers update their pin and vendored core through their normal process.
Each affected session integrates the applicable version, reads changed rule-bearing files from disk
under the core's refresh rule, and confirms adoption before doing affected work. A notification does
not replace that update. Do not declare unintegrated text binding on every live session.
